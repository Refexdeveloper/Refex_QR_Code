const cron = require("node-cron");
const reportService = require("./services/reportService");

const setupCronJobs = () => {
  cron.schedule(
    "0 10 * * *",
    async () => {
      console.log("Running daily contest form report job...");
      try {
        await reportService.generateAndSendDailyReport();
      } catch (error) {
        console.error("Error in daily contest form report job:", error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Contest report cron job scheduled");
};

module.exports = setupCronJobs;
