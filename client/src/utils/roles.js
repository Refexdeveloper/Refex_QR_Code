export const ROLES = {
  SuperAdmin: 'SuperAdmin',
  Admin: 'Admin',
  User: 'User',
  Campaign: 'Campaign',
};

export const ADMIN_ROLES = [ROLES.Admin, ROLES.SuperAdmin];

export const isAdmin = (user) => ADMIN_ROLES.includes(user?.role);

export const isUser = (user) => user?.role === ROLES.User;

export const hasRole = (user, ...roles) => roles.includes(user?.role);

export const getDefaultRoute = (user) => (isAdmin(user) ? '/assets/list' : '/qr_code/fixed_url');
