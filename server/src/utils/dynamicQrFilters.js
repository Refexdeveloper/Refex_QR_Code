const { Op } = require("sequelize");

const TEXT_OPERATORS = new Set([
  "contains",
  "equals",
  "not_equals",
  "starts_with",
  "ends_with",
]);

const DATE_OPERATORS = new Set(["equals", "after", "before"]);

const FILTER_FIELDS = {
  code: { type: "text", column: "code" },
  name: { type: "text", column: "name" },
  dynamic_value: { type: "text", column: "dynamic_value" },
  created_at: { type: "date", column: "created_at" },
  created_by: { type: "user", adminOnly: true },
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

function buildDateCondition(operator, value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  if (operator === "after") {
    return { [Op.gt]: parsed };
  }
  if (operator === "before") {
    return { [Op.lt]: parsed };
  }

  const start = new Date(parsed);
  start.setHours(0, 0, 0, 0);
  const end = new Date(parsed);
  end.setHours(23, 59, 59, 999);
  return { [Op.between]: [start, end] };
}

function buildCreatorWhere(operator, value) {
  const condition = buildTextCondition(operator, value);
  if (typeof condition === "string") {
    return {
      [Op.or]: [
        { first_name: condition },
        { last_name: condition },
        { email: condition },
      ],
    };
  }
  if (condition[Op.ne] !== undefined) {
    return {
      [Op.and]: [
        { first_name: { [Op.ne]: value } },
        { last_name: { [Op.ne]: value } },
        { email: { [Op.ne]: value } },
      ],
    };
  }
  return {
    [Op.or]: [
      { first_name: condition },
      { last_name: condition },
      { email: condition },
    ],
  };
}

function buildListFilter({ filterField, filterOperator, filterValue, isAdmin }) {
  const field = String(filterField || "").trim();
  const operator = String(filterOperator || "").trim();
  const value = String(filterValue ?? "").trim();

  if (!field && !value) {
    return { whereExtra: {}, creatorWhere: null };
  }

  if (!field) {
    return { whereExtra: {}, creatorWhere: null, error: "Filter column is required" };
  }
  if (!value) {
    return { whereExtra: {}, creatorWhere: null, error: "Filter value is required" };
  }

  const config = FILTER_FIELDS[field];
  if (!config) {
    return { whereExtra: {}, creatorWhere: null, error: "Invalid filter column" };
  }
  if (config.adminOnly && !isAdmin) {
    return { whereExtra: {}, creatorWhere: null, error: "You cannot filter by this column" };
  }

  if (config.type === "text") {
    if (!TEXT_OPERATORS.has(operator)) {
      return { whereExtra: {}, creatorWhere: null, error: "Invalid filter operator" };
    }
    return {
      whereExtra: { [config.column]: buildTextCondition(operator, value) },
      creatorWhere: null,
    };
  }

  if (config.type === "date") {
    if (!DATE_OPERATORS.has(operator)) {
      return { whereExtra: {}, creatorWhere: null, error: "Invalid filter operator" };
    }
    const dateCondition = buildDateCondition(operator, value);
    if (!dateCondition) {
      return { whereExtra: {}, creatorWhere: null, error: "Invalid date value" };
    }
    return { whereExtra: { [config.column]: dateCondition }, creatorWhere: null };
  }

  if (config.type === "user") {
    if (!TEXT_OPERATORS.has(operator)) {
      return { whereExtra: {}, creatorWhere: null, error: "Invalid filter operator" };
    }
    return {
      whereExtra: {},
      creatorWhere: buildCreatorWhere(operator, value),
    };
  }

  return { whereExtra: {}, creatorWhere: null, error: "Invalid filter column" };
}

module.exports = { buildListFilter };
