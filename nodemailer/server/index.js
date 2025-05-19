import express, { json } from 'express';
import { createServer } from 'https';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import { config } from 'dotenv';
import { createTransport } from 'nodemailer';
import { GLOBAL } from '../../photobooth/config/config.js';

config();

const app = express();
const PORT = process.env.PORT || 5000;

// Load HTTPS credentials
const key = readFileSync('./certs/cert.key');
const cert = readFileSync('./certs/cert.crt');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(json({ limit: '10mb' }));

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/send-photo', async (req, res) => {
  const { email, image } = req.body;

  console.log(`REQUEST: ${email}`);

  if (!email || !image) {
    return res.status(400).json({ message: 'Email and image are required.' });
  }

  try {
    // Ensure "pictures" directory exists
    const picturesDir = join(__dirname, 'pictures');
    if (!existsSync(picturesDir)) {
      mkdirSync(picturesDir);
    }

    // Sanitize and prepare the base filename
    const baseName = email.replace(/@/g, '__').replace(/[^a-zA-Z0-9_\-\.]/g, '');
    let fileName = `${baseName}.${GLOBAL.IMAGE_FORMAT.slice(-3).toLowerCase()}`;
    let filePath = join(picturesDir, fileName);

    // If file exists, append (n)
    let counter = 1;
    while (existsSync(filePath)) {
      fileName = `${baseName}(${counter}).${GLOBAL.IMAGE_FORMAT.slice(-3).toLowerCase()}`;
      filePath = join(picturesDir, fileName);
      counter++;
    }

    // Extract base64 content and save the image
    const base64Data = image.split('base64,')[1];
    writeFileSync(filePath, base64Data, 'base64');

    // Send email
    await transporter.sendMail({
      from: `"NGC Photobooth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your NGC Photobooth Picture! 📸',
      html: '<p>Thanks for using our photobooth! 🎉</p><p>God bless!</p>',
      attachments: [
        {
          filename: `photobooth.${GLOBAL.IMAGE_FORMAT.slice(-3).toLowerCase()}`,
          content: base64Data,
          encoding: 'base64',
        },
      ],
    });

    res.json({ message: 'Email sent successfully.' });
    console.log(`SENT: ${email} -> Saved as ${fileName}`);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
    console.log(`ERROR: ${email}`);
  }
});


// Start HTTPS server
createServer({ key, cert }, app).listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTPS Server running at https://0.0.0.0:${PORT}`);
});
