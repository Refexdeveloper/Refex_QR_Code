const { Op } = require("sequelize");
const { FixedQrCode, User } = require("../models");
const status = require("../helpers/Response");
const Role = require("../utils/userRoles");
const { generateFixedQrCodeId } = require("../utils/fixedQrCodeId");
const { buildListFilter } = require("../utils/fixedQrFilters");

const activeWhere = { is_delete: 0 };

function isAdminUser(user) {
  return user && [Role.Admin, Role.SuperAdmin].includes(user.role);
}

async function getRequestUser(req) {
  return User.findOne({
    where: { id: req.session_data?.user_id, is_delete: 0 },
    attributes: ["id", "first_name", "last_name", "email", "role"],
  });
}

function formatRow(row) {
  const plain = row.get ? row.get({ plain: true }) : row;
  const creator = plain.creator || {};
  const createdByName = `${creator.first_name || ""} ${creator.last_name || ""}`.trim();

  return {
    id: plain.id,
    code: plain.code,
    value: plain.value,
    user_id: plain.user_id,
    created_at: plain.created_at,
    created_by: createdByName || creator.email || "",
    creator: creator.id
      ? {
          id: creator.id,
          first_name: creator.first_name,
          last_name: creator.last_name,
          email: creator.email,
        }
      : null,
  };
}

module.exports = {
  list: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        return status.ResponseStatus(res, 401, "User not found");
      }

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
      const admin = isAdminUser(currentUser);

      const filterResult = buildListFilter({
        filterField,
        filterOperator,
        filterValue,
        isAdmin: admin,
      });

      if (filterResult.error) {
        return status.ResponseStatus(res, 400, filterResult.error);
      }

      const where = { ...activeWhere, ...filterResult.whereExtra };

      if (!admin) {
        where.user_id = currentUser.id;
      }

      if (search) {
        where[Op.or] = [
          { code: { [Op.like]: `%${search}%` } },
          { value: { [Op.like]: `%${search}%` } },
        ];
      }

      const include = [
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "email"],
          ...(filterResult.creatorWhere
            ? { where: filterResult.creatorWhere, required: true }
            : {}),
        },
      ];
      const { rows, count } = await FixedQrCode.findAndCountAll({
        where,
        include,
        order: [["created_at", "DESC"]],
        limit,
        offset,
        distinct: true,
      });

      const totalPage = Math.max(Math.ceil(count / limit), 1);
      return status.ResponseStatus(
        res,
        200,
        "Fixed QR codes fetched",
        rows.map(formatRow),
        { page, limit, total: count, totalPage }
      );
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch fixed QR codes", {
        error: error.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        return status.ResponseStatus(res, 401, "User not found");
      }

      const value = String(req.body.value || "").trim();
      if (!value) {
        return status.ResponseStatus(res, 400, "URL or data is required");
      }
      if (value.length > 4096) {
        return status.ResponseStatus(res, 400, "Value is too long (max 4096 characters)");
      }

      const code = await generateFixedQrCodeId();
      const record = await FixedQrCode.create({
        code,
        value,
        user_id: currentUser.id,
      });

      const withCreator = await FixedQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 201, "QR code created", formatRow(withCreator));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to create QR code", {
        error: error.message,
      });
    }
  },

  remove: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        return status.ResponseStatus(res, 401, "User not found");
      }

      const record = await FixedQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
      });

      if (!record) {
        return status.ResponseStatus(res, 404, "QR code not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        return status.ResponseStatus(res, 403, "You cannot delete this QR code");
      }

      record.is_delete = 1;
      await record.save();

      return status.ResponseStatus(res, 200, "QR code deleted");
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to delete QR code", {
        error: error.message,
      });
    }
  },
};
