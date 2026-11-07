import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import { Box, Card, Stack, Button, TextField, Typography } from '@mui/material';

const FIELDS = [
  { key: 'asset_id', label: 'Asset_ID', required: true },
  { key: 'asset_name', label: 'Asset_Name', required: true },
  { key: 'category', label: 'Category' },
  { key: 'asset_subcategory', label: 'Asset_SubCategory' },
  { key: 'entity', label: 'Entity' },
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'configuration_details', label: 'Configuration_Details', multiline: true },
  { key: 'asset_status', label: 'Asset_Status' },
  { key: 'purchase_date', label: 'Purchase_Date', type: 'date' },
  { key: 'warranty_expiry_date', label: 'Warranty_Expiry_Date', type: 'date' },
  { key: 'purchase_cost', label: 'Purchase_Cost', type: 'number' },
  { key: 'current_value', label: 'Current_Value', type: 'number' },
  { key: 'vendor_name', label: 'Vendor-Name' },
  { key: 'invoice_date', label: 'Invoice_Date', type: 'date' },
  { key: 'assigned_employee_name', label: 'Assigned_Employee-Name' },
  { key: 'assigned_employee_email', label: 'Assigned_Employee-Email' },
  { key: 'location', label: 'Location' },
  { key: 'notes', label: 'Notes', multiline: true },
  { key: 'employee_status', label: 'Employee_Status' },
  { key: 'exit_date', label: 'Exit_Date', type: 'date' },
];

export default function AssetsForm({ mode, initialValues, onSubmit, onCancel, submitLabel }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [assetIdStatus, setAssetIdStatus] = useState({ checking: false, exists: false });
  const lastCheckedIdRef = useRef('');

  const effectiveSubmitLabel = useMemo(() => submitLabel || (mode === 'edit' ? 'Update Asset' : 'Create Asset'), [
    submitLabel,
    mode,
  ]);

  const validate = () => {
    const e = {};
    if (!values.asset_id) e.asset_id = 'Asset_ID is required';
    if (!values.asset_name) e.asset_name = 'Asset_Name is required';
    if (mode === 'create' && assetIdStatus.exists) e.asset_id = 'Asset_ID already exists';
    return e;
  };

  const handleChange = (key, value) => {
    setValues((p) => ({ ...p, [key]: value }));
    setErrors({});
    if (mode === 'create' && key === 'asset_id') {
      setAssetIdStatus({ checking: false, exists: false });
      lastCheckedIdRef.current = '';
    }
  };

  const checkAssetId = async (assetIdRaw) => {
    const assetId = (assetIdRaw || '').trim();
    if (mode !== 'create') return;
    if (!assetId) return;
    if (lastCheckedIdRef.current === assetId) return;

    setAssetIdStatus({ checking: true, exists: false });
    lastCheckedIdRef.current = assetId;

    try {
      await axios.get(`/api/assets/${encodeURIComponent(assetId)}`);
      // If found -> exists
      setAssetIdStatus({ checking: false, exists: true });
      setErrors((prev) => ({ ...prev, asset_id: 'Asset_ID already exists' }));
    } catch (error) {
      const code = error?.response?.status;
      if (code === 404) {
        setAssetIdStatus({ checking: false, exists: false });
        setErrors((prev) => {
          if (prev.asset_id === 'Asset_ID already exists') {
            const next = { ...prev };
            delete next.asset_id;
            return next;
          }
          return prev;
        });
      } else {
        // Keep it non-blocking but show a helpful message
        setAssetIdStatus({ checking: false, exists: false });
        setErrors((prev) => ({ ...prev, asset_id: 'Unable to validate Asset_ID (try again)' }));
      }
    }
  };

  // Lightweight debounce while typing asset_id (create only)
  useEffect(() => {
    if (mode !== 'create') return undefined;
    const t = setTimeout(() => {
      checkAssetId(values.asset_id);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.asset_id, mode]);

  return (
    <Card>
      <Box p={4}>
        <Stack spacing={2} mb={3}>
          <Typography variant="h6">{mode === 'edit' ? 'Edit Asset' : 'Create Asset'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Fill the asset details below.
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {FIELDS.map((f) => (
            <Grid key={f.key} xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                required={Boolean(f.required)}
                label={f.label}
                value={values[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                onBlur={() => {
                  if (f.key === 'asset_id') checkAssetId(values.asset_id);
                }}
                error={Boolean(errors[f.key])}
                helperText={
                  f.key === 'asset_id' && mode === 'create' && assetIdStatus.checking
                    ? 'Checking Asset_ID…'
                    : errors[f.key]
                }
                multiline={Boolean(f.multiline)}
                minRows={f.multiline ? 3 : undefined}
                type={f.type || 'text'}
                InputLabelProps={f.type === 'date' ? { shrink: true } : undefined}
                disabled={mode === 'edit' && f.key === 'asset_id'}
              />
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
          <Button variant="outlined" color="inherit" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              const e = validate();
              if (Object.keys(e).length) {
                setErrors(e);
                return;
              }
              onSubmit(values);
            }}
          >
            {effectiveSubmitLabel}
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}

AssetsForm.propTypes = {
  mode: PropTypes.oneOf(['create', 'edit']).isRequired,
  initialValues: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
};

