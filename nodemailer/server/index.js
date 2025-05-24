import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { createTransport } from 'nodemailer';

config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://ngc-photobooth.vercel.app', // or specify exact origin: 'https://yourfrontend.com'
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://ngc-photobooth.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/send-photo', async (req, res) => {
  const { email, images } = req.body;

  console.log(`REQUEST: ${email}`);

  if (!email || !images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: 'Email and images array are required.' });
  }

  try {
    const attachments = images.map((imgData, index) => {
      const base64Data = imgData.split('base64,')[1];
      return {
        filename: `photobooth-${index + 1}.png`,
        content: base64Data,
        encoding: 'base64',
      };
    });

    // Send email
    await transporter.sendMail({
      from: `"NGC Photobooth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your NGC Photobooth Pictures! 📸',
      html: `<p>Thanks for using our photobooth! 🎉</p><p>You have ${images.length} photo(s) attached.</p><p>God bless!</p>`,
      attachments,
    });

    res.json({ message: 'Email sent successfully.' });
    console.log(`SENT: ${email} -> Sent ${images.length} photo(s)`);
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

