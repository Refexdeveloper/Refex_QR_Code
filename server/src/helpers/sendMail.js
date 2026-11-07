const nodemailer = require("nodemailer");
const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

const sendMail = (
  email,
  mailSubject,
  content,
  attachments = null,
  callback
) => {
  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST, // Replace with your SMTP server
      port: SMTP_PORT,
      secure: SMTP_SECURE === "true",
      requireTLS: true,
      auth: {
        user: SMTP_USER, // Replace with your email
        pass: SMTP_PASS, // Replace with your email password
      },
    });

    const mailOptions = {
      from: SMTP_USER,
      to: email,
      subject: mailSubject,
      html: content,
      attachments,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        // console.log(error);
        callback(error, null);
      } else {
        // console.log("Mail sent successfully!", info.response);
        callback(null, info);
      }
    });
  } catch (error) {
    // console.log(error.message);
    callback(error.message, null);
  }
};

module.exports = sendMail;
