const { Op } = require("sequelize");
const { parse: parseCsv } = require("csv-parse/sync");
const { Asset } = require("../models");
const status = require("../helpers/Response");
const {
  generateAssetQrPng,
  getAssetQrPublicPath,
  getPublicAssetUrl,
  getAssetQrFullUrl,
} = require("../utils/assetQr");

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeDateOnly(value) {
  if (value === null || value === undefined || value === "") return null;

  // If already Date
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const raw = String(value).trim();
  if (!raw) return null;

  // ISO-ish: YYYY-MM-DD
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return raw;

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmy) {
    const dd = String(dmy[1]).padStart(2, "0");
    const mm = String(dmy[2]).padStart(2, "0");
    const yyyy = dmy[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  // DD-MMM-YYYY (e.g. 16-Feb-2024)
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

  // Fallback: try Date.parse for other formats
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

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

function detectDelimiter(sampleLine) {
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let bestCount = -1;
  candidates.forEach((d) => {
    const count = sampleLine.split(d).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  });
  return best;
}

function toCsvValue(value) {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

const EXPORT_COLUMNS = [
  "asset_id",
  "asset_name",
  "category",
  "asset_subcategory",
  "entity",
  "brand",
  "model",
  "configuration_details",
  "asset_status",
  "purchase_date",
  "warranty_expiry_date",
  "purchase_cost",
  "current_value",
  "vendor_name",
  "invoice_date",
  "assigned_employee_name",
  "assigned_employee_email",
  "location",
  "notes",
  "employee_status",
  "exit_date",
];

module.exports = {
  publicGetById: async (req, res) => {
    try {
      const { asset_id } = req.params;
      const asset = await Asset.findByPk(asset_id, { raw: true });
      if (!asset) return status.ResponseStatus(res, 404, "Asset not found");

      return status.ResponseStatus(res, 200, "Asset fetched", {
        ...asset,
        public_url: getPublicAssetUrl(asset_id),
        qr_image_url: asset.qr_url || getAssetQrFullUrl(asset_id),
      });
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch asset", { error: error.message });
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
      return status.ResponseStatus(
        res,
        200,
        "Assets fetched",
        rows,
        {
          page,
          limit,
          total: count,
          totalPage,
        }
      );
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch assets", { error: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const { asset_id } = req.params;
      const asset = await Asset.findByPk(asset_id);
      if (!asset) return status.ResponseStatus(res, 404, "Asset not found");
      return status.ResponseStatus(res, 200, "Asset fetched", asset);
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to fetch asset", { error: error.message });
    }
  },

  create: async (req, res) => {
    try {
      const payload = normalizeAssetPayload(req.body);
      if (!payload.asset_id) return status.ResponseStatus(res, 400, "Asset_ID is required");
      if (!payload.asset_name) return status.ResponseStatus(res, 400, "Asset_Name is required");

      const exists = await Asset.findByPk(payload.asset_id);
      if (exists) return status.ResponseStatus(res, 409, "Asset_ID already exists");

      const created = await Asset.create(payload);
      await generateAssetQrPng(created.asset_id);
      await created.update({ qr_url: getAssetQrFullUrl(created.asset_id) });
      return status.ResponseStatus(res, 201, "Asset created", created);
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to create asset", { error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const { asset_id } = req.params;
      const asset = await Asset.findByPk(asset_id);
      if (!asset) return status.ResponseStatus(res, 404, "Asset not found");

      const payload = normalizeAssetPayload(req.body);
      // never allow primary key change via update
      delete payload.asset_id;

      await asset.update(payload);
      await generateAssetQrPng(asset_id);
      await asset.update({ qr_url: getAssetQrFullUrl(asset_id) });
      return status.ResponseStatus(res, 200, "Asset updated", asset);
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to update asset", { error: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      const { asset_id } = req.params;
      const asset = await Asset.findByPk(asset_id);
      if (!asset) return status.ResponseStatus(res, 404, "Asset not found");
      await asset.destroy();
      return status.ResponseStatus(res, 200, "Asset deleted");
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to delete asset", { error: error.message });
    }
  },

  exportCsv: async (req, res) => {
    try {
      const assets = await Asset.findAll({ order: [["asset_name", "ASC"]], raw: true });
      const header = EXPORT_COLUMNS.join(",");
      const rows = assets.map((a) => EXPORT_COLUMNS.map((col) => toCsvValue(a[col])).join(","));

      // Add UTF-8 BOM so Excel opens correctly (prevents â€™/â€” mojibake)
      const bom = "\uFEFF";

      const csv =
        assets.length === 0
          ? `${bom}${header}\nNo data`
          : `${bom}${[header, ...rows].join("\n")}`;

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=\"assets_export.csv\"");
      return res.status(200).send(csv);
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to export assets", { error: error.message });
    }
  },

  importCsvOrJson: async (req, res) => {
    try {
      let rows = [];

      if (req.file && req.file.buffer) {
        const text = req.file.buffer.toString("utf8");
        const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) || "";
        const delimiter = detectDelimiter(firstLine);

        rows = parseCsv(text, {
          columns: true,
          delimiter,
          skip_empty_lines: true,
          bom: true,
          trim: true,
          relax_quotes: true,
          relax_column_count: true,
        });
      } else if (Array.isArray(req.body)) {
        rows = req.body;
      } else if (Array.isArray(req.body?.rows)) {
        rows = req.body.rows;
      } else {
        return status.ResponseStatus(
          res,
          400,
          "Provide CSV file (field: file) or JSON array"
        );
      }

      const failures = [];
      const normalized = rows
        .map((r, idx) => ({
          idx,
          payload: normalizeAssetPayload(r),
        }))
        .filter(({ idx, payload }) => {
          if (!payload.asset_id || !payload.asset_name) {
            failures.push({
              row: idx + 1,
              asset_id: payload.asset_id || null,
              reason: !payload.asset_id ? "Missing Asset_ID" : "Missing Asset_Name",
            });
            return false;
          }
          return true;
        });

      if (normalized.length === 0) {
        return status.ResponseStatus(res, 400, "No valid rows found", {
          total: rows.length,
          created: 0,
          updated: 0,
          failed: failures.length,
          failures: failures.slice(0, 50),
        });
      }

      let created = 0;
      let updated = 0;
      let failed = failures.length;

      // Upsert one-by-one (simple + predictable)
      // eslint-disable-next-line no-restricted-syntax
      for (const { idx, payload } of normalized) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const existing = await Asset.findByPk(payload.asset_id);
          if (existing) {
            // eslint-disable-next-line no-await-in-loop
            await existing.update(payload);
            updated += 1;
          } else {
            // eslint-disable-next-line no-await-in-loop
            await Asset.create(payload);
            created += 1;
          }

          // Ensure QR exists/updated for each row
          // eslint-disable-next-line no-await-in-loop
          await generateAssetQrPng(payload.asset_id);
          // eslint-disable-next-line no-await-in-loop
          await Asset.update(
            { qr_url: getAssetQrFullUrl(payload.asset_id) },
            { where: { asset_id: payload.asset_id } }
          );
        } catch (e) {
          failed += 1;
          failures.push({
            row: idx + 1,
            asset_id: payload.asset_id,
            reason: e.message,
          });
          console.error("[assets.import] row failed", {
            row: idx + 1,
            asset_id: payload.asset_id,
            reason: e.message,
          });
        }
      }

      return status.ResponseStatus(res, 200, "Import completed", {
        total: rows.length,
        created,
        updated,
        failed,
        failures: failures.slice(0, 50),
      });
    } catch (error) {
      return status.ResponseStatus(res, 500, "Failed to import assets", { error: error.message });
    }
  },
};

