import express from 'express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import { config } from 'dotenv';
import { createTransport } from 'nodemailer';

config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const corsOptions = {
  origin: 'https://ngc-photobooth.vercel.app', // or specify exact origin: 'https://yourfrontend.com'
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

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
    let fileName = `${baseName}.png`;
    let filePath = join(picturesDir, fileName);

    // If file exists, append (n)
    let counter = 1;
    while (existsSync(filePath)) {
      fileName = `${baseName}(${counter}).png`;
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
          filename: `photobooth.png`,
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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

