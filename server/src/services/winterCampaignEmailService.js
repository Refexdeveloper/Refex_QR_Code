const { Op } = require("sequelize");
const { WinterCampaignSubmission, WinterSpinEntry } = require("../models");
const { sendMail } = require("./smtpService");

const LOGO_URL = "https://refexrenewables.com/img/logo.png";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildThankYouHtml(name) {
  const safeName = escapeHtml(name || "there");
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <div style="max-width:560px;margin:24px auto;padding:24px;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="${LOGO_URL}" alt="Refex" style="max-width:180px;height:auto;" />
    </div>
    <h2 style="color:#1a1a1a;margin:0 0 16px 0;font-size:20px;">Thank you for participating</h2>
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;">Hello ${safeName},</p>
    <p style="color:#333;margin:0 0 16px 0;line-height:1.5;">Thank you for participating in the Refex Winter Carnival at Pune Airport.</p>
    <p style="color:#9ca3af;margin:24px 0 0 0;font-size:12px;line-height:1.5;text-align:center;">
      Refex Airports Retail
    </p>
  </div>
</body>
</html>`;
}

function buildThankYouText(name) {
  const safeName = String(name || "there").replace(/[\r\n]/g, " ");
  return [
    "Thank you for participating",
    "",
    `Hello ${safeName},`,
    "",
    "Thank you for participating in the Refex Winter Carnival at Pune Airport.",
    "",
    "Refex Airports Retail",
  ].join("\n");
}

/**
 * One thank-you per submission. Winners are skipped. A row that was already
 * mailed is skipped, including a person who submits again.
 */
async function sendThankYouOnce(phone) {
  const cleanPhone = String(phone || "");
  const entry = await WinterSpinEntry.findOne({ where: { phone: cleanPhone } });
  if (!entry || entry.is_win) return { sent: false, skipped: true };

  const submission = await WinterCampaignSubmission.findOne({ where: { phone: cleanPhone } });
  if (!submission || submission.confirmation_sent_at) return { sent: false, skipped: true };

  const email = String(submission.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { sent: false, skipped: true, error: "Invalid recipient email" };
  }

  const [claimed] = await WinterCampaignSubmission.update(
    { confirmation_sent_at: new Date() },
    { where: { id: submission.id, confirmation_sent_at: { [Op.is]: null } } }
  );
  if (!claimed) return { sent: false, skipped: true };

  const result = await sendMail({
    to: email,
    subject: "Thank you for participating in the Refex Winter Carnival",
    text: buildThankYouText(submission.name),
    html: buildThankYouHtml(submission.name),
  });

  if (!result.sent) {
    await WinterCampaignSubmission.update(
      { confirmation_sent_at: null },
      { where: { id: submission.id } }
    );
    console.error("Winter campaign thank-you email was not sent:", result.error || "unknown error");
  }

  return result;
}

module.exports = { sendThankYouOnce };
