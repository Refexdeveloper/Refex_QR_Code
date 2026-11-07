const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports = {
  sendContestFormReport: async (excelBuffer, date) => {
    try {
      const mailOptions = {
        from: `"Contest Form System" <${process.env.SMTP_FROM_EMAIL}>`,
        to: process.env.REPORT_RECIPIENTS,
        cc: "murugesh.k@refex.co.in",
        subject: `Full Contest Form Report - ${date}`,
        text: `Please find attached the complete contest form data as of ${date}.`,
        attachments: [
          {
            filename: `contest_forms_full_${date}.xlsx`,
            content: excelBuffer,
          },
        ],
      };

      await transporter.sendMail(mailOptions);
      console.log("Email with full report sent successfully");
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  },
};
