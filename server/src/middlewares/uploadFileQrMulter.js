const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getQrFilesDir, MAX_FILE_SIZE } = require("../utils/uploadFileQr");

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, getQrFilesDir());
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

function ensureUploadDir() {
  getQrFilesDir();
}

ensureUploadDir();

module.exports = {
  uploadSingle: upload.single("file"),
};
