const router = require("express").Router();
const distributionListController = require("../../controllers/brochure/distribution_list");
const { createList } = require("../../middlewares/brochure/validator");

router.post(
  "/brochure_distribution_list",
  createList,
  distributionListController.createList
);

module.exports = router;
