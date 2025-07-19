// import { put } from '@vercel/blob';
import { google } from 'googleapis';
import { Readable } from "stream";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: "Hello!" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, filename } = req.body;

  if (!base64 || !filename) {
    return res.status(400).json({ error: "Missing base64 or filename" });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.TYPE,
        project_id: process.env.PROJECT_ID,
        private_key_id: process.env.PRIVATE_KEY_ID,
        private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.CLIENT_EMAIL,
        client_id: process.env.CLIENT_ID,
        auth_uri: process.env.AUTH_URI,
        token_uri: process.env.TOKEN_URI,
        auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
        universe_domain: process.env.UNIVERSE_DOMAIN,
      },
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const driveService = google.drive({ version: "v3", auth });

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64, "base64");
    const readableStream = Readable.from(buffer);

    const fileMetadata = { 
      name: filename,
      parents: [process.env.DRIVE_FOLDER_ID] 
    };

    const uploadResponse = driveService.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: "image/png",
        body: readableStream,
      },
      fields: "id, webViewLink",
    });

    const fileId = uploadResponse.data.id;
    const viewLink = uploadResponse.data.webViewLink;

    // Make file publicly readable
    driveService.permissions.create({
      fileId: fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    return res.status(200).json({ viewLink, success: true });

  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }

  // const { base64, filename } = req.body;

  // if (!base64 || !filename) {
  //   return res.status(400).json({ error: 'Missing data' });
  // }

  // try {
  //   const base64Data = base64.split(',')[1]; // remove "data:image/png;base64," part
  //   const buffer = Buffer.from(base64Data, 'base64');

  //   const result = await put(`${filename}.png`, buffer, {
  //     access: 'public',
  //   });

  //   return res.status(200).json({ url: result.url });
  // } catch (err) {
  //   console.error('Upload failed:', err);
  //   return res.status(500).json({ error: 'Upload failed' });
  // }
}
