import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/partners', label: 'Travel partners' },
  { to: '/documents', label: 'Document review' },
  { to: '/bookings', label: 'Bookings' },
  { to: '/live-trips', label: 'Live trips' },
  { to: '/users', label: 'Users' },
  { to: '/finance', label: 'Payments & refunds' },
  { to: '/payouts', label: 'Payouts' },
  { to: '/support', label: 'Support' },
  { to: '/facilities', label: 'Facilities' },
  { to: '/audit', label: 'Audit log' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { signOut, isSuperAdmin } = useAuth();

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1 className="brand">YoCabs Admin</h1>
        <nav>
          {[...LINKS, ...(isSuperAdmin ? [{ to: '/admins', label: 'Administrators' }] : [])].map(
            (link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {link.label}
              </NavLink>
            ),
          )}
        </nav>
        <button type="button" className="link" onClick={() => void signOut()}>
          Sign out
        </button>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
