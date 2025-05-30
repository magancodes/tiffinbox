import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// In-memory storage (replace with a database in production)
const otpStore = new Map();
const sessionStore = new Map();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = generateOTP();
    otpStore.set(phoneNumber, otp);

    // Send SMS via Twilio
    await twilioClient.messages.create({
      body: `Your verification code is: ${otp}`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ error: 'Phone number and OTP are required' });
  }

  const storedOTP = otpStore.get(phoneNumber);
  
  if (!storedOTP || storedOTP !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  // OTP is valid, create session
  sessionStore.set(phoneNumber, true);
  otpStore.delete(phoneNumber); // Remove used OTP

  res.json({ success: true, message: 'OTP verified successfully' });
});

// Check auth status endpoint
app.get('/api/check-auth', (req, res) => {
  const { phoneNumber } = req.query;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const isAuthenticated = sessionStore.get(phoneNumber) || false;
  res.json({ isAuthenticated });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});