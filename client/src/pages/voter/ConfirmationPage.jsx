import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useVoterAuth } from '../../context/VoterAuthContext';
import CircularCarousel from '../../components/CircularCarousel';
import {
  ArrowLeft,
  CheckSquare,
  Square,
  Lock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

const RANK_POINTS = [15, 12, 10, 8, 7, 5, 4, 3, 2, 1];

export const ConfirmationPage = () => {
  const { voter, rankings, submitOfficialBallot } = useVoterAuth();
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    // Give the carousel a moment to mount and paint before its IO fires,
    // then nudge it awake in case the IO callback missed the initial intersection.
    const wakeTimer = setTimeout(() => {
      carouselRef.current?.wake();
    }, 120);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(wakeTimer);
    };
  }, []);

  const isMobile = windowWidth < 640;

  if (!rankings || rankings.length !== 10) {
    return <Navigate to="/vote/select" replace />;
  }

  // Format rankings into items expected by CircularCarousel (pure awards plaques - no photos)
  const carouselItems = useMemo(() => {
    return rankings.map((nominee, idx) => {
      const rank = idx + 1;
      const points = RANK_POINTS[idx];
      return {
        alt: `${nominee.displayName} - Rank #${rank}`,
        title: nominee.displayName,
        subtitle: `@${(nominee.discordUsername || '').toLowerCase().replace(/#\d+$/, '')}`,
        rank,
        points,
        nominee
      };
    });
  }, [rankings]);

  const activeNominee = rankings[activeIndex] || rankings[0];
  const activeRank = activeIndex + 1;
  const activePoints = RANK_POINTS[activeIndex];

  const handleRankJump = (idx) => {
    setActiveIndex(idx);
    carouselRef.current?.focusIndex(idx);
  };

  const handleStep = (delta) => {
    carouselRef.current?.stepBy(delta);
  };

  const handleSubmit = async () => {
    if (!confirmed) {
      toast.warning('Please confirm your acknowledgement before sealing your ballot.');
      return;
    }

    setSubmitting(true);
    const res = await submitOfficialBallot();
    setSubmitting(false);

    if (res.success) {
      navigate('/vote/success');
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col relative text-[#F5F0E6]">
      {/* 1. Dark Obsidian Ceremony Stage Ambient Lighting (z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0907]">
        {/* Soft overhead golden gala spotlight beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[550px] sm:w-[900px] h-[450px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/14 via-[#D4AF57]/3 to-transparent blur-3xl pointer-events-none" />
        {/* Deep stage vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0907]/30 via-transparent to-[#0A0907]" />
      </div>

      {/* 2. Main Content Container (z-10 ensures everything renders crisply above background) */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-20 sm:pt-24 pb-16 flex flex-col">
        {/* Editorial Header */}
        <div className="mb-5 sm:mb-6 text-center border-b border-[#3D3321] pb-5 sm:pb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#D4AF57]/30 bg-[#D4AF57]/5 text-[#D4AF57] text-[10px] font-mono tracking-[0.25em] uppercase">
            <Sparkles className="w-3 h-3 text-[#D4AF57]" />
            <span>STAGE 3 OF 3 &bull; FINAL BALLOT SEALING</span>
          </div>
          <h1 className="font-playfair font-bold text-2xl sm:text-4xl text-[#F5F0E6] uppercase tracking-wide">
            Official Ballot Verification
          </h1>
          <p className="text-[#A69D8B] text-xs sm:text-sm font-sans max-w-lg mx-auto leading-relaxed px-2">
            Verify your final Top 10 rankings below. Swipe, drag, or tap any card to review positions before permanently sealing your vote.
          </p>
        </div>

        {/* 3D Awards Carousel Card Container */}
        <div className="mb-6 sm:mb-8 rounded-2xl border border-[#3D3321] bg-gradient-to-b from-[#14120E] via-[#0E0C09] to-[#0A0907] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col">
          {/* Top Touch-Friendly Rank Quick-Selector */}
          <div className="px-2 sm:px-4 py-2.5 sm:py-3 border-b border-[#3D3321]/80 bg-[#12100C]/80 backdrop-blur-md flex items-center justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto max-w-full py-1 px-1 scrollbar-none justify-start sm:justify-center">
              {rankings.map((_, idx) => {
                const isCurrent = activeIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleRankJump(idx)}
                    className={`min-w-[36px] sm:min-w-[42px] h-[32px] sm:h-[34px] px-2 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center justify-center select-none ${
                      isCurrent
                        ? 'bg-[#D4AF57] text-[#0A0907] shadow-[0_0_15px_rgba(212,175,87,0.5)] scale-105'
                        : 'bg-[#181510] text-[#A69D8B] hover:text-[#F5F0E6] hover:bg-[#252016] border border-[#3D3321]'
                    }`}
                    title={`Jump to Rank #${idx + 1}`}
                  >
                    #{String(idx + 1).padStart(2, '0')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3D Circular Carousel Stage */}
          <div className="w-full relative h-[390px] xs:h-[420px] sm:h-[500px] md:h-[540px] overflow-hidden">
            {/* Subtle Ambient Golden Beam & Pedestal */}
            <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[220px] sm:w-[320px] h-full bg-gradient-to-b from-[#D4AF57]/15 via-[#D4AF57]/5 to-transparent blur-3xl z-0" />
            <div className="pointer-events-none absolute bottom-[13%] sm:bottom-[15%] left-1/2 -translate-x-1/2 w-[200px] sm:w-[270px] h-[30px] sm:h-[38px] rounded-[100%] border border-[#D4AF57]/30 bg-gradient-to-t from-[#D4AF57]/15 to-transparent shadow-[0_0_35px_rgba(212,175,87,0.25)] blur-[1px] z-0" />

            <CircularCarousel
              ref={carouselRef}
              items={carouselItems}
              preset="cylinder"
              intro="rise"
              cardWidth={isMobile ? 165 : 200}
              aspectRatio={0.62}
              speed={22}
              captions={false}
              gap={isMobile ? 18 : 22}
              tilt={-4}
              curve={0}
              perspective={isMobile ? 1800 : 2200}
              autoplay="drift"
              interval={2.5}
              direction="left"
              momentum={0.65}
              snap
              pauseOnHover={false}
              focusOnClick
              draggable
              parallax={0.25}
              stretch={0.4}
              fadeColor="#000000"
              depthFade={0.6}
              innerShade={0.7}
              cornerRadius={16}
              spotlight={false}
              onChange={setActiveIndex}
              onItemClick={(item, idx) => {
                setActiveIndex(idx);
                carouselRef.current?.focusIndex(idx);
              }}
            />
          </div>

          {/* Minimalist Touch Controller Bar */}
          <div className="px-4 py-3 sm:py-3.5 border-t border-[#3D3321]/80 bg-[#12100C]/90 backdrop-blur-md flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleStep(-1)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#3D3321] hover:border-[#D4AF57] text-[#A69D8B] hover:text-[#F5F0E6] text-xs font-mono transition-colors cursor-pointer select-none active:scale-95"
              aria-label="Previous Nominee"
            >
              <ChevronLeft className="w-4 h-4 text-[#D4AF57]" />
              <span className="hidden sm:inline">PREV</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3 text-center min-w-0">
              <span className="font-cinzel text-xs sm:text-sm font-bold text-[#D4AF57] tracking-wider">
                #{String(activeRank).padStart(2, '0')}
              </span>
              <span className="text-[#3D3321]">&bull;</span>
              <span className="font-playfair text-sm sm:text-base font-bold text-[#F5F0E6] tracking-wide truncate max-w-[140px] sm:max-w-[220px]">
                {activeNominee.displayName}
              </span>
              <span className="text-[#3D3321]">&bull;</span>
              <span className="font-mono text-xs font-bold text-[#E8C97B]">
                +{activePoints} PTS
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleStep(1)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[#3D3321] hover:border-[#D4AF57] text-[#A69D8B] hover:text-[#F5F0E6] text-xs font-mono transition-colors cursor-pointer select-none active:scale-95"
              aria-label="Next Nominee"
            >
              <span className="hidden sm:inline">NEXT</span>
              <ChevronRight className="w-4 h-4 text-[#D4AF57]" />
            </button>
          </div>
        </div>

        {/* Irreversible Submission Warning Notice */}
        <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-xl bg-[#14120E] border border-[#3D3321] text-xs flex items-start gap-3 shadow-md">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-[#D4AF57] mt-0.5" />
          <div className="space-y-1">
            <p className="font-sans font-bold uppercase tracking-wider text-[#F5F0E6] text-xs">
              Irreversible Submission Notice
            </p>
            <p className="text-[#A69D8B] font-sans text-xs leading-relaxed">
              Your single-use voting passcode will be permanently retired upon submission. This ballot cannot be edited or re-ordered once sealed.
            </p>
          </div>
        </div>

        {/* Complete Ballot Breakdown Ledger */}
        <div className="rounded-2xl bg-[#12100C] border border-[#3D3321] p-4 sm:p-6 shadow-2xl space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between border-b border-[#3D3321] pb-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF57]" />
              <h2 className="font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F5F0E6]">
                Full Ballot Ledger (Top 10)
              </h2>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-[#D4AF57] font-bold px-2 py-0.5 rounded bg-[#1C1810] border border-[#4A3D24]">
              67 PTS TOTAL
            </span>
          </div>

          <div className="divide-y divide-[#2A2316]">
            {rankings.map((nominee, idx) => {
              const rank = idx + 1;
              const points = RANK_POINTS[idx];
              const isTop3 = rank <= 3;
              const isSelectedInCarousel = activeIndex === idx;

              return (
                <div
                  key={nominee._id}
                  onClick={() => handleRankJump(idx)}
                  className={`py-3 px-2 sm:px-3 rounded-lg flex items-center justify-between gap-3 sm:gap-4 transition-all duration-150 cursor-pointer ${
                    isSelectedInCarousel
                      ? 'bg-[#D4AF57]/15 border-l-4 border-[#D4AF57] pl-2'
                      : 'hover:bg-[#1A1610]'
                  }`}
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
                      <p className="font-playfair font-bold text-[#F5F0E6] text-sm sm:text-base tracking-wide truncate">
                        {nominee.displayName}
                      </p>
                      <p className="text-[11px] sm:text-xs text-[#A69D8B] font-mono truncate">
                        {nominee.discordUsername ? `@${nominee.discordUsername.toLowerCase().replace(/#\d+$/, '')}` : ''}
                      </p>
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

          {/* Voter Certification Checkbox & Sealing Action */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-[#3D3321] space-y-4">
            <label
              onClick={() => setConfirmed(!confirmed)}
              className={`flex items-start gap-3 sm:gap-3.5 cursor-pointer p-3.5 sm:p-4 rounded-xl border transition-all duration-200 select-none ${
                confirmed
                  ? 'bg-[#D4AF57]/10 border-[#D4AF57] shadow-[0_0_20px_rgba(212,175,87,0.15)]'
                  : 'bg-[#0E0C09] border-[#3D3321] hover:border-[#D4AF57]/40'
              }`}
            >
              <div className="mt-0.5 text-[#D4AF57] flex-shrink-0">
                {confirmed ? (
                  <CheckSquare className="w-5 h-5 text-[#D4AF57]" />
                ) : (
                  <Square className="w-5 h-5 text-[#706859]" />
                )}
              </div>
              <span className="text-xs sm:text-sm text-[#F5F0E6] font-sans leading-relaxed">
                I certify that this is my final Top 10 ballot. I understand that my voting passcode will be cryptographically retired and permanently invalidated upon submission.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button
                type="button"
                onClick={() => navigate('/vote/rank')}
                disabled={submitting}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#3D3321] hover:border-[#D4AF57] text-[#A69D8B] hover:text-[#F5F0E6] bg-[#14120E] text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Modify Rankings</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!confirmed || submitting}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0C0C0B] font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-[0_0_25px_rgba(212,175,87,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
              >
                {submitting ? (
                  <span>Sealing Official Ballot...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Seal & Cast Official Ballot</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
