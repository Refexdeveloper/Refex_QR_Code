const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { UploadFileQrCode } = require("../models");
const { slugifyName, getPublicBaseUrl } = require("./dynamicQr");

const UPLOAD_SUBDIR = "qr_files";
const MAX_FILE_SIZE = 100 * 1024 * 1024;

function getUploadsRoot() {
  return path.join(__dirname, "../../uploads");
}

function getQrFilesDir() {
  const dir = path.join(getUploadsRoot(), UPLOAD_SUBDIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

async function generateUploadFileQrCodeId() {
  const year = new Date().getFullYear();
  const prefix = `UQR/${year}/`;

  const latest = await UploadFileQrCode.findOne({
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

function buildUploadFileQrStaticUrl(record) {
  const slug = record.slug || slugifyName(record.name);
  return `${getPublicBaseUrl()}/qr/f/${record.id}/${slug}`;
}

function getFileAbsolutePath(record) {
  return path.join(getUploadsRoot(), record.stored_path);
}

function deleteStoredFile(record) {
  if (!record?.stored_path) return;
  const absolute = getFileAbsolutePath(record);
  if (fs.existsSync(absolute)) {
    fs.unlinkSync(absolute);
  }
}

function normalizeAccessMode(value) {
  const mode = String(value || "").trim().toLowerCase();
  return mode === "download" ? "download" : "view";
}

function sendStoredFile(res, record, mode) {
  const absolute = getFileAbsolutePath(record);
  if (!fs.existsSync(absolute)) {
    return res.status(404).send("File not found");
  }

  const accessMode = normalizeAccessMode(mode || record.access_mode);
  const originalName = record.original_name || path.basename(absolute);
  const mimeType = record.mime_type || "application/octet-stream";

  if (accessMode === "download") {
    return res.download(absolute, originalName);
  }

  res.setHeader("Content-Type", mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(originalName)}"`);
  return res.sendFile(absolute);
}

function formatFileSize(bytes) {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

module.exports = {
  UPLOAD_SUBDIR,
  MAX_FILE_SIZE,
  getUploadsRoot,
  getQrFilesDir,
  generateUploadFileQrCodeId,
  buildUploadFileQrStaticUrl,
  getFileAbsolutePath,
  deleteStoredFile,
  normalizeAccessMode,
  sendStoredFile,
  formatFileSize,
  slugifyName,
};
