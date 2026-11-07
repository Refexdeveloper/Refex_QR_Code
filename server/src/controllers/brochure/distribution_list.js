const { validationResult } = require("express-validator");

const { DistributionList } = require("../../models");
const status = require("../../helpers/Response");
const sendMail = require("../../helpers/sendMail");
const path = require("path");
const { APP_URL } = process.env;
module.exports = {
  // createList: async (req, res) => {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return status.ResponseStatus(
  //         res,
  //         400,
  //         "Validation failed. Please ensure all required fields are filled correctly.",
  //         errors
  //       );
  //     }

  //     const { name, email, contact_number, business_name } = req.body;

  //     const mailSubject =
  //       "Explore 3i MedTech's Cutting-Edge Medical Solutions: Your Exclusive Brochure Awaits"; // Set a meaningful subject for the email
  //     const mailContent = `<p>Dear ${name},</p>
  //     <p>We hope this message finds you well. Thank you for your interest in our line of advanced medical instruments. As requested, we've attached two PDFs containing detailed information:</p>
  //     <ul>
  //         <li><strong>Products Booklet:</strong> Comprehensive catalog showcasing our range of medical instruments.</li>
  //         <li><strong>New Product Details:</strong> Information about our latest innovations in medical technology.</li>
  //     </ul>
  //     <p>We trust that these materials will be valuable for your evaluation and decision-making process.</p>
  //     <p>Should you have any questions or require further assistance, please feel free to reach out to us. We are committed to providing you with the support and information you need to make informed choices for your medical practice.</p>
  //     <p>Thank you for choosing 3i MedTech. We look forward to the possibility of serving you and contributing to the success of your healthcare initiatives.</p>
  //     <p>Best regards,<br>3i MedTech</p>`; // Write a personalized email content
  //     const attachments = [
  //       {
  //         filename: "3i-MedTech_All_Product_Booklet_Latest.pdf",
  //         path: path.join(
  //           __dirname,
  //           "../../../uploads/pdf/3i-MedTech_All_Product_Booklet_Latest.pdf"
  //         ),
  //       },
  //       {
  //         filename: "Smart_Digital_X-Ray_Mini90_May_2024.pdf",
  //         path: path.join(
  //           __dirname,
  //           "../../../uploads/pdf/Smart_Digital_X-Ray_Mini90_May_2024.pdf"
  //         ),
  //       },
  //     ];

  //     // Attempt to send the email
  //     sendMail(
  //       email,
  //       mailSubject,
  //       mailContent,
  //       attachments,
  //       async (error, info) => {
  //         // console.log(info);
  //         // console.log(error);
  //         if (error) {
  //           // console.error("Failed to send email:", error);
  //           return status.ResponseStatus(
  //             res,
  //             500,
  //             `Failed to send email. ${error}`
  //           );
  //         }

  //         // If email sent successfully, store data in the database
  //         try {
  //           const result = await DistributionList.create({
  //             name,
  //             email,
  //             contact_number,
  //             business_name,
  //           });

  //           if (!result) {
  //             console.error("Failed to store data in the database.");
  //             return status.ResponseStatus(
  //               res,
  //               500,
  //               "Failed to store data in the database. Please try again later."
  //             );
  //           }

  //           return status.ResponseStatus(
  //             res,
  //             200,
  //             "Brochure sent to your email successfully."
  //           );
  //         } catch (dbError) {
  //           console.error("Failed to store data in the database:", dbError);
  //           return status.ResponseStatus(
  //             res,
  //             500,
  //             "Failed to record your information securely. Please try again later."
  //           );
  //         }
  //       }
  //     );

  //   } catch (error) {
  //     console.error("Internal server error:", error);
  //     return status.ResponseStatus(res, 500, "Internal server error", error);
  //   }
  // },
  createList: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return status.ResponseStatus(
          res,
          400,
          "Validation failed. Please ensure all required fields are filled correctly.",
          errors
        );
      }

      const { name, email, contact_number, institution_name } = req.body;

      // If email sent successfully, store data in the database
      try {
        const result = await DistributionList.create({
          name,
          email,
          contact_number,
          institution_name,
        });

        if (!result) {
          console.error("Failed to store data in the database.");
          return status.ResponseStatus(
            res,
            500,
            "Failed to store data in the database. Please try again later."
          );
        }
        const mailSubject =
          "Explore 3i MedTech's Cutting-Edge Medical Solutions: Your Exclusive Brochure Is Here..!"; // Set a meaningful subject for the email
        const mailContent = `<p>Dear ${name},</p>
      <p>We hope this message finds you well. Thank you for your interest in our line of advanced medical instruments. As requested, we've attached two PDFs containing detailed information:</p>
      <ul>
          <li><strong>Products Booklet:</strong> Comprehensive catalog showcasing our range of medical instruments.</li>
          <li><strong>New Product Details:</strong> Information about our latest innovations in medical technology.</li>
      </ul>
      <p>We trust that these materials will be valuable for your evaluation and decision-making process.</p>
      <p>Should you have any questions or require further assistance, please feel free to reach out to us. We are committed to providing you with the support and information you need to make informed choices for your medical practice.</p>
      <p>Thank you for choosing 3i MedTech. We look forward to the possibility of serving you and contributing to the success of your healthcare initiatives.</p>
      <div style="text-align: center;">
      <a href="https://www.3imedtech.com/">
          <img src="${APP_URL}/assets/3i_MedTech_Logo.png" alt="Logo" style="max-width: 100px;">
      </a>
      </div>
      <p>Best regards,<br>3i MedTech</p>`; // Write a personalized email content
        const attachments = [
          {
            filename: "3i-MedTech_All_Product_Booklet_Latest.pdf",
            path: path.join(
              __dirname,
              "../../../uploads/pdf/3i-MedTech_All_Product_Booklet_Latest.pdf"
            ),
          },
          {
            filename: "Smart_Digital_X-Ray_Mini90_May_2024.pdf",
            path: path.join(
              __dirname,
              "../../../uploads/pdf/Smart_Digital_X-Ray_Mini90_May_2024.pdf"
            ),
          },
        ];

        // Attempt to send the email
        sendMail(
          email,
          mailSubject,
          mailContent,
          attachments,
          async (error, info) => {
            // console.log(info);
            // console.log(error);
            if (error) {
              // console.error("Failed to send email:", error);
              return status.ResponseStatus(
                res,
                500,
                `Failed to send email. ${error}`
              );
            }
          }
        );

        setTimeout(() => {
          return status.ResponseStatus(
            res,
            200,
            "Your details has been submitted, You'll receive the brochure shortly."
          );
        }, 3000);
      } catch (dbError) {
        console.error("Failed to store data in the database:", dbError);
        return status.ResponseStatus(
          res,
          500,
          "Failed to record your information securely. Please try again later."
        );
      }
    } catch (error) {
      console.error("Internal server error:", error);
      return status.ResponseStatus(res, 500, "Internal server error", error);
    }
  },
};
