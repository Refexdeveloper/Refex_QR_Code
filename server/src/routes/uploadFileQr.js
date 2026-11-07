const router = require("express").Router();

const auth = require("../middlewares/auth");
const uploadFileQrController = require("../controllers/uploadFileQr");
const { uploadSingle } = require("../middlewares/uploadFileQrMulter");

router.get("/upload-file-qr", auth.authCheck, uploadFileQrController.list);
router.get("/upload-file-qr/:id/file", auth.authCheck, uploadFileQrController.serveFile);
router.post(
  "/upload-file-qr",
  auth.authCheck,
  uploadSingle,
  uploadFileQrController.create
);
router.put(
  "/upload-file-qr/:id",
  auth.authCheck,
  uploadSingle,
  uploadFileQrController.update
);
router.delete("/upload-file-qr/:id", auth.authCheck, uploadFileQrController.remove);

module.exports = router;
