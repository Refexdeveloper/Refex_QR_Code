import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';

import { DEFAULT_FORM_COPY } from './form-copy-defaults';

// ----------------------------------------------------------------------

function LineList({ label, helper, items, disabled, onChange }) {
  const update = (index, value) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  return (
    <Stack spacing={1.25}>
      <Box>
        <Typography variant="subtitle2">{label}</Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        ) : null}
      </Box>
      {items.map((item, index) => (
        <Stack key={`${label}-${index}`} direction="row" spacing={1} alignItems="flex-start">
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={item}
            disabled={disabled}
            onChange={(event) => update(index, event.target.value)}
          />
          <IconButton
            aria-label={`Remove ${label} ${index + 1}`}
            color="error"
            disabled={disabled || items.length <= 1}
            onClick={() => onChange(items.filter((_line, lineIndex) => lineIndex !== index))}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Stack>
      ))}
      <Box>
        <Button
          size="small"
          disabled={disabled}
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={() => onChange([...items, ''])}
        >
          Add paragraph
        </Button>
      </Box>
    </Stack>
  );
}

LineList.propTypes = {
  label: PropTypes.string.isRequired,
  helper: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

function Section({ title, children }) {
  return (
    <Card>
      <Stack spacing={2} sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Typography variant="h6">{title}</Typography>
        {children}
      </Stack>
    </Card>
  );
}

Section.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default function WinterCampaignFormDesign({ canManage }) {
  const [copy, setCopy] = useState(DEFAULT_FORM_COPY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let cancelled = false;
    axios
      .get('/api/winter-campaign/form-copy')
      .then((res) => {
        const saved = res.data?.results?.copy;
        if (!cancelled && saved) setCopy({ ...DEFAULT_FORM_COPY, ...saved });
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || 'Unable to load the form content.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setField = (key) => (event) => {
    setCopy((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const res = await axios.put('/api/winter-campaign/form-copy', copy);
      const saved = res.data?.results?.copy;
      if (saved) setCopy({ ...DEFAULT_FORM_COPY, ...saved });
      setNotice(res.data?.message || 'Form content saved.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save the form content.');
    } finally {
      setSaving(false);
    }
  };

  const disabled = !canManage || saving || loading;

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        This is the public form, from the heading down to the submit button. The input fields themselves stay as they are. The contest dates still come from the Prizes tab.
      </Typography>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {notice ? <Alert severity="success">{notice}</Alert> : null}
      {!canManage ? <Alert severity="info">Only an administrator can change the form.</Alert> : null}
      {loading ? <CircularProgress size={28} /> : null}

      <Section title="Header">
        <TextField label="Beside the logo" value={copy.eyebrow} disabled={disabled} onChange={setField('eyebrow')} />
        <TextField label="Title" value={copy.title} disabled={disabled} onChange={setField('title')} />
        <TextField label="Tagline" value={copy.tagline} disabled={disabled} onChange={setField('tagline')} />
        <TextField
          label="Organiser"
          value={copy.organiser}
          disabled={disabled}
          multiline
          minRows={3}
          onChange={setField('organiser')}
        />
        <TextField
          label="Introduction"
          value={copy.introduction}
          disabled={disabled}
          multiline
          minRows={3}
          onChange={setField('introduction')}
        />
      </Section>

      <Section title="How to participate">
        <TextField label="Heading" value={copy.howToTitle} disabled={disabled} onChange={setField('howToTitle')} />
        <LineList
          label="Steps"
          items={copy.howTo}
          disabled={disabled}
          onChange={(howTo) => setCopy((prev) => ({ ...prev, howTo }))}
        />
      </Section>

      <Section title="Prizes">
        <TextField label="Heading" value={copy.prizesTitle} disabled={disabled} onChange={setField('prizesTitle')} />
        <LineList
          label="Paragraphs"
          items={copy.prizes}
          disabled={disabled}
          onChange={(prizes) => setCopy((prev) => ({ ...prev, prizes }))}
        />
      </Section>

      <Section title="Terms and conditions">
        <TextField label="Heading" value={copy.termsTitle} disabled={disabled} onChange={setField('termsTitle')} />
        <LineList
          label="Clauses"
          helper="Keep the clause numbers in the text. Annexure II can stay as the last paragraph."
          items={copy.terms}
          disabled={disabled}
          onChange={(terms) => setCopy((prev) => ({ ...prev, terms }))}
        />
        <TextField
          label="Note under the terms"
          value={copy.termsNote}
          disabled={disabled}
          multiline
          minRows={2}
          onChange={setField('termsNote')}
        />
      </Section>

      <Section title="Form wording">
        <TextField label="Small label" value={copy.formKicker} disabled={disabled} onChange={setField('formKicker')} />
        <TextField label="Heading" value={copy.formTitle} disabled={disabled} onChange={setField('formTitle')} />
        <TextField label="Subtitle" value={copy.formSubtitle} disabled={disabled} onChange={setField('formSubtitle')} />
        <TextField
          label="Consent checkbox"
          value={copy.consent}
          disabled={disabled}
          multiline
          minRows={2}
          onChange={setField('consent')}
        />
        <TextField label="Invoice heading" value={copy.invoiceTitle} disabled={disabled} onChange={setField('invoiceTitle')} />
        <TextField
          label="Invoice note"
          value={copy.invoiceHint}
          disabled={disabled}
          multiline
          minRows={2}
          onChange={setField('invoiceHint')}
        />
        <TextField label="Invoice button" value={copy.invoiceButton} disabled={disabled} onChange={setField('invoiceButton')} />
        <TextField label="Boarding pass heading" value={copy.boardingTitle} disabled={disabled} onChange={setField('boardingTitle')} />
        <TextField
          label="Boarding pass note"
          value={copy.boardingHint}
          disabled={disabled}
          multiline
          minRows={2}
          onChange={setField('boardingHint')}
        />
        <TextField label="Boarding pass button" value={copy.boardingButton} disabled={disabled} onChange={setField('boardingButton')} />
        <TextField label="Replace file button" value={copy.boardingReplace} disabled={disabled} onChange={setField('boardingReplace')} />
        <TextField label="Security heading" value={copy.securityTitle} disabled={disabled} onChange={setField('securityTitle')} />
        <TextField label="Security note" value={copy.securityHint} disabled={disabled} onChange={setField('securityHint')} />
        <TextField label="Submit button" value={copy.submitLabel} disabled={disabled} onChange={setField('submitLabel')} />
      </Section>

      {canManage ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="contained" disabled={disabled} onClick={save}>
            {saving ? 'Saving…' : 'Save form'}
          </Button>
          <Button
            disabled={disabled}
            onClick={() => {
              setCopy(DEFAULT_FORM_COPY);
              setNotice('');
              setError('');
            }}
          >
            Load original text
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}

WinterCampaignFormDesign.propTypes = {
  canManage: PropTypes.bool,
};
