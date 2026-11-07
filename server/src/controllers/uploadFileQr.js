const path = require("path");
const { Op } = require("sequelize");
const { UploadFileQrCode, User } = require("../models");
const status = require("../helpers/Response");
const Role = require("../utils/userRoles");
const { buildListFilter } = require("../utils/uploadFileQrFilters");
const {
  UPLOAD_SUBDIR,
  generateUploadFileQrCodeId,
  slugifyName,
  buildUploadFileQrStaticUrl,
  deleteStoredFile,
  normalizeAccessMode,
  sendStoredFile,
  formatFileSize,
} = require("../utils/uploadFileQr");

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
    static_url: buildUploadFileQrStaticUrl(plain),
    stored_path: plain.stored_path,
    file_url: `/uploads/${plain.stored_path}`,
    original_name: plain.original_name,
    mime_type: plain.mime_type,
    file_size: plain.file_size,
    file_size_label: formatFileSize(plain.file_size),
    access_mode: plain.access_mode,
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

function buildStoredPath(filename) {
  return path.posix.join(UPLOAD_SUBDIR, filename);
}

function cleanupUploadedFile(req) {
  if (req.file?.path) {
    deleteStoredFile({ stored_path: buildStoredPath(req.file.filename) });
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
          { original_name: { [Op.like]: `%${search}%` } },
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

      const { rows, count } = await UploadFileQrCode.findAndCountAll({
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
        "Upload file QR codes fetched",
        rows.map(formatRow),
        { page, limit, total: count, totalPage }
      );
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch upload file QR codes", {
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

      if (!req.file) {
        return status.ResponseStatus(res, 400, "File is required");
      }

      const name = String(req.body.name || "").trim();
      if (!name) {
        cleanupUploadedFile(req);
        return status.ResponseStatus(res, 400, "Name is required");
      }

      const accessMode = normalizeAccessMode(req.body.accessMode);

      const code = await generateUploadFileQrCodeId();
      const slug = slugifyName(name);
      const storedPath = buildStoredPath(req.file.filename);

      const record = await UploadFileQrCode.create({
        code,
        name,
        slug,
        stored_path: storedPath,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype || "application/octet-stream",
        file_size: req.file.size || 0,
        access_mode: accessMode,
        user_id: currentUser.id,
      });

      const withCreator = await UploadFileQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 201, "Upload file QR code created", formatRow(withCreator));
    } catch (error) {
      cleanupUploadedFile(req);
      return status.ResponseStatus(res, 500, "Failed to create upload file QR code", {
        error: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        if (req.file) cleanupUploadedFile(req);
        return status.ResponseStatus(res, 401, "User not found");
      }

      const record = await UploadFileQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
      });

      if (!record) {
        if (req.file) cleanupUploadedFile(req);
        return status.ResponseStatus(res, 404, "QR code not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        if (req.file) cleanupUploadedFile(req);
        return status.ResponseStatus(res, 403, "You cannot edit this QR code");
      }

      if (req.body.accessMode !== undefined) {
        record.access_mode = normalizeAccessMode(req.body.accessMode);
      }

      if (req.file) {
        deleteStoredFile(record);
        record.stored_path = buildStoredPath(req.file.filename);
        record.original_name = req.file.originalname;
        record.mime_type = req.file.mimetype || "application/octet-stream";
        record.file_size = req.file.size || 0;
      }

      await record.save();

      const withCreator = await UploadFileQrCode.findByPk(record.id, {
        include: [
          {
            model: User,
            as: "creator",
            attributes: ["id", "first_name", "last_name", "email"],
          },
        ],
      });

      return status.ResponseStatus(res, 200, "Upload file QR updated", formatRow(withCreator));
    } catch (error) {
      if (req.file) cleanupUploadedFile(req);
      return status.ResponseStatus(res, 500, "Failed to update upload file QR code", {
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

      const record = await UploadFileQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
      });

      if (!record) {
        return status.ResponseStatus(res, 404, "QR code not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        return status.ResponseStatus(res, 403, "You cannot delete this QR code");
      }

      deleteStoredFile(record);
      record.is_delete = 1;
      await record.save();

      return status.ResponseStatus(res, 200, "QR code deleted");
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to delete QR code", {
        error: error.message,
      });
    }
  },

  serveFile: async (req, res) => {
    try {
      const currentUser = await getRequestUser(req);
      if (!currentUser) {
        return status.ResponseStatus(res, 401, "User not found");
      }

      const record = await UploadFileQrCode.findOne({
        where: { id: req.params.id, ...activeWhere },
      });

      if (!record) {
        return status.ResponseStatus(res, 404, "QR code not found");
      }

      if (!isAdminUser(currentUser) && record.user_id !== currentUser.id) {
        return status.ResponseStatus(res, 403, "You cannot access this file");
      }

      const mode = req.query.mode === "download" ? "download" : "view";
      return sendStoredFile(res, record, mode);
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to serve file", {
        error: error.message,
      });
    }
  },

  publicServe: async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) {
        return res.status(404).send("File link not found");
      }

      const record = await UploadFileQrCode.findOne({
        where: { id, ...activeWhere },
      });

      if (!record) {
        return res.status(404).send("File link not found");
      }

      const expectedSlug = record.slug || slugifyName(record.name);
      const requestSlug = String(req.params.slug || "").trim();

      if (requestSlug && requestSlug !== expectedSlug) {
        return res.redirect(301, buildUploadFileQrStaticUrl(record));
      }

      return sendStoredFile(res, record, record.access_mode);
    } catch (error) {
      return res.status(500).send("Unable to open file");
    }
  },
};
