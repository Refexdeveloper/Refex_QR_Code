const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { Op } = require("sequelize");
const {
  sequelize,
  WinterCampaignSubmission,
  WinterCampaignBill,
  WinterSpinEntry,
  WinterSpinToken,
} = require("../models");
const winterSpinService = require("./winterSpinService");

const BILLS_DIR = path.join(__dirname, "..", "..", "uploads", "winter-campaign");

function normalizeEmail(raw) {
  return String(raw || "").trim().toLowerCase();
}

function isValidName(name) {
  return /^[\p{L}][\p{L}\s.'-]{1,119}$/u.test(name);
}

function isValidEmail(email) {
  return email.length <= 180 && /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

function paging(query) {
  const page = Math.max(parseInt(query.page || "1", 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "10", 10) || 10, 1), 50);
  return { page, limit, offset: (page - 1) * limit };
}

function searchWhere(search, fields) {
  const term = String(search || "").trim();
  if (!term) return undefined;
  return {
    [Op.or]: fields.map((field) => ({ [field]: { [Op.like]: `%${term}%` } })),
  };
}

function mapBill(bill) {
  return {
    id: bill.id,
    originalName: bill.original_name,
    mimeType: bill.mime_type,
    sizeBytes: bill.size_bytes,
    kind: bill.kind || "invoice",
  };
}

function prizeLabelFor(entry) {
  const catalog = winterSpinService.PRIZE_BY_CODE[entry.prize_code];
  return catalog ? catalog.label : entry.prize_label;
}

function mapPrize(entry) {
  if (!entry) return null;
  return {
    id: entry.id,
    prizeCode: entry.prize_code,
    prizeLabel: prizeLabelFor(entry),
    isWin: entry.is_win,
    spunAt: entry.spun_at,
  };
}

async function listSubmissions(query) {
  const { page, limit, offset } = paging(query);
  const where = searchWhere(query.search, ["name", "email", "phone", "outlet"]);
  const { rows, count } = await WinterCampaignSubmission.findAndCountAll({
    where,
    include: [
      {
        model: WinterCampaignBill,
        as: "bills",
        attributes: ["id", "original_name", "mime_type", "size_bytes", "kind"],
      },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const phones = rows.map((row) => row.phone);
  const entries = phones.length
    ? await WinterSpinEntry.findAll({ where: { phone: phones } })
    : [];
  const entryByPhone = new Map(entries.map((entry) => [entry.phone, entry]));

  return {
    page,
    limit,
    total: count,
    totalPage: Math.max(Math.ceil(count / limit), 1),
    records: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address || "",
      outlet: row.outlet || "",
      invoiceValue: row.invoice_value == null ? null : Number(row.invoice_value),
      consent: row.consent,
      createdAt: row.created_at,
      bills: (row.bills || []).map(mapBill),
      prize: mapPrize(entryByPhone.get(row.phone)),
    })),
  };
}

async function listWinners(query) {
  const { page, limit, offset } = paging(query);
  const where = {
    is_win: true,
    ...searchWhere(query.search, ["name", "phone", "prize_label"]),
  };
  const { rows, count } = await WinterSpinEntry.findAndCountAll({
    where,
    order: [["spun_at", "DESC"]],
    limit,
    offset,
  });
  const phones = rows.map((row) => row.phone);
  const submissions = phones.length
    ? await WinterCampaignSubmission.findAll({
        where: { phone: phones },
        attributes: ["phone", "email", "outlet", "invoice_value", "address", "created_at"],
        include: [
          {
            model: WinterCampaignBill,
            as: "bills",
            attributes: ["id", "original_name", "mime_type", "size_bytes", "kind"],
          },
        ],
      })
    : [];
  const submissionByPhone = new Map(submissions.map((row) => [row.phone, row]));

  return {
    page,
    limit,
    total: count,
    totalPage: Math.max(Math.ceil(count / limit), 1),
    records: rows.map((row) => {
      const submission = submissionByPhone.get(row.phone);
      return {
        id: row.id,
        name: row.name,
        email: submission?.email || "",
        phone: row.phone,
        outlet: submission?.outlet || "",
        invoiceValue: submission?.invoice_value == null ? null : Number(submission.invoice_value),
        address: submission?.address || "",
        createdAt: submission?.created_at || null,
        bills: (submission?.bills || []).map(mapBill),
        prizeCode: row.prize_code,
        prizeLabel: prizeLabelFor(row),
        prize: { prizeLabel: prizeLabelFor(row), isWin: true },
        weekKey: row.week_key,
        spunAt: row.spun_at,
      };
    }),
  };
}

function formatExportWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function exportPhone(value) {
  const digits = String(value || "");
  if (!digits) return "";
  return digits.length > 10 ? `+${digits}` : digits;
}

function sheetFrom(headers, rows) {
  const data = [headers, ...rows.map((row) => headers.map((key) => row[key] ?? ""))];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = headers.map((header) => ({
    wch: Math.min(48, Math.max(header.length + 2, 18)),
  }));
  return sheet;
}

async function buildExport(query) {
  const submissions = await WinterCampaignSubmission.findAll({
    where: searchWhere(query.search, ["name", "email", "phone", "outlet"]),
    include: [{ model: WinterCampaignBill, as: "bills", attributes: ["original_name", "kind"] }],
    order: [["created_at", "DESC"]],
  });
  const phones = submissions.map((row) => row.phone);
  const spinEntries = phones.length
    ? await WinterSpinEntry.findAll({ where: { phone: phones } })
    : [];
  const entryByPhone = new Map(spinEntries.map((entry) => [entry.phone, entry]));

  const entryRows = submissions.map((row) => {
    const prize = entryByPhone.get(row.phone);
    return {
      Name: row.name,
      Email: row.email,
      Phone: exportPhone(row.phone),
      Address: row.address || "",
      Outlet: row.outlet || "",
      "Invoice value": row.invoice_value == null ? "" : Number(row.invoice_value),
      Submitted: formatExportWhen(row.created_at),
      Prize: prize ? prizeLabelFor(prize) : "Not spun",
      Winner: prize?.is_win ? "Yes" : "No",
      Bills: (row.bills || [])
        .filter((bill) => bill.kind !== "boarding_pass")
        .map((bill) => bill.original_name)
        .filter(Boolean)
        .join(", "),
      "Boarding pass": (row.bills || [])
        .filter((bill) => bill.kind === "boarding_pass")
        .map((bill) => bill.original_name)
        .filter(Boolean)
        .join(", "),
    };
  });

  const winners = await WinterSpinEntry.findAll({
    where: {
      is_win: true,
      ...searchWhere(query.search, ["name", "phone", "prize_label"]),
    },
    order: [["spun_at", "DESC"]],
  });
  const winnerPhones = winners.map((row) => row.phone);
  const winnerSubmissions = winnerPhones.length
    ? await WinterCampaignSubmission.findAll({
        where: { phone: winnerPhones },
        attributes: ["phone", "email"],
      })
    : [];
  const emailByPhone = new Map(winnerSubmissions.map((row) => [row.phone, row.email]));
  const winnerRows = winners.map((row) => ({
    Name: row.name,
    Email: emailByPhone.get(row.phone) || "",
    Phone: exportPhone(row.phone),
    Prize: prizeLabelFor(row),
    Week: row.week_key,
    Won: formatExportWhen(row.spun_at),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    sheetFrom(
      ["Name", "Email", "Phone", "Address", "Outlet", "Invoice value", "Submitted", "Prize", "Winner", "Bills", "Boarding pass"],
      entryRows
    ),
    "Entries"
  );
  XLSX.utils.book_append_sheet(
    workbook,
    sheetFrom(["Name", "Email", "Phone", "Prize", "Week", "Won"], winnerRows),
    "Winners"
  );
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}

async function billFile(id) {
  const bill = await WinterCampaignBill.findByPk(id);
  if (!bill) return { ok: false, status: 404, message: "Bill not found." };
  const root = path.resolve(BILLS_DIR);
  const filePath = path.resolve(root, path.basename(bill.stored_name));
  if (!filePath.startsWith(`${root}${path.sep}`) || !fs.existsSync(filePath)) {
    return { ok: false, status: 404, message: "Bill file is missing." };
  }
  return {
    ok: true,
    filePath,
    mimeType: bill.mime_type || "application/octet-stream",
    originalName: bill.original_name,
  };
}

async function updateSubmission(id, { name, email, phone }) {
  const submission = await WinterCampaignSubmission.findByPk(id);
  if (!submission) return { ok: false, status: 404, message: "Entry not found." };

  const cleanName = winterSpinService.normalizeName(name);
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = winterSpinService.normalizePhone(phone);

  if (!isValidName(cleanName)) {
    return { ok: false, status: 400, message: "Enter a valid name." };
  }
  if (!isValidEmail(cleanEmail)) {
    return { ok: false, status: 400, message: "Enter a valid email address." };
  }
  if (!winterSpinService.isValidPhone(cleanPhone)) {
    return { ok: false, status: 400, message: "Enter a valid mobile number." };
  }

  const clash = await WinterCampaignSubmission.findOne({
    where: {
      id: { [Op.ne]: submission.id },
      [Op.or]: [{ email: cleanEmail }, { phone: cleanPhone }],
    },
  });
  if (clash) {
    return { ok: false, status: 409, message: "Another entry already uses this email or phone." };
  }

  const previousPhone = submission.phone;
  try {
    await sequelize.transaction(async (transaction) => {
      await submission.update(
        { name: cleanName, email: cleanEmail, phone: cleanPhone },
        { transaction }
      );
      await WinterSpinToken.update(
        { name: cleanName, phone: cleanPhone },
        { where: { phone: previousPhone }, transaction }
      );
      await WinterSpinEntry.update(
        { name: cleanName, phone: cleanPhone },
        { where: { phone: previousPhone }, transaction }
      );
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return { ok: false, status: 409, message: "Another entry already uses this email or phone." };
    }
    throw error;
  }

  return { ok: true, message: "Entry updated." };
}

function removeBillFiles(bills) {
  (bills || []).forEach((bill) => {
    const root = path.resolve(BILLS_DIR);
    const filePath = path.resolve(root, path.basename(bill.stored_name || ""));
    if (filePath.startsWith(`${root}${path.sep}`)) {
      fs.unlink(filePath, () => {});
    }
  });
}

async function deleteSubmission(id) {
  const submission = await WinterCampaignSubmission.findByPk(id, {
    include: [{ model: WinterCampaignBill, as: "bills" }],
  });
  if (!submission) return { ok: false, status: 404, message: "Entry not found." };

  const bills = submission.bills || [];
  await sequelize.transaction(async (transaction) => {
    await WinterCampaignBill.destroy({ where: { submission_id: submission.id }, transaction });
    await submission.destroy({ transaction });
    await WinterSpinToken.destroy({ where: { phone: submission.phone }, transaction });
    await WinterSpinEntry.destroy({ where: { phone: submission.phone }, transaction });
  });
  removeBillFiles(bills);
  return { ok: true, message: "Entry removed." };
}

async function deleteWinner(id) {
  const entry = await WinterSpinEntry.findByPk(id);
  if (!entry || !entry.is_win) return { ok: false, status: 404, message: "Winner not found." };
  await entry.destroy();
  return { ok: true, message: "Winner removed." };
}

module.exports = {
  listSubmissions,
  listWinners,
  buildExport,
  billFile,
  updateSubmission,
  deleteSubmission,
  deleteWinner,
};
