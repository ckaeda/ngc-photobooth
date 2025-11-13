import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: "Hello!" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, filename } = req.body;

  if (!base64 || !filename) {
    return res.status(400).json({ error: 'Missing data' });
  }

  try {
    const base64Data = base64.split(',')[1]; // remove "data:image/png;base64," part
    const buffer = Buffer.from(base64Data, 'base64');

    const result = await put(`${filename}.png`, buffer, {
      access: 'public',
    });

    return res.status(200).json({ url: result.url });
  } catch (err) {
    console.error('Upload failed:', err);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
