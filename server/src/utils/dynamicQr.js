const { Op } = require("sequelize");
const { DynamicQrCode } = require("../models");

async function generateDynamicQrCodeId() {
  const year = new Date().getFullYear();
  const prefix = `DQR/${year}/`;

  const latest = await DynamicQrCode.findOne({
    where: {
      code: { [Op.like]: `${prefix}%` },
    },
    order: [["code", "DESC"]],
    attributes: ["code"],
  });

  let next = 1;
  if (latest?.code) {
    const parts = latest.code.split("/");
    const lastSeq = parseInt(parts[2], 10);
    if (!Number.isNaN(lastSeq)) {
      next = lastSeq + 1;
    }
  }

  return `${prefix}${String(next).padStart(4, "0")}`;
}

function slugifyName(name) {
  const slug = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || "qr";
}

function getPublicBaseUrl() {
  return (
    process.env.APP_URL ||
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:3030"
  ).replace(/\/$/, "");
}

function buildDynamicQrStaticUrl(record) {
  const slug = record.slug || slugifyName(record.name);
  return `${getPublicBaseUrl()}/qr/d/${record.id}/${slug}`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
  generateDynamicQrCodeId,
  slugifyName,
  getPublicBaseUrl,
  buildDynamicQrStaticUrl,
  escapeHtml,
};
