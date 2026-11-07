import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';

import { CORNER_LABELS, EYE_LABELS } from '../constants';

// ----------------------------------------------------------------------

function SliderField({ label, value, onChange, min = 0, max = 100, step = 1 }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          {value}
        </Typography>
      </Stack>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, val) => onChange(val)}
      />
    </Box>
  );
}

SliderField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  onChange: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
};

function ColorField({ label, value, onChange }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="body2" sx={{ minWidth: 72 }}>
        {label}
      </Typography>
      <Box
        component="input"
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ width: 36, height: 36, border: 'none', cursor: 'pointer', p: 0, borderRadius: 1 }}
      />
      <TextField
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{ flex: 1 }}
      />
    </Stack>
  );
}

ColorField.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

function CornerRadiusGroup({ title, corners, onChange }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        {title}
      </Typography>
      <Stack spacing={0.25}>
        {CORNER_LABELS.map((label, index) => (
          <SliderField
            key={`${title}-${label}`}
            label={label}
            value={corners[index]}
            min={0}
            max={50}
            onChange={(val) => {
              const next = [...corners];
              next[index] = val;
              onChange(next);
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

CornerRadiusGroup.propTypes = {
  title: PropTypes.string,
  corners: PropTypes.array,
  onChange: PropTypes.func,
};

function EyeRadiusColumn({ title, radius, onChange }) {
  return (
    <Box sx={{ p: 1.25, borderRadius: 1, bgcolor: 'background.neutral', height: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Stack spacing={2}>
        <CornerRadiusGroup
          title="Outer"
          corners={radius.outer}
          onChange={(outer) => onChange({ ...radius, outer })}
        />
        <CornerRadiusGroup
          title="Inner"
          corners={radius.inner}
          onChange={(inner) => onChange({ ...radius, inner })}
        />
      </Stack>
    </Box>
  );
}

EyeRadiusColumn.propTypes = {
  title: PropTypes.string,
  radius: PropTypes.object,
  onChange: PropTypes.func,
};

function EyeColorColumn({ title, color, onChange }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral', height: '100%' }}>
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Stack spacing={1.5}>
        <ColorField label="Outer" value={color.outer} onChange={(val) => onChange({ ...color, outer: val })} />
        <ColorField label="Inner" value={color.inner} onChange={(val) => onChange({ ...color, inner: val })} />
      </Stack>
    </Box>
  );
}

EyeColorColumn.propTypes = {
  title: PropTypes.string,
  color: PropTypes.object,
  onChange: PropTypes.func,
};

function ControlBlock({ children }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'background.neutral', height: '100%' }}>
      <Stack spacing={1.5}>{children}</Stack>
    </Box>
  );
}

ControlBlock.propTypes = {
  children: PropTypes.node,
};

export default function DesignQrControls({
  design,
  onChange,
  logoPreview,
  onLogoSelect,
  onLogoClear,
}) {
  const update = (key, value) => {
    onChange({ ...design, [key]: value });
  };

  const updateEyeRadius = (index, value) => {
    const next = design.eyeRadius.map((eye, i) => (i === index ? value : eye));
    update('eyeRadius', next);
  };

  const updateEyeColor = (index, value) => {
    const next = design.eyeColor.map((eye, i) => (i === index ? value : eye));
    update('eyeColor', next);
  };

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}
      >
        <ControlBlock>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="value"
            placeholder="https://refex.co.in"
            value={design.value}
            onChange={(e) => update('value', e.target.value)}
          />

          <FormControl fullWidth size="small">
            <InputLabel>ecLevel</InputLabel>
            <Select label="ecLevel" value={design.ecLevel} onChange={(e) => update('ecLevel', e.target.value)}>
              {['L', 'M', 'Q', 'H'].map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={design.enableCORS}
                onChange={(e) => update('enableCORS', e.target.checked)}
              />
            }
            label="enableCORS"
          />

          <SliderField
            label="size"
            value={design.size}
            min={100}
            max={500}
            onChange={(val) => update('size', val)}
          />

          <SliderField
            label="quietZone"
            value={design.quietZone}
            min={0}
            max={80}
            onChange={(val) => update('quietZone', val)}
          />

          <ColorField label="bgColor" value={design.bgColor} onChange={(val) => update('bgColor', val)} />
          <ColorField label="fgColor" value={design.fgColor} onChange={(val) => update('fgColor', val)} />

          <FormControl fullWidth size="small">
            <InputLabel>qrStyle</InputLabel>
            <Select label="qrStyle" value={design.qrStyle} onChange={(e) => update('qrStyle', e.target.value)}>
              <MenuItem value="squares">squares</MenuItem>
              <MenuItem value="dots">dots</MenuItem>
              <MenuItem value="fluid">fluid</MenuItem>
            </Select>
          </FormControl>
        </ControlBlock>

        <ControlBlock>
          <Stack spacing={1}>
            <Typography variant="body2">logoImage</Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Button variant="outlined" component="label" size="small" fullWidth={false} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                Choose file
                <input type="file" accept="image/*" hidden onChange={onLogoSelect} />
              </Button>
              {logoPreview && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={onLogoClear}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Remove
                </Button>
              )}
            </Stack>
            {logoPreview && (
              <Box
                component="img"
                src={logoPreview}
                alt="Logo preview"
                sx={{ maxWidth: 100, maxHeight: 100, objectFit: 'contain' }}
              />
            )}
          </Stack>

          <SliderField
            label="logoWidth"
            value={design.logoWidth}
            min={20}
            max={500}
            onChange={(val) => update('logoWidth', val)}
          />

          <SliderField
            label="logoHeight"
            value={design.logoHeight}
            min={20}
            max={500}
            onChange={(val) => update('logoHeight', val)}
          />

          <SliderField
            label="logoOpacity"
            value={design.logoOpacity}
            min={0}
            max={1}
            step={0.05}
            onChange={(val) => update('logoOpacity', val)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={design.removeQrCodeBehindLogo}
                onChange={(e) => update('removeQrCodeBehindLogo', e.target.checked)}
              />
            }
            label="removeQrCodeBehindLogo"
          />

          <SliderField
            label="logoPadding"
            value={design.logoPadding}
            min={0}
            max={50}
            onChange={(val) => update('logoPadding', val)}
          />

          <FormControl fullWidth size="small">
            <InputLabel>logoPaddingStyle</InputLabel>
            <Select
              label="logoPaddingStyle"
              value={design.logoPaddingStyle}
              onChange={(e) => update('logoPaddingStyle', e.target.value)}
            >
              <MenuItem value="square">square</MenuItem>
              <MenuItem value="circle">circle</MenuItem>
            </Select>
          </FormControl>

          <SliderField
            label="logoPaddingRadius"
            value={design.logoPaddingRadius || 0}
            min={0}
            max={80}
            onChange={(val) => update('logoPaddingRadius', val)}
          />
        </ControlBlock>
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          eyeRadius
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {EYE_LABELS.map((label, index) => (
            <EyeRadiusColumn
              key={label}
              title={label}
              radius={design.eyeRadius[index]}
              onChange={(value) => updateEyeRadius(index, value)}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
          eyeColor
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {EYE_LABELS.map((label, index) => (
            <EyeColorColumn
              key={`color-${label}`}
              title={label}
              color={design.eyeColor[index]}
              onChange={(value) => updateEyeColor(index, value)}
            />
          ))}
        </Box>
      </Box>
    </Stack>
  );
}

DesignQrControls.propTypes = {
  design: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  logoPreview: PropTypes.string,
  onLogoSelect: PropTypes.func,
  onLogoClear: PropTypes.func,
};
