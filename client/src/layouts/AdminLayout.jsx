import React from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Navbar } from '../components/Navbar';
import { LayoutDashboard, Users, Award, ShieldAlert, FileText } from 'lucide-react';

export const AdminLayout = () => {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-typography-secondary text-sm font-sans">
        Loading administration console...
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Voters & Codes', path: '/admin/voters', icon: Users },
    { label: 'Ballots', path: '/admin/ballots', icon: FileText },
    { label: 'Nominees', path: '/admin/nominees', icon: Award },
    { label: 'Private Results', path: '/admin/results', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-typography-primary">
      <Navbar />

      {/* Admin Subheader Navigation */}
      <div className="border-b border-surface-border bg-surface sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans uppercase tracking-wider whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-typography-primary border border-surface-border bg-background font-semibold text-gold'
                      : 'text-typography-secondary hover:text-typography-primary hover:bg-background/50 border border-transparent'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5 text-gold" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
