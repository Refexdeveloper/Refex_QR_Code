const router = require("express").Router();
const brochureDownload = require("../../controllers/brochure/brochure_download");
const {
  createBD,
} = require("../../middlewares/brochure/brochureDownloadValidator");

router.post("/brochure_download", createBD, brochureDownload.createBD);

module.exports = router;
