const { ContestForm } = require("../models");
const excelGenerator = require("./excelGenerator");
const emailService = require("./emailService");

module.exports = {
  generateAndSendDailyReport: async () => {
    try {
      // Get current date for the report filename
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];

      // Fetch ALL data
      const contestForms = await ContestForm.findAll({
        raw: true,
        order: [["created_at", "ASC"]], // Optional: Order by creation date
      });

      if (contestForms.length === 0) {
        console.log("No contest forms found in the database");
        return;
      }

      // Generate Excel file
      const excelBuffer = await excelGenerator.generateContestFormExcel(
        contestForms
      );

      // Send email with attachment
      await emailService.sendContestFormReport(excelBuffer, formattedDate);

      console.log("Full contest form report generated and sent successfully");
    } catch (error) {
      console.error("Error in generateAndSendDailyReport:", error);
      throw error;
    }
  },
};
