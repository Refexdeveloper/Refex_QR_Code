const router = require("express").Router();

const auth = require("../middlewares/auth");
const smtpController = require("../controllers/smtp");
const hrmsController = require("../controllers/hrms");
const ssoController = require("../controllers/sso");

router.get("/smtp-config", auth.authCheck, auth.authAdmin, smtpController.get);
router.put("/smtp-config", auth.authCheck, auth.authAdmin, smtpController.upsert);
router.post("/smtp-config/test", auth.authCheck, auth.authAdmin, smtpController.test);

router.get("/sso-providers", auth.authCheck, auth.authAdmin, ssoController.list);
router.post("/sso-providers", auth.authCheck, auth.authAdmin, ssoController.create);
router.put("/sso-providers/:id", auth.authCheck, auth.authAdmin, ssoController.update);
router.delete("/sso-providers/:id", auth.authCheck, auth.authAdmin, ssoController.remove);

router.get("/hrms-config", auth.authCheck, auth.authAdmin, hrmsController.getApiConfig);
router.put("/hrms-config", auth.authCheck, auth.authAdmin, hrmsController.upsertApiConfig);
router.patch("/hrms-config/cron", auth.authCheck, auth.authAdmin, hrmsController.updateCronSchedule);
router.post("/hrms-sync", auth.authCheck, auth.authAdmin, hrmsController.syncHrms);

module.exports = router;
