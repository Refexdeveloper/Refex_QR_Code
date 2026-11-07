const nodemailer = require("nodemailer");
const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

const sendMail = async (to, subject, html, attachments = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Replace with your SMTP server
      port: 465,
      secure: true,
      requireTLS: true,
      auth: {
        user: SMTP_MAIL, // Replace with your email
        pass: SMTP_PASSWORD, // Replace with your email password
      },
    });

    const mailOptions = {
      from: SMTP_MAIL, // Sender name and email
      to, // Recipient email address
      subject, // Subject of the email
      html, // HTML content of the email
      attachments, // Attachments, if any
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Email could not be sent.");
  }
};

module.exports = sendMail;
