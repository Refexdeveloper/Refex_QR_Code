const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { validationResult } = require("express-validator");

const { User } = require("../models");
const status = require("../helpers/Response");
const Role = require("../utils/userRoles");
const { generatePassword } = require("../utils/password");
const { sendUserActivationEmail } = require("../services/userEmailService");
const {
  encryptPendingPassword,
  decryptPendingPassword,
} = require("../utils/pendingPassword");
const { buildListFilter } = require("../utils/userFilters");
const { serializePageAccess } = require("../utils/pageAccess");

const saltRounds = 10;

const activeUserWhere = { is_delete: 0 };

function hasWhereKeys(obj) {
  if (!obj || typeof obj !== "object") return false;
  return (
    Object.keys(obj).length > 0 || Object.getOwnPropertySymbols(obj).length > 0
  );
}

function mergeWhere(base, extra) {
  if (!hasWhereKeys(base)) return { ...extra };
  if (!hasWhereKeys(extra)) return { ...base };
  return { [Op.and]: [base, extra] };
}

function sanitizeUser(user) {
  if (!user) return null;
  const plain = user.get ? user.get({ plain: true }) : { ...user };
  delete plain.password;
  delete plain.pending_password;
  if (plain.photo) {
    plain.photo = null;
  }
  return plain;
}

module.exports = {
  list: async (req, res) => {
    try {
      const search = (req.query.search || "").trim();
      const filterField = req.query.filterField;
      const filterOperator = req.query.filterOperator;
      const filterValue = req.query.filterValue;
      const page = Math.max(parseInt(req.query.page || "1", 10) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "10", 10) || 10, 1),
        100
      );
      const offset = (page - 1) * limit;

      const filterResult = buildListFilter({
        filterField,
        filterOperator,
        filterValue,
      });
      if (filterResult.error) {
        return status.ResponseStatus(res, 400, filterResult.error);
      }

      let where = mergeWhere(activeUserWhere, filterResult.whereExtra);

      if (search) {
        where = mergeWhere(where, {
          [Op.or]: [
            { first_name: { [Op.like]: `%${search}%` } },
            { last_name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { user_name: { [Op.like]: `%${search}%` } },
            { employee_id: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } },
            { company_name: { [Op.like]: `%${search}%` } },
            { designation: { [Op.like]: `%${search}%` } },
            { role: { [Op.like]: `%${search}%` } },
          ],
        });
      }

      const { rows, count } = await User.findAndCountAll({
        where,
        order: [["first_name", "ASC"], ["last_name", "ASC"]],
        limit,
        offset,
        attributes: { exclude: ["password", "pending_password", "photo"] },
      });

      const totalPage = Math.max(Math.ceil(count / limit), 1);
      return status.ResponseStatus(res, 200, "Users fetched", rows, {
        page,
        limit,
        total: count,
        totalPage,
      });
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch users", {
        error: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const user = await User.findOne({
        where: { id: req.params.user_id, ...activeUserWhere },
        attributes: { exclude: ["password", "pending_password", "photo"] },
      });
      if (!user) return status.ResponseStatus(res, 404, "User not found");
      return status.ResponseStatus(res, 200, "User fetched", user);
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch user", {
        error: error.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return status.ResponseStatus(res, 400, "Validation Failed", errors.array());
      }

      const {
        firstName,
        lastName,
        email,
        phone,
        userName,
        role,
        employeeId,
        companyName,
        designation,
        password,
        pageAccess,
      } = req.body;

      const normalizedEmail = String(email).trim().toLowerCase();
      const existing = await User.findOne({
        where: { email: normalizedEmail, ...activeUserWhere },
      });
      if (existing) {
        return status.ResponseStatus(res, 409, "Email already exists");
      }

      const plainPassword =
        password && String(password).trim()
          ? String(password).trim()
          : generatePassword(10);
      const hashed = await bcrypt.hash(plainPassword, saltRounds);

      const user = await User.create({
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        phone: phone || "",
        user_name: userName || employeeId || normalizedEmail.split("@")[0],
        employee_id: employeeId || null,
        company_name: companyName || "",
        designation: designation || "",
        role: role || Role.User,
        page_access: serializePageAccess(pageAccess),
        password: hashed,
        pending_password: encryptPendingPassword(plainPassword),
        is_verified: false,
        is_hrms_synced: false,
      });

      return status.ResponseStatus(res, 201, "User created", sanitizeUser(user));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to create user", {
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return status.ResponseStatus(res, 400, "Validation Failed", errors.array());
      }

      const user = await User.findOne({
        where: { id: req.params.user_id, ...activeUserWhere },
      });
      if (!user) return status.ResponseStatus(res, 404, "User not found");

      const {
        firstName,
        lastName,
        email,
        phone,
        userName,
        role,
        employeeId,
        companyName,
        designation,
        pageAccess,
      } = req.body;

      if (email) {
        const normalizedEmail = String(email).trim().toLowerCase();
        const duplicate = await User.findOne({
          where: {
            email: normalizedEmail,
            id: { [Op.ne]: user.id },
            ...activeUserWhere,
          },
        });
        if (duplicate) {
          return status.ResponseStatus(res, 409, "Email already exists");
        }
        user.email = normalizedEmail;
      }

      if (firstName !== undefined) user.first_name = firstName;
      if (lastName !== undefined) user.last_name = lastName;
      if (phone !== undefined) user.phone = phone;
      if (userName !== undefined) user.user_name = userName;
      if (employeeId !== undefined) user.employee_id = employeeId || null;
      if (companyName !== undefined) user.company_name = companyName;
      if (designation !== undefined) user.designation = designation;
      if (role !== undefined) user.role = role;
      if (pageAccess !== undefined) user.page_access = serializePageAccess(pageAccess);

      await user.save();
      return status.ResponseStatus(res, 200, "User updated", sanitizeUser(user));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to update user", {
        error: error.message,
      });
    }
  },

  remove: async (req, res) => {
    try {
      const currentUserId = req.session_data?.user_id;
      const user = await User.findOne({
        where: { id: req.params.user_id, ...activeUserWhere },
      });
      if (!user) return status.ResponseStatus(res, 404, "User not found");
      if (Number(user.id) === Number(currentUserId)) {
        return status.ResponseStatus(res, 400, "You cannot delete your own account");
      }
      user.is_delete = 1;
      user.is_verified = false;
      user.pending_password = null;
      await user.save();
      return status.ResponseStatus(res, 200, "User deleted");
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to delete user", {
        error: error.message,
      });
    }
  },

  activate: async (req, res) => {
    try {
      const user = await User.findOne({
        where: { id: req.params.user_id, ...activeUserWhere },
      });
      if (!user) return status.ResponseStatus(res, 404, "User not found");
      if (user.is_verified) {
        return status.ResponseStatus(res, 400, "User is already active");
      }

      let plainPassword = decryptPendingPassword(user.pending_password);

      if (plainPassword) {
        user.pending_password = null;
      } else {
        plainPassword = generatePassword(10);
        user.password = await bcrypt.hash(plainPassword, saltRounds);
      }

      user.is_verified = true;
      await user.save();

      const mailResult = await sendUserActivationEmail(user, plainPassword);
      if (!mailResult.sent) {
        return status.ResponseStatus(
          res,
          200,
          `User activated but email failed: ${mailResult.error}`,
          sanitizeUser(user)
        );
      }

      return status.ResponseStatus(
        res,
        200,
        "User activated and credentials emailed",
        sanitizeUser(user)
      );
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to activate user", {
        error: error.message,
      });
    }
  },

  deactivate: async (req, res) => {
    try {
      const currentUserId = req.session_data?.user_id;
      const user = await User.findOne({
        where: { id: req.params.user_id, ...activeUserWhere },
      });
      if (!user) return status.ResponseStatus(res, 404, "User not found");
      if (Number(user.id) === Number(currentUserId)) {
        return status.ResponseStatus(res, 400, "You cannot deactivate your own account");
      }
      user.is_verified = false;
      await user.save();
      return status.ResponseStatus(res, 200, "User deactivated", sanitizeUser(user));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to deactivate user", {
        error: error.message,
      });
    }
  },
};
