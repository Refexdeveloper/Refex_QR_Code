const router = require("express").Router();
const authController = require('../controllers/auth');
const ssoAuthController = require('../controllers/ssoAuth');
const {createUserSchema, validateLogin, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema} = require('../middlewares/userValidator');
const auth = require('../middlewares/auth');
const { SuperAdmin } = require("../utils/userRoles");

router.get("/sso-providers", ssoAuthController.listPublicProviders);
router.get("/sso/:provider", ssoAuthController.ssoRedirect);
router.get("/sso/:provider/callback", ssoAuthController.ssoCallback);

router.post("/login",validateLogin, authController.login);
router.post("/logout",auth.authCheck,authController.logout);
router.post("/change_password", auth.authCheck, changePasswordSchema, authController.changePassword);
// router.post("/register",createUserSchema,authController.register);
// router.get("/verify_email/:token",authController.verifyMail);
router.post("/forgot_password", forgotPasswordSchema, authController.forgotPassword);
router.post("/verify_token/:token", authController.verifyToken);
router.patch("/reset_password/:token", resetPasswordSchema, authController.resetPassword);
// router.post("/create_api_key/:user_id",auth.authCheck,auth.authRole(SuperAdmin),authController.createAPIKeyForUser);

module.exports = router;