require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure Mailjet SMTP transport
const transporter = nodemailer.createTransport({
  host: 'in-v3.mailjet.com',
  port: 465, // Use SSL port
  secure: true, // Use SSL
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY,
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000, // 10 seconds
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Your POS Registration OTP',
      text: `Your OTP is: ${otp}

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    console.error('Error code:', error.code);
    console.error('Using host: in-v3.mailjet.com, port: 465');
    return { success: false, error: error.message };
  }
};

// Send registration success email
const sendRegistrationSuccessEmail = async (email, businessName) => {
  try {
    const mailOptions = {
      from: `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Registration Successful - Welcome to POS System',
      text: `Welcome to POS System!

Your registration was successful.
Business Name: ${businessName}

How to access your POS:

DESKTOP:
1. Open your web browser
2. Visit: https://your-pos-domain.com
3. Login with your Business ID/Email and PIN

MOBILE:
1. Open your mobile browser (Chrome/Safari)
2. Visit: https://your-pos-domain.com
3. Login with your credentials
4. Tap "Add to Home Screen" when prompted
5. Launch POS from your home screen like a native app

ANDROID APP:
1. Open Chrome browser
2. Visit: https://your-pos-domain.com
3. Tap the menu (three dots)
4. Select "Install App" or "Add to Home Screen"
5. POS will be installed on your device

IOS APP:
1. Open Safari browser
2. Visit: https://your-pos-domain.com
3. Tap the Share button
4. Select "Add to Home Screen"
5. POS will be available on your home screen

NEED HELP?
Contact support if you need assistance.

Thank you for choosing POS System!`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Registration success email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending registration email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendRegistrationSuccessEmail,
};
