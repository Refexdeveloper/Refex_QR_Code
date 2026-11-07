/**
 * HRMS Sync: fetch active employees from HRMS API and upsert into users table.
 * Synced users are inactive (is_verified=false) until an admin activates them.
 */

const bcrypt = require("bcrypt");
const { User, ApiConfig } = require("../models");
const { generatePassword } = require("../utils/password");
const Role = require("../utils/userRoles");

const saltRounds = 10;

function splitEmployeeName(fullName) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };
  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  };
}

async function fetchHrmsEmployeesFromApi() {
  const cfg = await ApiConfig.findOne({ where: { is_active: true } });
  if (!cfg || !cfg.base_url) {
    throw new Error("API Config not set");
  }

  const base = cfg.base_url.replace(/\/$/, "");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (cfg.access_token) headers.Authorization = `Bearer ${cfg.access_token}`;
  if (cfg.api_key) headers["x-api-key"] = cfg.api_key;
  if (cfg.headers_json) {
    try {
      Object.assign(headers, JSON.parse(cfg.headers_json));
    } catch {
      // ignore invalid JSON
    }
  }

  const all = [];
  const maxPages = 50;
  let totalPages = 1;
  let currentPage = 1;

  do {
    const url = `${base}/api/employees/active${currentPage > 1 ? `?page=${currentPage}` : ""}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    let resp;
    try {
      resp = await fetch(url, { method: "GET", headers, signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`HRMS API error ${resp.status}: ${text || resp.statusText}`);
    }

    const data = await resp.json();
    const list = Array.isArray(data) ? data : data?.results || [];
    all.push(...list);
    if (data?.meta?.total_pages != null) {
      totalPages = Number(data.meta.total_pages) || 1;
    }
    if (list.length === 0) break;
    currentPage += 1;
  } while (currentPage <= Math.min(totalPages, maxPages));

  return all;
}

/**
 * @returns {{ created: number, updated: number, skipped: number, error?: string }}
 */
async function runHrmsUserSync() {
  const result = { created: 0, updated: 0, skipped: 0 };

  try {
    const hrmsEmployees = await fetchHrmsEmployeesFromApi();

    for (let i = 0; i < hrmsEmployees.length; i += 1) {
      const emp = hrmsEmployees[i];
      try {
        const employeeId = emp.employee_id || "";
        const email = (emp.email || "").trim().toLowerCase();
        if (!employeeId || !email) {
          result.skipped += 1;
          continue;
        }

        const { first_name, last_name } = splitEmployeeName(emp.employee_name);
        const payload = {
          first_name,
          last_name,
          email,
          phone: emp.mobile_number || "",
          user_name: employeeId,
          employee_id: employeeId,
          designation: emp.designation || "",
          company_name: emp.company?.company_name || "",
          is_hrms_synced: true,
        };

        const existing =
          (await User.findOne({ where: { employee_id: employeeId } })) ||
          (await User.findOne({ where: { email } }));

        if (existing) {
          await existing.update({
            ...payload,
            role: existing.role || Role.User,
            is_delete: 0,
          });
          result.updated += 1;
        } else {
          const tempPassword = generatePassword(10);
          const hashed = await bcrypt.hash(tempPassword, saltRounds);
          await User.create({
            ...payload,
            role: Role.User,
            password: hashed,
            is_verified: false,
          });
          result.created += 1;
        }
      } catch (err) {
        console.warn(`HRMS user sync: skip record at index ${i}:`, err.message);
        result.skipped += 1;
      }
    }

    return result;
  } catch (error) {
    console.error("HRMS user sync error:", error);
    result.error = error.message;
    return result;
  }
}

module.exports = { runHrmsUserSync, fetchHrmsEmployeesFromApi };
