const { WinterCampaignSetting } = require("../models");

const TEXT_FIELDS = [
  ["eyebrow", "The small label beside the logo", 80],
  ["title", "The title", 160],
  ["tagline", "The tagline", 240],
  ["organiser", "The organiser paragraph", 2000],
  ["introduction", "The introduction", 2000],
  ["howToTitle", "The how-to heading", 160],
  ["prizesTitle", "The prizes heading", 160],
  ["termsTitle", "The terms heading", 160],
  ["termsNote", "The terms note", 2000],
  ["formKicker", "The form label", 80],
  ["formTitle", "The form heading", 160],
  ["formSubtitle", "The form subtitle", 400],
  ["consent", "The consent text", 1000],
  ["invoiceTitle", "The invoice heading", 80],
  ["invoiceHint", "The invoice note", 400],
  ["invoiceButton", "The invoice button", 80],
  ["boardingTitle", "The boarding pass heading", 80],
  ["boardingHint", "The boarding pass note", 400],
  ["boardingButton", "The boarding pass button", 80],
  ["boardingReplace", "The replace-file button", 80],
  ["securityTitle", "The security heading", 80],
  ["securityHint", "The security note", 400],
  ["submitLabel", "The submit button", 80],
];

const LIST_FIELDS = [
  ["howTo", "How to participate", 12],
  ["prizes", "Prize description", 8],
  ["terms", "Terms", 40],
];

function cleanText(value, label, max) {
  const text = String(value ?? "").trim();
  if (!text) return { ok: false, message: `${label} cannot be empty.` };
  if (text.length > max) return { ok: false, message: `${label} is too long.` };
  return { ok: true, value: text };
}

function sanitizeFormCopy(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, status: 400, message: "The form content is missing." };
  }
  const copy = {};
  for (const [key, label, max] of TEXT_FIELDS) {
    const text = cleanText(body[key], label, max);
    if (!text.ok) return { ok: false, status: 400, message: text.message };
    copy[key] = text.value;
  }
  for (const [key, label, maxItems] of LIST_FIELDS) {
    if (!Array.isArray(body[key])) {
      return { ok: false, status: 400, message: `${label} needs at least one paragraph.` };
    }
    const items = [];
    for (const item of body[key]) {
      const text = String(item ?? "").trim();
      if (!text) continue;
      if (text.length > 8000) {
        return { ok: false, status: 400, message: `One ${label.toLowerCase()} paragraph is too long.` };
      }
      items.push(text);
    }
    if (!items.length) {
      return { ok: false, status: 400, message: `${label} needs at least one paragraph.` };
    }
    if (items.length > maxItems) {
      return { ok: false, status: 400, message: `${label} has too many paragraphs.` };
    }
    copy[key] = items;
  }
  return { ok: true, copy };
}

async function ensureSettingsRow() {
  let row = await WinterCampaignSetting.findByPk(1);
  if (row) return row;
  row = await WinterCampaignSetting.create({
    id: 1,
    start_date: process.env.WINTER_SPIN_START_DATE || "2026-11-09",
    end_date: process.env.WINTER_SPIN_END_DATE || "2027-01-15",
    est_spins_per_day: Math.max(1, Number(process.env.WINTER_SPIN_EST_SPINS_PER_DAY || 50)),
    default_caps: JSON.stringify({
      win_2000: 2,
      win_5000: 2,
      win_7000: 1,
      win_10000: 1,
    }),
    form_copy: null,
    updated_at: new Date(),
  });
  return row;
}

async function getFormCopy() {
  const row = await WinterCampaignSetting.findByPk(1);
  if (!row?.form_copy) return { copy: null };
  try {
    const copy = JSON.parse(row.form_copy);
    const checked = sanitizeFormCopy(copy);
    return { copy: checked.ok ? checked.copy : null };
  } catch (error) {
    return { copy: null };
  }
}

async function saveFormCopy(body) {
  const checked = sanitizeFormCopy(body);
  if (!checked.ok) return checked;
  const row = await ensureSettingsRow();
  await row.update({
    form_copy: JSON.stringify(checked.copy),
    updated_at: new Date(),
  });
  return { ok: true, message: "Form content saved.", copy: checked.copy };
}

module.exports = {
  getFormCopy,
  saveFormCopy,
};
