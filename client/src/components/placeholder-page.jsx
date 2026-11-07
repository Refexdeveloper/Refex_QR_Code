import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function PlaceholderPage({ title, description }) {
  return (
    <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {description}
        </Typography>
      </Card>
  );
}

PlaceholderPage.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
};
