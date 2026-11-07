const { body } = require("express-validator");

const validation = {
  createBD: [
    body("name")
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ max: 45 })
      .withMessage("Name must not exceed 45 characters."),
    body("designation")
      .notEmpty()
      .withMessage("Designation is required.")
      .isLength({ max: 45 })
      .withMessage("Designation must not exceed 45 characters."),
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    body("phone")
      .optional()
      .isLength({ min: 10, max: 10 })
      .withMessage("Phone number must be 10 digits."),
    body("downloaded_file")
      .notEmpty()
      .withMessage("Downloaded file is required.")
      .isIn([
        "All Product Brochure",
        "Anamaya Brochure",
        "Mini 90 Brochure",
        "Drive Link",
      ])
      .withMessage("Invalid downloaded file option."),
  ],
};

module.exports = validation;
