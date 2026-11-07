const path = require("path");
const { Op } = require("sequelize");
const { DesignQrCode, User } = require("../models");
const status = require("../helpers/Response");
const Role = require("../utils/userRoles");
const { buildListFilter } = require("../utils/designQrFilters");
const {
  generateDesignQrCodeId,
  buildLogoPath,
  deleteLogoFile,
  parseDesignConfig,
} = require("../utils/designQr");

const activeWhere = { is_delete: 0 };

const ALLOWED_CONFIG_KEYS = new Set([
  "ecLevel",
  "enableCORS",
  "size",
  "quietZone",
  "bgColor",
  "fgColor",
  "qrStyle",
  "logoWidth",
  "logoHeight",
  "logoOpacity",
  "logoPadding",
  "logoPaddingStyle",
  "logoPaddingRadius",
  "removeQrCodeBehindLogo",
  "eyeRadius",
  "eyeColor",
]);

function isAdminUser(user) {
  return user && [Role.Admin, Role.SuperAdmin].includes(user.role);
}

async function getRequestUser(req) {
  return User.findOne({
    where: { id: req.session_data?.user_id, is_delete: 0 },
    attributes: ["id", "first_name", "last_name", "email", "role"],
  });
}

function sanitizeDesignConfig(input) {
  const source = parseDesignConfig(input);
  const config = {};

  ALLOWED_CONFIG_KEYS.forEach((key) => {
    if (source[key] !== undefined) {
      config[key] = source[key];
    }
  });

  if (!config.ecLevel) config.ecLevel = "M";
  if (!config.size) config.size = 300;
  if (!config.quietZone && config.quietZone !== 0) config.quietZone = 10;
  if (!config.bgColor) config.bgColor = "#FFFFFF";
  if (!config.fgColor) config.fgColor = "#000000";
  if (!config.qrStyle) config.qrStyle = "squares";
  if (!config.logoPaddingStyle) config.logoPaddingStyle = "square";
  if (config.logoOpacity === undefined) config.logoOpacity = 1;
  if (config.removeQrCodeBehindLogo === undefined) config.removeQrCodeBehindLogo = false;
  if (config.enableCORS === undefined) config.enableCORS = false;

  return config;
}

function formatRow(row) {
  const plain = row.get ? row.get({ plain: true }) : row;
  const creator = plain.creator || {};
  const createdByName = `${creator.first_name || ""} ${creator.last_name || ""}`.trim();
  const designConfig = parseDesignConfig(plain.design_config);

  if (plain.logo_path) {
    designConfig.logoImage = `/uploads/${plain.logo_path}`;
  }

  return {
    id: plain.id,
    code: plain.code,
    name: plain.name,
    value: plain.value,
    design_config: designConfig,
    logo_path: plain.logo_path,
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

function cleanupUploadedLogo(req) {
  if (req.file?.filename) {
    deleteLogoFile(buildLogoPath(req.file.filename));
  }
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

      const { rows, count } = await DesignQrCode.findAndCountAll({
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
        "Design QR codes fetched",
        rows.map(formatRow),
        { page, limit, total: count, totalPage }
      );
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch design QR codes", {
        error: error.message,
      });
    }
  },

  getOne: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        return status.ResponseStatus(res, 401, "User not found");
      }

      const record = await DesignQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      if (!record) {
        return status.ResponseStatus(res, 404, "Design not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        return status.ResponseStatus(res, 403, "You cannot view this design");
      }

      return status.ResponseStatus(res, 200, "Design fetched", formatRow(record));
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch design", {
        error: error.message,
      });
    }
  },

  create: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        cleanupUploadedLogo(req);
        return status.ResponseStatus(res, 401, "User not found");
      }

      const name = String(req.body.name || "").trim();
      const value = String(req.body.value || "").trim();

      if (!name) {
        cleanupUploadedLogo(req);
        return status.ResponseStatus(res, 400, "Name is required");
      }
      if (!value) {
        cleanupUploadedLogo(req);
        return status.ResponseStatus(res, 400, "QR value is required");
      }

      const designConfig = sanitizeDesignConfig(req.body.designConfig || req.body.config);
      const code = await generateDesignQrCodeId();
      const logoPath = req.file ? buildLogoPath(req.file.filename) : null;

      const record = await DesignQrCode.create({
        code,
        name,
        value,
        design_config: JSON.stringify(designConfig),
        logo_path: logoPath,
        user_id: currentUser.id,
      });

      const withCreator = await DesignQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 201, "Design saved", formatRow(withCreator));
    } catch (error) {
      cleanupUploadedLogo(req);
      return status.ResponseStatus(res, 500, "Failed to save design", {
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        cleanupUploadedLogo(req);
        return status.ResponseStatus(res, 401, "User not found");
      }

      const record = await DesignQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
      });

      if (!record) {
        cleanupUploadedLogo(req);
        return status.ResponseStatus(res, 404, "Design not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        cleanupUploadedLogo(req);
        return status.ResponseStatus(res, 403, "You cannot edit this design");
      }

      if (req.body.name !== undefined) {
        const name = String(req.body.name || "").trim();
        if (!name) {
          cleanupUploadedLogo(req);
          return status.ResponseStatus(res, 400, "Name is required");
        }
        record.name = name;
      }

      if (req.body.value !== undefined) {
        const value = String(req.body.value || "").trim();
        if (!value) {
          cleanupUploadedLogo(req);
          return status.ResponseStatus(res, 400, "QR value is required");
        }
        record.value = value;
      }

      if (req.body.designConfig !== undefined || req.body.config !== undefined) {
        record.design_config = JSON.stringify(
          sanitizeDesignConfig(req.body.designConfig || req.body.config)
        );
      }

      if (req.body.removeLogo === "true" || req.body.removeLogo === true) {
        deleteLogoFile(record.logo_path);
        record.logo_path = null;
      }

      if (req.file) {
        deleteLogoFile(record.logo_path);
        record.logo_path = buildLogoPath(req.file.filename);
      }

      await record.save();

      const withCreator = await DesignQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 200, "Design updated", formatRow(withCreator));
    } catch (error) {
      cleanupUploadedLogo(req);
      return status.ResponseStatus(res, 500, "Failed to update design", {
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

      const record = await DesignQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
      });

      if (!record) {
        return status.ResponseStatus(res, 404, "Design not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        return status.ResponseStatus(res, 403, "You cannot delete this design");
      }

      deleteLogoFile(record.logo_path);
      record.is_delete = 1;
      await record.save();

      return status.ResponseStatus(res, 200, "Design deleted");
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to delete design", {
        error: error.message,
      });
    }
  },
};
