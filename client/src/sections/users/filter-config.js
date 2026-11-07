export const TEXT_OPERATORS = [
  { id: 'contains', label: 'Contains' },
  { id: 'equals', label: 'Equals' },
  { id: 'not_equals', label: 'Not equals' },
  { id: 'starts_with', label: 'Starts with' },
  { id: 'ends_with', label: 'Ends with' },
];

export const SELECT_OPERATORS = [
  { id: 'equals', label: 'Equals' },
  { id: 'not_equals', label: 'Not equals' },
];

export const FILTER_FIELDS = [
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'email', label: 'Email', type: 'text' },
  { id: 'phone', label: 'Phone', type: 'text' },
  { id: 'employee_id', label: 'Employee ID', type: 'text' },
  { id: 'role', label: 'Role', type: 'text' },
  { id: 'designation', label: 'Designation', type: 'text' },
  { id: 'company_name', label: 'Company', type: 'text' },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { id: 'active', label: 'Active' },
      { id: 'inactive', label: 'Inactive' },
    ],
  },
  {
    id: 'source',
    label: 'Source',
    type: 'select',
    options: [
      { id: 'hrms', label: 'HRMS' },
      { id: 'manual', label: 'Manual' },
    ],
  },
];

export const EMPTY_FILTER = {
  field: '',
  operator: 'contains',
  value: '',
};

export function getFilterFields() {
  return FILTER_FIELDS;
}

export function getOperatorsForField(fieldId) {
  const field = FILTER_FIELDS.find((item) => item.id === fieldId);
  if (field?.type === 'select') {
    return SELECT_OPERATORS;
  }
  return TEXT_OPERATORS;
}

export function getDefaultOperator(fieldId) {
  return getOperatorsForField(fieldId)[0]?.id || 'contains';
}
