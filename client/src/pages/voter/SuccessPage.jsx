import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoterAuth } from '../../context/VoterAuthContext';
import api from '../../services/api';
import { LogOut, CheckCircle2 } from 'lucide-react';

const RANK_POINTS = [15, 12, 10, 8, 7, 5, 4, 3, 2, 1];

export const SuccessPage = () => {
  const { voter, submittedReceipt, logoutVoter, rankings: contextRankings } = useVoterAuth();
  const navigate = useNavigate();

  const [ballotRankings, setBallotRankings] = useState(contextRankings || []);

  // If rankings not in context, fetch from backend endpoint
  useEffect(() => {
    if ((!ballotRankings || ballotRankings.length === 0) && voter) {
      const fetchBallot = async () => {
        try {
          const res = await api.get('/voter/ballot');
          if (res.data?.success && res.data.data?.rankings) {
            const list = res.data.data.rankings
              .sort((a, b) => a.rank - b.rank)
              .map((r) => ({
                ...(r.nomineeId || {}),
                rank: r.rank,
                points: r.points
              }));
            setBallotRankings(list);
          }
        } catch (err) {
          console.error('Error fetching ballot rankings:', err);
        }
      };

      fetchBallot();
    }
  }, [voter, ballotRankings]);

  const handleExit = () => {
    logoutVoter();
    navigate('/');
  };

  const voterName = voter?.discordUsername || submittedReceipt?.voterDiscord || 'Voter';
  const rawCat = voter?.category || submittedReceipt?.category || 'Regular Member';
  const voterCategory = rawCat === 'Journo' ? 'Journalist' : rawCat;
  const ballotId = submittedReceipt?.ballotId || (voter?._id ? `BALLOT-${voter._id.toString().slice(-8).toUpperCase()}` : 'OFFICIAL-BALLOT-2026');

  const displayRankings = ballotRankings.length > 0 ? ballotRankings : contextRankings;

  const normalizedRankings = Array.from({ length: 10 }).map((_, idx) => {
    const existing = displayRankings[idx];
    if (existing) {
      return {
        ...existing,
        rank: existing.rank || idx + 1,
        points: existing.points || RANK_POINTS[idx],
        displayName: existing.displayName || existing.name || `Nominee #${idx + 1}`
      };
    }
    return {
      rank: idx + 1,
      points: RANK_POINTS[idx],
      displayName: `Candidate #${idx + 1}`,
      discordUsername: `nominee${idx + 1}`
    };
  });

  return (
    <div className="flex-1 min-h-screen flex flex-col relative text-[#F5F0E6] bg-[#0A0907]">
      {/* Background Ambience Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-radial from-[#1A1610]/40 via-transparent to-[#0A0907]" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-xl w-full mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 flex flex-col items-center space-y-6 text-center">
        {/* Header Kicker */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#554628] bg-[#16130E] text-[#D4AF57] text-[10px] font-mono tracking-[0.25em] uppercase mb-3 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF57]" />
            <span>OFFICIAL BALLOT RECORDED</span>
          </div>
          <h1 className="font-playfair font-bold text-3xl sm:text-5xl text-[#F5F0E6] uppercase tracking-wide">
            Ballot Submitted
          </h1>
          <p className="mt-2 text-[#A69D8B] text-xs sm:text-sm font-sans max-w-md mx-auto leading-relaxed px-2">
            Your Top 10 rankings for <strong className="text-[#E8C97B] font-semibold">r/FUT d'Or 2026</strong> have been officially recorded and permanently sealed.
          </p>
        </div>

        {/* Sealed Ballot Breakdown (Clean Typography Ledger, Zero Images) */}
        <div className="w-full rounded-2xl bg-[#12100C]/95 border border-[#3D3321] p-4 sm:p-6 shadow-2xl backdrop-blur-md text-left">
          {/* Metadata Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#2A2316] gap-2 text-xs">
            <div>
              <span className="text-[#706859] text-[10px] block font-mono uppercase tracking-wider">Voter Record</span>
              <span className="font-sans font-bold text-sm text-[#F5F0E6]">@{voterName}</span>
              <span className="text-[11px] font-mono text-[#D4AF57] ml-2">({voterCategory})</span>
            </div>

            <div className="sm:text-right font-mono text-[11px]">
              <span className="text-[#706859] text-[10px] block uppercase tracking-wider">Ballot ID</span>
              <span className="text-[#E8C97B] font-semibold">{ballotId}</span>
            </div>
          </div>

          {/* Top 10 Ranked List */}
          <div className="divide-y divide-[#2A2316] mt-2">
            {normalizedRankings.map((nom, idx) => {
              const rank = nom.rank || idx + 1;
              const points = nom.points || RANK_POINTS[idx];
              const isTop3 = rank <= 3;

              return (
                <div
                  key={nom._id || idx}
                  className="py-2.5 px-2 sm:px-3 rounded-lg flex items-center justify-between gap-3 sm:gap-4 hover:bg-[#1A1610]/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-mono text-xs font-bold w-8 sm:w-9 text-center py-1 rounded flex-shrink-0 ${
                        isTop3
                          ? 'bg-[#D4AF57]/20 text-[#E8C97B] border border-[#D4AF57]/40'
                          : 'text-[#A69D8B] bg-[#1A1610] border border-[#3D3321]'
                      }`}
                    >
                      #{String(rank).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <p className="font-playfair font-bold lining-nums text-[#F5F0E6] text-sm sm:text-base tracking-wide truncate leading-normal pb-0.5">
                        {nom.displayName}
                      </p>
                      {nom.discordUsername && (
                        <p className="text-[11px] sm:text-xs text-[#A69D8B] font-mono truncate pb-0.5">
                          @{nom.discordUsername.toLowerCase().replace(/^@/, '').replace(/#\d+$/, '')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 font-mono">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded ${
                        isTop3
                          ? 'bg-[#D4AF57]/20 text-[#E8C97B] border border-[#D4AF57]/40 shadow-sm'
                          : 'text-[#D8D2C4] bg-[#181510] border border-[#3D3321]'
                      }`}
                    >
                      +{points} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ledger Footer */}
          <div className="mt-4 pt-3.5 border-t border-[#2A2316] flex items-center justify-between text-xs font-mono">
            <span className="text-[#A69D8B]">Status: <strong className="text-emerald-400 font-semibold">Sealed & Recorded</strong></span>
            <span className="text-[#E8C97B] font-bold">67 Points Total</span>
          </div>
        </div>

        {/* Primary Action: Exit Ceremony */}
        <div className="w-full space-y-3 pt-2">
          <button
            type="button"
            onClick={handleExit}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0C0C0B] font-sans font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(212,175,87,0.3)] cursor-pointer active:scale-[0.99]"
          >
            <LogOut className="w-4 h-4 text-[#0C0C0B]" />
            <span>Exit Ceremony</span>
          </button>
        </div>

        {/* Ceremony Protocol Notice */}
        <div className="w-full p-3.5 sm:p-4 rounded-xl bg-[#16130E]/80 border border-[#3D3321] text-xs text-[#A69D8B] leading-relaxed font-sans text-center">
          <p>
            <strong className="text-[#F5F0E6] font-medium">Ceremony Protocol:</strong> The winner and final standings remain strictly confidential until the official gala announcement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
