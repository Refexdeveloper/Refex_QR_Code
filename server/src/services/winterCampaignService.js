const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { WinterCampaignSubmission, WinterCampaignBill } = require("../models");
const winterSpinService = require("./winterSpinService");
const winterCaptchaService = require("./winterCaptchaService");
const { findOutlet } = require("./winterOutlets");

function normalizeEmail(raw) {
  return String(raw || "").trim().toLowerCase();
}

function isValidName(name) {
  return /^[\p{L}][\p{L}\s.'-]{1,119}$/u.test(name);
}

function isValidEmail(email) {
  return (
    email.length <= 180 &&
    /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)
  );
}

function removeUploaded(files) {
  (files || []).forEach((file) => {
    if (file && file.path) {
      fs.unlink(file.path, () => {});
    }
  });
}

function allUploads(files, boardingPass) {
  return [...(files || []), ...(boardingPass || [])];
}

function parseInvoice(raw) {
  const value = Number(String(raw || "").replace(/,/g, "").trim());
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

async function registerSubmission({
  name,
  email,
  phone,
  consent,
  outlet,
  invoiceValue,
  files,
  boardingPass,
  ip,
  userAgent,
  captchaToken,
  captchaAnswer,
}) {
  const uploads = allUploads(files, boardingPass);
  if (!winterCaptchaService.allowRegister(ip)) {
    removeUploaded(uploads);
    return {
      ok: false,
      status: 429,
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }
  if (!winterCaptchaService.verifyCaptcha(captchaToken, captchaAnswer)) {
    removeUploaded(uploads);
    return {
      ok: false,
      status: 400,
      message: "Enter the security code shown in the image.",
    };
  }

  const cleanEmail = normalizeEmail(email);
  const cleanName = winterSpinService.normalizeName(name);
  const cleanPhone = winterSpinService.normalizePhone(phone);
  const agreed = consent === true || consent === "true" || consent === "1" || consent === "on";

  const chosenOutlet = findOutlet(outlet);
  const invoice = parseInvoice(invoiceValue);

  if (!isValidName(cleanName)) {
    removeUploaded(uploads);
    return {
      ok: false,
      status: 400,
      message: "Enter a valid name using letters, spaces, hyphens, or apostrophes.",
    };
  }
  if (!isValidEmail(cleanEmail)) {
    removeUploaded(uploads);
    return { ok: false, status: 400, message: "A valid email address is required." };
  }
  if (!winterSpinService.isValidPhone(cleanPhone)) {
    removeUploaded(uploads);
    return { ok: false, status: 400, message: "A valid mobile number with country code is required." };
  }
  if (!chosenOutlet) {
    removeUploaded(uploads);
    return { ok: false, status: 400, message: "Select the participating outlet on your invoice." };
  }
  if (invoice == null || invoice < chosenOutlet.minimum) {
    removeUploaded(uploads);
    return {
      ok: false,
      status: 400,
      message: `The invoice must be at least ₹${chosenOutlet.minimum.toLocaleString("en-IN")} for ${chosenOutlet.brand} at ${chosenOutlet.location}.`,
    };
  }
  if (invoice > 10000000) {
    removeUploaded(uploads);
    return { ok: false, status: 400, message: "Enter the invoice value shown on the bill." };
  }
  if (!agreed) {
    removeUploaded(uploads);
    return { ok: false, status: 400, message: "Please agree to the campaign terms to continue." };
  }

  const existing = await WinterCampaignSubmission.findOne({
    where: { [Op.or]: [{ email: cleanEmail }, { phone: cleanPhone }] },
  });

  if (existing) {
    removeUploaded(uploads);
    const access = await winterSpinService.mintSpinAccess({
      name: existing.name,
      phone: existing.phone,
    });
    if (!access.ok) return access;
    return {
      ok: true,
      alreadyRegistered: true,
      message: "This email or phone has already been submitted. Opening your spin.",
      spinPath: "/winter-carnival/spin",
      sessionToken: access.token,
      expiresAt: access.expiresAt,
    };
  }

  if (!files || !files.length) {
    removeUploaded(uploads);
    return { ok: false, status: 400, message: "Upload a clear photo or PDF of your purchase bill." };
  }
  if (files.length > 5) {
    removeUploaded(uploads);
    return { ok: false, status: 400, message: "You can upload up to 5 bill files." };
  }
  const passes = boardingPass || [];
  if (passes.length > 1) {
    removeUploaded(uploads);
    return { ok: false, status: 400, message: "Upload one boarding pass." };
  }

  const access = await winterSpinService.mintSpinAccess({
    name: cleanName,
    phone: cleanPhone,
  });
  if (!access.ok) {
    removeUploaded(uploads);
    return access;
  }

  try {
    const submission = await WinterCampaignSubmission.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      consent: true,
      address: null,
      outlet: chosenOutlet.label,
      invoice_value: invoice,
      token: access.token,
      created_at: new Date(),
      ip_address: ip ? String(ip).slice(0, 64) : null,
      user_agent: userAgent ? String(userAgent).slice(0, 512) : null,
    });

    const billRows = [
      ...files.map((file) => ({ file, kind: "invoice" })),
      ...passes.map((file) => ({ file, kind: "boarding_pass" })),
    ];
    await WinterCampaignBill.bulkCreate(
      billRows.map(({ file, kind }) => ({
        submission_id: submission.id,
        original_name: path.basename(file.originalname || kind).slice(0, 255),
        stored_name: path.basename(file.filename),
        mime_type: file.mimetype ? String(file.mimetype).slice(0, 120) : null,
        size_bytes: file.size || 0,
        kind,
        created_at: new Date(),
      }))
    );

    return {
      ok: true,
      alreadyRegistered: false,
      message: "Details saved. Opening your spin wheel.",
      spinPath: "/winter-carnival/spin",
      sessionToken: access.token,
      expiresAt: access.expiresAt,
    };
  } catch (error) {
    removeUploaded(uploads);
    if (error.name === "SequelizeUniqueConstraintError") {
      const again = await WinterCampaignSubmission.findOne({
        where: { [Op.or]: [{ email: cleanEmail }, { phone: cleanPhone }] },
      });
      if (again) {
        const retry = await winterSpinService.mintSpinAccess({
          name: again.name,
          phone: again.phone,
        });
        if (retry.ok) {
          return {
            ok: true,
            alreadyRegistered: true,
            message: "This email or phone has already been submitted. Opening your spin.",
            spinPath: "/winter-carnival/spin",
            sessionToken: retry.token,
            expiresAt: retry.expiresAt,
          };
        }
      }
    }
    throw error;
  }
}

module.exports = { registerSubmission };
