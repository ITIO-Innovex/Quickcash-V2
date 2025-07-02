require('dotenv').config();
const nodemailer = require('nodemailer');

const createTransformerConfig = () => ({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendMail = async ({ to, cc, subject, attachments, document, userDetails }) => {
    const transporter = nodemailer.createTransport(createTransformerConfig());

    const logo = `<img src='${process.env.EMAIL_LOGO_URL}' height='50' style='padding:20px'/>`;
    const opurl = ` <a href='${process.env.EMAIL_SUPPORT_URL}' target=_blank>here</a>`;
    const themeColor = process.env.EMAIL_THEME_COLOR;
    const TenantAppName = process.env.EMAIL_TENANT_NAME;

    const mailOptions = {
        to,
        cc,
        subject,
        from: process.env.EMAIL_FROM,
        ...(attachments && { attachments }),
        html: `
        <html><head><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'/></head>
        <body><div style='background-color:#f5f5f5;padding:20px'>
        <div style='background-color:white'><div>${logo}</div>
        <div style='padding:2px;font-family:system-ui;background-color:${themeColor}'>
        <p style='font-size:20px;font-weight:400;color:white;padding-left:20px'>Document Copy</p></div>
        <div><p style='padding:20px;font-family:system-ui;font-size:14px'>
        <strong>This is a testing mail</strong></p></div></div>
        <div><p style='padding:20px;font-family:system-ui;font-size:14px'>
        A copy of the document <strong>${document?.name || 'Document'}</strong> is attached to this email.
        Kindly download the document from the attachment.</p></div></div>
        <div><p>This is an automated email from ${TenantAppName}.
        For any queries regarding this email, please contact the sender
        ${userDetails?.email || process.env.EMAIL_FALLBACK_CONTACT} directly.
        If you think this email is inappropriate or spam, you may file a complaint with
        ${TenantAppName}${opurl}.</p></div></div></body></html>`,
    };

    return transporter.sendMail(mailOptions);
};

const sendGeneralMail = async ({ from = '', to, replyTo = '', subject, html, attachments}) => {
    const transporter = nodemailer.createTransport(createTransformerConfig());

    const mailsender = process.env.EMAIL_FROM;
    const mailOptions = {
      from: from + ' <' + mailsender + '>',
      to,
      subject,
      html: html || '',
      replyTo: replyTo ? replyTo : undefined,
      ...(attachments && { attachments }),
    };

    return transporter.sendMail(mailOptions);

}

module.exports = { sendMail, sendGeneralMail };
