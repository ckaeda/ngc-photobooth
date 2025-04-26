const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

  if (!email || !image) {
    return res.status(400).json({ message: 'Email and image are required.' });
  }

  try {
    await transporter.sendMail({
      from: `"Photobooth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Photobooth Picture! 📸',
      html: '<p>Thanks for using our photobooth! 🎉</p>',
      attachments: [
        {
          filename: 'photobooth.jpg',
          content: image.split('base64,')[1], // base64 payload only
          encoding: 'base64',
        },
      ],
    });

    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
