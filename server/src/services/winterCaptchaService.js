const crypto = require("crypto");

const CODE_LENGTH = 5;
const TTL_MS = 5 * 60 * 1000;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ISSUE_LIMIT = 120;
const REGISTER_LIMIT = 80;
const WINDOW_MS = 10 * 60 * 1000;

const usedNonces = new Map();
const issueHits = new Map();
const registerHits = new Map();

function secret() {
  return process.env.APP_KEY || "refex-winter-captcha";
}

function prune(map, now = Date.now()) {
  for (const [key, expiresAt] of map) {
    if (expiresAt < now) map.delete(key);
  }
  if (map.size > 5000) map.clear();
}

function allow(map, ip) {
  const now = Date.now();
  prune(map, now);
  const key = String(ip || "unknown").slice(0, 80);
  const row = map.get(key);
  if (!row || row.reset < now) {
    map.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  row.count += 1;
  const limit = map === issueHits ? ISSUE_LIMIT : REGISTER_LIMIT;
  return row.count <= limit;
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function renderSvg(code) {
  const glyphs = code
    .split("")
    .map((char, index) => {
      const x = 14 + index * 26;
      const y = 31 + crypto.randomInt(-2, 3);
      const rotate = crypto.randomInt(-16, 17);
      const fill = index % 2 === 0 ? "#F5C542" : "#F7FBFF";
      return `<text x="${x}" y="${y}" fill="${fill}" font-size="22" font-family="Arial,sans-serif" font-weight="700" transform="rotate(${rotate} ${x} ${y})">${char}</text>`;
    })
    .join("");

  const lines = Array.from({ length: 5 }, () => {
    const x1 = crypto.randomInt(0, 148);
    const y1 = crypto.randomInt(0, 46);
    const x2 = crypto.randomInt(0, 148);
    const y2 = crypto.randomInt(0, 46);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(232,246,255,0.35)" stroke-width="1"/>`;
  }).join("");

  const dots = Array.from({ length: 18 }, () => {
    const cx = crypto.randomInt(4, 144);
    const cy = crypto.randomInt(4, 42);
    return `<circle cx="${cx}" cy="${cy}" r="1" fill="rgba(245,197,66,0.55)"/>`;
  }).join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="148" height="46" viewBox="0 0 148 46" role="img" aria-label="Security code"><rect width="148" height="46" rx="8" fill="#0E2438"/>${lines}${dots}${glyphs}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function createCaptcha() {
  prune(usedNonces);
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[crypto.randomInt(0, ALPHABET.length)];
  }
  const nonce = crypto.randomBytes(12).toString("hex");
  const expiresAt = Date.now() + TTL_MS;
  const answerHash = sign(`${nonce}:${code}`);
  const payload = Buffer.from(JSON.stringify({ n: nonce, e: expiresAt, h: answerHash })).toString("base64url");
  return {
    token: `${payload}.${sign(payload)}`,
    image: renderSvg(code),
  };
}

function verifyCaptcha(token, answer) {
  prune(usedNonces);
  const clean = String(answer || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const raw = String(token || "");
  const dot = raw.lastIndexOf(".");
  if (dot <= 0 || !clean) return false;

  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!safeEqual(signature, sign(payload))) return false;

  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch (error) {
    return false;
  }
  if (!data?.n || !data?.e || !data?.h || Number(data.e) < Date.now()) return false;
  if (usedNonces.has(data.n)) return false;
  usedNonces.set(data.n, Number(data.e));

  return safeEqual(data.h, sign(`${data.n}:${clean}`));
}

module.exports = {
  createCaptcha,
  verifyCaptcha,
  allowIssue: (ip) => allow(issueHits, ip),
  allowRegister: (ip) => allow(registerHits, ip),
};
