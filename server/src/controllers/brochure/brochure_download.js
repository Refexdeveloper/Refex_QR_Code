const { BrochureDownload } = require("../../models");
const { validationResult } = require("express-validator");
const status = require("../../helpers/Response");
const sendMail = require("../../helpers/sendMail2");
const path = require("path");
const { APP_URL } = process.env;

module.exports = {
  createBD: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return status.ResponseStatus(
          res,
          400,
          "Validation failed. Please ensure all required fields are filled correctly.",
          errors.array()
        );
      }

      const { name, designation, email, phone, company, downloaded_file } =
        req.body;

      // Save the form data to the database
      const newBrochureDownload = await BrochureDownload.create({
        name,
        designation,
        email,
        phone,
        company,
        downloaded_file,
      });

      if (!newBrochureDownload) {
        // If data creation failed
        return status.ResponseStatus(
          res,
          500,
          "An error occurred while saving the data."
        );
      }

      // Handle file download or redirection only on successful data creation
      if (downloaded_file === "Drive Link") {
        try {
          // Redirect to the Google Drive folder
          const mailSubject =
            "Thank You for Your Submission! Here's Your Exclusive Brochure";

          const mailContent = `
      <p>Dear ${name},</p>
      <p>Thank you for submitting your details and expressing interest in our offerings.</p>
      <p>We are pleased to share the link to our comprehensive brochure, which includes all the details you need:</p>
      <p>Drive Link: <a href="https://drive.google.com/drive/folders/1PpARSZm53gRgBqXyZagZeh9eXi035GWe?usp=sharing" target="_blank"><strong>Access the Brochure</strong></a></p>
      <p>We hope you find the information insightful and helpful in making informed decisions. Should you require any further assistance or have questions, please don't hesitate to contact us.</p>
      <p>Thank you once again for choosing our services. We look forward to assisting you further.</p>
      <div style="text-align: center;">
      <a href="https://www.3imedtech.com/">
          <img src="${APP_URL}/assets/3i_MedTech_Logo.png" alt="Logo" style="max-width: 100px;">
      </a>
      </div>
      <p>Best regards,<br>3i MedTech Team</p>
    `;
          // Attempt to send the email
          sendMail(email, mailSubject, mailContent);

          // Send success response
          return status.ResponseStatus(
            res,
            200,
            "Thank You for Your Submission! You'll receive an email with the drive link to access the brochure."
          );
        } catch (error) {
          return status.ResponseStatus(
            res,
            500,
            `Failed to send email. ${error}`
          );
        }
      }

      // Determine the PDF file path for other cases
      let pdfFilePath;
      switch (downloaded_file) {
        case "All Product Brochure":
          pdfFilePath = path.join(
            __dirname,
            "../../../uploads/pdf/All_Product_Brochure.pdf"
          );
          break;
        case "Anamaya Brochure":
          pdfFilePath = path.join(
            __dirname,
            "../../../uploads/pdf/Anamaya_Brochure.pdf"
          );
          break;
        case "Mini 90 Brochure":
          pdfFilePath = path.join(
            __dirname,
            "../../../uploads/pdf/Mini_90_Brochure.pdf"
          );
          break;
        default:
          return status.ResponseStatus(
            res,
            400,
            "Invalid downloaded_file value. Please select a valid option."
          );
      }

      // Download the selected file
      return res.download(pdfFilePath, path.basename(pdfFilePath), (err) => {
        if (err) {
          console.error("Error while sending the file:", err);
          return status.ResponseStatus(
            res,
            500,
            "An error occurred while sending the PDF."
          );
        }
      });
    } catch (error) {
      console.error("Error creating brochure download:", error);
      return status.ResponseStatus(
        res,
        500,
        "An error occurred while creating the brochure download."
      );
    }
  },
};
