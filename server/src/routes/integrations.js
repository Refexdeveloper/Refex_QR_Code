const router = require("express").Router();

const auth = require("../middlewares/auth");
const assetsIntegrationController = require("../controllers/integrations/assets");

// UI uses user JWT (authCheck) to issue an integration token
router.get(
  "/integrations/assets/token",
  auth.authCheck,
  auth.authAdmin,
  assetsIntegrationController.issueAssetsApiToken
);

// External systems use API token (validateAPI) for create/update
router.get(
  "/integrations/assets",
  auth.validateAPI,
  assetsIntegrationController.list
);

router.post(
  "/integrations/assets",
  auth.validateAPI,
  assetsIntegrationController.createOrUpdate
);

router.put(
  "/integrations/assets/:asset_id",
  auth.validateAPI,
  assetsIntegrationController.updateById
);

module.exports = router;

