const nodemailer = require("nodemailer");

module.exports  = {
  // Email send function middleware
  sendMail: async(email,subject,bodyData) => {
    try {
      const info = await transporter.sendMail({
        from: '"Quick Cash" <reactnode@xeyso.com>', 
        to: email, 
        bcc: "testmailwifigo@gmail.com",
        subject: subject,
        html: bodyData, 
      }); 

      console.log("Message Report with status", info);

      if(info) {
       return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Error while sending mail", error);
    }
  },
  // Email Send with attachment function middleware
  sendMailWithAttachment: async(email,subject,bodyData,path,title="") => {
    console.log("Path", path);
    try {
     const info = await transporter.sendMail({
      from: '"Quick Cash" <reactnode@xeyso.com>', 
      to: email, 
      subject: subject,
      html: bodyData,
      attachments: [{
       filename: title ? title : "attachment.pdf",
       path: path
      }] 
    }); 

    console.log("Message Report with status", info);

    if(info) {
      return true;
    } else {
      return false;
    }
    } catch (error) {
      console.log("Error while sending mail", error);
   }
  }
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST,
  port: process.env.SMTP_MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_MAIL_USER,
    pass: process.env.SMTP_MAIL_PASSWORD,
  },
});