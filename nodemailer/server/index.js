const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Load HTTPS credentials
const key = fs.readFileSync('./certs/cert.key');
const cert = fs.readFileSync('./certs/cert.crt');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const transporter = nodemailer.createTransport({
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
    await transporter.sendMail({
      from: `"NGC Photobooth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your NGC Photobooth Picture! 📸',
      html: '<p>Thanks for using our photobooth! 🎉</p><p>God bless!</p>',
      attachments: [
        {
          filename: 'photobooth.jpg',
          content: image.split('base64,')[1],
          encoding: 'base64',
        },
      ],
    });

    res.json({ message: 'Email sent successfully.' });
    console.log(`SENT: ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
    console.log(`ERROR: ${email}`);
  }
});

// Start HTTPS server
https.createServer({ key, cert }, app).listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTPS Server running at https://0.0.0.0:${PORT}`);
});
