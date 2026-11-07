const router = require("express").Router();

const auth = require("../middlewares/auth");
const fixedQrController = require("../controllers/fixedQr");

router.get("/fixed-qr", auth.authCheck, fixedQrController.list);
router.post("/fixed-qr", auth.authCheck, fixedQrController.create);
router.delete("/fixed-qr/:id", auth.authCheck, fixedQrController.remove);

module.exports = router;
