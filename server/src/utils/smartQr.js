const { Op } = require("sequelize");
const { SmartQrCode } = require("../models");
const { slugifyName, getPublicBaseUrl } = require("./dynamicQr");

async function generateSmartQrCodeId() {
  const year = new Date().getFullYear();
  const prefix = `SQR/${year}/`;

  const latest = await SmartQrCode.findOne({
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

function buildSmartQrStaticUrl(record) {
  const slug = record.slug || slugifyName(record.name);
  return `${getPublicBaseUrl()}/qr/s/${record.id}/${slug}`;
}

function resolveSmartLinkTarget(userAgent, record) {
  const ua = String(userAgent || "");

  if (/android/i.test(ua)) {
    return record.android_url;
  }

  if (
    (/iPad|iPhone|iPod/i.test(ua) && !/MSStream/i.test(ua)) ||
    /Macintosh|Mac OS X/i.test(ua)
  ) {
    return record.ios_url;
  }

  return record.fallback_url;
}

module.exports = {
  generateSmartQrCodeId,
  buildSmartQrStaticUrl,
  resolveSmartLinkTarget,
  slugifyName,
};
