const cron = require("node-cron");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");
const {User} = require("../models/user.model");
const { Account } = require('../models/account.model');
const { Transaction } = require('../models/transaction.model');
const generatePDF = require("../utils/monthlyStatementPdfGenerator");
const { sendMailWithAttachment } = require("../middlewares/mail.middleware");

cron.schedule("* * * * *", async () => {
  try{
      const users = await User.find({ emailStatement: true });
      const now = new Date();
      const month = now.getMonth(); // 0 = Jan
      const year = now.getFullYear();
      const start = new Date(year, month , 1);
      const end = new Date(year, month+1, 0, 23, 59, 59);
      for (let user of users) {
        const accounts = await Account.find({ user: user._id });

        for (let acc of accounts) {
          acc.transactions = await Transaction.find({
            source_account:  acc._id,
            createdAt: { $gte: start, $lte: end },
          }).sort({ createdAt: -1 }); ;
        }
        // Generate PDF
        const pdfPath = path.join(__dirname, `../temp/${user._id}_statement.pdf`);
        await generatePDF({
          user: user,
          dob: 12345,
          accounts,
          outputPath: pdfPath,
        });
        // Send email with PDF attachment
        const html = await ejs.renderFile(
          path.join(__dirname, "../views/statementEmail.ejs"),
          { name: user.name }
        );
        const attachment = pdfPath.replace(".pdf", "_protected.pdf");
        await sendMailWithAttachment(
          user.email,
          `Your Account Statement - ${start.toLocaleString('default', { month: 'long' })} ${year}`,
          html,
          attachment,
          "Account_Statement.pdf"
        );

        fs.unlinkSync(attachment); // optional cleanup
              console.log("✅ Monthly statements sent to"+ user.name);
      }
            console.log("✅ All monthly statements processed successfully");
  }catch (error) {
    console.error("❌ Error in monthly statement cron job:", error);
  }
});
