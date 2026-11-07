const router = require("express").Router();
const contestFormController = require("../../controllers/contest/contestForm");
const {
  validation: { createContestForm },
  fileUploadMiddleware,
} = require("../../middlewares/contest/contestFormValidator");

router.post(
  "/contest_form",
  fileUploadMiddleware, // Handle file upload first
  createContestForm, // Then validate other fields
  contestFormController.createContestForm
);

module.exports = router;
