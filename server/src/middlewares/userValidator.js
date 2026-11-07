const { check } = require("express-validator");
const Role = require("../utils/userRoles");

const validation = {
  createUserSchema: [
    check("firstName").exists().withMessage("First Name is required").trim(),
    check("lastName").exists().withMessage("Last Name is required").trim(),
    check("email")
      .exists()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    check("phone").optional().trim(),
    check("userName").optional().trim(),
    check("employeeId").optional().trim(),
    check("companyName").optional().trim(),
    check("designation").optional().trim(),
    check("password")
      .optional({ values: "falsy" })
      .isLength({ min: 6 })
      .withMessage("Password must contain at least 6 characters"),
    check("role")
      .optional()
      .isIn([Role.SuperAdmin, Role.Admin, Role.User, Role.Campaign])
      .withMessage("Invalid Role type"),
    check("pageAccess").optional().isArray().withMessage("Page access must be a list"),
  ],
  changePasswordSchema: [
    check("currentPassword")
      .exists()
      .withMessage("Current password is required")
      .notEmpty()
      .withMessage("Current password is required"),
    check("newPassword")
      .exists()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must contain at least 6 characters"),
    check("confirmPassword")
      .exists()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  updateUserSchema: [
    check("firstName").optional().trim(),
    check("lastName").optional().trim(),
    check("email")
      .optional()
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    check("phone").optional().trim(),
    check("userName").optional().trim(),
    check("employeeId").optional().trim(),
    check("companyName").optional().trim(),
    check("designation").optional().trim(),
    check("role")
      .optional()
      .isIn([Role.SuperAdmin, Role.Admin, Role.User, Role.Campaign])
      .withMessage("Invalid Role type"),
    check("pageAccess").optional().isArray().withMessage("Page access must be a list"),
  ],
  validateLogin: [
    check("email")
      .exists()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
    check("password")
      .exists()
      .withMessage("Password is required")
      .notEmpty()
      .withMessage("Password must be filled"),
  ],
  forgotPasswordSchema: [
    check("email")
      .exists()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Must be a valid email")
      .normalizeEmail(),
  ],
  resetPasswordSchema: [
    check("password")
      .exists()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must contain at least 6 characters"),
    check("confirm_password")
      .exists()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
};

module.exports = {
  createUserSchema: validation.createUserSchema,
  updateUserSchema: validation.updateUserSchema,
  changePasswordSchema: validation.changePasswordSchema,
  validateLogin: validation.validateLogin,
  forgotPasswordSchema: validation.forgotPasswordSchema,
  resetPasswordSchema: validation.resetPasswordSchema,
};
