import { Helmet } from 'react-helmet-async';

import { UsersList } from 'src/sections/users/view';

export default function UsersListPage() {
  return (
    <>
      <Helmet>
        <title>User Management | Refex</title>
      </Helmet>
      <UsersList />
    </>
  );
}
