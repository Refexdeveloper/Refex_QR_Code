const router = require("express").Router();

const auth = require("../middlewares/auth");
const designQrController = require("../controllers/designQr");
const { uploadLogo } = require("../middlewares/designQrMulter");

router.get("/design-qr", auth.authCheck, designQrController.list);
router.get("/design-qr/:id", auth.authCheck, designQrController.getOne);
router.post("/design-qr", auth.authCheck, uploadLogo, designQrController.create);
router.put("/design-qr/:id", auth.authCheck, uploadLogo, designQrController.update);
router.delete("/design-qr/:id", auth.authCheck, designQrController.remove);

module.exports = router;
