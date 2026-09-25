import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { AdminsPage } from './pages/AdminsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { BookingsPage } from './pages/BookingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { FinancePage } from './pages/FinancePage';
import { LiveTripsPage } from './pages/LiveTripsPage';
import { LoginPage } from './pages/LoginPage';
import { PartnersPage } from './pages/PartnersPage';
import { PayoutsPage } from './pages/PayoutsPage';
import { SupportPage } from './pages/SupportPage';
import { UsersPage } from './pages/UsersPage';

export function App() {
  const { status, isSuperAdmin } = useAuth();

  if (status === 'loading') return <p className="center muted">Loading…</p>;
  if (status === 'signedOut') return <LoginPage />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/live-trips" element={<LiveTripsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/payouts" element={<PayoutsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/audit" element={<AuditLogsPage />} />
        {isSuperAdmin ? <Route path="/admins" element={<AdminsPage />} /> : null}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
