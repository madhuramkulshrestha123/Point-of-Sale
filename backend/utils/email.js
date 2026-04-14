require('dotenv').config();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email using Mailjet API
const sendOTPEmail = async (email, otp) => {
  try {
    console.log('Attempting to send OTP email to:', email);
    console.log('Using sender:', process.env.SENDER_EMAIL);

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64')}`
      },
      body: JSON.stringify({
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
      })
    });

    const result = await response.json();
    
    if (response.ok && result.Messages[0].Status === 'success') {
      console.log('✅ OTP email sent successfully:', result.Messages[0].MessageID);
      return { success: true, messageId: result.Messages[0].MessageID };
    } else {
      console.error('❌ Mailjet API error:', result);
      return { success: false, error: result.ErrorMessage || 'Failed to send email' };
    }
  } catch (error) {
    console.error('❌ Error sending OTP email:', error.message);
    return { success: false, error: error.message };
  }
};

// Send registration success email using Mailjet API
const sendRegistrationSuccessEmail = async (email, businessName) => {
  try {
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64')}`
      },
      body: JSON.stringify({
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
      })
    });

    const result = await response.json();
    
    if (response.ok && result.Messages[0].Status === 'success') {
      console.log('✅ Registration success email sent:', result.Messages[0].MessageID);
      return { success: true, messageId: result.Messages[0].MessageID };
    } else {
      console.error('❌ Mailjet API error:', result);
      return { success: false, error: result.ErrorMessage || 'Failed to send email' };
    }
  } catch (error) {
    console.error('❌ Error sending registration email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendRegistrationSuccessEmail,
};
