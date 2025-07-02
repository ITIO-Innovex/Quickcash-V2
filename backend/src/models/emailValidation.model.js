const axios = require('axios');
require('dotenv').config();


const apiUrl = process.env.EMAIL_VALIDATION_HOST_KEY;
const apiKey = process.env.EMAIL_VALIDATION_API_KEY;


function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}


async function validateEmailWithJuvlon(email) {
  try {
    const response = await axios.post(apiUrl, {
      to: email,
      subject: "Email Validation",
      message: "Please validate your email for signup."
    }, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      }
    });

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error while validating email with Juvlon:", error);
    return false;
  }
}

module.exports = { isValidEmail, validateEmailWithJuvlon };