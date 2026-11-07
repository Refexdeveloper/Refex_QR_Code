const router = require("express").Router();
const winterSpinController = require("../../controllers/contest/winterSpin");
const winterCampaignAdmin = require("../../controllers/contest/winterCampaignAdmin");
const { uploadBills } = require("../../middlewares/winterCampaignUpload");
const { authCheck, authAdmin, authPage } = require("../../middlewares/auth");

const canViewCampaign = authPage("campaign");

router.get("/winter-campaign/period", winterSpinController.campaignPeriod);
router.get("/winter-campaign/form-copy", winterSpinController.formCopy);
router.put("/winter-campaign/form-copy", authCheck, authAdmin, winterCampaignAdmin.saveFormCopy);
router.get("/winter-campaign/spin-desk", authCheck, canViewCampaign, winterCampaignAdmin.getSpinDesk);
router.put("/winter-campaign/spin-settings", authCheck, authAdmin, winterCampaignAdmin.saveSpinSettings);
router.put("/winter-campaign/spin-stock", authCheck, authAdmin, winterCampaignAdmin.saveSpinStock);
router.get("/winter-campaign/submissions", authCheck, canViewCampaign, winterCampaignAdmin.listSubmissions);
router.get("/winter-campaign/export", authCheck, canViewCampaign, winterCampaignAdmin.exportExcel);
router.get("/winter-campaign/winners", authCheck, canViewCampaign, winterCampaignAdmin.listWinners);
router.get("/winter-campaign/bills/:id", authCheck, canViewCampaign, winterCampaignAdmin.getBill);
router.put("/winter-campaign/submissions/:id", authCheck, authAdmin, winterCampaignAdmin.updateSubmission);
router.delete("/winter-campaign/submissions/:id", authCheck, authAdmin, winterCampaignAdmin.deleteSubmission);
router.delete("/winter-campaign/winners/:id", authCheck, authAdmin, winterCampaignAdmin.deleteWinner);

router.get("/winter-campaign/captcha", winterSpinController.issueCaptcha);
router.post("/winter-campaign/register", uploadBills, winterSpinController.register);
router.get("/winter-spin/status", winterSpinController.getStatus);
router.post("/winter-spin/issue", winterSpinController.issue);
router.post("/winter-spin/spin", winterSpinController.spin);

module.exports = router;
