import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock, Mail, Key, ArrowRight, AlertCircle } from 'lucide-react';

export const AdminLogin = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { loginAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg('Please enter your admin email and password.');
      return;
    }

    setErrorMsg('');
    const res = await loginAdmin(identifier, password);
    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-3.5 sm:px-6 py-12 relative z-10">
      {/* Fixed Ceremony Background Layer */}
      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-[position:85%_center] md:bg-right-center pointer-events-none z-0"
        style={{
          backgroundImage: `url('/assets/rfut_dor_bg.jpg')`,
        }}
      >
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#0A0907] via-[#0A0907]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0907]/30 via-transparent to-[#0A0907]/95" />
      </div>

      <div className="max-w-md w-full bg-[#110F0B]/95 border border-[#554628] rounded-2xl p-5 sm:p-8 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,87,0.1)]">
        <div className="text-center mb-7 space-y-1.5">
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#D4AF57] block">
            STEWARDSHIP ACCESS
          </span>
          <h2 className="font-playfair font-bold text-2xl sm:text-3xl text-[#F5F0E6] uppercase tracking-wide">
            Administration Portal
          </h2>
          <p className="text-xs text-[#A69D8B] font-sans">
            Ceremony stewards and voting governance controls.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#F5F0E6] mb-1.5">
              Admin Email / Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A69D8B]">
                <Mail className="w-4 h-4 text-[#D4AF57]" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="uhridfc@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0A0907] border border-[#4A3D24] rounded-xl text-sm text-[#F5F0E6] focus:outline-none focus:border-[#D4AF57] transition-colors placeholder:text-stone-600"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-[#F5F0E6] mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A69D8B]">
                <Key className="w-4 h-4 text-[#D4AF57]" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-9 pr-3 py-2.5 bg-[#0A0907] border border-[#4A3D24] rounded-xl text-sm text-[#F5F0E6] focus:outline-none focus:border-[#D4AF57] transition-colors placeholder:text-stone-600"
                autoComplete="current-password"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-sans font-semibold text-xs tracking-widest uppercase text-[#0A0907] bg-[#D4AF57] hover:bg-[#E8C97B] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(212,175,87,0.25)]"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Administration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
