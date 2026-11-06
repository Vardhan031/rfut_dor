import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollStack, ScrollStackItem } from '../../components/ui/scroll-stack';
import {
  Trophy,
  Crown,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  X,
  RotateCcw,
  Wand2,
  UserCheck,
  Check,
  Award
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

// 10 Official Ballot Ranks with exact point allocations
const INITIAL_RANKS = [
  { rank: 1, points: 15, badge: "BALLON D'OR LAUREATE", nomineeId: null },
  { rank: 2, points: 12, badge: 'SILVER PODIUM', nomineeId: null },
  { rank: 3, points: 10, badge: 'BRONZE PODIUM', nomineeId: null },
  { rank: 4, points: 8, badge: 'ORDER OF MERIT #4', nomineeId: null },
  { rank: 5, points: 7, badge: 'ORDER OF MERIT #5', nomineeId: null },
  { rank: 6, points: 5, badge: 'ORDER OF MERIT #6', nomineeId: null },
  { rank: 7, points: 4, badge: 'ORDER OF MERIT #7', nomineeId: null },
  { rank: 8, points: 3, badge: 'ORDER OF MERIT #8', nomineeId: null },
  { rank: 9, points: 2, badge: 'ORDER OF MERIT #9', nomineeId: null },
  { rank: 10, points: 1, badge: 'ORDER OF MERIT #10', nomineeId: null }
];

export const ScrollStackTestPage = () => {
  // Slots start empty as requested
  const [rankedSlots, setRankedSlots] = useState(INITIAL_RANKS);

  // Assign nominee to a specific rank slot (auto-clears duplicate if already selected elsewhere)
  const handleSelectNominee = (rankNumber, selectedId) => {
    setRankedSlots((prev) =>
      prev.map((slot) => {
        // If this slot is the target slot
        if (slot.rank === rankNumber) {
          return { ...slot, nomineeId: selectedId || null };
        }
        // If nominee was assigned elsewhere, clear it so no duplicate candidate can exist
        if (selectedId && slot.nomineeId === selectedId) {
          return { ...slot, nomineeId: null };
        }
        return slot;
      })
    );
  };

  const handleClearSlot = (rankNumber) => {
    setRankedSlots((prev) =>
      prev.map((slot) => (slot.rank === rankNumber ? { ...slot, nomineeId: null } : slot))
    );
  };

  // Quick auto-populate for testing the full stacked deck
  const handleAutoPopulate = () => {
    setRankedSlots((prev) =>
      prev.map((slot, index) => ({
        ...slot,
        nomineeId: NOMINEE_POOL[index]?.id || null
      }))
    );
  };

  const handleResetAll = () => {
    setRankedSlots(INITIAL_RANKS);
  };

  // Metrics
  const filledCount = rankedSlots.filter((s) => s.nomineeId).length;
  const currentPoints = rankedSlots
    .filter((s) => s.nomineeId)
    .reduce((sum, s) => sum + s.points, 0);

  // Check if a nominee is assigned to any rank (returns rank number if assigned)
  const getAssignedRank = (nomineeId) => {
    const slot = rankedSlots.find((s) => s.nomineeId === nomineeId);
    return slot ? slot.rank : null;
  };

  return (
    <div className="min-h-screen text-[#F5F0E6] bg-[#0A0907] relative pb-40">
      {/* Gala Atmosphere Theatrical Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/16 via-[#D4AF57]/3 to-transparent blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#D4AF57]/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute top-3/4 -left-48 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#D4AF57]/8 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28">
        {/* Ceremony Gala Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF57]/10 border border-[#D4AF57]/30 text-[#E8C97B] text-xs font-mono tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,87,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF57] animate-pulse" />
            <span>r/FUT d'Or 2026 &bull; OFFICIAL ORDER OF MERIT</span>
          </div>

          <h1 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-wider text-typography-primary leading-tight">
            Order of Merit Selection
          </h1>

          <p className="text-sm font-sans text-typography-secondary max-w-xl mx-auto leading-relaxed">
            Assign your official Top 10 laureates. Each card stacks smoothly into a gilded ceremony deck as you scroll down.
          </p>

          {/* Quick Status Bar & Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-3 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14120E] border border-[#3D3321]">
              <span className="text-typography-muted">Progress:</span>
              <span className="text-[#E8C97B] font-bold">
                {filledCount} / 10 Assigned
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14120E] border border-[#3D3321]">
              <Trophy className="w-3.5 h-3.5 text-[#D4AF57]" />
              <span className="text-typography-muted">Allocated:</span>
              <span className="text-[#D4AF57] font-bold">
                {currentPoints} / 67 Points
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoPopulate}
                className="px-3.5 py-1.5 rounded-xl border border-[#D4AF57]/40 bg-[#D4AF57]/10 hover:bg-[#D4AF57]/20 text-[#E8C97B] text-xs font-mono transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Quickly fill sample nominees to test full stack"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#D4AF57]" />
                <span>Auto-Fill 10</span>
              </button>

              {filledCount > 0 && (
                <button
                  onClick={handleResetAll}
                  className="px-3 py-1.5 rounded-xl border border-[#3D3321] hover:border-rose-500/40 text-typography-muted hover:text-rose-400 text-xs font-mono transition flex items-center gap-1 cursor-pointer"
                  title="Clear all assignments"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Floating Indicator */}
        <div className="mb-8 flex items-center justify-between px-5 py-2.5 rounded-2xl bg-[#12100C]/80 border border-[#3D3321] text-xs font-sans text-typography-secondary max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF57] animate-ping" />
            <span>Cards span across the screen with floating margins and stack as you scroll down.</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[11px] text-[#D4AF57]">
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            <span>Scroll Deck</span>
          </div>
        </div>

        {/* THE FLOATING SCROLL STACK */}
        <ScrollStack
          itemDistance={42}
          topOffset={90}
          stackOffset={28}
          scaleStep={0.025}
          blurStep={1.5}
          fadeStep={0.1}
          className="w-full max-w-6xl mx-auto"
        >
          {rankedSlots.map((slot, index) => {
            const isWinner = slot.rank === 1;
            const isSilver = slot.rank === 2;
            const isBronze = slot.rank === 3;
            const isPodium = slot.rank <= 3;

            const assignedNominee = NOMINEE_POOL.find((n) => n.id === slot.nomineeId);

            return (
              <ScrollStackItem key={slot.rank}>
                <div
                  className={`relative w-full rounded-3xl border transition-all duration-300 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] ${
                    isWinner
                      ? 'bg-gradient-to-b from-[#1C170E]/95 via-[#14110A]/95 to-[#0B0A08]/98 border-[#D4AF57] shadow-[0_20px_60px_rgba(212,175,87,0.3)]'
                      : isSilver
                      ? 'bg-gradient-to-b from-[#181818]/95 via-[#121212]/95 to-[#0A0907]/98 border-[#B5B5B5] shadow-[0_18px_50px_rgba(180,180,180,0.2)]'
                      : isBronze
                      ? 'bg-gradient-to-b from-[#1B1510]/95 via-[#120E0A]/95 to-[#0A0907]/98 border-[#CD7F32] shadow-[0_18px_50px_rgba(205,127,50,0.22)]'
                      : 'bg-[#12100C]/95 border-[#3D3321] hover:border-[#D4AF57]/60'
                  }`}
                >
                  {/* Luxury Top Header Bar (Permanently peeks out when stacked) */}
                  <div
                    className={`px-6 sm:px-10 py-3.5 border-b flex items-center justify-between text-xs font-mono uppercase tracking-wider ${
                      isWinner
                        ? 'bg-[#D4AF57]/15 border-[#D4AF57]/40 text-[#E8C97B]'
                        : isSilver
                        ? 'bg-[#CCCCCC]/10 border-[#CCCCCC]/30 text-[#E0E0E0]'
                        : isBronze
                        ? 'bg-[#CD7F32]/10 border-[#CD7F32]/30 text-[#E8A76A]'
                        : 'bg-[#181510] border-[#2A2317] text-typography-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isWinner ? (
                        <Crown className="w-4 h-4 text-[#D4AF57]" />
                      ) : isPodium ? (
                        <MedalIcon rank={slot.rank} />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#554628]" />
                      )}
                      <span className="font-semibold text-typography-primary tracking-widest">
                        {slot.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-typography-muted">Point Weight:</span>
                      <span
                        className={`font-bold px-3 py-0.5 rounded text-xs ${
                          isWinner
                            ? 'bg-[#D4AF57] text-[#0A0907] shadow-sm'
                            : isPodium
                            ? 'bg-[#E8C97B]/20 text-[#E8C97B] border border-[#D4AF57]/40'
                            : 'bg-[#1E1B15] text-[#D4AF57] border border-[#3D3321]'
                        }`}
                      >
                        +{slot.points} PTS
                      </span>
                    </div>
                  </div>

                  {/* Card Main Body: Generous Two-Column Layout */}
                  <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center min-h-[160px] sm:min-h-[180px]">
                    {/* LEFT HALF (Cols 1-7): Candidate Display (Name, Discord, Photo, Pos) */}
                    <div className="lg:col-span-7 flex items-center gap-5 sm:gap-7">
                      {/* Big Position Box */}
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center font-display font-bold border flex-shrink-0 shadow-lg ${
                          isWinner
                            ? 'bg-gradient-to-b from-[#D4AF57] to-[#9E7D35] text-[#0A0907] border-[#D4AF57] shadow-[0_4px_16px_rgba(212,175,87,0.4)]'
                            : isSilver
                            ? 'bg-gradient-to-b from-[#E0E0E0] to-[#999999] text-[#0A0907] border-[#CCCCCC]'
                            : isBronze
                            ? 'bg-gradient-to-b from-[#CD7F32] to-[#8C4E17] text-[#0A0907] border-[#CD7F32]'
                            : 'bg-[#181510] text-[#D4AF57] border-[#3D3321]'
                        }`}
                      >
                        <span className="text-[10px] uppercase font-mono tracking-widest font-normal">POS</span>
                        <span className="text-3xl sm:text-4xl leading-none font-bold">
                          {slot.rank < 10 ? `0${slot.rank}` : slot.rank}
                        </span>
                      </div>

                      {/* Candidate Avatar or Empty Placeholder */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 shadow-xl bg-[#0A0907] transition-all">
                        {assignedNominee ? (
                          <>
                            <img
                              src={assignedNominee.avatar}
                              alt={assignedNominee.name}
                              className="w-full h-full object-cover"
                            />
                            {isWinner && (
                              <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-[#D4AF57] text-[#0A0907] shadow-md">
                                <Trophy className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-typography-muted/40 border-2 border-dashed border-[#3D3321]/60">
                            <Award className="w-8 h-8 text-[#554628]/40" />
                          </div>
                        )}
                      </div>

                      {/* Candidate Name & Discord (No stats or extra descriptions!) */}
                      <div className="flex-1 min-w-0">
                        {assignedNominee ? (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#D4AF57] block">
                              Assigned Candidate
                            </span>
                            <h3 className="font-playfair text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-typography-primary truncate leading-tight">
                              {assignedNominee.name}
                            </h3>
                            <p className="font-mono text-xs sm:text-sm text-[#D4AF57] truncate">
                              {assignedNominee.discord}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-typography-muted block">
                              Position #{slot.rank}
                            </span>
                            <h3 className="font-playfair text-xl sm:text-2xl font-bold uppercase tracking-wider text-typography-muted/70 italic">
                              Unassigned Position
                            </h3>
                            <p className="text-xs font-sans text-typography-muted">
                              Select a candidate from the dropdown &rarr;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT HALF (Cols 8-12): High-End Dropdown Selector */}
                    <div className="lg:col-span-5 flex flex-col justify-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#2A2317]">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <label
                          htmlFor={`select-slot-${slot.rank}`}
                          className="text-typography-secondary uppercase tracking-wider text-[11px]"
                        >
                          Select Nominee for Rank #{slot.rank}
                        </label>
                        {assignedNominee && (
                          <button
                            type="button"
                            onClick={() => handleClearSlot(slot.rank)}
                            className="text-[11px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>

                      {/* Luxury Select Element */}
                      <div className="relative">
                        <select
                          id={`select-slot-${slot.rank}`}
                          value={slot.nomineeId || ''}
                          onChange={(e) => handleSelectNominee(slot.rank, e.target.value)}
                          className={`w-full py-3.5 pl-4 pr-10 rounded-2xl bg-[#16130E] border text-sm sm:text-base font-sans transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF57]/40 shadow-inner ${
                            assignedNominee
                              ? 'border-[#D4AF57] text-typography-primary font-semibold'
                              : 'border-[#554628] text-typography-muted hover:border-[#D4AF57]/60'
                          }`}
                        >
                          <option value="" className="bg-[#14120E] text-typography-muted">
                            -- Choose from 10 Nominees --
                          </option>

                          {NOMINEE_POOL.map((nominee) => {
                            const assignedTo = getAssignedRank(nominee.id);
                            const isCurrentSlot = assignedTo === slot.rank;

                            return (
                              <option
                                key={nominee.id}
                                value={nominee.id}
                                className="bg-[#14120E] text-typography-primary py-2"
                              >
                                {nominee.name} ({nominee.discord})
                                {assignedTo && !isCurrentSlot ? ` — [Rank #${assignedTo}]` : ''}
                              </option>
                            );
                          })}
                        </select>

                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#D4AF57]">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>

                      {assignedNominee && (
                        <p className="text-[11px] text-emerald-400/90 font-mono flex items-center gap-1.5 pt-0.5">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Locked into Rank #{slot.rank} (+{slot.points} Points)</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            );
          })}
        </ScrollStack>

        {/* Milestone Submission Card (When all 10 are chosen) */}
        {filledCount === 10 ? (
          <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#1C170E] via-[#14120E] to-[#0A0907] border border-[#D4AF57] text-center max-w-2xl mx-auto space-y-5 shadow-[0_20px_60px_rgba(212,175,87,0.3)] animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF57]/15 border border-[#D4AF57] flex items-center justify-center text-[#D4AF57] shadow-xl">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#D4AF57] block">
                OFFICIAL CEREMONY VERIFICATION
              </span>
              <h3 className="font-playfair text-3xl sm:text-4xl font-bold uppercase tracking-wide text-typography-primary mt-1">
                Top 10 Ballot Complete
              </h3>
              <p className="text-sm text-typography-secondary font-sans mt-2 max-w-md mx-auto leading-relaxed">
                All 10 positions assigned with all 67 points distributed. Ready to cast your official sealed ballot.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link
                to="/vote/select"
                className="px-8 py-3.5 rounded-2xl bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(212,175,87,0.4)]"
              >
                Apply to Official Voting Flow
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-16 text-center text-xs font-mono text-typography-muted max-w-md mx-auto p-4 rounded-xl border border-[#2A2317] bg-[#12100C]/60">
            <span>Assign all 10 ranks to unlock official ballot submission. ({10 - filledCount} positions remaining)</span>
          </div>
        )}
      </div>
    </div>
  );
};

const MedalIcon = ({ rank }) => {
  return (
    <span
      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
        rank === 2 ? 'bg-[#CCCCCC] text-[#0A0907]' : 'bg-[#CD7F32] text-[#0A0907]'
      }`}
    >
      {rank}
    </span>
  );
};

export default ScrollStackTestPage;
