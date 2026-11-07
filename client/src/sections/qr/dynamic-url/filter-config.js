export const TEXT_OPERATORS = [
  { id: 'contains', label: 'Contains' },
  { id: 'equals', label: 'Equals' },
  { id: 'not_equals', label: 'Not equals' },
  { id: 'starts_with', label: 'Starts with' },
  { id: 'ends_with', label: 'Ends with' },
];

export const DATE_OPERATORS = [
  { id: 'equals', label: 'On' },
  { id: 'after', label: 'After' },
  { id: 'before', label: 'Before' },
];

export const BASE_FILTER_FIELDS = [
  { id: 'code', label: 'ID', type: 'text' },
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'dynamic_value', label: 'Dynamic URL / Data', type: 'text' },
  { id: 'created_at', label: 'Created At', type: 'date' },
];

export const ADMIN_FILTER_FIELDS = [{ id: 'created_by', label: 'Created By', type: 'text' }];

export const EMPTY_FILTER = {
  field: '',
  operator: 'contains',
  value: '',
};

export function getFilterFields(admin) {
  return admin ? [...BASE_FILTER_FIELDS, ...ADMIN_FILTER_FIELDS] : BASE_FILTER_FIELDS;
}

export function getOperatorsForField(fieldId, fields) {
  const field = fields.find((item) => item.id === fieldId);
  if (field?.type === 'date') {
    return DATE_OPERATORS;
  }
  return TEXT_OPERATORS;
}

export function getDefaultOperator(fieldId, fields) {
  return getOperatorsForField(fieldId, fields)[0]?.id || 'contains';
}
