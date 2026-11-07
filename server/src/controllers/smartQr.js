const { Op } = require("sequelize");
const { SmartQrCode, User } = require("../models");
const status = require("../helpers/Response");
const Role = require("../utils/userRoles");
const { buildListFilter } = require("../utils/smartQrFilters");
const {
  generateSmartQrCodeId,
  slugifyName,
  buildSmartQrStaticUrl,
  resolveSmartLinkTarget,
} = require("../utils/smartQr");

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

function isValidUrl(value) {
  return /^https?:\/\/.+/i.test(String(value || "").trim());
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
    static_url: buildSmartQrStaticUrl(plain),
    android_url: plain.android_url,
    ios_url: plain.ios_url,
    fallback_url: plain.fallback_url,
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

function validateLinkPayload({ androidUrl, iosUrl, fallbackUrl }) {
  const android = String(androidUrl || "").trim();
  const ios = String(iosUrl || "").trim();
  const fallback = String(fallbackUrl || "").trim();

  if (!android || !ios || !fallback) {
    return { error: "Android, iOS, and fallback links are required" };
  }
  if (!isValidUrl(android) || !isValidUrl(ios) || !isValidUrl(fallback)) {
    return { error: "All links must be valid URLs starting with http:// or https://" };
  }
  if (android.length > 2048 || ios.length > 2048 || fallback.length > 2048) {
    return { error: "URL is too long (max 2048 characters)" };
  }

  return { android, ios, fallback };
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
          { android_url: { [Op.like]: `%${search}%` } },
          { ios_url: { [Op.like]: `%${search}%` } },
          { fallback_url: { [Op.like]: `%${search}%` } },
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

      const { rows, count } = await SmartQrCode.findAndCountAll({
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
        "Smart QR codes fetched",
        rows.map(formatRow),
        { page, limit, total: count, totalPage }
      );
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch smart QR codes", {
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
      if (!name) {
        return status.ResponseStatus(res, 400, "Name is required");
      }

      const linkCheck = validateLinkPayload(req.body);
      if (linkCheck.error) {
        return status.ResponseStatus(res, 400, linkCheck.error);
      }

      const code = await generateSmartQrCodeId();
      const slug = slugifyName(name);

      const record = await SmartQrCode.create({
        code,
        name,
        slug,
        android_url: linkCheck.android,
        ios_url: linkCheck.ios,
        fallback_url: linkCheck.fallback,
        user_id: currentUser.id,
      });

      const withCreator = await SmartQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 201, "Smart QR code created", formatRow(withCreator));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to create smart QR code", {
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

      const record = await SmartQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
      });

      if (!record) {
        return status.ResponseStatus(res, 404, "QR code not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        return status.ResponseStatus(res, 403, "You cannot edit this QR code");
      }

      const linkCheck = validateLinkPayload(req.body);
      if (linkCheck.error) {
        return status.ResponseStatus(res, 400, linkCheck.error);
      }

      record.android_url = linkCheck.android;
      record.ios_url = linkCheck.ios;
      record.fallback_url = linkCheck.fallback;
      await record.save();

      const withCreator = await SmartQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 200, "Smart links updated", formatRow(withCreator));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to update smart QR code", {
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

      const record = await SmartQrCode.findOne({
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
        return res.status(404).send("Smart link not found");
      }

      const record = await SmartQrCode.findOne({
        where: { id, ...activeWhere },
      });

      if (!record) {
        return res.status(404).send("Smart link not found");
      }

      const expectedSlug = record.slug || slugifyName(record.name);
      const requestSlug = String(req.params.slug || "").trim();

      if (requestSlug && requestSlug !== expectedSlug) {
        return res.redirect(301, buildSmartQrStaticUrl(record));
      }

      const target = resolveSmartLinkTarget(req.headers["user-agent"], record);
      if (!target) {
        return res.status(404).send("No destination configured");
      }

      return res.redirect(302, target);
    } catch (error) {
      return res.status(500).send("Unable to open smart link");
    }
  },
};
