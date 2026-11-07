import PropTypes from 'prop-types';
import { lazy, Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import LogoutPage from 'src/pages/logout';
import { useAuth } from 'src/context/AuthContext';
import DashboardLayout from 'src/layouts/dashboard';
import { getDefaultRoute, hasRole, ADMIN_ROLES } from 'src/utils/roles';
import { hasPageAccess } from 'src/utils/pageAccess';

export const BrochureFormPage = lazy(() => import('src/pages/brochure-form'));
export const ContestFormPage = lazy(() => import('src/pages/contest-form'));
export const WinterSpinPage = lazy(() => import('src/pages/winter-spin'));
export const WinterCampaignPage = lazy(() => import('src/pages/winter-campaign'));
export const WinterCampaignReviewPage = lazy(() => import('src/pages/winter-campaign-review'));
export const BrochureDownloadForm = lazy(() => import('src/pages/brochure-download'));
export const QRCodeLinkPage = lazy(() => import('src/pages/qr-code-link'));
export const InstaLinkPage = lazy(() => import('src/pages/qr-insta'));
export const AssetsListPage = lazy(() => import('src/pages/assets-list'));
export const AssetsCreatePage = lazy(() => import('src/pages/assets-create'));
export const AssetsEditPage = lazy(() => import('src/pages/assets-edit'));
export const AssetsApiAccessPage = lazy(() => import('src/pages/assets-api-access'));
export const AssetPublicPage = lazy(() => import('src/pages/asset-public'));
export const QrFixedUrlPage = lazy(() => import('src/pages/qr-fixed-url'));
export const QrDynamicUrlPage = lazy(() => import('src/pages/qr-dynamic-url'));
export const QrUploadFilePage = lazy(() => import('src/pages/qr-upload-file'));
export const QrSmartLinkPage = lazy(() => import('src/pages/qr-smart-link'));
export const QrDesignPage = lazy(() => import('src/pages/qr-design'));
export const UsersListPage = lazy(() => import('src/pages/users-list'));
export const SmtpConfigPage = lazy(() => import('src/pages/smtp-config'));
export const HrmsConfigPage = lazy(() => import('src/pages/hrms-config'));
export const SsoConfigPage = lazy(() => import('src/pages/sso-config'));
export const SsoCallbackPage = lazy(() => import('src/pages/sso-callback'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const ForgotPasswordPage = lazy(() => import('src/pages/forgot-password'));
export const ResetPasswordPage = lazy(() => import('src/pages/reset-password'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

function PrivateRoute({ element, allowedRoles, allowedPage }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.length && !hasRole(user, ...allowedRoles)) {
    return <Navigate to={getDefaultRoute(user)} replace />;
  }

  if (allowedPage && !hasPageAccess(user, allowedPage)) {
    return <Navigate to={getDefaultRoute(user)} replace />;
  }

  return element;
}

PrivateRoute.propTypes = {
  element: PropTypes.element,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
  allowedPage: PropTypes.string,
};

function DashboardShell() {
  return (
    <PrivateRoute
      element={
        <DashboardLayout>
          <Suspense>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      }
    />
  );
}

// ----------------------------------------------------------------------

export default function Router() {
  const { isAuthenticated, user } = useAuth();

  const routes = useRoutes([
    {
      element: <DashboardShell />,
      children: [
        {
          element: (
            <PrivateRoute
              allowedRoles={ADMIN_ROLES}
              element={<Navigate to="/assets/list" replace />}
            />
          ),
          index: true,
        },
        {
          path: 'assets',
          element: <PrivateRoute allowedRoles={ADMIN_ROLES} element={<Outlet />} />,
          children: [
            { element: <Navigate to="/assets/list" />, index: true },
            { path: 'list', element: <AssetsListPage /> },
            { path: 'api-access', element: <AssetsApiAccessPage /> },
            { path: 'create', element: <AssetsCreatePage /> },
            { path: 'edit/:assetId', element: <AssetsEditPage /> },
          ],
        },
        {
          path: 'qr_code',
          children: [
            { element: <Navigate to="/qr_code/fixed_url" />, index: true },
            { path: 'fixed_url', element: <QrFixedUrlPage /> },
            { path: 'dynamic_url', element: <QrDynamicUrlPage /> },
            { path: 'upload_file', element: <QrUploadFilePage /> },
            { path: 'smart_link', element: <QrSmartLinkPage /> },
            { path: 'design_qr', element: <QrDesignPage /> },
          ],
        },
        {
          path: 'carnival',
          element: <PrivateRoute allowedPage="campaign" element={<Outlet />} />,
          children: [
            { element: <Navigate to="/carnival/review" />, index: true },
            { path: 'review', element: <WinterCampaignReviewPage /> },
          ],
        },
        { path: 'campaign', element: <Navigate to="/carnival/review" replace /> },
        { path: 'campaign/review', element: <Navigate to="/carnival/review" replace /> },
        {
          path: 'users',
          element: <PrivateRoute allowedRoles={ADMIN_ROLES} element={<Outlet />} />,
          children: [
            { element: <Navigate to="/users/list" />, index: true },
            { path: 'list', element: <UsersListPage /> },
            { path: 'smtp-config', element: <SmtpConfigPage /> },
            { path: 'hrms-config', element: <HrmsConfigPage /> },
            { path: 'sso-config', element: <SsoConfigPage /> },
          ],
        },
        {
          path: 'logout',
          element: <LogoutPage />,
        },
      ],
    },
    {
      path: 'login',
      element: isAuthenticated ? (
        <Navigate to={getDefaultRoute(user)} replace />
      ) : (
        <LoginPage />
      ),
    },
    {
      path: 'sso/callback',
      element: <SsoCallbackPage />,
    },
    {
      path: 'asset/:assetId',
      element: <AssetPublicPage />,
    },
    {
      path: 'airport',
      children: [
        { element: <Navigate to="/airport/fly_buy_summer" />, index: true },
        { path: 'fly_buy_summer', element: <ContestFormPage /> },
        { path: 'winter_carnival', element: <WinterCampaignPage /> },
        { path: 'winter_campaign', element: <Navigate to="/airport/winter_carnival" replace /> },
      ],
    },
    {
      path: 'winter-carnival',
      children: [
        { element: <WinterCampaignPage />, index: true },
        { path: 'spin', element: <WinterSpinPage /> },
      ],
    },
    {
      path: 'winter-campaign',
      element: <Navigate to="/winter-carnival" replace />,
    },
    {
      path: 'winter-spin',
      element: <Navigate to="/winter-carnival/spin" replace />,
    },
    {
      path: 'brochure_form',
      element: <BrochureFormPage />,
    },
    {
      path: 'brochure_download_form/:file',
      element: <BrochureDownloadForm />,
    },
    {
      path: 'qr_eveelz',
      element: <QRCodeLinkPage />,
    },
    {
      path: 'ratna_award_2024',
      element: <InstaLinkPage />,
    },
    {
      path: 'forgot_password',
      element: <ForgotPasswordPage />,
    },
    {
      path: 'reset_password/:token',
      element: <ResetPasswordPage />,
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
