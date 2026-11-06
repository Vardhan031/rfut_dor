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
  { rank: 10, points: 1, badge: 'RANK #10', nomineeId: null },
  { rank: 9, points: 2, badge: 'RANK #9', nomineeId: null },
  { rank: 8, points: 3, badge: 'RANK #8', nomineeId: null },
  { rank: 7, points: 4, badge: 'RANK #7', nomineeId: null },
  { rank: 6, points: 5, badge: 'RANK #6', nomineeId: null },
  { rank: 5, points: 7, badge: 'RANK #5', nomineeId: null },
  { rank: 4, points: 8, badge: 'RANK #4', nomineeId: null },
  { rank: 3, points: 10, badge: 'RANK #3 (BRONZE PODIUM)', nomineeId: null },
  { rank: 2, points: 12, badge: 'RANK #2 (SILVER PODIUM)', nomineeId: null },
  { rank: 1, points: 15, badge: "RANK #1 (BALLON D'OR WINNER)", nomineeId: null }
];

const getRankSuffix = (rank) => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};

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
    <div className="min-h-screen text-[#F5F0E6] bg-[#070604] relative pb-48 pt-8 sm:pt-12">
      {/* Gala Atmosphere Theatrical Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/14 via-[#D4AF57]/2 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#D4AF57]/8 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* THE 92vw FLOATING SCROLL STACK (100% Solid Opaque, Descending 10 -> 1) */}
        <ScrollStack
          itemDistance={56}
          topOffset="calc(5rem + 28px)"
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
                  className={`w-[92vw] max-w-[1550px] h-[78vh] min-h-[480px] rounded-3xl border transition-all duration-300 relative flex flex-col justify-between shadow-[0_25px_70px_rgba(0,0,0,0.95)] ${
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

                  {/* Main Card Body (Two-Column Split matching wireframe) */}
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#2E2618]/70 relative">
                    {/* LEFT HALF: Circular PFP + Overlapping Rank Rectangle Badge + Name + Discord */}
                    <div className="bg-[#120F0A]/90 p-6 sm:p-10 flex flex-col items-center justify-center text-center">
                      {/* Circular Container (Blank Minimalist Frame) with Overlapping Rank Badge */}
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full border-4 shadow-2xl transition-all duration-300 ${
                            isWinner
                              ? 'border-[#D4AF57] shadow-[0_0_45px_rgba(212,175,87,0.45)] bg-gradient-to-b from-[#241C0F] to-[#120E08]'
                              : isSilver
                              ? 'border-[#CCCCCC] shadow-[0_0_35px_rgba(204,204,204,0.3)] bg-gradient-to-b from-[#202020] to-[#101010]'
                              : isBronze
                              ? 'border-[#CD7F32] shadow-[0_0_35px_rgba(205,127,50,0.35)] bg-gradient-to-b from-[#24150A] to-[#120A05]'
                              : 'border-[#3D3321] hover:border-[#554628] bg-gradient-to-b from-[#18140E] to-[#0C0A07]'
                          }`}
                        />

                        {/* Overlapping Rank Rectangle Badge (Overlapping bottom center of pfp) */}
                        <div
                          className={`absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 px-6 sm:px-8 py-1.5 sm:py-2 rounded-2xl font-display font-black text-base sm:text-xl tracking-wide shadow-2xl flex items-center justify-center min-w-[76px] sm:min-w-[92px] z-10 ${
                            isWinner
                              ? 'bg-gradient-to-r from-[#FFE58F] via-[#D4AF57] to-[#B38C30] text-[#0A0907] border-2 border-[#FFF2B2] shadow-[0_6px_25px_rgba(212,175,87,0.6)]'
                              : isSilver
                              ? 'bg-gradient-to-r from-[#FFFFFF] via-[#CCCCCC] to-[#999999] text-[#0A0907] border-2 border-[#FFFFFF] shadow-[0_6px_20px_rgba(204,204,204,0.45)]'
                              : isBronze
                              ? 'bg-gradient-to-r from-[#F5B041] via-[#CD7F32] to-[#8C4614] text-[#0A0907] border-2 border-[#FAD7A0] shadow-[0_6px_20px_rgba(205,127,50,0.5)]'
                              : 'bg-gradient-to-b from-[#2A2317] to-[#18140D] border-2 border-[#D4AF57]/60 text-[#E8C97B] shadow-[0_4px_15px_rgba(0,0,0,0.6)]'
                          }`}
                        >
                          {getRankSuffix(slot.rank)}
                        </div>
                      </div>

                      {/* Username and Discord Username (Directly Under the PFP - Full Visibility, No Truncation) */}
                      <div className="mt-8 sm:mt-9 space-y-1 w-full max-w-xl px-4">
                        {assignedNominee ? (
                          <>
                            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-bold uppercase tracking-wide text-typography-primary leading-tight break-words">
                              {assignedNominee.name}
                            </h2>
                            <p className="font-mono text-sm sm:text-lg text-[#E8C97B] break-words">
                              {assignedNominee.discord}
                            </p>
                          </>
                        ) : (
                          <>
                            <h2 className="font-playfair text-xl sm:text-3xl font-bold uppercase tracking-wide text-typography-muted/50 italic">
                              Unassigned
                            </h2>
                            <p className="font-mono text-xs sm:text-sm text-typography-muted">
                              Select a nominee on the right &rarr;
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* RIGHT HALF: Direct 10-Nominee Luxury Selection Grid (Zero Internal Scroll, Zero Conflict) */}
                    <div className="bg-[#080705]/95 p-6 sm:p-8 lg:p-10 flex flex-col justify-center items-center">
                      <div className="w-full max-w-xl space-y-3.5">
                        {/* Header with Title and Clear Action */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#2A2317]">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#D4AF57]" />
                            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8C97B]">
                              Select Nominee for {getRankSuffix(slot.rank)}
                            </span>
                          </div>
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

                        {/* Direct 2-Column Grid of 10 Nominees (No Scrollbar Needed!) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {NOMINEE_POOL.map((nominee) => {
                            const assignedToRank = getAssignedRank(nominee.id);
                            const isCurrent = assignedToRank === slot.rank;

                            return (
                              <button
                                key={nominee.id}
                                type="button"
                                onClick={() => handleSelectNominee(slot.rank, nominee.id)}
                                className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer group ${
                                  isCurrent
                                    ? 'bg-gradient-to-r from-[#D4AF57]/30 via-[#D4AF57]/15 to-transparent border-[#D4AF57] shadow-[0_0_25px_rgba(212,175,87,0.3)] ring-1 ring-[#D4AF57]'
                                    : assignedToRank
                                    ? 'bg-[#12100C]/60 border-[#262015] hover:border-[#554628] opacity-75'
                                    : 'bg-[#12100C] border-[#3D3321] hover:border-[#D4AF57]/80 hover:bg-[#18140D] hover:shadow-[0_0_20px_rgba(212,175,87,0.15)]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                  {/* Blank Circular Placeholder */}
                                  <div
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 transition-all ${
                                      isCurrent
                                        ? 'bg-[#D4AF57] border-2 border-[#FFF0B3] shadow-[0_0_10px_rgba(212,175,87,0.5)]'
                                        : assignedToRank
                                        ? 'bg-[#2E2413] border border-[#E8C97B]/70'
                                        : 'bg-[#18140E] border border-[#443822] group-hover:border-[#D4AF57]'
                                    }`}
                                  />
                                  <div className="min-w-0">
                                    <span
                                      className={`block text-xs sm:text-sm font-bold uppercase tracking-wide truncate ${
                                        isCurrent
                                          ? 'text-[#F5F0E6]'
                                          : 'text-typography-primary group-hover:text-[#E8C97B]'
                                      }`}
                                    >
                                      {nominee.name}
                                    </span>
                                    <span className="block text-[10px] sm:text-xs font-mono text-typography-secondary truncate">
                                      {nominee.discord}
                                    </span>
                                  </div>
                                </div>

                                {/* Brighter, Prominent Rank Badge Beside Name */}
                                {isCurrent ? (
                                  <span className="ml-2 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#FFE58F] via-[#D4AF57] to-[#B38C30] text-[#0A0907] text-xs font-mono font-black flex items-center gap-1.5 flex-shrink-0 shadow-[0_0_15px_rgba(212,175,87,0.5)] border border-[#FFF5C0]">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{getRankSuffix(slot.rank)}</span>
                                  </span>
                                ) : assignedToRank ? (
                                  <span className="ml-2 px-2.5 py-0.5 rounded-lg bg-[#2D2313] border-2 border-[#D4AF57] text-[#FFE8A3] text-xs font-mono font-black flex items-center flex-shrink-0 shadow-[0_0_12px_rgba(212,175,87,0.4)]">
                                    {getRankSuffix(assignedToRank)}
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>

                        {assignedNominee && (
                          <div className="flex items-center justify-between pt-1 text-xs font-mono">
                            <div className="flex items-center gap-1.5 text-emerald-400">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Locked into {getRankSuffix(slot.rank)}: {assignedNominee.name}</span>
                            </div>
                            <span className="text-[#D4AF57] font-semibold">+{slot.points} Points</span>
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
          <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-[#0E0C08] border-2 border-[#D4AF57] text-center w-[92vw] max-w-[1550px] mx-auto space-y-4 shadow-[0_20px_70px_rgba(212,175,87,0.35)] animate-fadeIn">
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
