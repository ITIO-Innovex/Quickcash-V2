const { sendMail } = require('../middlewares/common.middleware');

exports.sendContactMail = async (req, res) => {
  const { fullName, contactNumber, companyName, email, description } = req.body;

  const subject = `New Lead received ${fullName}`;
  const body = `
    <h2>New Contact Submission</h2>
    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Contact Number:</strong> ${contactNumber}</p>
    <p><strong>Company Name:</strong> ${companyName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Description:</strong> ${description}</p>
  `;

  try {
    const isSent = await sendMail('support@quickcash.oyefin.com', subject, body);
    if (isSent) {
      return res.status(200).json({ message: 'Mail sent successfully!' });
    } else {
      return res.status(500).json({ message: 'Mail failed to send.' });
    }
  } catch (error) {
    console.error('Email Send Error:', error);
    return res.status(500).json({ message: 'Server error', error });
  }
};
