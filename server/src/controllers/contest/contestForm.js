const { ContestForm } = require("../../models");
const { validationResult } = require("express-validator");
const status = require("../../helpers/Response");
const path = require("path");

module.exports = {
  createContestForm: async (req, res) => {
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

      const {
        name,
        mobile_number,
        email,
        has_residential_address,
        is_participate,
        is_acknowledge,
      } = req.body;

      // Check if file was uploaded
      if (!req.file) {
        return status.ResponseStatus(res, 400, "Invoice file is required.");
      }

      const invoicePath = req.file.path;

      // Save the form data to the database
      const newContestForm = await ContestForm.create({
        name,
        mobile_number,
        email,
        has_residential_address,
        is_participate,
        is_acknowledge,
        invoice: req.file.filename, // Store only the filename
      });

      if (!newContestForm) {
        return status.ResponseStatus(
          res,
          500,
          "An error occurred while saving the contest form data."
        );
      }

      return status.ResponseStatus(
        res,
        201,
        "Thank You for your submission..!",
        {
          id: newContestForm.id,
          name: newContestForm.name,
          email: newContestForm.email,
        }
      );
    } catch (error) {
      console.error("Error creating contest form:", error);
      return status.ResponseStatus(
        res,
        500,
        "An error occurred while creating the contest form."
      );
    }
  },
};
