const router = require("express").Router();

const auth = require("../middlewares/auth");
const dynamicQrController = require("../controllers/dynamicQr");

router.get("/dynamic-qr", auth.authCheck, dynamicQrController.list);
router.post("/dynamic-qr", auth.authCheck, dynamicQrController.create);
router.put("/dynamic-qr/:id", auth.authCheck, dynamicQrController.update);
router.delete("/dynamic-qr/:id", auth.authCheck, dynamicQrController.remove);

module.exports = router;
