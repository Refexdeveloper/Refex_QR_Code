const nodemailer = require("nodemailer");
const { SmtpConfig } = require("../models");

const MASKED_PASSWORD = "••••••";

async function getActiveSmtpConfig() {
  const config = await SmtpConfig.findOne({ where: { is_active: true } });
  if (!config || !config.host || !config.user) {
    return null;
  }
  return config;
}

function createTransporter(config) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port || (config.secure ? 465 : 587),
    secure: !!config.secure,
    requireTLS: true,
    auth: config.user
      ? { user: config.user, pass: config.password || "" }
      : undefined,
  });
}

function formatSmtpResponse(config) {
  if (!config) return null;
  const plain = config.get ? config.get({ plain: true }) : { ...config };
  return {
    host: plain.host || "",
    port: plain.port ?? "",
    secure: !!plain.secure,
    user: plain.user || "",
    password: plain.password ? MASKED_PASSWORD : "",
    fromEmail: plain.from_email || "",
    fromName: plain.from_name || "",
  };
}

async function sendMail({ to, subject, text, html }) {
  const config = await getActiveSmtpConfig();
  if (!config) {
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    const transporter = createTransporter(config);
    const from = config.from_email || config.user || "noreply@localhost";
    const fromName = config.from_name || "Refex QR Code";

    await transporter.sendMail({
      from: config.from_name ? `"${fromName}" <${from}>` : from,
      to,
      subject,
      text,
      html,
    });

    return { sent: true };
  } catch (error) {
    return { sent: false, error: error.message };
  }
}

module.exports = {
  MASKED_PASSWORD,
  getActiveSmtpConfig,
  createTransporter,
  formatSmtpResponse,
  sendMail,
};
