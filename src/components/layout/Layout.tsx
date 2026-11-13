import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './Navbar';
import EmailVerificationBanner from './EmailVerificationBanner';
import Footer from './Footer';

export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <EmailVerificationBanner />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <Footer />
      <ScrollRestoration />
    </Box>
  );
}
