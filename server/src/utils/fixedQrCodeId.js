const { Op } = require("sequelize");
const { FixedQrCode } = require("../models");

async function generateFixedQrCodeId() {
  const year = new Date().getFullYear();
  const prefix = `FQR/${year}/`;

  const latest = await FixedQrCode.findOne({
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

module.exports = { generateFixedQrCodeId };
