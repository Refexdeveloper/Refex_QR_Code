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
import { RESPONSIVE_FILTER_BAR_SX } from '../../common/responsive-dialog';

// ----------------------------------------------------------------------

export default function UploadFileFilterBar({ admin, filter, onFilterChange, onApply, onClear }) {
  const fields = getFilterFields(admin);
  const operators = getOperatorsForField(filter.field, fields);
  const isDateField = fields.find((item) => item.id === filter.field)?.type === 'date';
  const hasActiveFilter = Boolean(filter.field || filter.value);

  const handleFieldChange = (field) => {
    const nextOperator = getDefaultOperator(field, fields);
    onFilterChange({ ...filter, field, operator: nextOperator });
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={1.5}
      alignItems={{ xs: 'stretch', md: 'center' }}
      sx={RESPONSIVE_FILTER_BAR_SX}
    >
      <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
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

      <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }} disabled={!filter.field}>
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

      <TextField
        size="small"
        label="Query"
        placeholder={isDateField ? 'YYYY-MM-DD' : 'Enter filter value'}
        value={filter.value}
        onChange={(e) => onFilterChange({ ...filter, value: e.target.value })}
        disabled={!filter.field}
        type={isDateField ? 'date' : 'text'}
        InputLabelProps={isDateField ? { shrink: true } : undefined}
        sx={{ minWidth: { xs: '100%', md: 240 }, flex: 1 }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onApply();
          }
        }}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
        <Button
          variant="contained"
          onClick={onApply}
          disabled={!filter.field || !filter.value.trim()}
          fullWidth
          sx={{ width: { md: 'auto' } }}
        >
          Apply
        </Button>
        <Button
          variant="outlined"
          onClick={onClear}
          disabled={!hasActiveFilter}
          fullWidth
          sx={{ width: { md: 'auto' } }}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}

UploadFileFilterBar.propTypes = {
  admin: PropTypes.bool,
  filter: PropTypes.shape({
    field: PropTypes.string,
    operator: PropTypes.string,
    value: PropTypes.string,
  }),
  onFilterChange: PropTypes.func,
  onApply: PropTypes.func,
  onClear: PropTypes.func,
};
