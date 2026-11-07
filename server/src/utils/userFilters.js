const { Op } = require("sequelize");

const TEXT_OPERATORS = new Set([
  "contains",
  "equals",
  "not_equals",
  "starts_with",
  "ends_with",
]);

const SELECT_OPERATORS = new Set(["equals", "not_equals"]);

const FILTER_FIELDS = {
  name: { type: "name" },
  email: { type: "text", column: "email" },
  phone: { type: "text", column: "phone" },
  employee_id: { type: "text", column: "employee_id" },
  role: { type: "text", column: "role" },
  designation: { type: "text", column: "designation" },
  company_name: { type: "text", column: "company_name" },
  status: {
    type: "boolean",
    column: "is_verified",
    values: { active: true, inactive: false },
  },
  source: {
    type: "boolean",
    column: "is_hrms_synced",
    values: { hrms: true, manual: false },
  },
};

function escapeLike(value) {
  return String(value).replace(/[%_\\]/g, "\\$&");
}

function buildTextCondition(operator, value) {
  const safe = escapeLike(value);
  switch (operator) {
    case "equals":
      return value;
    case "not_equals":
      return { [Op.ne]: value };
    case "starts_with":
      return { [Op.like]: `${safe}%` };
    case "ends_with":
      return { [Op.like]: `%${safe}` };
    case "contains":
    default:
      return { [Op.like]: `%${safe}%` };
  }
}

function buildNameWhere(operator, value) {
  const condition = buildTextCondition(operator, value);
  if (typeof condition === "string") {
    return {
      [Op.or]: [{ first_name: condition }, { last_name: condition }],
    };
  }
  if (condition[Op.ne] !== undefined) {
    return {
      [Op.and]: [
        { first_name: { [Op.ne]: value } },
        { last_name: { [Op.ne]: value } },
      ],
    };
  }
  return {
    [Op.or]: [{ first_name: condition }, { last_name: condition }],
  };
}

/**
 * @returns {{ whereExtra: object, error?: string }}
 */
function buildListFilter({ filterField, filterOperator, filterValue }) {
  const field = String(filterField || "").trim();
  const operator = String(filterOperator || "").trim();
  const value = String(filterValue ?? "").trim();

  if (!field && !value) {
    return { whereExtra: {} };
  }

  if (!field) {
    return { whereExtra: {}, error: "Filter column is required" };
  }
  if (!value) {
    return { whereExtra: {}, error: "Filter value is required" };
  }

  const config = FILTER_FIELDS[field];
  if (!config) {
    return { whereExtra: {}, error: "Invalid filter column" };
  }

  if (config.type === "text") {
    if (!TEXT_OPERATORS.has(operator)) {
      return { whereExtra: {}, error: "Invalid filter operator" };
    }
    return {
      whereExtra: { [config.column]: buildTextCondition(operator, value) },
    };
  }

  if (config.type === "name") {
    if (!TEXT_OPERATORS.has(operator)) {
      return { whereExtra: {}, error: "Invalid filter operator" };
    }
    return { whereExtra: buildNameWhere(operator, value) };
  }

  if (config.type === "boolean") {
    if (!SELECT_OPERATORS.has(operator)) {
      return { whereExtra: {}, error: "Invalid filter operator" };
    }
    const normalized = value.toLowerCase();
    if (!(normalized in config.values)) {
      return { whereExtra: {}, error: "Invalid filter value" };
    }
    const boolValue = config.values[normalized];
    return {
      whereExtra: {
        [config.column]:
          operator === "not_equals" ? { [Op.ne]: boolValue } : boolValue,
      },
    };
  }

  return { whereExtra: {}, error: "Invalid filter column" };
}

module.exports = {
  buildListFilter,
  FILTER_FIELDS,
};
