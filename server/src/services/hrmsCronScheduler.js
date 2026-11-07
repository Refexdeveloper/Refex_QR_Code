const cron = require("node-cron");
const { ApiConfig } = require("../models");
const { runHrmsUserSync } = require("./hrmsUserSync");

const TIMEZONE = "Asia/Kolkata";

let hrmsSyncTask = null;
let currentConfig = {
  enabled: true,
  hour: 22,
  minute: 0,
};

function buildCronExpression(hour, minute) {
  return `${minute} ${hour} * * *`;
}

function formatScheduleLabel(hour, minute) {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}:${m} IST daily`;
}

async function executeHrmsSyncJob() {
  console.log("Running scheduled HRMS user sync job...");
  try {
    const result = await runHrmsUserSync();
    if (result.error) {
      console.error("HRMS user sync job error:", result.error);
    } else {
      console.log(
        `HRMS user sync done. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`
      );
    }
  } catch (error) {
    console.error("Error in HRMS user sync job:", error);
  }
}

function stopHrmsSyncCron() {
  if (hrmsSyncTask) {
    hrmsSyncTask.stop();
    if (typeof hrmsSyncTask.destroy === "function") {
      hrmsSyncTask.destroy();
    }
    hrmsSyncTask = null;
  }
}

function startHrmsSyncCron(hour, minute) {
  stopHrmsSyncCron();
  const expression = buildCronExpression(hour, minute);
  hrmsSyncTask = cron.schedule(expression, executeHrmsSyncJob, {
    scheduled: true,
    timezone: TIMEZONE,
  });
  console.log(`HRMS sync cron scheduled: ${expression} (${TIMEZONE})`);
}

function applyHrmsSyncCronConfig({ enabled, hour, minute }) {
  const h = Number.isInteger(hour) ? hour : currentConfig.hour;
  const m = Number.isInteger(minute) ? minute : currentConfig.minute;

  currentConfig = {
    enabled: Boolean(enabled),
    hour: h,
    minute: m,
  };

  if (enabled) {
    startHrmsSyncCron(h, m);
  } else {
    stopHrmsSyncCron();
  }
}

function getHrmsSyncCronStatus() {
  return {
    enabled: currentConfig.enabled,
    hour: currentConfig.hour,
    minute: currentConfig.minute,
    running: Boolean(hrmsSyncTask),
    timezone: TIMEZONE,
    cronExpression: buildCronExpression(currentConfig.hour, currentConfig.minute),
    scheduleLabel: formatScheduleLabel(currentConfig.hour, currentConfig.minute),
  };
}

async function initHrmsSyncCronFromDb() {
  const cfg = await ApiConfig.findOne({ where: { is_active: true } });
  const enabled = cfg ? Boolean(cfg.hrms_sync_cron_enabled) : true;
  const hour = cfg?.hrms_sync_cron_hour ?? 22;
  const minute = cfg?.hrms_sync_cron_minute ?? 0;

  applyHrmsSyncCronConfig({ enabled, hour, minute });
  console.log(
    `HRMS sync cron ${enabled ? "enabled" : "disabled"} at ${formatScheduleLabel(hour, minute)}`
  );
}

module.exports = {
  applyHrmsSyncCronConfig,
  initHrmsSyncCronFromDb,
  getHrmsSyncCronStatus,
  buildCronExpression,
};
