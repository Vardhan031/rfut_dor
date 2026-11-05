import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, ArrowRight, Trophy } from 'lucide-react';

export const PublicNomineesPage = () => {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchNominees = async () => {
      try {
        setLoading(true);
        const res = await api.get('/nominees');
        if (res.data?.success) {
          setNominees(res.data.data);
        }
      } catch (err) {
        setFetchError('Unable to load candidate roster.');
      } finally {
        setLoading(false);
      }
    };

    fetchNominees();
  }, []);

  // Filter based on search query, maintaining exact roster order
  const filteredNominees = nominees.filter((n) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      n.displayName.toLowerCase().includes(term) ||
      n.discordUsername.toLowerCase().includes(term) ||
      (n.description && n.description.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0907] text-[#F5F0E6] relative overflow-x-hidden">
      {/* ============================================================== */}
      {/* 1. FIXED CEREMONY BACKGROUND LAYER (MATCHING HOME PAGE BG)     */}
      {/* ============================================================== */}
      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-[position:85%_center] md:bg-right-center pointer-events-none z-0"
        style={{
          backgroundImage: `url('/assets/rfut_dor_bg.jpg')`,
        }}
      >
        {/* Soft vignette to guarantee crisp legibility over cards */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#0A0907] via-[#0A0907]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0907]/30 via-transparent to-[#0A0907]/90" />
      </div>

      {/* ============================================================== */}
      {/* 2. HERO SECTION WITH EXACT TYPOGRAPHY & SEARCH BAR             */}
      {/* ============================================================== */}
      <section className="relative pt-20 sm:pt-28 pb-6 sm:pb-8 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full z-10">
        {/* Hero Left Content */}
        <div className="max-w-2xl space-y-3">
          <h1 className="font-playfair text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight uppercase leading-none">
            <span className="text-[#F5F0E6]">THE </span>
            <span className="text-[#D8B264] drop-shadow-[0_2px_18px_rgba(216,178,100,0.35)]">
              NOMINEES.
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs font-sans tracking-[0.2em] sm:tracking-[0.25em] text-[#A69D8B] uppercase font-medium pt-1">
            <span>2026 OFFICIAL SELECTION</span>
            <span className="text-[#554628]">|</span>
            <span className="text-[#E8C97B] font-semibold">
              {loading ? '...' : `${filteredNominees.length} NOMINEES`}
            </span>
          </div>
        </div>

        {/* Search Bar (Spanning across below hero text) */}
        <div className="mt-6 sm:mt-10 max-w-5xl">
          <div className="relative flex items-center rounded-xl border border-[#4A3D24] bg-[#12100C]/90 focus-within:border-[#D4AF57] focus-within:ring-1 focus-within:ring-[#D4AF57]/40 transition-all px-3.5 sm:px-4 py-3 sm:py-3.5 shadow-inner backdrop-blur-md">
            <Search className="w-4 h-4 text-[#D4AF57] flex-shrink-0 mr-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nominees..."
              className="w-full bg-transparent text-base sm:text-sm font-sans text-[#F5F0E6] placeholder-[#706859] outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs font-sans text-[#A69D8B] hover:text-[#F5F0E6] uppercase tracking-wider ml-2 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. NOMINEE CARDS GRID (PURE LUXURY CARDS - NO VIEW PROFILE)    */}
      {/* ============================================================== */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 pb-20 flex-1">
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center space-y-3 font-sans text-xs uppercase tracking-widest text-[#A69D8B]">
            <div className="w-8 h-8 border-2 border-[#D4AF57] border-t-transparent rounded-full animate-spin" />
            <span>Loading 2026 Nominees...</span>
          </div>
        ) : fetchError ? (
          <div className="p-8 rounded-xl bg-[#14120E] border border-rose-900/40 text-rose-300 text-center font-sans text-xs max-w-md mx-auto">
            {fetchError}
          </div>
        ) : filteredNominees.length === 0 ? (
          <div className="py-24 text-center text-[#706859] bg-[#12100C] rounded-xl border border-[#3D3321] font-sans text-sm">
            No candidates found matching "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredNominees.map((nominee, idx) => {
              const formattedNumber = String(idx + 1).padStart(2, '0');
              const cleanDiscordHandle = nominee.discordUsername
                ? `@${nominee.discordUsername.toLowerCase().replace(/#\d+$/, '')}`
                : `@${nominee.displayName.toLowerCase()}`;

              return (
                <div
                  key={nominee._id}
                  className="group relative p-5 sm:p-7 rounded-2xl border border-[#4A3D24] bg-[#110F0B]/95 hover:border-[#D4AF57] hover:shadow-[0_12px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(212,175,87,0.15)] transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[220px] sm:min-h-[240px] select-none backdrop-blur-sm"
                >
                  {/* Subtle Geometric Ballon d'Or Watermark Contour in Card Background */}
                  <svg
                    className="absolute right-0 bottom-0 w-44 h-44 pointer-events-none opacity-20 select-none overflow-hidden transition-opacity group-hover:opacity-35"
                    viewBox="0 0 180 180"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="140" cy="140" r="110" stroke="#D4AF57" strokeWidth="1" strokeDasharray="3 3" />
                    <circle cx="140" cy="140" r="80" stroke="#D4AF57" strokeWidth="1.2" />
                    <circle cx="140" cy="140" r="50" stroke="#D4AF57" strokeWidth="0.8" />
                    <polygon
                      points="110,120 140,105 170,120 170,150 140,165 110,150"
                      stroke="#D4AF57"
                      strokeWidth="1"
                      fill="none"
                    />
                    <line x1="140" y1="105" x2="140" y2="70" stroke="#D4AF57" strokeWidth="0.8" />
                    <line x1="110" y1="120" x2="85" y2="105" stroke="#D4AF57" strokeWidth="0.8" />
                    <line x1="170" y1="120" x2="195" y2="105" stroke="#D4AF57" strokeWidth="0.8" />
                  </svg>

                  {/* Card Content */}
                  <div className="relative z-10">
                    {/* Top Row: r/FUT d'Or (left) and 2026 (right) */}
                    <div className="flex items-center justify-between text-xs tracking-wider">
                      <span className="font-playfair font-bold text-[#C5A253]">r/FUT d'Or</span>
                      <span className="font-sans font-medium text-[11px] text-[#A69D8B]">2026</span>
                    </div>

                    {/* Nominee Number Row with Gold Underline */}
                    <div className="mt-4">
                      <span className="inline-block text-[11px] font-sans font-semibold tracking-[0.2em] text-[#E8C97B] pb-1 border-b border-[#A68A48]">
                        NOMINEE NO. {formattedNumber}
                      </span>
                    </div>

                    {/* Main Name & Discord Handle */}
                    <div className="mt-6 mb-2">
                      <h3 className="font-playfair font-bold text-3xl sm:text-4xl text-[#F5F0E6] tracking-tight truncate leading-tight group-hover:text-[#FFF4D0] transition-colors">
                        {nominee.displayName}
                      </h3>
                      <p className="text-sm font-sans text-[#A69D8B] mt-1.5 font-normal truncate">
                        {cleanDiscordHandle}
                      </p>
                    </div>
                  </div>

                  {/* Clean Plaque Base Accent */}
                  <div className="relative z-10 pt-2 flex items-center justify-between border-t border-[#3D3321]/60 mt-4 text-[10px] font-mono text-[#706859] uppercase tracking-wider">
                    <span>OFFICIAL SHORTLIST</span>
                    <span className="text-[#D4AF57] font-semibold">2026</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Discreet Cast Ballot Action Strip */}
        <div className="mt-16 pt-8 border-t border-[#2A2317] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#A69D8B]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF57] animate-pulse" />
            <span className="tracking-wider uppercase">
              Official 2026 Candidate Roster &bull; Single-Use Passcode Required to Vote
            </span>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-semibold text-xs uppercase tracking-widest transition-colors cursor-pointer"
          >
            <span>Proceed to Voting</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PublicNomineesPage;
