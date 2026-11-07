const router = require("express").Router();
const multer = require("multer");

const auth = require("../middlewares/auth");
const assetsController = require("../controllers/assets");

const upload = multer({ storage: multer.memoryStorage() });

// Public (no-auth) read for asset detail page
router.get("/assets_public/:asset_id", assetsController.publicGetById);

router.get("/assets", auth.authCheck, auth.authAdmin, assetsController.list);
router.get("/assets/export", auth.authCheck, auth.authAdmin, assetsController.exportCsv);
router.get("/assets/:asset_id", auth.authCheck, auth.authAdmin, assetsController.getById);

router.post("/assets", auth.authCheck, auth.authAdmin, assetsController.create);
router.put("/assets/:asset_id", auth.authCheck, auth.authAdmin, assetsController.update);
router.delete("/assets/:asset_id", auth.authCheck, auth.authAdmin, assetsController.remove);

router.post(
  "/assets/import",
  auth.authCheck,
  auth.authAdmin,
  upload.single("file"),
  assetsController.importCsvOrJson
);

module.exports = router;
