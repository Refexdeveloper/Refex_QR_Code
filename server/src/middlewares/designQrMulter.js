const path = require("path");
const multer = require("multer");
const { getLogoDir } = require("../utils/designQr");

const MAX_LOGO_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, getLogoDir());
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || "");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_LOGO_SIZE },
});

getLogoDir();

module.exports = {
  uploadLogo: upload.single("logo"),
};
