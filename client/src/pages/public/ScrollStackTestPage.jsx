import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrollStack, ScrollStackItem } from '../../components/ui/scroll-stack';
import {
  Trophy,
  Crown,
  ChevronDown,
  Check,
  X,
  Award,
  Sparkles,
  User,
  ShieldCheck
} from 'lucide-react';

// The 10 Official Selected Nominees available for the ballot
const NOMINEE_POOL = [
  {
    id: 'nom-1',
    name: 'Kylian Mbappe',
    discord: 'mbappe_official#0007',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-2',
    name: 'Erling Haaland',
    discord: 'haaland_cyborg#0009',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-3',
    name: 'Jude Bellingham',
    discord: 'belligoal#0005',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-4',
    name: 'Vinicius Jr',
    discord: 'vini_skillz#0007',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-5',
    name: 'Rodri Hernandez',
    discord: 'rodri_anchor#0016',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-6',
    name: 'Lamine Yamal',
    discord: 'yamal_wonder#0019',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-7',
    name: 'Harry Kane',
    discord: 'kane_clinical#0009',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-8',
    name: 'Phil Foden',
    discord: 'foden_craft#0047',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-9',
    name: 'Florian Wirtz',
    discord: 'wirtz_vision#0010',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nom-10',
    name: 'Dani Carvajal',
    discord: 'carvajal_warrior#0002',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80'
  }
];

// 10 Official Ballot Ranks in DESCENDING order (Rank 10 down to Rank 1 - Ballon d'Or Winner)
const DESCENDING_RANKS = [
  { rank: 10, points: 1, badge: 'ORDER OF MERIT #10', nomineeId: null },
  { rank: 9, points: 2, badge: 'ORDER OF MERIT #9', nomineeId: null },
  { rank: 8, points: 3, badge: 'ORDER OF MERIT #8', nomineeId: null },
  { rank: 7, points: 4, badge: 'ORDER OF MERIT #7', nomineeId: null },
  { rank: 6, points: 5, badge: 'ORDER OF MERIT #6', nomineeId: null },
  { rank: 5, points: 7, badge: 'ORDER OF MERIT #5', nomineeId: null },
  { rank: 4, points: 8, badge: 'ORDER OF MERIT #4', nomineeId: null },
  { rank: 3, points: 10, badge: 'BRONZE PODIUM', nomineeId: null },
  { rank: 2, points: 12, badge: 'SILVER PODIUM', nomineeId: null },
  { rank: 1, points: 15, badge: "BALLON D'OR WINNER", nomineeId: null }
];

export const ScrollStackTestPage = () => {
  // Initial empty slots in descending order (10 -> 1)
  const [rankedSlots, setRankedSlots] = useState(DESCENDING_RANKS);

  // Active open dropdown tracker
  const [openDropdownRank, setOpenDropdownRank] = useState(null);

  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (!e.target.closest('.nominee-dropdown-wrapper')) {
        setOpenDropdownRank(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpenDropdownRank(null);
      }
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectNominee = (rankNumber, selectedId) => {
    setRankedSlots((prev) =>
      prev.map((slot) => {
        if (slot.rank === rankNumber) {
          return { ...slot, nomineeId: selectedId || null };
        }
        // If nominee was assigned elsewhere, clear previous to prevent duplicate vote
        if (selectedId && slot.nomineeId === selectedId) {
          return { ...slot, nomineeId: null };
        }
        return slot;
      })
    );
    setOpenDropdownRank(null);
  };

  const handleClearSlot = (rankNumber) => {
    setRankedSlots((prev) =>
      prev.map((slot) => (slot.rank === rankNumber ? { ...slot, nomineeId: null } : slot))
    );
    setOpenDropdownRank(null);
  };

  const getAssignedRank = (nomineeId) => {
    const slot = rankedSlots.find((s) => s.nomineeId === nomineeId);
    return slot ? slot.rank : null;
  };

  const allAssigned = rankedSlots.every((s) => s.nomineeId);

  return (
    <div className="min-h-screen text-[#F5F0E6] bg-[#070604] relative pb-48 pt-6 sm:pt-10">
      {/* Gala Atmosphere Theatrical Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/14 via-[#D4AF57]/2 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#D4AF57]/8 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* THE 80vw x 80vh FLOATING SCROLL STACK (100% Solid Opaque, Descending 10 -> 1) */}
        <ScrollStack
          itemDistance={56}
          topOffset="10vh"
          stackOffset={0}
          scaleStep={0.015}
          className="w-full flex justify-center"
        >
          {rankedSlots.map((slot) => {
            const isWinner = slot.rank === 1;
            const isSilver = slot.rank === 2;
            const isBronze = slot.rank === 3;
            const isPodium = slot.rank <= 3;

            const assignedNominee = NOMINEE_POOL.find((n) => n.id === slot.nomineeId);
            const isDropdownOpen = openDropdownRank === slot.rank;

            return (
              <ScrollStackItem key={slot.rank}>
                <div
                  className={`w-[80vw] h-[80vh] rounded-3xl border transition-all duration-300 relative flex flex-col justify-between shadow-[0_25px_70px_rgba(0,0,0,0.95)] ${
                    isWinner
                      ? 'bg-[#0E0C08] border-[#D4AF57] shadow-[0_25px_80px_rgba(212,175,87,0.35)]'
                      : isSilver
                      ? 'bg-[#0D0D0D] border-[#CCCCCC] shadow-[0_25px_70px_rgba(200,200,200,0.22)]'
                      : isBronze
                      ? 'bg-[#0E0B08] border-[#CD7F32] shadow-[0_25px_70px_rgba(205,127,50,0.25)]'
                      : 'bg-[#0C0A07] border-[#3D3321] hover:border-[#554628]'
                  }`}
                  style={{
                    // 100% Solid opaque background — zero bleed-through
                    backgroundColor: isWinner
                      ? '#0E0C08'
                      : isSilver
                      ? '#0D0D0D'
                      : isBronze
                      ? '#0E0B08'
                      : '#0C0A07'
                  }}
                >
                  {/* Luxury Staggered Peeking Header Bar */}
                  <div
                    className={`px-8 sm:px-12 py-4 border-b flex items-center justify-between text-xs sm:text-sm font-mono uppercase tracking-widest ${
                      isWinner
                        ? 'bg-[#D4AF57]/20 border-[#D4AF57]/50 text-[#E8C97B]'
                        : isSilver
                        ? 'bg-[#CCCCCC]/15 border-[#CCCCCC]/40 text-[#EAEAEA]'
                        : isBronze
                        ? 'bg-[#CD7F32]/15 border-[#CD7F32]/40 text-[#E8A76A]'
                        : 'bg-[#14110C] border-[#2E2618] text-typography-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isWinner ? (
                        <Crown className="w-5 h-5 text-[#D4AF57]" />
                      ) : isPodium ? (
                        <MedalBadge rank={slot.rank} />
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-[#554628]" />
                      )}
                      <span className="font-semibold text-typography-primary tracking-widest">
                        {slot.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-typography-muted text-xs">CEREMONY WEIGHT:</span>
                      <span
                        className={`font-bold px-3 py-1 rounded-lg text-xs sm:text-sm font-mono ${
                          isWinner
                            ? 'bg-[#D4AF57] text-[#0A0907] shadow-md'
                            : isPodium
                            ? 'bg-[#E8C97B]/25 text-[#E8C97B] border border-[#D4AF57]/50'
                            : 'bg-[#1C1812] text-[#D4AF57] border border-[#3D3321]'
                        }`}
                      >
                        +{slot.points} PTS
                      </span>
                    </div>
                  </div>

                  {/* Main Card Body (Grand Two-Column Split in 80vh) */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 p-6 sm:p-10 lg:p-12 gap-6 sm:gap-10 items-center">
                    {/* LEFT HALF: Nominee Showcase (Pos, Photo, Name, Discord) */}
                    <div className="flex items-center gap-6 sm:gap-10">
                      {/* Big Position Numeral Box */}
                      <div
                        className={`w-20 h-20 sm:w-28 sm:h-28 rounded-3xl flex flex-col items-center justify-center font-display font-bold border flex-shrink-0 shadow-2xl ${
                          isWinner
                            ? 'bg-gradient-to-b from-[#D4AF57] to-[#8C6D27] text-[#0A0907] border-[#D4AF57] shadow-[0_6px_25px_rgba(212,175,87,0.5)]'
                            : isSilver
                            ? 'bg-gradient-to-b from-[#EAEAEA] to-[#888888] text-[#0A0907] border-[#CCCCCC]'
                            : isBronze
                            ? 'bg-gradient-to-b from-[#CD7F32] to-[#7A3F0E] text-[#0A0907] border-[#CD7F32]'
                            : 'bg-[#15120D] text-[#D4AF57] border-[#3D3321]'
                        }`}
                      >
                        <span className="text-[11px] sm:text-xs uppercase font-mono tracking-widest font-normal">
                          POS
                        </span>
                        <span className="text-4xl sm:text-6xl leading-none font-bold">
                          {slot.rank < 10 ? `0${slot.rank}` : slot.rank}
                        </span>
                      </div>

                      {/* Candidate Avatar (or Empty Silhouette) */}
                      <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-2 flex-shrink-0 shadow-2xl bg-[#070604]">
                        {assignedNominee ? (
                          <>
                            <img
                              src={assignedNominee.avatar}
                              alt={assignedNominee.name}
                              className="w-full h-full object-cover"
                            />
                            {isWinner && (
                              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-[#D4AF57] text-[#0A0907] shadow-lg">
                                <Trophy className="w-4 h-4" />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-typography-muted/30 border-2 border-dashed border-[#3D3321]">
                            <User className="w-12 h-12 text-[#554628]/40" />
                          </div>
                        )}
                      </div>

                      {/* Candidate Display Name and Discord Tag (Strictly NO descriptions/stats) */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {assignedNominee ? (
                          <>
                            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D4AF57] block">
                              Ranked Candidate
                            </span>
                            <h2 className="font-playfair text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wider text-typography-primary leading-tight truncate">
                              {assignedNominee.name}
                            </h2>
                            <p className="font-mono text-sm sm:text-lg text-[#E8C97B] truncate">
                              {assignedNominee.discord}
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-typography-muted block">
                              Rank #{slot.rank}
                            </span>
                            <h2 className="font-playfair text-xl sm:text-3xl font-bold uppercase tracking-wider text-typography-muted/60 italic">
                              Unassigned
                            </h2>
                            <p className="text-xs sm:text-sm font-sans text-typography-muted">
                              Choose a candidate on the right &rarr;
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* RIGHT HALF: Ultra-Premium Custom Luxury Dropdown */}
                    <div className="flex flex-col justify-center items-stretch lg:items-end relative">
                      <div className="w-full max-w-md space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-typography-secondary uppercase tracking-widest text-[11px]">
                            Select Nominee
                          </span>
                          {assignedNominee && (
                            <button
                              type="button"
                              onClick={() => handleClearSlot(slot.rank)}
                              className="text-xs text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer font-sans"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Clear</span>
                            </button>
                          )}
                        </div>

                        {/* Premium Custom Dropdown Trigger */}
                        <div className="relative nominee-dropdown-wrapper">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenDropdownRank(isDropdownOpen ? null : slot.rank)
                            }
                            className={`w-full py-4 px-5 rounded-2xl border-2 text-left font-sans transition-all duration-200 flex items-center justify-between cursor-pointer shadow-lg group ${
                              assignedNominee
                                ? 'bg-[#15120C] border-[#D4AF57] hover:border-[#E8C97B] hover:shadow-[0_0_30px_rgba(212,175,87,0.3)]'
                                : 'bg-[#12100C] border-[#3D3321] hover:border-[#D4AF57]/80 hover:shadow-[0_0_25px_rgba(212,175,87,0.2)]'
                            }`}
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              {assignedNominee ? (
                                <>
                                  <img
                                    src={assignedNominee.avatar}
                                    alt={assignedNominee.name}
                                    className="w-9 h-9 rounded-xl object-cover border border-[#D4AF57] flex-shrink-0"
                                  />
                                  <div className="truncate">
                                    <span className="block text-sm sm:text-base font-semibold text-typography-primary uppercase tracking-wide truncate">
                                      {assignedNominee.name}
                                    </span>
                                    <span className="block text-xs font-mono text-[#D4AF57] truncate">
                                      {assignedNominee.discord}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <span className="text-sm sm:text-base text-typography-muted group-hover:text-typography-secondary font-medium">
                                  -- Choose Nominee from Shortlist --
                                </span>
                              )}
                            </div>

                            <ChevronDown
                              className={`w-5 h-5 text-[#D4AF57] transition-transform duration-300 flex-shrink-0 ${
                                isDropdownOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Luxury Dropdown Popup Menu */}
                          {isDropdownOpen && (
                            <div
                              className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border-2 border-[#D4AF57] bg-[#100E0A] shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-72 overflow-y-auto divide-y divide-[#2A2317] p-1.5"
                              style={{ backgroundColor: '#100E0A' }}
                            >
                              {NOMINEE_POOL.map((nominee) => {
                                const assignedToRank = getAssignedRank(nominee.id);
                                const isCurrent = assignedToRank === slot.rank;

                                return (
                                  <button
                                    key={nominee.id}
                                    type="button"
                                    onClick={() => handleSelectNominee(slot.rank, nominee.id)}
                                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all duration-150 cursor-pointer ${
                                      isCurrent
                                        ? 'bg-[#D4AF57]/20 border border-[#D4AF57]/40 text-[#E8C97B]'
                                        : 'hover:bg-gradient-to-r hover:from-[#D4AF57]/20 hover:to-transparent text-typography-primary'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <img
                                        src={nominee.avatar}
                                        alt={nominee.name}
                                        className="w-10 h-10 rounded-xl object-cover border border-[#554628] flex-shrink-0"
                                      />
                                      <div className="truncate">
                                        <p className="text-sm font-semibold uppercase tracking-wide truncate">
                                          {nominee.name}
                                        </p>
                                        <p className="text-xs font-mono text-typography-secondary truncate">
                                          {nominee.discord}
                                        </p>
                                      </div>
                                    </div>

                                    {isCurrent ? (
                                      <span className="px-2 py-0.5 rounded bg-[#D4AF57] text-[#0A0907] text-[10px] font-mono font-bold flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        <span>SELECTED</span>
                                      </span>
                                    ) : assignedToRank ? (
                                      <span className="text-[10px] font-mono text-typography-muted px-2 py-0.5 rounded bg-[#181510] border border-[#2A2317]">
                                        Rank #{assignedToRank}
                                      </span>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {assignedNominee && (
                          <div className="flex items-center gap-2 pt-1 text-xs font-mono text-emerald-400">
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Locked into Rank #{slot.rank} (+{slot.points} Points)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Minimal Accent Line */}
                  <div
                    className={`h-1.5 w-full ${
                      isWinner
                        ? 'bg-gradient-to-r from-transparent via-[#D4AF57] to-transparent'
                        : isSilver
                        ? 'bg-gradient-to-r from-transparent via-[#CCCCCC] to-transparent'
                        : isBronze
                        ? 'bg-gradient-to-r from-transparent via-[#CD7F32] to-transparent'
                        : 'bg-transparent'
                    }`}
                  />
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>

        {/* Milestone Submission Card (When all 10 are chosen) */}
        {allAssigned && (
          <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-[#0E0C08] border-2 border-[#D4AF57] text-center w-[80vw] mx-auto space-y-4 shadow-[0_20px_70px_rgba(212,175,87,0.35)] animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF57]/15 border border-[#D4AF57] flex items-center justify-center text-[#D4AF57] shadow-xl">
              <Trophy className="w-8 h-8" />
            </div>

            <h3 className="font-playfair text-3xl sm:text-4xl font-bold uppercase tracking-wider text-typography-primary">
              All 10 Positions Sealed
            </h3>
            <p className="text-sm text-typography-secondary font-sans max-w-md mx-auto">
              Total 67 points allocated across all 10 positions in descending order.
            </p>

            <div className="pt-2">
              <Link
                to="/vote/select"
                className="inline-block px-8 py-3.5 rounded-2xl bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_25px_rgba(212,175,87,0.45)]"
              >
                Apply to Official Voting Flow
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MedalBadge = ({ rank }) => {
  return (
    <span
      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
        rank === 2 ? 'bg-[#CCCCCC] text-[#0A0907]' : 'bg-[#CD7F32] text-[#0A0907]'
      }`}
    >
      {rank}
    </span>
  );
};

export default ScrollStackTestPage;
