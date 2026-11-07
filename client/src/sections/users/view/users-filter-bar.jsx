import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

import {
  getDefaultOperator,
  getFilterFields,
  getOperatorsForField,
} from '../filter-config';

// ----------------------------------------------------------------------

export default function UsersFilterBar({ filter, onFilterChange, onApply, onClear }) {
  const fields = getFilterFields();
  const selectedField = fields.find((item) => item.id === filter.field);
  const operators = getOperatorsForField(filter.field);
  const isSelectField = selectedField?.type === 'select';
  const hasActiveFilter = Boolean(filter.field || filter.value);

  const handleFieldChange = (field) => {
    const nextOperator = getDefaultOperator(field);
    onFilterChange({ ...filter, field, operator: nextOperator, value: '' });
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', md: 'center' }}
      sx={{ p: 2, borderBottom: (theme) => `dashed 1px ${theme.palette.divider}` }}
    >
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Column</InputLabel>
        <Select
          label="Column"
          value={filter.field}
          onChange={(e) => handleFieldChange(e.target.value)}
        >
          <MenuItem value="">
            <em>Select column</em>
          </MenuItem>
          {fields.map((field) => (
            <MenuItem key={field.id} value={field.id}>
              {field.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 150 }} disabled={!filter.field}>
        <InputLabel>Operator</InputLabel>
        <Select
          label="Operator"
          value={filter.operator}
          onChange={(e) => onFilterChange({ ...filter, operator: e.target.value })}
        >
          {operators.map((operator) => (
            <MenuItem key={operator.id} value={operator.id}>
              {operator.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {isSelectField ? (
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }} disabled={!filter.field}>
          <InputLabel>Query</InputLabel>
          <Select
            label="Query"
            value={filter.value}
            onChange={(e) => onFilterChange({ ...filter, value: e.target.value })}
          >
            <MenuItem value="">
              <em>Select value</em>
            </MenuItem>
            {(selectedField?.options || []).map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          size="small"
          label="Query"
          placeholder="Enter filter value"
          value={filter.value}
          onChange={(e) => onFilterChange({ ...filter, value: e.target.value })}
          disabled={!filter.field}
          sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onApply();
            }
          }}
        />
      )}

      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={onApply} disabled={!filter.field || !filter.value.trim()}>
          Apply
        </Button>
        <Button variant="outlined" onClick={onClear} disabled={!hasActiveFilter}>
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

UsersFilterBar.propTypes = {
  filter: PropTypes.shape({
    field: PropTypes.string,
    operator: PropTypes.string,
    value: PropTypes.string,
  }),
  onFilterChange: PropTypes.func,
  onApply: PropTypes.func,
  onClear: PropTypes.func,
};
