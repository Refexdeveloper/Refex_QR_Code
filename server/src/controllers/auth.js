const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const {User,LoginHistory} = require("../models");
const status = require('../helpers/Response');
const Role = require("../utils/userRoles");
const { sendPasswordChangedEmail, sendPasswordResetEmail } = require("../services/userEmailService");

const { APP_KEY } = process.env;
const saltRounds = 10;
const RESET_TOKEN_PURPOSE = "password_reset";
const RESET_TOKEN_TTL = "1h";
const INACTIVE_ACCOUNT_MESSAGE =
  "Your account is not active. Please contact your administrator to activate your account.";

function isActiveAccount(user) {
  return Boolean(user?.is_verified);
}

function signPasswordResetToken(userId) {
  if (!APP_KEY) {
    throw new Error("APP_KEY is not configured");
  }
  return jwt.sign({ user_id: userId, type: RESET_TOKEN_PURPOSE }, APP_KEY, {
    expiresIn: RESET_TOKEN_TTL,
  });
}

function verifyPasswordResetToken(token) {
  if (!token || !APP_KEY) {
    return null;
  }
  try {
    const decoded = jwt.verify(token, APP_KEY);
    if (decoded.type !== RESET_TOKEN_PURPOSE || !decoded.user_id) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

module.exports = {
    login: async (req, res) => {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return status.ResponseStatus(res, 400, "Validation Failed", errors);
          }
          const { email, password } = req.body;
          const existingUser = await User.findOne({ where: { email, is_delete: 0 } });
          if (existingUser) {
            if (!Boolean(existingUser.is_verified)) {
              return status.ResponseStatus(res, 401, "Email not verified");
            }
            const compare = await bcrypt.compare(
              password,
              existingUser.password
            );
            if (compare) {
              const { id, first_name, last_name, email, user_name, role, photo, page_access } = existingUser;
              const history = await LoginHistory.create({ user_id:id, first_name, last_name, email, user_name, status:'Logged-In'});
              const token = jwt.sign({ session_id:history.id,user_id:id }, APP_KEY, { expiresIn: '1d' });   //, { expiresIn: '1d' }
              return res.status(200).json({
                status: true,
                message: "Login successfully",
                session_id: history.id,
                token,
                user_data:{
                  id,
                  first_name,
                  last_name,
                  email,
                  user_name,
                  role,
                  page_access,
                  photo: photo ? Buffer.from(photo, "binary").toString() : null,
                }
              });
            } else {
              return status.ResponseStatus(res, 401, "Invalid password");
            }
          } else {
            return status.ResponseStatus(res, 401, "Invalid email");
          }
        } catch (error) {
          console.log(error.message);
          return status.ResponseStatus(res, 500, "Internal server error", {
            error: error.message,
          });
        }
    },
    logout:async (req, res) => {
        try{
          const {session_id} = req.session_data;
          const result = await LoginHistory.update({status:"Logged-Out"},{where:{id:session_id}});
          if(result){
            return status.ResponseStatus(res,200,"Logout successfully");
          }else{
            return status.ResponseStatus(res,401,"Logout unsuccessful");
          }
        }catch(error){
        return status.ResponseStatus(res, 500, "Internal server error",error);
        }
    },
    changePassword: async (req, res) => {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return status.ResponseStatus(res, 400, "Validation Failed", errors.array());
          }

          const { currentPassword, newPassword } = req.body;
          const userId = req.session_data?.user_id;
          const user = await User.findOne({ where: { id: userId, is_delete: 0 } });

          if (!user) {
            return status.ResponseStatus(res, 404, "User not found");
          }

          const isMatch = await bcrypt.compare(currentPassword, user.password);
          if (!isMatch) {
            return status.ResponseStatus(res, 401, "Current password is incorrect");
          }

          if (currentPassword === newPassword) {
            return status.ResponseStatus(
              res,
              400,
              "New password must be different from current password"
            );
          }

          user.password = await bcrypt.hash(newPassword, saltRounds);
          user.pending_password = null;
          await user.save();

          const mailResult = await sendPasswordChangedEmail(user);
          if (!mailResult.sent) {
            return status.ResponseStatus(
              res,
              200,
              `Password changed but notification email failed: ${mailResult.error}`
            );
          }

          return status.ResponseStatus(res, 200, "Password changed successfully");
        } catch (error) {
          return status.ResponseStatus(res, 500, "Failed to change password", {
            error: error.message,
          });
        }
    },
    forgotPassword: async (req, res) => {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return status.ResponseStatus(res, 400, "Validation Failed", errors.array());
          }

          const { email } = req.body;
          const successMessage =
            "If an account exists with that email, you will receive a password reset link shortly.";

          const user = await User.findOne({ where: { email, is_delete: 0 } });
          if (!user) {
            return status.ResponseStatus(res, 200, successMessage);
          }

          if (!isActiveAccount(user)) {
            return status.ResponseStatus(res, 403, INACTIVE_ACCOUNT_MESSAGE);
          }

          const token = signPasswordResetToken(user.id);
          const mailResult = await sendPasswordResetEmail(user, token);
          if (!mailResult.sent) {
            return status.ResponseStatus(
              res,
              500,
              `Failed to send reset email: ${mailResult.error}`
            );
          }

          return status.ResponseStatus(res, 200, successMessage);
        } catch (error) {
          return status.ResponseStatus(res, 500, "Failed to process reset request", {
            error: error.message,
          });
        }
    },
    verifyToken: async (req, res) => {
        try {
          const { token } = req.params;
          const decoded = verifyPasswordResetToken(token);
          if (!decoded) {
            return status.ResponseStatus(res, 400, "Invalid or expired reset link");
          }

          const user = await User.findOne({
            where: { id: decoded.user_id, is_delete: 0 },
          });
          if (!user) {
            return status.ResponseStatus(res, 404, "User not found");
          }

          if (!isActiveAccount(user)) {
            return status.ResponseStatus(res, 403, INACTIVE_ACCOUNT_MESSAGE);
          }

          return status.ResponseStatus(res, 200, "Token verified", {
            user: { email: user.email },
          });
        } catch (error) {
          return status.ResponseStatus(res, 500, "Failed to verify reset link", {
            error: error.message,
          });
        }
    },
    resetPassword: async (req, res) => {
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
            return status.ResponseStatus(res, 400, "Validation Failed", errors.array());
          }

          const { token } = req.params;
          const { password } = req.body;
          const decoded = verifyPasswordResetToken(token);
          if (!decoded) {
            return status.ResponseStatus(res, 400, "Invalid or expired reset link");
          }

          const user = await User.findOne({
            where: { id: decoded.user_id, is_delete: 0 },
          });
          if (!user) {
            return status.ResponseStatus(res, 404, "User not found");
          }

          if (!isActiveAccount(user)) {
            return status.ResponseStatus(res, 403, INACTIVE_ACCOUNT_MESSAGE);
          }

          user.password = await bcrypt.hash(password, saltRounds);
          user.pending_password = null;
          await user.save();

          await sendPasswordChangedEmail(user);

          return status.ResponseStatus(
            res,
            200,
            "Password reset successfully. You can now log in with your new password."
          );
        } catch (error) {
          return status.ResponseStatus(res, 500, "Failed to reset password", {
            error: error.message,
          });
        }
    },
}