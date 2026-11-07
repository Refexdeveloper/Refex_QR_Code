const router = require("express").Router();

const auth = require("../middlewares/auth");
const smartQrController = require("../controllers/smartQr");

router.get("/smart-qr", auth.authCheck, smartQrController.list);
router.post("/smart-qr", auth.authCheck, smartQrController.create);
router.put("/smart-qr/:id", auth.authCheck, smartQrController.update);
router.delete("/smart-qr/:id", auth.authCheck, smartQrController.remove);

module.exports = router;
