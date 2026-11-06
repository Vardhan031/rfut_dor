import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useVoterAuth } from '../../context/VoterAuthContext';
import { ScrollStack, ScrollStackItem } from '../../components/ui/scroll-stack';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableNomineeItem } from '../../components/SortableNomineeItem';
import {
  Trophy,
  Crown,
  Check,
  X,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

// 10 Official Ballot Ranks in DESCENDING order (Rank 10 → Rank 1 Ballon d'Or Winner)
const DESCENDING_RANKS = [
  { rank: 10, points: 1,  badge: 'RANK #10',                   nomineeId: null },
  { rank: 9,  points: 2,  badge: 'RANK #9',                    nomineeId: null },
  { rank: 8,  points: 3,  badge: 'RANK #8',                    nomineeId: null },
  { rank: 7,  points: 4,  badge: 'RANK #7',                    nomineeId: null },
  { rank: 6,  points: 5,  badge: 'RANK #6',                    nomineeId: null },
  { rank: 5,  points: 7,  badge: 'RANK #5',                    nomineeId: null },
  { rank: 4,  points: 8,  badge: 'RANK #4',                    nomineeId: null },
  { rank: 3,  points: 10, badge: 'RANK #3 (BRONZE PODIUM)',    nomineeId: null },
  { rank: 2,  points: 12, badge: 'RANK #2 (SILVER PODIUM)',    nomineeId: null },
  { rank: 1,  points: 15, badge: "RANK #1 (BALLON D'OR WINNER)", nomineeId: null },
];

const getRankSuffix = (rank) => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return `${rank}th`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook: detect if window is >= 1024px (desktop / lg breakpoint)
// ─────────────────────────────────────────────────────────────────────────────
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    setIsDesktop(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return isDesktop;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const MedalBadge = ({ rank }) => (
  <span
    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
      rank === 2 ? 'bg-[#CCCCCC] text-[#0A0907]' : 'bg-[#CD7F32] text-[#0A0907]'
    }`}
  >
    {rank}
  </span>
);

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP VIEW — Scroll Stack (lg and above)
// ─────────────────────────────────────────────────────────────────────────────

const DesktopScrollStackView = ({ selectedNominees, rankings, setRankings }) => {
  const navigate = useNavigate();

  const [rankedSlots, setRankedSlots] = useState(() => {
    if (rankings && rankings.length === 10) {
      return DESCENDING_RANKS.map((slot) => {
        const matchingNominee = rankings[slot.rank - 1];
        return { ...slot, nomineeId: matchingNominee?._id || null };
      });
    }
    return DESCENDING_RANKS;
  });

  const handleSelectNominee = (rankNumber, selectedId) => {
    setRankedSlots((prev) =>
      prev.map((slot) => {
        if (slot.rank === rankNumber) return { ...slot, nomineeId: selectedId || null };
        if (selectedId && slot.nomineeId === selectedId) return { ...slot, nomineeId: null };
        return slot;
      })
    );
  };

  const handleClearSlot = (rankNumber) => {
    setRankedSlots((prev) =>
      prev.map((slot) => (slot.rank === rankNumber ? { ...slot, nomineeId: null } : slot))
    );
  };

  const handleAutoFill = () => {
    setRankedSlots(
      DESCENDING_RANKS.map((slot) => ({
        ...slot,
        nomineeId: selectedNominees[10 - slot.rank]?._id || null,
      }))
    );
    toast.success('Ranks auto-populated from selection order.');
  };

  const handleResetSlots = () => {
    setRankedSlots(DESCENDING_RANKS);
    toast.info('All rank slots cleared.');
  };

  const getAssignedRank = (nomineeId) => {
    const slot = rankedSlots.find((s) => s.nomineeId === nomineeId);
    return slot ? slot.rank : null;
  };

  const assignedCount = rankedSlots.filter((s) => s.nomineeId).length;
  const allAssigned = assignedCount === 10;

  const handleProceedToConfirm = () => {
    if (!allAssigned) {
      toast.warning('Please assign all 10 ranks before proceeding.');
      return;
    }
    const finalRanked = [];
    for (let r = 1; r <= 10; r++) {
      const slot = rankedSlots.find((s) => s.rank === r);
      const nominee = selectedNominees.find((n) => n._id === slot.nomineeId);
      if (nominee) finalRanked.push(nominee);
    }
    if (finalRanked.length !== 10) {
      toast.error('Incomplete ranking list. Please assign all 10 ranks.');
      return;
    }
    setRankings(finalRanked);
    navigate('/vote/confirm');
  };

  return (
    <div className="min-h-screen text-[#F5F0E6] bg-[#070604] relative pb-48 pt-24 sm:pt-28">
      {/* Gala Atmosphere Theatrical Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/14 via-[#D4AF57]/2 to-transparent blur-3xl" />
        <div className="absolute bottom-1/4 -right-40 w-[600px] h-[600px] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-[#D4AF57]/8 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Stage Header Info Bar */}
        <div className="w-[92vw] max-w-[1550px] mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2E2618]">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#D4AF57] block">
              STAGE 2 OF 3 &bull; ORDER OF MERIT
            </span>
            <h1 className="font-playfair text-2xl sm:text-4xl font-bold uppercase tracking-wide text-typography-primary">
              Rank Your Top 10 Nominees
            </h1>
            <p className="text-xs sm:text-sm text-typography-secondary font-sans">
              Assign each candidate from Rank 10 (+1 pt) down to Rank 01 Ballon d'Or Winner (+15 pts).
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#141009] border border-[#3D3321] text-xs font-mono">
              <span className="text-typography-muted">SEALED: </span>
              <span className={`font-bold ${allAssigned ? 'text-emerald-400' : 'text-[#D4AF57]'}`}>
                {assignedCount} / 10
              </span>
            </div>

            {assignedCount > 0 && (
              <button
                type="button"
                onClick={handleResetSlots}
                className="px-3 py-1.5 rounded-xl border border-[#3D3321] hover:border-rose-500/50 text-[11px] font-mono text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <Link
              to="/vote/select"
              className="px-3 py-1.5 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] text-[11px] font-mono text-typography-secondary hover:text-typography-primary transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Change 10 Candidates</span>
            </Link>
          </div>
        </div>

        {/* THE 92vw FLOATING SCROLL STACK (Descending Rank 10 → 1) */}
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

            const assignedNominee = selectedNominees.find((n) => n._id === slot.nomineeId);

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
                    backgroundColor: isWinner
                      ? '#0E0C08'
                      : isSilver
                      ? '#0D0D0D'
                      : isBronze
                      ? '#0E0B08'
                      : '#0C0A07',
                  }}
                >
                  {/* Luxury Card Header Bar */}
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

                  {/* Main Card Body (Two-Column Split) */}
                  <div className="flex-1 grid grid-cols-2 divide-x divide-[#2E2618]/70 relative">
                    {/* LEFT HALF: Blank Circular Frame + Overlapping Rank Badge + Name + Discord */}
                    <div className="bg-[#120F0A]/90 p-6 sm:p-10 flex flex-col items-center justify-center text-center">
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

                        {/* Overlapping Rank Rectangle Badge */}
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

                      {/* Username and Discord Username */}
                      <div className="mt-8 sm:mt-9 space-y-1 w-full max-w-xl px-4">
                        {assignedNominee ? (
                          <>
                            <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-bold uppercase tracking-wide text-typography-primary leading-tight break-words">
                              {assignedNominee.displayName || assignedNominee.name}
                            </h2>
                            <p className="font-mono text-sm sm:text-lg text-[#E8C97B] break-words">
                              {assignedNominee.discordUsername || assignedNominee.discord}
                            </p>
                          </>
                        ) : (
                          <>
                            <h2 className="font-playfair text-xl sm:text-3xl font-bold uppercase tracking-wide text-typography-muted/50 italic">
                              Unassigned
                            </h2>
                            <p className="font-mono text-xs sm:text-sm text-typography-muted">
                              Select a candidate on the right &rarr;
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* RIGHT HALF: Direct 10-Nominee Selection Grid (No Internal Scroll) */}
                    <div className="bg-[#080705]/95 p-6 sm:p-8 lg:p-10 flex flex-col justify-center items-center">
                      <div className="w-full max-w-xl space-y-3.5">
                        {/* Header */}
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

                        {/* 2-Column Grid */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {selectedNominees.map((nominee) => {
                            const assignedToRank = getAssignedRank(nominee._id);
                            const isCurrent = assignedToRank === slot.rank;

                            return (
                              <button
                                key={nominee._id}
                                type="button"
                                onClick={() => handleSelectNominee(slot.rank, nominee._id)}
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
                                      {nominee.displayName || nominee.name}
                                    </span>
                                    <span className="block text-[10px] sm:text-xs font-mono text-typography-secondary truncate">
                                      {nominee.discordUsername || nominee.discord}
                                    </span>
                                  </div>
                                </div>

                                {/* Rank Badge */}
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
                              <span>
                                Locked into {getRankSuffix(slot.rank)}:{' '}
                                {assignedNominee.displayName || assignedNominee.name}
                              </span>
                            </div>
                            <span className="text-[#D4AF57] font-semibold">+{slot.points} Points</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Accent Line */}
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

        {/* Submission / Progress Footer */}
        {allAssigned ? (
          <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-[#0E0C08] border-2 border-[#D4AF57] text-center w-[92vw] max-w-[1550px] mx-auto space-y-4 shadow-[0_20px_70px_rgba(212,175,87,0.35)] animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#D4AF57]/15 border border-[#D4AF57] flex items-center justify-center text-[#D4AF57] shadow-xl">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="font-playfair text-3xl sm:text-4xl font-bold uppercase tracking-wider text-typography-primary">
              All 10 Positions Sealed
            </h3>
            <p className="text-sm text-typography-secondary font-sans max-w-md mx-auto">
              Total 67 points allocated across all 10 positions in your Order of Merit.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/vote/select"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-[#3D3321] hover:border-[#D4AF57] text-[#A69D8B] hover:text-[#F5F0E6] font-semibold text-xs uppercase tracking-widest transition-all"
              >
                Modify Top 10 Selection
              </Link>
              <button
                type="button"
                onClick={handleProceedToConfirm}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_25px_rgba(212,175,87,0.45)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Confirmation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-12 text-center text-xs font-mono text-typography-muted">
            <span>Scroll and assign all 10 ranks to proceed to confirmation ({assignedCount}/10 assigned)</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE VIEW — Drag & Drop (below lg / < 1024px)
// ─────────────────────────────────────────────────────────────────────────────

const MobileDragDropView = ({ selectedNominees, rankings, setRankings }) => {
  const navigate = useNavigate();

  // Local sorted list — initialised from context rankings or selected order
  const [localRankings, setLocalRankings] = useState(() => {
    if (rankings && rankings.length === 10) return [...rankings];
    return [...selectedNominees];
  });

  // Keep context rankings in sync so desktop view also sees changes
  useEffect(() => {
    setRankings(localRankings);
  }, [localRankings, setRankings]);

  // ── DnD Kit Sensors (Pointer + Touch + Keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setLocalRankings((prev) => {
      const oldIdx = prev.findIndex((n) => n._id === active.id);
      const newIdx = prev.findIndex((n) => n._id === over.id);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const moveUp = (idx) => {
    if (idx === 0) return;
    setLocalRankings((prev) => arrayMove(prev, idx, idx - 1));
  };

  const moveDown = (idx) => {
    if (idx === localRankings.length - 1) return;
    setLocalRankings((prev) => arrayMove(prev, idx, idx + 1));
  };

  const removeNominee = (nomineeId) => {
    // On mobile we don't remove — just show a toast guiding them back
    toast.info('Go back to Change Candidates to modify your top 10 list.');
  };

  const handleReviewBallot = () => {
    setRankings(localRankings);
    navigate('/vote/confirm');
  };

  return (
    <div className="min-h-screen bg-[#070604] text-[#F5F0E6] pb-32 pt-16 sm:pt-20">
      {/* Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/12 via-[#D4AF57]/2 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-1 pb-4 border-b border-[#2E2618]">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D4AF57] block">
            STAGE 2 OF 3 &bull; ORDER OF MERIT
          </span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-bold uppercase tracking-wide text-typography-primary">
            Rank Your Top 10
          </h1>
          <p className="text-xs text-typography-secondary font-sans">
            Drag to reorder · Rank 1 earns +15 pts (Ballon d'Or Winner), Rank 10 earns +1 pt.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            to="/vote/select"
            className="px-3 py-1.5 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] text-[11px] font-mono text-typography-secondary hover:text-typography-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Change Candidates</span>
          </Link>

          <button
            type="button"
            onClick={handleReviewBallot}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] font-bold text-[11px] uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(212,175,87,0.4)] cursor-pointer flex items-center gap-2"
          >
            <span>Review Final Ballot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Points Legend */}
        <div className="grid grid-cols-5 gap-1.5 p-3 rounded-2xl bg-[#0C0A07] border border-[#2E2618] text-center">
          {[
            { label: '1st', pts: 15 },
            { label: '2nd', pts: 12 },
            { label: '3rd', pts: 10 },
            { label: '4th', pts: 8 },
            { label: '5th', pts: 7 },
            { label: '6th', pts: 5 },
            { label: '7th', pts: 4 },
            { label: '8th', pts: 3 },
            { label: '9th', pts: 2 },
            { label: '10th', pts: 1 },
          ].map(({ label, pts }) => (
            <div key={label} className="space-y-0.5">
              <div className="text-[9px] font-mono text-typography-muted uppercase">{label}</div>
              <div className="text-[10px] font-mono text-[#D4AF57] font-bold">+{pts}p</div>
            </div>
          ))}
        </div>

        {/* Sortable Drag List */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localRankings.map((n) => n._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {localRankings.map((nominee, idx) => (
                <SortableNomineeItem
                  key={nominee._id}
                  id={nominee._id}
                  nominee={nominee}
                  rank={idx + 1}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                  onRemove={() => removeNominee(nominee._id)}
                  isFirst={idx === 0}
                  isLast={idx === localRankings.length - 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Bottom CTA */}
        <div className="pt-4 pb-8">
          <button
            type="button"
            onClick={handleReviewBallot}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] font-bold text-sm uppercase tracking-widest transition-all shadow-[0_4px_25px_rgba(212,175,87,0.45)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>Review Final Ballot</span>
          </button>
          <p className="text-center text-[10px] font-mono text-typography-muted mt-3">
            Drag nominees to set your preferred order · Top of list = Rank 1
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main RankingPage — renders correct view based on screen width
// ─────────────────────────────────────────────────────────────────────────────

export const RankingPage = () => {
  const { voter, selectedNominees, rankings, setRankings } = useVoterAuth();
  const isDesktop = useIsDesktop();

  // Voter auth guards
  if (!voter) return <Navigate to="/" replace />;
  if (voter.hasVoted) return <Navigate to="/vote/success" replace />;
  if (!selectedNominees || selectedNominees.length !== 10)
    return <Navigate to="/vote/select" replace />;

  return isDesktop ? (
    <DesktopScrollStackView
      selectedNominees={selectedNominees}
      rankings={rankings}
      setRankings={setRankings}
    />
  ) : (
    <MobileDragDropView
      selectedNominees={selectedNominees}
      rankings={rankings}
      setRankings={setRankings}
    />
  );
};

export default RankingPage;
