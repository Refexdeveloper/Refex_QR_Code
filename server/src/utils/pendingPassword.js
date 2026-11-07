const crypto = require("crypto");

const { APP_KEY } = process.env;

function getKey() {
  return crypto.scryptSync(APP_KEY || "refex-qr-pending-password", "salt", 32);
}

function encryptPendingPassword(plainText) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

function decryptPendingPassword(stored) {
  if (!stored) return null;
  const [ivHex, encrypted] = stored.split(":");
  if (!ivHex || !encrypted) return null;
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    getKey(),
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = {
  encryptPendingPassword,
  decryptPendingPassword,
};
