const { check } = require("express-validator");

const validation = {
  createList: [
    check("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required and can't be empty..!"),
    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required and can't be empty..!")
      .isEmail()
      .withMessage("Invalid email")
      .normalizeEmail(),
    // check("contact_number")
    //   .optional()
    //   .isMobilePhone()
    //   .withMessage("Must be a valid contact number"),
    check("institution_name")
      .exists()
      .withMessage("Institution or Hospital Name is required"),
  ],
};

module.exports = validation;
