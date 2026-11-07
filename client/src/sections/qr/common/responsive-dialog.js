export const RESPONSIVE_DIALOG_PAPER_SX = {
  m: { xs: 0, sm: 2 },
  width: { xs: '100%', sm: '100%' },
  maxHeight: { xs: '100%', sm: 'calc(100% - 64px)' },
};

export const RESPONSIVE_DIALOG_ACTIONS_SX = {
  px: { xs: 2, sm: 3 },
  py: { xs: 1.5, sm: 2 },
  flexDirection: { xs: 'column-reverse', sm: 'row' },
  alignItems: 'stretch',
  gap: { xs: 1, sm: 0 },
  '& > :not(:first-of-type)': { ml: { xs: 0, sm: 1 } },
};

export const RESPONSIVE_DIALOG_CONTENT_SX = {
  px: { xs: 2, sm: 3 },
  py: { xs: 2, sm: 2.5 },
};

export const RESPONSIVE_FILTER_BAR_SX = {
  p: { xs: 1.5, sm: 2 },
  borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
};
