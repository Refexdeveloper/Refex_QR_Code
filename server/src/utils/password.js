const crypto = require("crypto");

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generatePassword(length = 10) {
  let password = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i += 1) {
    password += CHARSET[bytes[i] % CHARSET.length];
  }
  return password;
}

module.exports = { generatePassword };
