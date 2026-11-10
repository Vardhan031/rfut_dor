import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useVoterAuth } from '../context/VoterAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Lock, LogOut, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { voter, logoutVoter } = useVoterAuth();
  const { admin, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // Track scroll position to trigger glassmorphism
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set correct initial value
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'VOTING', path: '/' },
    { label: 'NOMINEES', path: '/nominees' },
  ];

  // ── Navbar class logic ──────────────────────────────────────────────────────
  // Admin routes: always solid dark background
  // Public routes:
  //   • At top (not scrolled): transparent, no border
  //   • Scrolled: glassmorphism — blurred dark panel + gold bottom border
  const headerClass = isAdminRoute
    ? 'bg-[#0A0907]/95 backdrop-blur-md border-b border-[#2A2317]'
    : scrolled
    ? [
        'bg-[#0A0907]/70',
        'backdrop-blur-xl',
        'border-b border-[#D4AF57]/20',
        'shadow-[0_4px_30px_rgba(0,0,0,0.6),0_1px_0_rgba(212,175,87,0.08)_inset]',
        'supports-[backdrop-filter]:bg-[#0A0907]/55',
      ].join(' ')
    : 'bg-transparent border-b border-transparent';

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ease-in-out ${headerClass}`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3.5 group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-[#0A0907]/80 border border-[#554628] p-0.5 shadow-[0_2px_14px_rgba(212,175,87,0.35)] group-hover:border-[#D4AF57] transition-all">
            <img
              src="/assets/rfut_dor_trophy_logo.jpg"
              alt="r/FUT d'Or Trophy Emblem"
              className="w-full h-full object-cover rounded-md"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-playfair font-bold text-lg sm:text-2xl tracking-wide text-typography-primary leading-tight">
                r/FUT <span className="text-[#D4AF57]">d'Or</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-sans font-semibold tracking-widest px-1.5 py-0.5 rounded border border-[#524326] text-[#E8C97B] bg-[#1A160F]">
                2026
              </span>
            </div>
            <p className="text-[8px] sm:text-[10px] font-sans text-typography-secondary tracking-[0.2em] uppercase">
              THE COMMUNITY AWARDS
            </p>
          </div>
        </Link>

        {/* Center: Main Navigation */}
        {!isAdminRoute && (
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/' || location.pathname.startsWith('/vote')
                  : location.pathname === link.path;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className="relative py-2 text-xs font-sans font-medium uppercase tracking-[0.2em] transition-colors flex items-center gap-1.5"
                >
                  <span
                    className={
                      isActive
                        ? 'text-[#E8C97B] font-semibold'
                        : 'text-typography-secondary hover:text-typography-primary'
                    }
                  >
                    {link.label}
                  </span>
                  {link.isNew && (
                    <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF57]/20 border border-[#D4AF57]/50 text-[#E8C97B] leading-none animate-pulse">
                      TEST
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF57] shadow-[0_0_8px_rgba(212,175,87,0.5)]" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-5">
          {voter && !isAdminRoute && (
            <div className="flex items-center gap-3 pr-2 border-r border-[#3D3321]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-typography-primary font-mono">{voter.discordUsername}</span>
                <span className="text-[10px] uppercase font-mono text-[#D4AF57]">
                  {voter.category === 'Journo' ? 'Journalist' : voter.category}
                </span>
              </div>
              <button
                onClick={() => {
                  logoutVoter();
                  navigate('/');
                }}
                title="Disconnect voting session"
                className="text-xs font-sans text-typography-secondary hover:text-typography-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          )}

          {isAdminRoute ? (
            admin ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#D4AF57]">{admin.email || admin.username}</span>
                <button
                  onClick={() => {
                    logoutAdmin();
                    navigate('/admin/login');
                  }}
                  className="text-xs font-sans text-typography-secondary hover:text-typography-primary flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : null
          ) : (
            <Link
              to="/admin/login"
              className="text-xs font-sans text-typography-secondary hover:text-[#E8C97B] transition-colors flex items-center gap-1.5 py-1"
            >
              <Lock className="w-3.5 h-3.5 text-[#D4AF57]" />
              <span>Admin</span>
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center gap-2">
          {isAdminRoute && admin && (
            <button
              onClick={() => {
                logoutAdmin();
                navigate('/admin/login');
              }}
              className="p-1.5 text-xs font-mono text-[#D4AF57] flex items-center gap-1 border border-[#3D3321] rounded bg-[#16130E]"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          )}

          {!isAdminRoute && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-[#3D3321] bg-[#12100C]/80 text-[#D4AF57] hover:border-[#D4AF57] transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && !isAdminRoute && (
        <div className="md:hidden bg-[#100E0A]/95 border-b border-[#3D3321] px-4 py-4 space-y-3 font-sans backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/' || location.pathname.startsWith('/vote')
                  : location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-xs uppercase tracking-widest py-3 px-3.5 rounded-xl transition-all flex items-center justify-between ${
                    isActive
                      ? 'text-[#0A0907] bg-[#D4AF57] font-bold shadow-md'
                      : 'text-typography-secondary hover:text-typography-primary hover:bg-[#181510]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{link.label}</span>
                    {link.isNew && (
                      <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-[#D4AF57]/20 border border-[#D4AF57]/40 text-[#E8C97B]">
                        PROTOTYPE
                      </span>
                    )}
                  </div>
                  {isActive && <span className="text-[10px] font-mono">&bull; ACTIVE</span>}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#3D3321] flex flex-col gap-2.5 text-xs">
            {voter ? (
              <div className="p-3 rounded-xl bg-[#16130E] border border-[#3D3321] flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-[#F5F0E6] block">{voter.discordUsername}</span>
                  <span className="text-[10px] font-mono text-[#D4AF57] uppercase tracking-wider">
                    {voter.category === 'Journo' ? 'Journalist' : voter.category}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logoutVoter();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-900/40 text-rose-300 hover:bg-rose-950/30 flex items-center gap-1.5 text-xs font-sans transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Session</span>
                </button>
              </div>
            ) : (
              <Link
                to="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-typography-secondary hover:text-[#E8C97B] hover:bg-[#181510] flex items-center gap-2 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4AF57]" />
                <span className="uppercase tracking-wider text-xs">Admin Portal</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
