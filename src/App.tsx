import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import HomePage from '@/pages/HomePage';
import SearchPage from '@/pages/SearchPage';
import AdDetailPage from '@/pages/AdDetailPage';
import AdFormPage from '@/pages/AdFormPage';
import MyAdsPage from '@/pages/MyAdsPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import MessagesPage from '@/pages/MessagesPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminPage from '@/pages/AdminPage';
import NotFoundPage from '@/pages/NotFoundPage';
import FavoritesPage from '@/pages/FavoritesPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import ConfirmEmailChangePage from '@/pages/ConfirmEmailChangePage';
import LegalPage from '@/pages/LegalPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'ads', element: <SearchPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'confirm-email-change', element: <ConfirmEmailChangePage /> },
      { path: 'terms', element: <LegalPage kind="terms" /> },
      { path: 'privacy', element: <LegalPage kind="privacy" /> },
      {
        element: <ProtectedRoute />,
        children: [
          // Static segments win over :id, so /ads/new is not read as an ad id.
          { path: 'ads/new', element: <AdFormPage /> },
          { path: 'ads/:id/edit', element: <AdFormPage /> },
          { path: 'my-ads', element: <MyAdsPage /> },
          { path: 'favorites', element: <FavoritesPage /> },
          { path: 'messages', element: <MessagesPage /> },
          { path: 'messages/:id', element: <MessagesPage /> },
          { path: 'profile', element: <ProfilePage /> },
        ],
      },
      { path: 'ads/:id', element: <AdDetailPage /> },
      {
        element: <ProtectedRoute adminOnly />,
        children: [{ path: 'admin', element: <AdminPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
