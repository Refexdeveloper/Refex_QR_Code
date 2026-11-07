const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { DesignQrCode } = require("../models");

const LOGO_SUBDIR = "qr_designs/logos";

function getUploadsRoot() {
  return path.join(__dirname, "../../uploads");
}

function getLogoDir() {
  const dir = path.join(getUploadsRoot(), LOGO_SUBDIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function generateDesignQrCodeId() {
  const year = new Date().getFullYear();
  const prefix = `GQR/${year}/`;

  const latest = await DesignQrCode.findOne({
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

function buildLogoPath(filename) {
  return path.posix.join(LOGO_SUBDIR, filename);
}

function deleteLogoFile(logoPath) {
  if (!logoPath) return;
  const absolute = path.join(getUploadsRoot(), logoPath);
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }
}

function parseDesignConfig(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

module.exports = {
  LOGO_SUBDIR,
  getUploadsRoot,
  getLogoDir,
  generateDesignQrCodeId,
  buildLogoPath,
  deleteLogoFile,
  parseDesignConfig,
};
