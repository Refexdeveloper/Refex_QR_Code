const router = require("express").Router();

const auth = require("../middlewares/auth");
const userController = require("../controllers/user");
const { createUserSchema, updateUserSchema } = require("../middlewares/userValidator");

router.get("/users", auth.authCheck, auth.authAdmin, userController.list);

router.get("/users/:user_id", auth.authCheck, auth.authAdmin, userController.getById);
router.post("/users", auth.authCheck, auth.authAdmin, createUserSchema, userController.create);
router.put(
  "/users/:user_id",
  auth.authCheck,
  auth.authAdmin,
  updateUserSchema,
  userController.update
);
router.delete("/users/:user_id", auth.authCheck, auth.authAdmin, userController.remove);
router.patch(
  "/users/:user_id/activate",
  auth.authCheck,
  auth.authAdmin,
  userController.activate
);
router.patch(
  "/users/:user_id/deactivate",
  auth.authCheck,
  auth.authAdmin,
  userController.deactivate
);

module.exports = router;
