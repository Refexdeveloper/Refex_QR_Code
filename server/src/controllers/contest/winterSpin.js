const status = require("../../helpers/Response");
const winterSpinService = require("../../services/winterSpinService");
const winterCampaignService = require("../../services/winterCampaignService");
const winterCaptchaService = require("../../services/winterCaptchaService");
const winterFormCopy = require("../../services/winterFormCopy");

const SPIN_COOKIE = "refex_spin";

function readSpinCookie(req) {
  const header = String(req.headers.cookie || "");
  const parts = header.split(";");
  for (let i = 0; i < parts.length; i += 1) {
    const trimmed = parts[i].trim();
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    if (trimmed.slice(0, eq) !== SPIN_COOKIE) continue;
    try {
      return decodeURIComponent(trimmed.slice(eq + 1));
    } catch (error) {
      return "";
    }
  }
  return "";
}

function setSpinCookie(req, res, token, expiresAt) {
  const expiresMs = expiresAt ? new Date(expiresAt).getTime() - Date.now() : 72 * 60 * 60 * 1000;
  const maxAge = Math.max(60, Math.floor(expiresMs / 1000));
  const secure = Boolean(req.secure) || String(req.headers["x-forwarded-proto"] || "") === "https";
  const pieces = [
    `${SPIN_COOKIE}=${encodeURIComponent(token)}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) pieces.push("Secure");
  res.append("Set-Cookie", pieces.join("; "));
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
}

function extractApiKey(req) {
  const headers = req.headers || {};
  const header =
    headers["x-api-key"] ||
    headers["x-api_key"] ||
    headers["api-key"] ||
    headers["apikey"] ||
    headers["x-winter-spin-key"] ||
    "";
  if (header) return String(header).trim();

  const auth = String(headers.authorization || headers.Authorization || "").trim();
  if (!auth) {
    return String(req.body?.apiKey || req.body?.api_key || req.query?.apiKey || "").trim();
  }

  const lower = auth.toLowerCase();
  if (lower.startsWith("bearer ")) return auth.slice(7).trim();
  if (lower.startsWith("apikey ")) return auth.slice(7).trim();
  if (lower.startsWith("api-key ")) return auth.slice(8).trim();
  // Raw key in Authorization header
  return auth;
}

module.exports = {
  getStatus: async (req, res) => {
    try {
      const result = await winterSpinService.getSessionStatus(readSpinCookie(req));
      if (!result.ok) {
        return status.ResponseStatus(res, result.status || 403, result.error);
      }
      return status.ResponseStatus(res, 200, "OK", result);
    } catch (error) {
      console.error("Winter spin status error:", error);
      return status.ResponseStatus(
        res,
        500,
        "Unable to load spin status. Please try again."
      );
    }
  },

  issueCaptcha: async (req, res) => {
    try {
      if (!winterCaptchaService.allowIssue(clientIp(req))) {
        return status.ResponseStatus(res, 429, "Too many requests. Please wait and try again.");
      }
      return status.ResponseStatus(res, 200, "OK", winterCaptchaService.createCaptcha());
    } catch (error) {
      console.error("Winter campaign captcha error:", error);
      return status.ResponseStatus(res, 500, "Unable to load the security check.");
    }
  },

  register: async (req, res) => {
    try {
      const uploaded = req.files || {};
      const bills = Array.isArray(uploaded) ? uploaded : uploaded.bills || [];
      const boardingPass = Array.isArray(uploaded) ? [] : uploaded.boardingPass || [];
      const result = await winterCampaignService.registerSubmission({
        name: req.body.name || "",
        email: req.body.email || "",
        phone: req.body.phone || req.body.mobile || "",
        consent: req.body.consent,
        address: req.body.address || "",
        outlet: req.body.outlet || "",
        invoiceValue: req.body.invoiceValue || "",
        files: bills,
        boardingPass,
        ip: clientIp(req),
        userAgent: req.headers["user-agent"],
        captchaToken: req.body.captchaToken || "",
        captchaAnswer: req.body.captchaAnswer || "",
      });

      if (!result.ok) {
        return status.ResponseStatus(res, result.status || 400, result.message);
      }

      if (result.sessionToken) {
        setSpinCookie(req, res, result.sessionToken, result.expiresAt);
      }

      return status.ResponseStatus(res, 200, result.message, {
        alreadyRegistered: result.alreadyRegistered,
        spinPath: "/winter-carnival/spin",
      });
    } catch (error) {
      console.error("Winter campaign register error:", error);
      return status.ResponseStatus(
        res,
        500,
        "Unable to save your entry. Please try again."
      );
    }
  },

  /**
   * Trusted server-to-server callers only.
   * POST /api/winter-spin/issue
   * Header: X-API-Key: <WINTER_SPIN_API_KEY>
   * Body: { name, phone }
   */
  issue: async (req, res) => {
    try {
      const name = req.body.name || req.body.full_name || "";
      const phone = req.body.phone || req.body.mobile || req.body.mobile_number || "";
      const apiKey = extractApiKey(req);

      const result = await winterSpinService.issueSpinToken({ name, phone, apiKey });
      if (!result.ok) {
        return status.ResponseStatus(res, result.status || 400, result.message);
      }

      return status.ResponseStatus(res, 200, "Token issued.", {
        token: result.token,
        expiresAt: result.expiresAt,
        spinUrl: result.spinUrl,
        reused: result.reused,
      });
    } catch (error) {
      console.error("Winter spin issue error:", error);
      return status.ResponseStatus(
        res,
        500,
        "Unable to issue spin token. Please try again."
      );
    }
  },

  formCopy: async (_req, res) => {
    try {
      const result = await winterFormCopy.getFormCopy();
      return status.ResponseStatus(res, 200, "OK", result);
    } catch (error) {
      console.error("Winter form copy error:", error);
      return status.ResponseStatus(res, 500, "Unable to load the form content.");
    }
  },

  campaignPeriod: async (_req, res) => {
    try {
      const period = await winterSpinService.getCampaignPeriod();
      return status.ResponseStatus(res, 200, "OK", period);
    } catch (error) {
      console.error("Winter campaign period error:", error);
      return status.ResponseStatus(res, 500, "Unable to load the contest period.");
    }
  },

  spin: async (req, res) => {
    try {
      const result = await winterSpinService.spinSession({
        token: readSpinCookie(req),
        ip: clientIp(req),
        userAgent: req.headers["user-agent"],
      });

      if (!result.ok) {
        return status.ResponseStatus(res, result.status || 400, result.message);
      }

      return status.ResponseStatus(res, 200, "Spin result ready.", {
        alreadySpun: result.alreadySpun,
        weekKey: result.weekKey,
        entry: result.entry,
      });
    } catch (error) {
      console.error("Winter spin error:", error);
      return status.ResponseStatus(
        res,
        500,
        "Unable to complete your spin. Please try again."
      );
    }
  },
};
