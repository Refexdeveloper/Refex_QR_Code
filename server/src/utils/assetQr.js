const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

function getPublicAssetUrl(assetId) {
  const base = process.env.APP_URL || "http://localhost:3001";
  return `${base.replace(/\/$/, "")}/asset/${encodeURIComponent(assetId)}`;
}

function getAssetQrDiskPath(assetId) {
  // As requested: under uploads/assets/laptops
  return path.join(
    __dirname,
    "..",
    "..",
    "uploads",
    "assets",
    "laptops",
    `${assetId}.png`
  );
}

function getAssetQrPublicPath(assetId) {
  return `/uploads/assets/laptops/${encodeURIComponent(assetId)}.png`;
}

function getAssetQrFullUrl(assetId) {
  const base = process.env.APP_URL || "http://localhost:3001";
  return `${base.replace(/\/$/, "")}${getAssetQrPublicPath(assetId)}`;
}

async function ensureDir(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function generateAssetQrPng(assetId) {
  const qrPath = getAssetQrDiskPath(assetId);
  await ensureDir(path.dirname(qrPath));

  const url = getPublicAssetUrl(assetId);

  await QRCode.toFile(qrPath, url, {
    type: "png",
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });

  return {
    url,
    file_path: qrPath,
    public_path: getAssetQrPublicPath(assetId),
    qr_url: getAssetQrFullUrl(assetId),
  };
}

module.exports = {
  getPublicAssetUrl,
  getAssetQrDiskPath,
  getAssetQrPublicPath,
  getAssetQrFullUrl,
  generateAssetQrPng,
};

