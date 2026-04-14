require('dotenv').config();
const Mailjet = require('node-mailjet');

// Initialize Mailjet client with API credentials
const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const request = {
      Messages: [
        {
          From: {
            Email: process.env.SENDER_EMAIL,
            Name: process.env.SENDER_NAME
          },
          To: [
            {
              Email: email
            }
          ],
          Subject: 'Your POS Registration OTP',
          TextPart: `Your OTP is: ${otp}

This OTP is valid for 10 minutes.

If you didn't request this, please ignore this email.`,
          CustomID: 'OTPVerification'
        }
      ]
    };

    const result = await mailjet.post('send', { version: 'v3.1' }).request(request);
    console.log('OTP email sent successfully:', result.body);
    return { success: true, messageId: result.body.GlobalID || 'sent' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send registration success email
const sendRegistrationSuccessEmail = async (email, businessName) => {
  try {
    const request = {
      Messages: [
        {
          From: {
            Email: 'madhukull2701@gmail.com',
            Name: 'POS System'
          },
          To: [
            {
              Email: email
            }
          ],
          Subject: 'Registration Successful - Welcome to POS System',
          TextPart: `Welcome to POS System!

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
          CustomID: 'RegistrationSuccess'
        }
      ]
    };

    const result = await mailjet.post('send', { version: 'v3.1' }).request(request);
    console.log('Registration success email sent:', result.body);
    return { success: true, messageId: result.body.GlobalID || 'sent' };
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
