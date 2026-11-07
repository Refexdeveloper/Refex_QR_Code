const { sendMail } = require("./smtpService");

const LOGO_URL = "https://refexrenewables.com/img/logo.png";

function getAppBaseUrl() {
  return (
    process.env.APP_URL ||
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:3030"
  ).replace(/\/$/, "");
}

function getLoginUrl() {
  return `${getAppBaseUrl()}/login`;
}

function getResetPasswordUrl(token) {
  return `${getAppBaseUrl()}/reset_password/${encodeURIComponent(token)}`;
}

function buildActivationHtml(user, plainPassword, loginUrl) {
  const name =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "there";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <div style="max-width:560px;margin:24px auto;padding:24px;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="${LOGO_URL}" alt="Refex" style="max-width:180px;height:auto;" />
    </div>
    <h2 style="color:#1a1a1a;margin:0 0 16px 0;font-size:20px;">Your Refex QR Code account is active</h2>
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;">Hello ${name.replace(/</g, "&lt;")},</p>
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;">Your account has been activated. Use the credentials below to sign in:</p>
    <p style="color:#333;margin:0 0 8px 0;line-height:1.5;"><strong>Email:</strong> ${user.email}</p>
    <p style="color:#333;margin:0 0 16px 0;line-height:1.5;"><strong>Password:</strong> ${plainPassword}</p>
    <p style="margin:24px 0 0 0;text-align:center;">
      <a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#2879b6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Sign in</a>
    </p>
    <p style="color:#9ca3af;margin:24px 0 0 0;font-size:12px;line-height:1.5;text-align:center;">
      Please change your password after your first login. This is an automated message from Refex QR Code.
    </p>
  </div>
</body>
</html>`;
}

/**
 * Send activation email with login credentials.
 * @returns {{ sent: boolean, error?: string }}
 */
async function sendUserActivationEmail(user, plainPassword) {
  if (!user?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    return { sent: false, error: "Invalid recipient email" };
  }

  const loginUrl = getLoginUrl();
  const name =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
  const plain = `Your Refex QR Code account is active\n\nHello ${name},\n\nEmail: ${user.email}\nPassword: ${plainPassword}\n\nSign in: ${loginUrl}\n\nPlease change your password after your first login.`;

  return sendMail({
    to: user.email,
    subject: "Your Refex QR Code account is active",
    text: plain,
    html: buildActivationHtml(user, plainPassword, loginUrl),
  });
}

function buildPasswordChangedHtml(user, loginUrl) {
  const name =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "there";
  const changedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <div style="max-width:560px;margin:24px auto;padding:24px;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="${LOGO_URL}" alt="Refex" style="max-width:180px;height:auto;" />
    </div>
    <h2 style="color:#1a1a1a;margin:0 0 16px 0;font-size:20px;">Password changed successfully</h2>
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;">Hello ${name.replace(/</g, "&lt;")},</p>
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;">Your Refex QR Code account password was changed on <strong>${changedAt} IST</strong>.</p>
    <p style="color:#333;margin:0 0 16px 0;line-height:1.5;">If you did not make this change, please contact your administrator immediately.</p>
    <p style="margin:24px 0 0 0;text-align:center;">
      <a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#2879b6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Sign in</a>
    </p>
    <p style="color:#9ca3af;margin:24px 0 0 0;font-size:12px;line-height:1.5;text-align:center;">
      This is an automated message from Refex QR Code.
    </p>
  </div>
</body>
</html>`;
}

/**
 * Notify user that their password was changed.
 * @returns {{ sent: boolean, error?: string }}
 */
async function sendPasswordChangedEmail(user) {
  if (!user?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    return { sent: false, error: "Invalid recipient email" };
  }

  const loginUrl = getLoginUrl();
  const name =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
  const changedAt = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
  const plain = `Password changed successfully\n\nHello ${name},\n\nYour Refex QR Code account password was changed on ${changedAt} IST.\n\nIf you did not make this change, please contact your administrator.\n\nSign in: ${loginUrl}`;

  return sendMail({
    to: user.email,
    subject: "Your Refex QR Code password was changed",
    text: plain,
    html: buildPasswordChangedHtml(user, loginUrl),
  });
}

function buildPasswordResetHtml(user, resetUrl) {
  const name =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "there";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <div style="max-width:560px;margin:24px auto;padding:24px;background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align:center;margin-bottom:24px;">
      <img src="${LOGO_URL}" alt="Refex" style="max-width:180px;height:auto;" />
    </div>
    <h2 style="color:#1a1a1a;margin:0 0 16px 0;font-size:20px;">Reset your password</h2>
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;">Hello ${name.replace(/</g, "&lt;")},</p>
    <p style="color:#333;margin:0 0 12px 0;line-height:1.5;">We received a request to reset the password for your Refex QR Code account (${user.email}).</p>
    <p style="color:#333;margin:0 0 16px 0;line-height:1.5;">Click the button below to choose a new password. This link expires in 1 hour.</p>
    <p style="margin:24px 0 0 0;text-align:center;">
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2879b6;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">Reset password</a>
    </p>
    <p style="color:#666;margin:24px 0 0 0;font-size:13px;line-height:1.5;">If you did not request this, you can safely ignore this email.</p>
    <p style="color:#9ca3af;margin:24px 0 0 0;font-size:12px;line-height:1.5;text-align:center;">
      This is an automated message from Refex QR Code.
    </p>
  </div>
</body>
</html>`;
}

/**
 * Send password reset link email.
 * @returns {{ sent: boolean, error?: string }}
 */
async function sendPasswordResetEmail(user, token) {
  if (!user?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    return { sent: false, error: "Invalid recipient email" };
  }

  const resetUrl = getResetPasswordUrl(token);
  const name =
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User";
  const plain = `Reset your password\n\nHello ${name},\n\nWe received a request to reset the password for your Refex QR Code account (${user.email}).\n\nOpen this link to choose a new password (expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`;

  return sendMail({
    to: user.email,
    subject: "Reset your Refex QR Code password",
    text: plain,
    html: buildPasswordResetHtml(user, resetUrl),
  });
}

module.exports = {
  sendUserActivationEmail,
  sendPasswordChangedEmail,
  sendPasswordResetEmail,
};
