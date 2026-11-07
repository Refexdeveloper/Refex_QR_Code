/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import Router from 'src/routes/sections';
import ThemeProvider from 'src/theme';

import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './context/AuthContext';
// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  return (
    <ThemeProvider>
      <AuthProvider>
        <SnackbarProvider
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Router />
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
