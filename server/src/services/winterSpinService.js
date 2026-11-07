const crypto = require("crypto");
const {
  sequelize,
  WinterSpinEntry,
  WinterSpinWeeklyStock,
  WinterSpinToken,
  WinterCampaignSetting,
} = require("../models");
const winterCampaignEmailService = require("./winterCampaignEmailService");

/** Shared secret for trusted server-to-server token issue calls. */
const ISSUE_API_KEY = process.env.WINTER_SPIN_API_KEY || "";
/** Token lifetime in hours (default 72h). */
const TOKEN_TTL_HOURS = Number(process.env.WINTER_SPIN_TOKEN_TTL_HOURS || 72);
/** Public site base for issued redirect URLs. */
const PUBLIC_BASE_URL = (
  process.env.WINTER_SPIN_PUBLIC_BASE_URL ||
  process.env.CLIENT_URL ||
  "http://localhost:3030"
).replace(/\/$/, "");

/**
 * Refex Winter Campaign — weekly prize inventory (IST Monday–Sunday).
 *
 * Each new week starts again at the same quantities:
 *   ₹2,000 × 2, ₹5,000 × 2, ₹7,000 × 1, ₹10,000 × 1.
 * Every other spin is an independent coin flip between Better Luck Next Time
 * and Eligible for Bumper Prize through Lucky Draw. There is no fixed count
 * for either of those.
 */
const PRIZES = [
  {
    code: "better_luck",
    label: "Better Luck Next Time",
    shortLabel: "Better Luck Next Time",
    isWin: false,
    weeklyCap: null,
  },
  {
    code: "win_2000",
    label: "Gift worth up to ₹2,000",
    shortLabel: "Gift up to ₹2,000",
    isWin: true,
    weeklyCap: 2,
  },
  {
    code: "win_5000",
    label: "Gift worth up to ₹5,000",
    shortLabel: "Gift up to ₹5,000",
    isWin: true,
    weeklyCap: 2,
  },
  {
    code: "win_7000",
    label: "Gift worth up to ₹7,000",
    shortLabel: "Gift up to ₹7,000",
    isWin: true,
    weeklyCap: 1,
  },
  {
    code: "win_10000",
    label: "Gift worth up to ₹10,000",
    shortLabel: "Gift up to ₹10,000",
    isWin: true,
    weeklyCap: 1,
  },
  {
    code: "bumper",
    label: "Eligible for Bumper Gift through Lucky Draw",
    shortLabel: "Bumper Gift Lucky Draw",
    isWin: true,
    weeklyCap: null,
  },
];

const PRIZE_BY_CODE = Object.fromEntries(PRIZES.map((p) => [p.code, p]));

/**
 * Opening estimate of spins per day, used only until this week has a real sample.
 * After that, the week's own pace spreads the gift prizes across the days left.
 * The live value is stored in winter_campaign_settings and can be changed in the Prizes tab.
 */
const EST_SPINS_PER_DAY = Number(process.env.WINTER_SPIN_EST_SPINS_PER_DAY || 50);
const PACE_SAMPLE_SPINS = 8;
const CAPPED_PRIZE_CODES = PRIZES.filter((prize) => prize.weeklyCap != null).map((prize) => prize.code);

let configCache = null;

function builtinCaps() {
  const caps = {};
  PRIZES.forEach((prize) => {
    if (prize.weeklyCap != null) caps[prize.code] = prize.weeklyCap;
  });
  return caps;
}

function fallbackConfig() {
  return {
    startDate: process.env.WINTER_SPIN_START_DATE || "2026-11-09",
    endDate: process.env.WINTER_SPIN_END_DATE || "2027-01-15",
    estSpinsPerDay: Math.max(1, EST_SPINS_PER_DAY || 50),
    defaultCaps: builtinCaps(),
  };
}

function isRealIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseCaps(raw) {
  const base = builtinCaps();
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      parsed = null;
    }
  }
  if (!parsed || typeof parsed !== "object") return base;
  const caps = { ...base };
  Object.keys(base).forEach((code) => {
    const count = Number(parsed[code]);
    if (Number.isInteger(count) && count >= 0 && count <= 500) caps[code] = count;
  });
  return caps;
}

function rowToConfig(row) {
  return {
    startDate: row.start_date,
    endDate: row.end_date,
    estSpinsPerDay: Math.max(1, Number(row.est_spins_per_day) || 50),
    defaultCaps: parseCaps(row.default_caps),
  };
}

async function getCampaignConfig() {
  if (configCache) return configCache;
  const fallback = fallbackConfig();
  try {
    let row = await WinterCampaignSetting.findByPk(1);
    if (!row) {
      row = await WinterCampaignSetting.create({
        id: 1,
        start_date: fallback.startDate,
        end_date: fallback.endDate,
        est_spins_per_day: fallback.estSpinsPerDay,
        default_caps: JSON.stringify(fallback.defaultCaps),
        updated_at: new Date(),
      });
    }
    configCache = rowToConfig(row);
  } catch (error) {
    return fallback;
  }
  return configCache;
}

function clearCampaignConfigCache() {
  configCache = null;
}

function getIstParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );
  return parts;
}

/** Monday-start week key in Asia/Kolkata, e.g. 2026-11-03 */
function getWeekKey(date = new Date()) {
  const parts = getIstParts(date);
  const y = Number(parts.year);
  const m = Number(parts.month);
  const d = Number(parts.day);
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const weekday = weekdayMap[parts.weekday] || 1;
  const monday = new Date(utcNoon);
  monday.setUTCDate(utcNoon.getUTCDate() - (weekday - 1));
  const yy = monday.getUTCFullYear();
  const mm = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(monday.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function getIstDateString(date = new Date()) {
  const parts = getIstParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

async function isCampaignActive(date = new Date()) {
  const config = await getCampaignConfig();
  return getIstDateString(date) <= config.endDate;
}

function normalizePhone(raw) {
  if (raw == null) return "";
  // Keep the country code. The public form stores dial code + national number.
  return String(raw).replace(/\D/g, "").slice(0, 15);
}

function isValidPhone(digits) {
  if (!/^\d{8,15}$/.test(digits)) return false;
  // New Indian entries are 91 plus a 10-digit mobile. A 10-digit value that
  // happens to start with 91 is an older national number, not a country code.
  if (digits.startsWith("91") && digits.length !== 10) {
    return /^91[6-9]\d{9}$/.test(digits);
  }
  return true;
}

function normalizeName(raw) {
  return String(raw || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function normalizeToken(raw) {
  const value = String(raw || "").trim();
  if (!value) return null;
  return value.slice(0, 255);
}

function campaignClosedMessage() {
  return "The Refex Winter Carnival contest is over.";
}

function mapEntry(entry) {
  if (!entry) return null;
  const prize = PRIZE_BY_CODE[entry.prize_code];
  return {
    prizeCode: entry.prize_code,
    prizeLabel: prize ? prize.label : entry.prize_label,
    isWin: entry.is_win,
    weekKey: entry.week_key,
    spunAt: entry.spun_at,
  };
}

async function openSpinSession(token) {
  const cleanToken = normalizeToken(token);
  if (!cleanToken) {
    return { ok: false, status: 403, message: "Access denied." };
  }

  const record = await WinterSpinToken.findOne({ where: { token: cleanToken } });
  if (!record) {
    return { ok: false, status: 403, message: "Access denied." };
  }
  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    return { ok: false, status: 403, message: "Access denied. This spin session has expired." };
  }

  return {
    ok: true,
    cleanName: normalizeName(record.name),
    cleanPhone: record.phone,
    cleanToken: record.token,
  };
}

function cryptoWeightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return null;
  const roll = crypto.randomInt(0, total);
  let cursor = 0;
  for (const item of items) {
    cursor += item.weight;
    if (roll < cursor) return item;
  }
  return items[items.length - 1];
}

/** Mon=1 … Sun=7 in Asia/Kolkata */
function getIstWeekdayNumber(date = new Date()) {
  const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  return weekdayMap[getIstParts(date).weekday] || 1;
}

/** Days left in the IST week including today (1–7). */
function getRemainingDaysInWeek(date = new Date()) {
  return 8 - getIstWeekdayNumber(date);
}

/**
 * Spins still expected after this one. Sunday (or the last day) returns 0 so
 * any cash still in stock is awarded before the week ends. A brand-new week
 * uses the daily estimate; once eight people have spun, the week's own rate
 * takes over and a quiet week still gives out its six cash prizes.
 */
function expectedFutureSpins(spinsSoFar, date = new Date(), estSpinsPerDay = EST_SPINS_PER_DAY) {
  const futureDays = Math.max(0, getRemainingDaysInWeek(date) - 1);
  if (futureDays === 0) return 0;

  const prior = Math.max(1, Number(estSpinsPerDay) || EST_SPINS_PER_DAY);
  if (spinsSoFar < PACE_SAMPLE_SPINS) return futureDays * prior;

  const observed = spinsSoFar / Math.max(1, getIstWeekdayNumber(date));
  return futureDays * Math.max(1, observed);
}

/** True when this spin should take one of the week's remaining cash slots. */
function shouldAwardCash(remainingSlots, spinsSoFar, date = new Date(), estSpinsPerDay = EST_SPINS_PER_DAY) {
  if (remainingSlots <= 0) return false;
  const horizon = expectedFutureSpins(spinsSoFar, date, estSpinsPerDay) + 1;
  const probability = Math.min(1, remainingSlots / horizon);
  const scale = 1_000_000;
  const threshold = Math.floor(probability * scale);
  return crypto.randomInt(0, scale) < threshold;
}

function pickOpenOutcome() {
  return crypto.randomInt(0, 2) === 0
    ? PRIZE_BY_CODE.better_luck
    : PRIZE_BY_CODE.bumper;
}

async function ensureWeeklyStock(weekKey, transaction) {
  const config = await getCampaignConfig();
  const capped = PRIZES.filter((prize) => prize.weeklyCap != null);
  for (const prize of capped) {
    await WinterSpinWeeklyStock.findOrCreate({
      where: { week_key: weekKey, prize_code: prize.code },
      defaults: {
        week_key: weekKey,
        prize_code: prize.code,
        cap: config.defaultCaps[prize.code] ?? prize.weeklyCap,
        used: 0,
      },
      transaction,
    });
  }
}

async function consumeWeeklyStock(weekKey, prizeCode, transaction) {
  const prize = PRIZE_BY_CODE[prizeCode];
  if (!prize || prize.weeklyCap == null) return true;

  const [, meta] = await sequelize.query(
    `UPDATE winter_spin_weekly_stock
     SET used = used + 1
     WHERE week_key = :weekKey
       AND prize_code = :prizeCode
       AND used < cap`,
    {
      replacements: { weekKey, prizeCode },
      transaction,
    }
  );
  return (meta?.affectedRows || 0) > 0;
}

async function pickSecurePrize(weekKey, transaction) {
  await ensureWeeklyStock(weekKey, transaction);

  const stocks = await WinterSpinWeeklyStock.findAll({
    where: { week_key: weekKey },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const config = await getCampaignConfig();
  const spinsSoFar = await WinterSpinEntry.count({
    where: { week_key: weekKey },
    transaction,
  });

  let cashChoices = stocks
    .map((row) => ({
      prize: PRIZE_BY_CODE[row.prize_code],
      weight: Number(row.cap) - Number(row.used),
    }))
    .filter((row) => row.prize && row.prize.weeklyCap != null && row.weight > 0);

  const remainingSlots = cashChoices.reduce((sum, row) => sum + row.weight, 0);

  if (shouldAwardCash(remainingSlots, spinsSoFar, new Date(), config.estSpinsPerDay)) {
    for (let attempt = 0; attempt < cashChoices.length; attempt += 1) {
      const picked = cryptoWeightedPick(cashChoices);
      if (!picked?.prize) break;
      const ok = await consumeWeeklyStock(weekKey, picked.prize.code, transaction);
      if (ok) return picked.prize;
      cashChoices = cashChoices.filter((row) => row.prize.code !== picked.prize.code);
      if (!cashChoices.length) break;
    }
  }

  return pickOpenOutcome();
}

/**
 * Only server-issued tokens are valid. Random query strings are rejected.
 */
async function assertValidIssuedToken({ token, phone, name, forSpin = false }) {
  const cleanToken = normalizeToken(token);
  const cleanPhone = normalizePhone(phone);
  const cleanName = normalizeName(name);

  if (!cleanToken) {
    return { ok: false, status: 403, message: "Access denied. A valid token is required." };
  }
  if (!isValidPhone(cleanPhone)) {
    return { ok: false, status: 400, message: "A valid mobile number is required." };
  }
  if (!cleanName || cleanName.length < 2) {
    return { ok: false, status: 400, message: "Name is required." };
  }

  const record = await WinterSpinToken.findOne({ where: { token: cleanToken } });
  if (!record) {
    return {
      ok: false,
      status: 403,
      message: "Access denied. Invalid or unknown token.",
    };
  }

  if (record.phone !== cleanPhone) {
    return {
      ok: false,
      status: 403,
      message: "Access denied. Token does not match this phone number.",
    };
  }

  // Name must match what was registered with the token
  if (normalizeName(record.name).toLowerCase() !== cleanName.toLowerCase()) {
    return {
      ok: false,
      status: 403,
      message: "Access denied. Token does not match this name.",
    };
  }

  if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      status: 403,
      message: "Access denied. This spin link has expired.",
    };
  }

  if (forSpin && record.used_at) {
    // Spin may still return existing entry for this phone; flag for caller
    return {
      ok: true,
      tokenRecord: record,
      tokenAlreadyUsed: true,
      cleanName,
      cleanPhone,
      cleanToken,
    };
  }

  return {
    ok: true,
    tokenRecord: record,
    tokenAlreadyUsed: Boolean(record.used_at),
    cleanName,
    cleanPhone,
    cleanToken,
  };
}

function isIssueApiKeyValid(providedKey) {
  if (!ISSUE_API_KEY) return false;
  const a = Buffer.from(String(providedKey || "").trim());
  const b = Buffer.from(String(ISSUE_API_KEY).trim());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function buildSpinPath(name, phone, token) {
  return `/winter-carnival/spin?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(
    phone
  )}&token=${encodeURIComponent(token)}`;
}

/**
 * Create or reuse a spin token. Used by our public campaign form.
 */
async function mintSpinAccess({ name, phone }) {
  const cleanName = normalizeName(name);
  const cleanPhone = normalizePhone(phone);

  if (!cleanName || cleanName.length < 2) {
    return { ok: false, status: 400, message: "Name is required." };
  }
  if (!isValidPhone(cleanPhone)) {
    return {
      ok: false,
      status: 400,
      message: "A valid mobile number is required.",
    };
  }
  if (!(await isCampaignActive())) {
    return {
      ok: false,
      status: 403,
      message: campaignClosedMessage(),
    };
  }

  // Reuse unused non-expired token for same phone if present
  const existing = await WinterSpinToken.findOne({
    where: { phone: cleanPhone, used_at: null },
    order: [["id", "DESC"]],
  });
  if (
    existing &&
    (!existing.expires_at || new Date(existing.expires_at).getTime() > Date.now())
  ) {
    const spinPath = buildSpinPath(existing.name, existing.phone, existing.token);
    return {
      ok: true,
      reused: true,
      token: existing.token,
      name: existing.name,
      phone: existing.phone,
      expiresAt: existing.expires_at,
      spinPath,
      spinUrl: `${PUBLIC_BASE_URL}${spinPath}`,
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + Math.max(1, TOKEN_TTL_HOURS) * 60 * 60 * 1000);

  await WinterSpinToken.create({
    token,
    name: cleanName,
    phone: cleanPhone,
    created_at: new Date(),
    expires_at: expiresAt,
    used_at: null,
  });

  const spinPath = buildSpinPath(cleanName, cleanPhone, token);

  return {
    ok: true,
    reused: false,
    token,
    name: cleanName,
    phone: cleanPhone,
    expiresAt,
    spinPath,
    spinUrl: `${PUBLIC_BASE_URL}${spinPath}`,
  };
}

/**
 * Trusted server-to-server issue. The public form uses mintSpinAccess directly.
 */
async function getSessionStatus(token) {
  const session = await openSpinSession(token);
  if (!session.ok) return { ok: false, status: session.status, error: session.message };
  return getStatus({
    phone: session.cleanPhone,
    name: session.cleanName,
    token: session.cleanToken,
  });
}

async function spinSession({ token, ip, userAgent }) {
  const session = await openSpinSession(token);
  if (!session.ok) return { ok: false, status: session.status, message: session.message };
  return spinOnce({
    name: session.cleanName,
    phone: session.cleanPhone,
    token: session.cleanToken,
    ip,
    userAgent,
  });
}

async function issueSpinToken({ name, phone, apiKey }) {
  if (!ISSUE_API_KEY) {
    return {
      ok: false,
      status: 503,
      message: "Token issuing is not configured (WINTER_SPIN_API_KEY).",
    };
  }
  if (!isIssueApiKeyValid(apiKey)) {
    return { ok: false, status: 401, message: "Unauthorized." };
  }
  return mintSpinAccess({ name, phone });
}

async function getStatus({ phone, name, token }) {
  const access = await assertValidIssuedToken({
    token,
    phone,
    name,
    forSpin: false,
  });
  if (!access.ok) {
    return { ok: false, status: access.status, error: access.message };
  }

  const entry = await WinterSpinEntry.findOne({
    where: { phone: access.cleanPhone },
  });
  const weekKey = getWeekKey();
  const config = await getCampaignConfig();
  const campaignActive = getIstDateString() <= config.endDate;

  return {
    ok: true,
    campaignActive,
    campaignStart: config.startDate,
    campaignEnd: config.endDate,
    weekKey,
    alreadySpun: Boolean(entry),
    entry: mapEntry(entry),
    segments: PRIZES.map((p) => ({
      code: p.code,
      label: p.shortLabel,
      isWin: p.isWin,
    })),
  };
}

async function spinOnce({ name, phone, token, ip, userAgent }) {
  const access = await assertValidIssuedToken({
    token,
    phone,
    name,
    forSpin: true,
  });
  if (!access.ok) {
    return { ok: false, status: access.status, message: access.message };
  }

  const { cleanName, cleanPhone, cleanToken } = access;

  if (!(await isCampaignActive())) {
    return {
      ok: false,
      status: 403,
      message: campaignClosedMessage(),
    };
  }

  const weekKey = getWeekKey();

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const existing = await WinterSpinEntry.findOne({
        where: { phone: cleanPhone },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (existing) {
        return {
          alreadySpun: true,
          entry: existing,
        };
      }

      // Lock token row so the same link cannot be raced
      const lockedToken = await WinterSpinToken.findOne({
        where: { token: cleanToken },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!lockedToken || lockedToken.phone !== cleanPhone) {
        throw Object.assign(new Error("Invalid token"), { status: 403 });
      }
      if (lockedToken.used_at) {
        const usedEntry = await WinterSpinEntry.findOne({
          where: { phone: cleanPhone },
          transaction,
        });
        if (usedEntry) {
          return { alreadySpun: true, entry: usedEntry };
        }
      }

      const prize = await pickSecurePrize(weekKey, transaction);

      const entry = await WinterSpinEntry.create(
        {
          name: cleanName,
          phone: cleanPhone,
          token: cleanToken,
          prize_code: prize.code,
          prize_label: prize.label,
          is_win: prize.isWin,
          week_key: weekKey,
          spun_at: new Date(),
          user_agent: userAgent ? String(userAgent).slice(0, 512) : null,
          ip_address: ip ? String(ip).slice(0, 64) : null,
        },
        { transaction }
      );

      await lockedToken.update({ used_at: new Date() }, { transaction });

      return { alreadySpun: false, entry, prize };
    });

    if (!result.alreadySpun && result.entry && !result.entry.is_win) {
      try {
        await winterCampaignEmailService.sendThankYouOnce(cleanPhone);
      } catch (mailError) {
        console.error("Winter campaign thank-you email failed:", mailError.message);
      }
    }

    return {
      ok: true,
      alreadySpun: result.alreadySpun,
      weekKey,
      entry: mapEntry(result.entry),
    };
  } catch (error) {
    if (error.status === 403) {
      return { ok: false, status: 403, message: "Access denied. Invalid token." };
    }
    if (error.name === "SequelizeUniqueConstraintError") {
      const entry = await WinterSpinEntry.findOne({
        where: { phone: cleanPhone },
      });
      if (entry) {
        return {
          ok: true,
          alreadySpun: true,
          weekKey,
          entry: mapEntry(entry),
        };
      }
    }
    throw error;
  }
}

function addIsoDays(iso, days) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function formatShortDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatOrdinalDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  const monthName = new Date(Date.UTC(year, month - 1, day)).toLocaleString("en-GB", {
    month: "long",
    timeZone: "UTC",
  });
  const mod100 = day % 100;
  const suffix = mod100 >= 11 && mod100 <= 13 ? "th" : { 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th";
  return `${day}${suffix} ${monthName} ${year}`;
}

function resolveWeekKey(input) {
  if (!input) return getWeekKey();
  if (!isRealIsoDate(input)) return null;
  const [year, month, day] = String(input).split("-").map(Number);
  return getWeekKey(new Date(Date.UTC(year, month - 1, day, 6, 30, 0)));
}

function readWholeCount(value, label) {
  const count = Number(value);
  if (!Number.isInteger(count) || count < 0 || count > 500) {
    return { ok: false, message: `${label} must be a whole number from 0 to 500.` };
  }
  return { ok: true, value: count };
}

async function buildSpinDesk(weekKey) {
  const config = await getCampaignConfig();
  const currentWeek = getWeekKey();
  const stocks = await WinterSpinWeeklyStock.findAll({ where: { week_key: weekKey } });
  const stockByCode = Object.fromEntries(stocks.map((row) => [row.prize_code, row]));
  const awardedRows = await WinterSpinEntry.findAll({
    attributes: ["prize_code", [sequelize.fn("COUNT", sequelize.col("id")), "total"]],
    where: { week_key: weekKey },
    group: ["prize_code"],
    raw: true,
  });
  const awardedByCode = Object.fromEntries(
    awardedRows.map((row) => [row.prize_code, Number(row.total) || 0])
  );
  const weekEnd = addIsoDays(weekKey, 6);

  return {
    currentWeek,
    weekKey,
    weekLabel: `${formatShortDate(weekKey)} – ${formatShortDate(weekEnd)}`,
    isCurrentWeek: weekKey === currentWeek,
    startDate: config.startDate,
    endDate: config.endDate,
    startLabel: formatOrdinalDate(config.startDate),
    endLabel: formatOrdinalDate(config.endDate),
    estSpinsPerDay: config.estSpinsPerDay,
    campaignActive: getIstDateString() <= config.endDate,
    defaultCaps: config.defaultCaps,
    prizes: PRIZES.map((prize) => {
      const awarded = awardedByCode[prize.code] || 0;
      if (prize.weeklyCap == null) {
        return {
          code: prize.code,
          label: prize.label,
          limited: false,
          cap: null,
          used: awarded,
          remaining: null,
        };
      }
      const stock = stockByCode[prize.code];
      const cap = stock ? Number(stock.cap) : Number(config.defaultCaps[prize.code] ?? prize.weeklyCap);
      const used = stock ? Number(stock.used) : 0;
      return {
        code: prize.code,
        label: prize.label,
        limited: true,
        cap,
        used,
        remaining: Math.max(0, cap - used),
        stored: Boolean(stock),
      };
    }),
  };
}

async function getSpinDesk(weekInput) {
  const weekKey = resolveWeekKey(weekInput);
  if (!weekKey) return { ok: false, status: 400, message: "Choose a valid week." };
  return { ok: true, desk: await buildSpinDesk(weekKey) };
}

async function getCampaignPeriod() {
  const config = await getCampaignConfig();
  return {
    startDate: config.startDate,
    endDate: config.endDate,
    startLabel: formatOrdinalDate(config.startDate),
    endLabel: formatOrdinalDate(config.endDate),
    campaignActive: getIstDateString() <= config.endDate,
  };
}

async function saveCampaignSettings(body) {
  const startDate = String(body.startDate || "").trim();
  const endDate = String(body.endDate || "").trim();
  if (!isRealIsoDate(startDate) || !isRealIsoDate(endDate)) {
    return { ok: false, status: 400, message: "Enter a valid start date and end date." };
  }
  if (startDate > endDate) {
    return { ok: false, status: 400, message: "The end date must be on or after the start date." };
  }
  const pace = readWholeCount(body.estSpinsPerDay, "Expected spins per day");
  if (!pace.ok) return { ok: false, status: 400, message: pace.message };
  if (pace.value < 1) {
    return { ok: false, status: 400, message: "Expected spins per day must be at least 1." };
  }

  const caps = {};
  for (const code of CAPPED_PRIZE_CODES) {
    const prize = PRIZE_BY_CODE[code];
    const count = readWholeCount(body.defaultCaps?.[code], prize.shortLabel);
    if (!count.ok) return { ok: false, status: 400, message: count.message };
    caps[code] = count.value;
  }

  const payload = {
    start_date: startDate,
    end_date: endDate,
    est_spins_per_day: pace.value,
    default_caps: JSON.stringify(caps),
    updated_at: new Date(),
  };
  const existing = await WinterCampaignSetting.findByPk(1);
  if (existing) await existing.update(payload);
  else await WinterCampaignSetting.create({ id: 1, ...payload });
  clearCampaignConfigCache();
  const weekKey = resolveWeekKey(body.weekKey) || getWeekKey();
  return { ok: true, message: "Contest settings saved.", desk: await buildSpinDesk(weekKey) };
}

async function saveWeekStock({ weekKey: weekInput, caps }) {
  const weekKey = resolveWeekKey(weekInput);
  if (!weekKey) return { ok: false, status: 400, message: "Choose a valid week." };

  const existing = await WinterSpinWeeklyStock.findAll({ where: { week_key: weekKey } });
  const byCode = Object.fromEntries(existing.map((row) => [row.prize_code, row]));
  const nextCaps = {};
  for (const code of CAPPED_PRIZE_CODES) {
    const prize = PRIZE_BY_CODE[code];
    const count = readWholeCount(caps?.[code], prize.shortLabel);
    if (!count.ok) return { ok: false, status: 400, message: count.message };
    const used = byCode[code] ? Number(byCode[code].used) : 0;
    if (count.value < used) {
      return {
        ok: false,
        status: 400,
        message: `${prize.shortLabel} has already been given ${used} time${used === 1 ? "" : "s"} this week. The count cannot be lower than that.`,
      };
    }
    nextCaps[code] = count.value;
  }

  await sequelize.transaction(async (transaction) => {
    for (const code of CAPPED_PRIZE_CODES) {
      const row = byCode[code];
      if (row) {
        await row.update({ cap: nextCaps[code] }, { transaction });
      } else {
        await WinterSpinWeeklyStock.create(
          { week_key: weekKey, prize_code: code, cap: nextCaps[code], used: 0 },
          { transaction }
        );
      }
    }
  });

  return { ok: true, message: "This week's prize counts are saved.", desk: await buildSpinDesk(weekKey) };
}

module.exports = {
  PRIZES,
  PRIZE_BY_CODE,
  getWeekKey,
  isCampaignActive,
  getCampaignPeriod,
  getSpinDesk,
  saveCampaignSettings,
  saveWeekStock,
  normalizePhone,
  isValidPhone,
  normalizeName,
  getStatus,
  getStatusByPhone: getStatus,
  mintSpinAccess,
  issueSpinToken,
  getSessionStatus,
  spinSession,
  spinOnce,
};
