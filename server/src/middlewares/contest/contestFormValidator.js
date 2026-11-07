const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/contest_invoices/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Allowed file types
const allowedFileTypes = [
  "application/pdf", // PDF files
  "application/msword", // DOC files
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
  "image/jpeg", // JPEG images
  "image/png", // PNG images
  "image/gif", // GIF images
];

const fileFilter = (req, file, cb) => {
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, JPEG, PNG, and GIF files are allowed!"
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // Limit file size to 5MB
  },
});

// Validation rules
const validation = {
  createContestForm: [
    body("name")
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ max: 45 })
      .withMessage("Name must not exceed 45 characters."),
    body("mobile_number")
      .notEmpty()
      .withMessage("Mobile number is required.")
      .isLength({ min: 10, max: 10 })
      .withMessage("Mobile number must be 10 digits.")
      .matches(/^[0-9]+$/)
      .withMessage("Mobile number must contain only numbers."),
    body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    // body("residency")
    //   .notEmpty()
    //   .withMessage("Residency is required.")
    //   .isLength({ max: 45 })
    //   .withMessage("Residency must not exceed 45 characters."),
    // body("is_participate")
    //   .notEmpty()
    //   .withMessage("Participation status is required")
    //   .isIn(["true", "false", "1", "0"])
    //   .withMessage("Invalid boolean value"),
    // body("is_acknowledge")
    //   .notEmpty()
    //   .withMessage("Acknowledgement is required")
    //   .isIn(["true", "false", "1", "0"])
    //   .withMessage("Invalid boolean value"),
    body("has_residential_address")
      .notEmpty()
      .withMessage("Residential confirmation is required.")
      .isBoolean()
      .withMessage("Residential must be a boolean value."),
    body("is_participate")
      .notEmpty()
      .withMessage("Participation confirmation is required.")
      .isBoolean()
      .withMessage("Participation must be a boolean value."),
    body("is_acknowledge")
      .notEmpty()
      .withMessage("Acknowledgement is required.")
      .isBoolean()
      .withMessage("Acknowledgement must be a boolean value."),
  ],
};

// File upload middleware
const fileUploadMiddleware = upload.single("invoice");

module.exports = {
  validation,
  fileUploadMiddleware,
};
