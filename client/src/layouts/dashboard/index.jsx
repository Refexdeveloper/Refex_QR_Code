import PropTypes from 'prop-types';

import { useAuth } from 'src/context/AuthContext';
import { isAdmin } from 'src/utils/roles';

import AdminLayout from './admin-layout';
import UserLayout from './user-layout';

// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const { user } = useAuth();

  if (isAdmin(user)) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <UserLayout>{children}</UserLayout>;
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};

export { default as AdminLayout } from './admin-layout';
export { default as UserLayout } from './user-layout';
