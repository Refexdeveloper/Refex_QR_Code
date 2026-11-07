const { ApiConfig } = require("../models");
const status = require("../helpers/Response");
const { runHrmsUserSync } = require("../services/hrmsUserSync");
const {
  applyHrmsSyncCronConfig,
  getHrmsSyncCronStatus,
} = require("../services/hrmsCronScheduler");

const MASKED_PASSWORD = "••••••";

function parseCronTime(cronHour, cronMinute) {
  const hour = parseInt(cronHour, 10);
  const minute = parseInt(cronMinute, 10);

  if (Number.isNaN(hour) || hour < 0 || hour > 23) {
    return { error: "cronHour must be between 0 and 23" };
  }
  if (Number.isNaN(minute) || minute < 0 || minute > 59) {
    return { error: "cronMinute must be between 0 and 59" };
  }

  return { hour, minute };
}

function formatApiConfigResponse(cfg) {
  const plain = cfg ? cfg.get({ plain: true }) : null;
  const cronStatus = getHrmsSyncCronStatus();

  return {
    baseUrl: plain?.base_url || "",
    accessToken: plain?.access_token || "",
    apiKey: plain?.api_key || "",
    username: plain?.username || "",
    password: plain?.password ? MASKED_PASSWORD : "",
    headersJson: plain?.headers_json || "",
    cronEnabled: plain ? Boolean(plain.hrms_sync_cron_enabled) : cronStatus.enabled,
    cronHour: plain?.hrms_sync_cron_hour ?? cronStatus.hour,
    cronMinute: plain?.hrms_sync_cron_minute ?? cronStatus.minute,
    cronTimezone: cronStatus.timezone,
    cronRunning: cronStatus.running,
    cronExpression: cronStatus.cronExpression,
    cronScheduleLabel: cronStatus.scheduleLabel,
  };
}

module.exports = {
  getApiConfig: async (req, res) => {
    try {
      const cfg = await ApiConfig.findOne({ where: { is_active: true } });
      if (!cfg) {
        return status.ResponseStatus(res, 200, "No API config", {
          ...formatApiConfigResponse(null),
        });
      }
      return status.ResponseStatus(res, 200, "API config fetched", formatApiConfigResponse(cfg));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch API config", {
        error: error.message,
      });
    }
  },

  upsertApiConfig: async (req, res) => {
    try {
      const {
        baseUrl,
        accessToken,
        apiKey,
        username,
        password,
        headersJson,
        cronEnabled,
        cronHour,
        cronMinute,
      } = req.body;
      if (!baseUrl) {
        return status.ResponseStatus(res, 400, "baseUrl is required");
      }

      let cfg = await ApiConfig.findOne({ where: { is_active: true } });
      const payload = {
        base_url: baseUrl,
        access_token: accessToken || null,
        api_key: apiKey || null,
        username: username || null,
        headers_json: headersJson || null,
        updated_by: String(req.session_data?.user_id || "admin"),
        is_active: true,
      };

      if (password !== undefined && password !== "" && password !== MASKED_PASSWORD) {
        payload.password = password;
      }

      if (cronEnabled !== undefined) {
        payload.hrms_sync_cron_enabled = Boolean(cronEnabled);
      }
      if (cronHour !== undefined || cronMinute !== undefined) {
        const parsed = parseCronTime(
          cronHour ?? cfg?.hrms_sync_cron_hour ?? 22,
          cronMinute ?? cfg?.hrms_sync_cron_minute ?? 0
        );
        if (parsed.error) {
          return status.ResponseStatus(res, 400, parsed.error);
        }
        payload.hrms_sync_cron_hour = parsed.hour;
        payload.hrms_sync_cron_minute = parsed.minute;
      }

      if (cfg) {
        await cfg.update(payload);
      } else {
        cfg = await ApiConfig.create({
          ...payload,
          hrms_sync_cron_enabled:
            cronEnabled !== undefined ? Boolean(cronEnabled) : true,
          hrms_sync_cron_hour: payload.hrms_sync_cron_hour ?? 22,
          hrms_sync_cron_minute: payload.hrms_sync_cron_minute ?? 0,
        });
      }

      await cfg.reload();
      applyHrmsSyncCronConfig({
        enabled: cfg.hrms_sync_cron_enabled,
        hour: cfg.hrms_sync_cron_hour,
        minute: cfg.hrms_sync_cron_minute,
      });

      return status.ResponseStatus(res, 200, "API config saved", formatApiConfigResponse(cfg));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to save API config", {
        error: error.message,
      });
    }
  },

  updateCronSchedule: async (req, res) => {
    try {
      const { enabled, cronHour, cronMinute } = req.body;
      const cfg = await ApiConfig.findOne({ where: { is_active: true } });

      if (!cfg) {
        return status.ResponseStatus(
          res,
          400,
          "Save HRMS API configuration before managing the scheduler"
        );
      }

      const nextEnabled = enabled !== undefined ? Boolean(enabled) : cfg.hrms_sync_cron_enabled;
      let hour = cfg.hrms_sync_cron_hour;
      let minute = cfg.hrms_sync_cron_minute;

      if (cronHour !== undefined || cronMinute !== undefined) {
        const parsed = parseCronTime(
          cronHour ?? cfg.hrms_sync_cron_hour,
          cronMinute ?? cfg.hrms_sync_cron_minute
        );
        if (parsed.error) {
          return status.ResponseStatus(res, 400, parsed.error);
        }
        hour = parsed.hour;
        minute = parsed.minute;
      }

      await cfg.update({
        hrms_sync_cron_enabled: nextEnabled,
        hrms_sync_cron_hour: hour,
        hrms_sync_cron_minute: minute,
        updated_by: String(req.session_data?.user_id || "admin"),
      });

      applyHrmsSyncCronConfig({
        enabled: nextEnabled,
        hour,
        minute,
      });

      const message = nextEnabled
        ? `Daily HRMS sync scheduler started (${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} IST)`
        : "Daily HRMS sync scheduler stopped";

      return status.ResponseStatus(res, 200, message, formatApiConfigResponse(cfg));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to update scheduler", {
        error: error.message,
      });
    }
  },

  syncHrms: async (req, res) => {
    try {
      const result = await runHrmsUserSync();
      if (result.error) {
        return status.ResponseStatus(res, 500, result.error, result);
      }
      return status.ResponseStatus(res, 200, "HRMS sync completed", result);
    } catch (error) {
      return status.ResponseStatus(res, 500, "HRMS sync failed", {
        error: error.message,
      });
    }
  },
};
