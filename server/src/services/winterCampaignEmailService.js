const { Op } = require("sequelize");
const { WinterCampaignSubmission } = require("../models");
const { sendMail } = require("./smtpService");

const LOGO_URL = "https://refexrenewables.com/img/logo.png";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function prizeNote(prizeCode) {
  if (prizeCode === "better_luck") {
    return "This spin does not include an instant gift, and you remain eligible for the weekly bumper lucky draw.";
  }
  if (prizeCode === "bumper") {
    return "You are eligible for the bumper gift through the lucky draw. This spin does not include an instant gift.";
  }
  if (["win_2000", "win_5000", "win_7000", "win_10000"].includes(prizeCode)) {
    return "This is an instant gift, not cash. The store manager confirms it with the Refex Floor Manager before handover.";
  }
  return "";
}

function buildThankYouHtml({ name, prizeLabel, note }) {
  const safeName = escapeHtml(name || "there");
  const safePrize = escapeHtml(prizeLabel || "your result");
  const safeNote = escapeHtml(note);
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
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;">Thank you for participating in the Refex Winter Carnival at Pune Airport.</p>
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;"><strong>Your spin result:</strong> ${safePrize}</p>
    ${safeNote ? `<p style="color:#333;margin:0 0 16px 0;line-height:1.5;">${safeNote}</p>` : ""}
    <p style="color:#9ca3af;margin:24px 0 0 0;font-size:12px;line-height:1.5;text-align:center;">
      Refex Airports Retail
    </p>
  </div>
</body>
</html>`;
}

function buildThankYouText({ name, prizeLabel, note }) {
  const safeName = String(name || "there").replace(/[\r\n]/g, " ");
  const safePrize = String(prizeLabel || "your result").replace(/[\r\n]/g, " ");
  return [
    "Thank you for participating",
    "",
    `Hello ${safeName},`,
    "",
    "Thank you for participating in the Refex Winter Carnival at Pune Airport.",
    "",
    `Your spin result: ${safePrize}`,
    note ? "" : null,
    note || null,
    "",
    "Refex Airports Retail",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

async function findSubmission(entry) {
  if (entry.submission_id) {
    const byId = await WinterCampaignSubmission.findByPk(entry.submission_id);
    if (byId) return byId;
  }
  const outlet = String(entry.outlet || "").trim();
  if (entry.phone && outlet) {
    return WinterCampaignSubmission.findOne({ where: { phone: entry.phone, outlet } });
  }
  if (entry.phone) {
    return WinterCampaignSubmission.findOne({
      where: { phone: entry.phone, outlet: { [Op.is]: null } },
    });
  }
  return null;
}

/**
 * One thank-you after a completed spin. Sent for every prize, including
 * Better Luck Next Time. A repeat view of a saved result does not send again.
 */
async function sendSpinThankYou(entry) {
  if (!entry) return { sent: false, skipped: true };

  const submission = await findSubmission(entry);
  const email = String(submission?.email || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { sent: false, skipped: true, error: "Invalid recipient email" };
  }

  const prizeLabel = entry.prize_label || "your result";
  const note = prizeNote(entry.prize_code);
  const content = {
    name: submission.name || entry.name,
    prizeLabel,
    note,
  };

  const result = await sendMail({
    to: email,
    subject: "Thank you for participating in the Refex Winter Carnival",
    text: buildThankYouText(content),
    html: buildThankYouHtml(content),
  });

  if (!result.sent) {
    console.error("Winter campaign thank-you email was not sent:", result.error || "unknown error");
  }

  return result;
}

module.exports = { sendSpinThankYou };
