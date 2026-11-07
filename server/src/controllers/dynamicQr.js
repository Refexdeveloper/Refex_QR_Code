const { Op } = require("sequelize");
const { DynamicQrCode, User } = require("../models");
const status = require("../helpers/Response");
const Role = require("../utils/userRoles");
const { buildListFilter } = require("../utils/dynamicQrFilters");
const {
  generateDynamicQrCodeId,
  slugifyName,
  buildDynamicQrStaticUrl,
  escapeHtml,
} = require("../utils/dynamicQr");

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
    name: plain.name,
    slug: plain.slug,
    static_url: buildDynamicQrStaticUrl(plain),
    dynamic_value: plain.dynamic_value,
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
          { name: { [Op.like]: `%${search}%` } },
          { dynamic_value: { [Op.like]: `%${search}%` } },
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

      const { rows, count } = await DynamicQrCode.findAndCountAll({
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
        "Dynamic QR codes fetched",
        rows.map(formatRow),
        { page, limit, total: count, totalPage }
      );
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch dynamic QR codes", {
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

      const name = String(req.body.name || "").trim();
      const dynamicValue = String(req.body.dynamicValue || req.body.dynamic_value || "").trim();

      if (!name) {
        return status.ResponseStatus(res, 400, "Name is required");
      }
      if (!dynamicValue) {
        return status.ResponseStatus(res, 400, "Dynamic URL or data is required");
      }
      if (dynamicValue.length > 4096) {
        return status.ResponseStatus(res, 400, "Dynamic value is too long (max 4096 characters)");
      }

      const code = await generateDynamicQrCodeId();
      const slug = slugifyName(name);

      const record = await DynamicQrCode.create({
        code,
        name,
        slug,
        dynamic_value: dynamicValue,
        user_id: currentUser.id,
      });

      const withCreator = await DynamicQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 201, "Dynamic QR code created", formatRow(withCreator));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to create dynamic QR code", {
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        return status.ResponseStatus(res, 401, "User not found");
      }

      const record = await DynamicQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
      });

      if (!record) {
        return status.ResponseStatus(res, 404, "QR code not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        return status.ResponseStatus(res, 403, "You cannot edit this QR code");
      }

      const dynamicValue = String(req.body.dynamicValue || req.body.dynamic_value || "").trim();
      if (!dynamicValue) {
        return status.ResponseStatus(res, 400, "Dynamic URL or data is required");
      }
      if (dynamicValue.length > 4096) {
        return status.ResponseStatus(res, 400, "Dynamic value is too long (max 4096 characters)");
      }

      record.dynamic_value = dynamicValue;
      await record.save();

      const withCreator = await DynamicQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 200, "Dynamic link updated", formatRow(withCreator));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to update dynamic QR code", {
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

      const record = await DynamicQrCode.findOne({
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

  publicRedirect: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(404).send("QR link not found");
      }

      const record = await DynamicQrCode.findOne({
        where: { id, ...activeWhere },
      });

      if (!record) {
        return res.status(404).send("QR link not found");
      }

      const canonicalUrl = buildDynamicQrStaticUrl(record);
      const requestSlug = String(req.params.slug || "").trim();
      const expectedSlug = record.slug || slugifyName(record.name);

      if (requestSlug && requestSlug !== expectedSlug) {
        return res.redirect(301, canonicalUrl);
      }

      const target = String(record.dynamic_value || "").trim();
      if (!target) {
        return res.status(404).send("No destination configured");
      }

      if (/^https?:\/\//i.test(target)) {
        return res.redirect(302, target);
      }

      return res
        .status(200)
        .type("html")
        .send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(record.name)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fa; color: #1f2937; }
    .wrap { max-width: 640px; margin: 48px auto; padding: 24px; background: #fff; border-radius: 12px; box-shadow: 0 1px 8px rgba(0,0,0,.08); }
    h1 { font-size: 20px; margin: 0 0 16px; }
    .content { white-space: pre-wrap; word-break: break-word; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(record.name)}</h1>
    <div class="content">${escapeHtml(target)}</div>
  </div>
</body>
</html>`);
    } catch (error) {
      return res.status(500).send("Unable to open QR link");
    }
  },
};
