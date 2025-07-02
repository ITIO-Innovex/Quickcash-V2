const { isValidEmail, validateEmailWithJuvlon } = require('../models/emailValidation.model');
const { successMessage, errorMessage } = require('../views/responseMessage');

// Shared email validation logic
async function validateEmail(req, res) {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    res.status(400).json(errorMessage("Invalid email format"));
    return false;
  }

  try {
    const isValid = await validateEmailWithJuvlon(email);
    if (!isValid) {
      res.status(400).json(errorMessage("Email validation failed"));
      return false;
    }
  } catch (err) {
    console.error("Email validation error:", err);
    res.status(500).json(errorMessage("Server error during email validation"));
    return false;
  }

  return true;
}

// Controller for user signup
async function signup(req, res) {
  if (!(await validateEmail(req, res))) return;
  res.status(200).json(successMessage("Signup successful!"));
}

// Controller for forgot password
async function forgotPassword(req, res) {
  if (!(await validateEmail(req, res))) return;
  res.status(200).json(successMessage("Password reset link sent!"));
}

// Controller for reset password
async function resetPassword(req, res) {
  if (!(await validateEmail(req, res))) return;
  res.status(200).json(successMessage("Password has been reset successfully!"));
}

module.exports = { signup, forgotPassword, resetPassword };
