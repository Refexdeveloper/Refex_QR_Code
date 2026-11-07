const { SmtpConfig } = require("../models");
const status = require("../helpers/Response");
const {
  MASKED_PASSWORD,
  createTransporter,
  formatSmtpResponse,
} = require("../services/smtpService");

module.exports = {
  get: async (req, res) => {
    try {
      const config = await SmtpConfig.findOne({ where: { is_active: true } });
      return status.ResponseStatus(res, 200, "SMTP config fetched", formatSmtpResponse(config));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch SMTP config", {
        error: error.message,
      });
    }
  },

  upsert: async (req, res) => {
    try {
      const { host, port, secure, user, password, fromEmail, fromName } = req.body;

      let config = await SmtpConfig.findOne({ where: { is_active: true } });
      const payload = {
        host: host != null ? String(host).trim() : "",
        port: port != null && port !== "" ? Number(port) : null,
        secure: secure !== false && secure !== "false",
        user: user != null ? String(user).trim() : "",
        from_email: fromEmail != null ? String(fromEmail).trim() : "",
        from_name: fromName != null ? String(fromName).trim() : "",
      };

      if (password !== undefined && password !== "" && password !== MASKED_PASSWORD) {
        payload.password = String(password);
      }

      if (!config) {
        config = await SmtpConfig.create({ ...payload, is_active: true });
      } else {
        await config.update(payload);
        await config.reload();
      }

      return status.ResponseStatus(res, 200, "SMTP configuration saved", formatSmtpResponse(config));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to save SMTP config", {
        error: error.message,
      });
    }
  },

  test: async (req, res) => {
    try {
      const testEmail = (req.body?.testEmail || "").trim();
      if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
        return status.ResponseStatus(res, 400, "Valid test email address is required");
      }

      const config = await SmtpConfig.findOne({ where: { is_active: true } });
      if (!config || !config.host || !config.user) {
        return status.ResponseStatus(
          res,
          400,
          "SMTP config not set or incomplete. Save host and user first."
        );
      }

      const transporter = createTransporter(config);
      const from = config.from_email || config.user || "noreply@localhost";
      const fromName = config.from_name || "Refex QR Code";

      await transporter.sendMail({
        from: config.from_name ? `"${fromName}" <${from}>` : from,
        to: testEmail,
        subject: "Refex QR Code – SMTP test",
        text: "This is a test email from your Refex QR Code SMTP configuration. If you received this, SMTP is working.",
      });

      return status.ResponseStatus(res, 200, "Test email sent successfully");
    } catch (error) {
      return status.ResponseStatus(res, 500, error.message || "Failed to send test email", {
        error: error.message,
      });
    }
  },
};
