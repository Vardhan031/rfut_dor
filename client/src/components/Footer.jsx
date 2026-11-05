import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-[#2A2317] py-6 sm:py-7 px-4 sm:px-6 lg:px-8 bg-[#080705] text-xs font-sans text-[#A69D8B] relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="font-playfair font-bold text-sm text-[#F5F0E6]">
            r/FUT <span className="text-[#D4AF57]">d'Or</span>
          </span>
          <span className="text-[#3D3321] hidden xs:inline">&bull;</span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#A69D8B]">
            2026 Official Community Awards &bull; All Rights Reserved
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] uppercase font-mono tracking-widest text-[#706859]">
          <Link to="/" className="hover:text-[#E8C97B] transition-colors py-1">
            Voting Ballot
          </Link>
          <span className="text-[#3D3321]">&bull;</span>
          <Link to="/nominees" className="hover:text-[#E8C97B] transition-colors py-1">
            Nominees Roster
          </Link>
          <span className="text-[#3D3321]">&bull;</span>
          <Link to="/admin/login" className="hover:text-[#E8C97B] transition-colors py-1">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
