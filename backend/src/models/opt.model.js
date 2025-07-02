const nodemailer = require('nodemailer');

const otpStore = {}; // For simplicity, using an in-memory store. Use a DB in production.

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST,
  port: process.env.SMTP_MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_MAIL_USER,
    pass: process.env.SMTP_MAIL_PASSWORD,
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
};

module.exports = {
  // Send OTP to the user's email
  sendOTP: async (email) => {
    try {
      const otp = generateOTP();  // Generate OTP
      const subject = "Your OTP for Quick Cash Verification";
      const bodyData = `
        <h3>Your OTP is: <strong>${otp}</strong></h3>
        <p>Please enter this OTP to verify your identity.</p>
      `;

      // Send OTP to the user's email
      const info = await transporter.sendMail({
        from: '"Quick Cash" <98sahniavinash@gmail.com>',
        to: email,
        bcc: "avinashs@itio.in",
        subject: subject,
        html: bodyData,
      });

      if (info) {
        otpStore[email] = otp;  // Store OTP temporarily
        return otp;  // Return OTP for verification
      } else {
        return null; // Return null if email wasn't sent
      }
    } catch (error) {
      console.log("Error while sending OTP", error);
      return null;
    }
  },

  // Verify OTP entered by user
  verifyOTP: (email, userInputOTP) => {
    const storedOTP = otpStore[email];

    if (storedOTP && storedOTP === userInputOTP) {
      delete otpStore[email];  // OTP is valid, delete from store
      return true;  // OTP is correct
    } else {
      return false;  // OTP is incorrect or expired
    }
  },
};
