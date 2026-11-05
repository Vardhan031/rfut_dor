import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoterAuth } from '../../context/VoterAuthContext';
import api from '../../services/api';
import { toBlob, toPng } from 'html-to-image';
import {
  LogOut,
  CheckCircle2,
  Download,
  Sparkles,
  FileText,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

const RANK_POINTS = [15, 12, 10, 8, 7, 5, 4, 3, 2, 1];

export const SuccessPage = () => {
  const { voter, submittedReceipt, logoutVoter, rankings: contextRankings } = useVoterAuth();
  const navigate = useNavigate();

  const [ballotRankings, setBallotRankings] = useState(contextRankings || []);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Dedicated off-screen reference for 2x retina DOM-to-image capture
  const exportCardRef = useRef(null);

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
  const voterCategory = voter?.category || submittedReceipt?.category || 'Regular Member';
  const ballotId = submittedReceipt?.ballotId || (voter?._id ? `BALLOT-${voter._id.toString().slice(-8).toUpperCase()}` : 'OFFICIAL-BALLOT-2026');
  const dateStr = submittedReceipt?.submittedAt
    ? new Date(submittedReceipt.submittedAt).toUTCString()
    : voter?.votedAt
    ? new Date(voter.votedAt).toUTCString()
    : new Date().toUTCString();

  const displayRankings = ballotRankings.length > 0 ? ballotRankings : contextRankings;

  // Ensure array has 10 items for visual layout
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

  // Client-Side DOM-to-Image Generation (html-to-image at 2x Retina DPI)
  const handleDownloadImageReceipt = async () => {
    if (!exportCardRef.current) {
      toast.error('Receipt canvas not initialized. Please try again.');
      return;
    }

    setGeneratingImage(true);
    const toastId = toast.loading('Rendering high-resolution ballot card receipt...');

    try {
      if (document.fonts) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => setTimeout(resolve, 200));

      const sanitizedName = voterName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `rFUT_dOr_2026_Ballot_Receipt_${sanitizedName}.png`;

      // Transparent canvas with no clipped outer black shadows
      const options = {
        pixelRatio: 2,
        cacheBust: true,
        skipFonts: true,
        backgroundColor: null
      };

      let downloadUrl = '';
      let isBlob = false;

      try {
        const blob = await toBlob(exportCardRef.current, options);
        if (blob) {
          downloadUrl = URL.createObjectURL(blob);
          isBlob = true;
        }
      } catch (blobErr) {
        console.warn('toBlob fallback to toPng:', blobErr);
      }

      if (!downloadUrl) {
        downloadUrl = await toPng(exportCardRef.current, options);
      }

      const link = document.createElement('a');
      link.download = filename;
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (isBlob) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
      }

      toast.success('Ballot card receipt downloaded (PNG)!', { id: toastId });
    } catch (err) {
      console.error('Failed to generate PNG receipt:', err);
      toast.error('Image capture failed. Downloading text ballot instead.', { id: toastId });
      handleDownloadTextBallot();
    } finally {
      setGeneratingImage(false);
    }
  };

  // Text Ballot (.txt) Fallback
  const handleDownloadTextBallot = () => {
    const rows = normalizedRankings.map((nom, idx) => {
      const rankNum = nom.rank || idx + 1;
      const pts = nom.points || RANK_POINTS[idx];
      const name = nom.displayName;
      const handle = nom.discordUsername ? `(@${nom.discordUsername.toLowerCase().replace(/#\d+$/, '')})` : '';
      return `RANK #${String(rankNum).padStart(2, '0')}:  ${name.padEnd(20)} ${handle.padEnd(18)} [${pts > 0 ? `+${pts}` : pts} PTS]`;
    });

    const fileContent = [
      '================================================================================',
      "                    r/FUT d'Or 2026 • OFFICIAL BALLOT RECEIPT",
      '================================================================================',
      '',
      `Ballot ID:       ${ballotId}`,
      `Voter Discord:   ${voterName}`,
      `Category:        ${voterCategory}`,
      `Status:          PERMANENTLY SEALED & CRYPTOGRAPHICALLY RECORDED`,
      `Submission Date: ${dateStr}`,
      `Total Points:    67 Points Distributed Across Top 10 Nominees`,
      '',
      '--------------------------------------------------------------------------------',
      '                         OFFICIAL TOP 10 BALLOT RANKINGS',
      '--------------------------------------------------------------------------------',
      ...rows,
      '',
      '================================================================================',
      "  r/FUT d'Or 2026 • Official Community Awards • All Rights Reserved",
      '================================================================================'
    ].join('\n');

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rFUT_dOr_2026_Ballot_${voterName.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Ballot text receipt downloaded!');
  };

  // ========================================================================
  // PREMIUM GOLD TYPOGRAPHY CARD RECEIPT WITH VIVID TROPHY BACKGROUND
  // ========================================================================
  const renderCardReceipt = () => {
    const top1 = normalizedRankings[0];
    const top2 = normalizedRankings[1];
    const top3 = normalizedRankings[2];
    const rest = normalizedRankings.slice(3, 10);

    return (
      <div
        style={{
          width: '480px',
          minWidth: '480px',
          maxWidth: '480px',
          backgroundColor: '#0A0907',
          color: '#F5F0E6',
          fontFamily: "'Manrope', sans-serif"
        }}
        className="relative p-4 sm:p-5 rounded-[28px] sm:rounded-[32px] border-2 border-[#D4AF57]/60 flex flex-col gap-3 select-none text-left overflow-hidden box-border"
      >
        {/* Full Trophy Background Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/assets/receipt_trophy_bg.png"
            alt="r/FUT d'Or Trophy Background"
            className="w-full h-full object-cover object-top filter brightness-[0.95] contrast-[1.12]"
            crossOrigin="anonymous"
          />
          {/* Gentle Luxury Vignette: Trophy Stays Vividly Visible */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/65" />
        </div>

        {/* Top Header Strip */}
        <div className="relative z-10 flex items-center justify-between pb-1 px-1">
          <div className="flex items-center gap-2">
            <div>
              <span className="font-playfair font-bold text-sm tracking-wide text-[#F5F0E6] block leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                r/FUT <span className="text-[#D4AF57]">d'Or</span>
              </span>
              <span className="text-[9px] font-mono text-[#E8C97B] uppercase tracking-widest block drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                2026 CEREMONY
              </span>
            </div>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-[#D4AF57]/50 text-[9px] font-mono tracking-widest text-[#E8C97B] uppercase font-bold shadow-md whitespace-nowrap flex-shrink-0">
            BALLOT RECEIPT
          </div>
        </div>

        {/* 1. TIER 1: APEX SELECTION (#1 CHOICE - 15 PTS) - TRANSLUCENT FROSTED GLASS */}
        <div className="relative z-10 rounded-[22px] bg-black/35 backdrop-blur-md border border-[#D4AF57]/45 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {/* Rank + Points Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] tracking-widest uppercase text-[#FFF0C8] font-black flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C97B] shadow-[0_0_6px_rgba(232,201,123,0.9)]" />
              RANK #01 &bull; 1ST CHOICE SELECTION
            </span>
            <span className="font-mono text-[11px] font-black text-[#0A0805] bg-gradient-to-r from-[#FFF3D0] via-[#E8C97B] to-[#D4AF57] px-2.5 py-0.5 rounded-full shadow-md whitespace-nowrap flex-shrink-0 leading-tight">
              +{top1.points} PTS
            </span>
          </div>

          {/* Nominee Name Typography */}
          <div className="pt-1">
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-white tracking-tight leading-tight truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              {top1.displayName}
            </h2>
            {top1.discordUsername && (
              <p className="font-mono text-xs text-[#E8C97B] mt-1 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                @{top1.discordUsername.toLowerCase().replace(/#\d+$/, '')}
              </p>
            )}
          </div>
        </div>

        {/* 2. TIER 2: PODIUM SELECTIONS (#02 & #03 - 2-COLUMN BENTO GRID - FROSTED GLASS) */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5">
          {/* Rank #02 */}
          <div className="rounded-[18px] bg-black/35 backdrop-blur-md border border-[#D4AF57]/40 p-3 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-1.5 gap-1">
              <span className="font-mono text-[9px] font-bold tracking-wider uppercase text-[#E8C97B] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
                RANK #02
              </span>
              <span className="font-mono text-[9px] font-bold text-[#E8C97B] bg-black/60 border border-[#D4AF57]/40 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap flex-shrink-0 leading-none">
                +{top2.points} PTS
              </span>
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {top2.displayName}
              </h3>
              {top2.discordUsername && (
                <span className="font-mono text-[10px] text-[#D8CEB8] block truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  @{top2.discordUsername.toLowerCase().replace(/#\d+$/, '')}
                </span>
              )}
            </div>
          </div>

          {/* Rank #03 */}
          <div className="rounded-[18px] bg-black/35 backdrop-blur-md border border-[#D4AF57]/40 p-3 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-1.5 gap-1">
              <span className="font-mono text-[9px] font-bold tracking-wider uppercase text-[#C5A253] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
                RANK #03
              </span>
              <span className="font-mono text-[9px] font-bold text-[#C5A253] bg-black/60 border border-[#C5A253]/40 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap flex-shrink-0 leading-none">
                +{top3.points} PTS
              </span>
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {top3.displayName}
              </h3>
              {top3.discordUsername && (
                <span className="font-mono text-[10px] text-[#D8CEB8] block truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  @{top3.discordUsername.toLowerCase().replace(/#\d+$/, '')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. TIER 3: POSITIONS #04 THROUGH #10 (FROSTED GLASS ROSTER PANEL) */}
        <div className="relative z-10 rounded-[20px] bg-black/35 backdrop-blur-md border border-[#D4AF57]/35 p-3 shadow-[0_6px_24px_rgba(0,0,0,0.5)]">
          <div className="space-y-1">
            {rest.map((nom) => (
              <div
                key={nom.rank}
                className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-black/40 hover:bg-black/60 border border-[#D4AF57]/20 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 pr-3">
                  <span className="w-5 text-center font-mono text-[9px] font-bold py-0.5 rounded bg-black/60 text-[#E8C97B] border border-[#D4AF57]/30 flex-shrink-0">
                    #{String(nom.rank).padStart(2, '0')}
                  </span>
                  <span className="font-sans font-semibold text-xs text-white truncate max-w-[190px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {nom.displayName}
                  </span>
                  {nom.discordUsername && (
                    <span className="font-mono text-[9px] text-[#D8CEB8] truncate hidden xs:inline drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                      @{nom.discordUsername.toLowerCase().replace(/#\d+$/, '')}
                    </span>
                  )}
                </div>

                {/* Guaranteed Single-Line Pill with whitespace-nowrap */}
                <span className="font-mono text-[10px] font-bold text-[#E8C97B] bg-black/75 px-2.5 py-0.5 rounded-md border border-[#D4AF57]/35 flex-shrink-0 shadow-sm whitespace-nowrap leading-tight">
                  +{nom.points}&nbsp;PTS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. FOOTER BAR */}
        <div className="relative z-10 pt-1 pb-0.5 px-1.5 flex items-center justify-between border-t border-[#D4AF57]/30">
          <div className="text-left">
            <span className="font-sans font-semibold text-sm text-[#FFFDF7] block leading-tight truncate max-w-[200px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              @{voterName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#E8C97B] shadow-[0_0_8px_rgba(232,201,123,0.9)]" />
              <span className="font-mono text-[10px] font-bold tracking-wider text-[#E8C97B] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
                VERIFIED
              </span>
            </div>
          </div>

          {/* Clean Pill Button matching reference footer without duplicate d'Or */}
          <div className="rounded-xl bg-black/60 backdrop-blur-md border border-[#D4AF57]/50 px-3 py-1.5 flex items-center gap-1.5 text-xs text-[#FFF3D0] shadow-sm font-medium whitespace-nowrap flex-shrink-0">
            <Award className="w-3.5 h-3.5 text-[#D4AF57] flex-shrink-0" />
            <span className="font-sans text-xs tracking-wide">
              r/FUT <span className="font-playfair font-bold text-[#D4AF57]">d'Or</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col relative text-[#F5F0E6]">
      {/* 1. Fixed Ceremony Background Layer */}
      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-[position:85%_center] md:bg-right-center pointer-events-none z-0"
        style={{
          backgroundImage: `url('/assets/rfut_dor_bg.jpg')`,
        }}
      >
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#0A0907] via-[#0A0907]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0907]/30 via-transparent to-[#0A0907]/95" />
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 max-w-xl w-full mx-auto px-3.5 sm:px-6 pt-20 sm:pt-28 pb-16 flex flex-col items-center space-y-6 text-center">
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
            Your Top 10 rankings for <strong className="text-[#E8C97B] font-semibold">r/FUT d'Or 2026</strong> are sealed. Download your official card receipt below!
          </p>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE CARD RECEIPT PREVIEW CONTAINER                     */}
        {/* ============================================================== */}
        <div className="w-full flex flex-col items-center justify-center rounded-3xl bg-[#0C0B08]/95 border border-[#3A2F18] p-3 sm:p-5 shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Clean preview without redundant subheader */}
          <div className="w-full overflow-x-auto flex justify-center py-2">
            <div className="scale-[0.72] xs:scale-[0.8] sm:scale-[0.9] md:scale-100 origin-top transition-all duration-300">
              {renderCardReceipt()}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRIMARY ACTION BUTTONS                                         */}
        {/* ============================================================== */}
        <div className="w-full space-y-3 pt-2">
          {/* Main Download Button */}
          <button
            type="button"
            onClick={handleDownloadImageReceipt}
            disabled={generatingImage}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0C0C0B] font-sans font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-[0_0_30px_rgba(212,175,87,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {generatingImage ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin text-[#0C0C0B]" />
                <span>Generating Ballot Card Receipt...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-[#0C0C0B]" />
                <span>Download Card Receipt (PNG)</span>
              </>
            )}
          </button>

          {/* Secondary Controls: Download Text & Exit */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTextBallot}
              className="w-full sm:w-auto flex-1 px-4 py-3 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] text-[#A69D8B] hover:text-[#F5F0E6] bg-[#12100C]/80 text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#D4AF57]" />
              <span>Download Text (.txt)</span>
            </button>

            <button
              type="button"
              onClick={handleExit}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#554628] hover:border-rose-400 text-[#A69D8B] hover:text-rose-200 bg-[#14120E] text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Exit Ceremony</span>
            </button>
          </div>
        </div>

        {/* Ceremony Protocol Notice */}
        <div className="w-full p-3.5 sm:p-4 rounded-xl bg-[#16130E]/80 border border-[#3D3321] text-xs text-[#A69D8B] leading-relaxed font-sans text-center">
          <p>
            <strong className="text-[#F5F0E6] font-medium">Ceremony Protocol:</strong> The winner and final standings remain strictly confidential until the official gala announcement.
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. DEDICATED OFF-SCREEN EXPORT CANVAS (Pure 480px unscaled)     */}
      {/* ============================================================== */}
      <div
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0',
          width: '480px',
          pointerEvents: 'none',
          zIndex: -9999
        }}
        aria-hidden="true"
      >
        <div ref={exportCardRef} style={{ width: '480px' }}>
          {renderCardReceipt()}
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
