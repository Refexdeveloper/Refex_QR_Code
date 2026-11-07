const jwt = require("jsonwebtoken");

const { Asset } = require("../../models");
const { Op } = require("sequelize");
const status = require("../../helpers/Response");
const { generateAssetQrPng, getAssetQrFullUrl } = require("../../utils/assetQr");

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeDateOnly(value) {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const yyyy = iso[1];
    const mm = String(iso[2]).padStart(2, "0");
    const dd = String(iso[3]).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  const dmy = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmy) {
    const dd = String(dmy[1]).padStart(2, "0");
    const mm = String(dmy[2]).padStart(2, "0");
    const yyyy = dmy[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  const dMonY = raw.match(/^(\d{1,2})-([A-Za-z]{3,})-(\d{4})$/);
  if (dMonY) {
    const dd = String(dMonY[1]).padStart(2, "0");
    const monRaw = dMonY[2].toLowerCase();
    const yyyy = dMonY[3];
    const months = {
      jan: "01",
      january: "01",
      feb: "02",
      february: "02",
      mar: "03",
      march: "03",
      apr: "04",
      april: "04",
      may: "05",
      jun: "06",
      june: "06",
      jul: "07",
      july: "07",
      aug: "08",
      august: "08",
      sep: "09",
      sept: "09",
      september: "09",
      oct: "10",
      october: "10",
      nov: "11",
      november: "11",
      dec: "12",
      december: "12",
    };
    const mm = months[monRaw];
    if (mm) return `${yyyy}-${mm}-${dd}`;
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

function normalizeAssetPayload(body = {}) {
  return {
    asset_id: body.asset_id ?? body.Asset_ID ?? body.assetId ?? body.AssetId,
    asset_name: body.asset_name ?? body.Asset_Name ?? body.assetName,
    category: body.category ?? body.Category,
    asset_subcategory: body.asset_subcategory ?? body.Asset_SubCategory ?? body.assetSubCategory,
    entity: body.entity ?? body.Entity,
    brand: body.brand ?? body.Brand,
    model: body.model ?? body.Model,
    configuration_details:
      body.configuration_details ?? body.Configuration_Details ?? body.configurationDetails,
    asset_status: body.asset_status ?? body.Asset_Status ?? body.assetStatus,
    purchase_date: normalizeDateOnly(body.purchase_date ?? body.Purchase_Date ?? body.purchaseDate),
    warranty_expiry_date:
      normalizeDateOnly(
        body.warranty_expiry_date ?? body.Warranty_Expiry_Date ?? body.warrantyExpiryDate
      ),
    purchase_cost: toNumberOrNull(body.purchase_cost ?? body.Purchase_Cost ?? body.purchaseCost),
    current_value: toNumberOrNull(body.current_value ?? body.Current_Value ?? body.currentValue),
    vendor_name: body.vendor_name ?? body["Vendor-Name"] ?? body.Vendor_Name ?? body.vendorName,
    invoice_date: normalizeDateOnly(body.invoice_date ?? body.Invoice_Date ?? body.invoiceDate),
    assigned_employee_name:
      body.assigned_employee_name ??
      body["Assigned_Employee-Name"] ??
      body.Assigned_Employee_Name ??
      body.assignedEmployeeName,
    assigned_employee_email:
      body.assigned_employee_email ??
      body["Assigned_Employee-Email"] ??
      body.Assigned_Employee_Email ??
      body.assignedEmployeeEmail,
    location: body.location ?? body.Location,
    notes: body.notes ?? body.Notes,
    employee_status: body.employee_status ?? body.Employee_Status ?? body.employeeStatus,
    exit_date: normalizeDateOnly(body.exit_date ?? body.Exit_Date ?? body.exitDate),
  };
}

async function upsertAsset(payload) {
  const existing = await Asset.findByPk(payload.asset_id);
  if (existing) {
    await existing.update(payload);
    await generateAssetQrPng(payload.asset_id);
    await existing.update({ qr_url: getAssetQrFullUrl(payload.asset_id) });
    return { asset: existing, created: false };
  }
  const created = await Asset.create(payload);
  await generateAssetQrPng(payload.asset_id);
  await created.update({ qr_url: getAssetQrFullUrl(payload.asset_id) });
  return { asset: created, created: true };
}

module.exports = {
  issueAssetsApiToken: async (req, res) => {
    try {
      const { API_KEY } = process.env;
      if (!API_KEY) {
        return status.ResponseStatus(res, 500, "Server misconfigured: API_KEY is missing");
      }

      const issuedBy = req.session_data?.user_id || null;
      const token = jwt.sign(
        { scope: "assets", issued_by: issuedBy },
        API_KEY,
        { expiresIn: "365d" }
      );

      return status.ResponseStatus(res, 200, "Assets API token issued", { token, expires_in_days: 365 });
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to issue token", { error: error.message });
    }
  },

  createOrUpdate: async (req, res) => {
    try {
      const payload = normalizeAssetPayload(req.body);
      if (!payload.asset_id) return status.ResponseStatus(res, 400, "Asset_ID is required");
      if (!payload.asset_name) return status.ResponseStatus(res, 400, "Asset_Name is required");

      const { asset, created } = await upsertAsset(payload);
      return status.ResponseStatus(res, created ? 201 : 200, created ? "Asset created" : "Asset updated", asset);
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to upsert asset", { error: error.message });
    }
  },

  updateById: async (req, res) => {
    try {
      const { asset_id } = req.params;
      const payload = normalizeAssetPayload({ ...req.body, asset_id });
      if (!payload.asset_id) return status.ResponseStatus(res, 400, "Asset_ID is required");

      // update-by-id should not create silently unless explicitly requested
      const existing = await Asset.findByPk(asset_id);
      if (!existing) return status.ResponseStatus(res, 404, "Asset not found");

      await existing.update(payload);
      await generateAssetQrPng(asset_id);
      await existing.update({ qr_url: getAssetQrFullUrl(asset_id) });
      return status.ResponseStatus(res, 200, "Asset updated", existing);
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to update asset", { error: error.message });
    }
  },

  list: async (req, res) => {
    try {
      const search = (req.query.search || "").trim();
      const page = Math.max(parseInt(req.query.page || "1", 10) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "10", 10) || 10, 1),
        100
      );
      const offset = (page - 1) * limit;

      const where = search
        ? {
            [Op.or]: [
              { asset_id: { [Op.like]: `%${search}%` } },
              { asset_name: { [Op.like]: `%${search}%` } },
              { category: { [Op.like]: `%${search}%` } },
              { brand: { [Op.like]: `%${search}%` } },
              { model: { [Op.like]: `%${search}%` } },
            ],
          }
        : undefined;

      const { rows, count } = await Asset.findAndCountAll({
        where,
        order: [["asset_name", "ASC"]],
        limit,
        offset,
      });

      const totalPage = Math.max(Math.ceil(count / limit), 1);
      return status.ResponseStatus(res, 200, "Assets fetched", rows, {
        page,
        limit,
        total: count,
        totalPage,
      });
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch assets", { error: error.message });
    }
  },
};

