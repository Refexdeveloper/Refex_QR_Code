const OPTIONAL_PAGES = ["campaign"];

function parsePageAccess(value) {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch (error) {
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function normalizePageAccess(value) {
  const allowed = new Set(OPTIONAL_PAGES);
  return [...new Set(parsePageAccess(value).filter((page) => allowed.has(page)))];
}

function serializePageAccess(value) {
  const pages = normalizePageAccess(value);
  return pages.length ? JSON.stringify(pages) : null;
}

function userCanAccessPage(user, page) {
  if (!user) return false;
  if (user.role === "Admin" || user.role === "SuperAdmin") return true;
  if (page === "qr") return true;
  if (page === "campaign" && user.role === "Campaign") return true;
  return parsePageAccess(user.page_access).includes(page);
}

module.exports = {
  OPTIONAL_PAGES,
  parsePageAccess,
  normalizePageAccess,
  serializePageAccess,
  userCanAccessPage,
};
