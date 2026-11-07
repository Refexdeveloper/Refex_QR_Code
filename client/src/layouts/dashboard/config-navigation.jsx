import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

export const SECTIONS = {
  assets: 'assets',
  qrCode: 'qr_code',
  campaign: 'campaign',
  administration: 'administration',
};

export const adminSidebarNav = [
  {
    title: 'Assets',
    path: '/assets/list',
    section: SECTIONS.assets,
    icon: icon('ic_blog'),
  },
  {
    title: 'QR Code',
    path: '/qr_code/fixed_url',
    section: SECTIONS.qrCode,
    icon: icon('ic_cart'),
  },
  {
    title: 'Winter Carnival',
    path: '/carnival/review',
    section: SECTIONS.campaign,
    icon: icon('ic_analytics'),
  },
  {
    title: 'Administration',
    path: '/users/list',
    section: SECTIONS.administration,
    icon: icon('ic_user'),
  },
];

export const sectionSubNav = {
  [SECTIONS.assets]: [
    { title: 'Assets List', path: '/assets/list' },
    { title: 'Assets API Access', path: '/assets/api-access' },
  ],
  [SECTIONS.qrCode]: [
    { title: 'Fixed URL', path: '/qr_code/fixed_url' },
    { title: 'Dynamic URL', path: '/qr_code/dynamic_url' },
    { title: 'Upload File', path: '/qr_code/upload_file' },
    { title: 'Smart Link', path: '/qr_code/smart_link' },
    { title: 'Design QR', path: '/qr_code/design_qr' },
  ],
  [SECTIONS.campaign]: [{ title: 'Entries and winners', path: '/carnival/review' }],
  [SECTIONS.administration]: [
    { title: 'User Management', path: '/users/list' },
    { title: 'SMTP Configuration', path: '/users/smtp-config' },
    { title: 'HRMS API Configuration', path: '/users/hrms-config' },
    { title: 'SSO Configuration', path: '/users/sso-config' },
  ],
};

export const getSectionFromPath = (pathname) => {
  if (pathname.startsWith('/carnival') || pathname.startsWith('/campaign')) return SECTIONS.campaign;
  if (pathname.startsWith('/assets')) return SECTIONS.assets;
  if (pathname.startsWith('/qr_code')) return SECTIONS.qrCode;
  if (pathname.startsWith('/users')) return SECTIONS.administration;
  return null;
};

export const getSubNavForPath = (pathname) => {
  const section = getSectionFromPath(pathname);
  return section ? sectionSubNav[section] || [] : [];
};
