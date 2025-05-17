const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const { GLOBAL } = require('../../photobooth/config/config');

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
    // Ensure "pictures" directory exists
    const picturesDir = path.join(__dirname, 'pictures');
    if (!fs.existsSync(picturesDir)) {
      fs.mkdirSync(picturesDir);
    }

    // Sanitize and prepare the base filename
    const baseName = email.replace(/@/g, '__').replace(/[^a-zA-Z0-9_\-\.]/g, '');
    let fileName = `${baseName}.${GLOBAL.IMAGE_FORMAT.slice(-3).toLowerCase()}`;
    let filePath = path.join(picturesDir, fileName);

    // If file exists, append (n)
    let counter = 1;
    while (fs.existsSync(filePath)) {
      fileName = `${baseName}(${counter}).${GLOBAL.IMAGE_FORMAT.slice(-3).toLowerCase()}`;
      filePath = path.join(picturesDir, fileName);
      counter++;
    }

    // Extract base64 content and save the image
    const base64Data = image.split('base64,')[1];
    fs.writeFileSync(filePath, base64Data, 'base64');

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
https.createServer({ key, cert }, app).listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 HTTPS Server running at https://0.0.0.0:${PORT}`);
});
