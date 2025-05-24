// api/send-photo.js
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createTransport } from 'nodemailer';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Allow CORS for all methods
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, image } = req.body;

  console.log(`REQUEST: ${email}`);

  if (!email || !image) {
    return res.status(400).json({ message: 'Email and image are required.' });
  }

  try {
    // Ensure "pictures" directory exists
    const picturesDir = join(__dirname, '../../pictures');
    if (!existsSync(picturesDir)) {
      mkdirSync(picturesDir, { recursive: true });
    }

    // Sanitize and prepare the base filename
    const baseName = email.replace(/@/g, '__').replace(/[^a-zA-Z0-9_\-\.]/g, '');
    let fileName = `${baseName}.png`;
    let filePath = join(picturesDir, fileName);

    let counter = 1;
    while (existsSync(filePath)) {
      fileName = `${baseName}(${counter}).png`;
      filePath = join(picturesDir, fileName);
      counter++;
    }

    const base64Data = image.split('base64,')[1];
    writeFileSync(filePath, base64Data, 'base64');

    await transporter.sendMail({
      from: `"NGC Photobooth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your NGC Photobooth Picture! 📸',
      html: '<p>Thanks for using our photobooth! 🎉</p><p>God bless!</p>',
      attachments: [
        {
          filename: `photobooth.png`,
          content: base64Data,
          encoding: 'base64',
        },
      ],
    });

    res.status(200).json({ message: 'Email sent successfully.' });
    console.log(`SENT: ${email} -> Saved as ${fileName}`);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
    console.log(`ERROR: ${email}`);
  }
}
