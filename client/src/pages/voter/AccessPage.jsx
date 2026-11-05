import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useVoterAuth } from '../../context/VoterAuthContext';
import { toast } from 'sonner';
import {
  Trophy,
  ArrowRight,
  AlertCircle,
  Check,
  ShieldCheck,
  ClipboardPaste,
  X
} from 'lucide-react';

export const AccessPage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [platformStatus, setPlatformStatus] = useState({ isVotingOpen: true, loading: true });

  const { unlockWithCode, voter } = useVoterAuth();
  const navigate = useNavigate();

  // Fetch live voting status
  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const healthRes = await api.get('/health');
        if (!isMounted) return;
        if (healthRes.data?.status === 'ok') {
          setPlatformStatus({ isVotingOpen: healthRes.data.isVotingOpen, loading: false });
        }
      } catch (err) {
        if (isMounted) {
          setPlatformStatus({ isVotingOpen: true, loading: false });
        }
      }
    };

    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCodeChange = (e) => {
    setCode(e.target.value.toUpperCase());
    setErrorMsg('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setCode(text.trim().toUpperCase());
        setErrorMsg('');
        setCopiedSuccess(true);
        setTimeout(() => setCopiedSuccess(false), 2000);
      }
    } catch (err) {
      // Clipboard permission error ignored
    }
  };

  const handleClear = () => {
    setCode('');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setErrorMsg('Please enter your voting code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const res = await unlockWithCode(cleanCode);
    setLoading(false);

    if (res.success) {
      const username = res.voter?.displayName || res.voter?.discordUsername || 'Voter';
      toast.success(`Welcome, ${username}!`, {
        description: 'Voting session authenticated. Proceed to nominee selection.'
      });
      if (res.voter?.hasVoted) {
        navigate('/vote/success');
      } else {
        navigate('/vote/select');
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center text-[#F5F0E6] relative overflow-hidden min-h-screen pt-20 sm:pt-28 pb-10 sm:pb-14">
      {/* Background Image Layer (Positioned with the golden trophy on right) */}
      <div
        className="fixed inset-0 bg-no-repeat bg-cover bg-[position:85%_center] md:bg-right-center pointer-events-none z-0"
        style={{
          backgroundImage: `url('/assets/rfut_dor_bg.jpg')`,
        }}
      >
        {/* Subtle gradient vignette on left to ensure high text contrast */}
        <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-[#0A0907] via-[#0A0907]/90 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0907]/25 via-transparent to-[#0A0907]/95" />
      </div>

      {/* Main Hero Container: 2-Column Asymmetric Layout (Left column holds all UI; right column showcases the trophy) */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Monumental Editorial Presentation & Ballot Input Form */}
        <div className="lg:col-span-7 xl:col-span-6 space-y-5 sm:space-y-6 max-w-xl">
          {/* Edition & Status Kicker */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16130E] border border-[#554628] text-[#E8C97B] text-[10px] font-sans font-semibold tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-[#D4AF57]" />
              <span><span className="font-playfair font-bold text-[#E8C97B]">r/FUT d'Or</span> &bull; 2026 EDITION</span>
            </span>

            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border backdrop-blur-md ${
                platformStatus.isVotingOpen
                  ? 'bg-[#18140B] text-[#D4AF57] border-[#554628]'
                  : 'bg-[#181510] text-[#706859] border-[#3D3321]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  platformStatus.isVotingOpen ? 'bg-[#D4AF57] animate-pulse' : 'bg-[#706859]'
                }`}
              />
              <span>{platformStatus.isVotingOpen ? 'Voting Open' : 'Voting Closed'}</span>
            </span>
          </div>

          {/* Monumental Headline */}
          <div className="space-y-1.5">
            <h1 className="font-playfair text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight uppercase leading-[0.95]">
              <span className="text-[#F5F0E6] block">THE OFFICIAL</span>
              <span className="text-[#D8B264] drop-shadow-[0_2px_20px_rgba(216,178,100,0.35)]">
                BALLOT.
              </span>
            </h1>
            <p className="font-sans text-[11px] sm:text-sm uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#A69D8B] font-medium pt-1">
              2026 COMMUNITY AWARDS &bull; RANKED-CHOICE VOTING
            </p>
          </div>

          {/* Luxury Ballot Authentication Card (Restructured here so it never covers the trophy!) */}
          <div className="relative rounded-2xl bg-[#110F0B]/90 border border-[#554628] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_25px_rgba(212,175,87,0.1)] backdrop-blur-md overflow-hidden max-w-md">
            {/* Subtle Geometric Ballon d'Or Watermark in Card */}
            <svg
              className="absolute right-0 bottom-0 w-44 h-44 pointer-events-none opacity-20 select-none overflow-hidden"
              viewBox="0 0 180 180"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="140" cy="140" r="110" stroke="#D4AF57" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx="140" cy="140" r="80" stroke="#D4AF57" strokeWidth="1.2" />
              <polygon
                points="110,120 140,105 170,120 170,150 140,165 110,150"
                stroke="#D4AF57"
                strokeWidth="1"
                fill="none"
              />
            </svg>

            {/* Card Header Strip */}
            <div className="relative z-10 flex items-center justify-between border-b border-[#3D3321] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-[#1C170F] border border-[#554628] flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF57]" />
                </div>
                <div>
                  <span className="text-[11px] font-playfair font-bold text-[#E8C97B] tracking-wide block">
                    r/FUT d'Or
                  </span>
                  <span className="text-[9px] font-sans text-[#A69D8B] uppercase tracking-wider">
                    Official Voting Pass
                  </span>
                </div>
              </div>

              <span className="text-[9px] font-mono uppercase tracking-widest text-[#E8C97B] px-2 py-0.5 rounded border border-[#554628] bg-[#1A160F]">
                Single Use
              </span>
            </div>

            {/* Card Body */}
            <div className="relative z-10">
              {/* State A: Active Voter Session */}
              {voter && !voter.hasVoted ? (
                <div className="space-y-4 text-center py-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF57] block font-semibold">
                    Ballot Session Active
                  </span>
                  <p className="text-base font-playfair font-bold text-[#F5F0E6]">
                    {voter.discordUsername}
                  </p>
                  <p className="text-xs text-[#A69D8B] font-sans uppercase tracking-wider">
                    Category: <span className="text-[#E8C97B] font-semibold">{voter.category}</span>
                  </p>

                  <button
                    onClick={() => navigate('/vote/select')}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm mt-3"
                  >
                    <span>Resume Top 10 Ballot</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : voter && voter.hasVoted ? (
                /* State B: Already Submitted */
                <div className="space-y-4 text-center py-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#D4AF57] block font-semibold">
                    Official Ballot Sealed
                  </span>
                  <p className="text-base font-playfair font-bold text-[#F5F0E6]">
                    {voter.discordUsername}
                  </p>
                  <p className="text-xs text-[#A69D8B] font-sans leading-relaxed">
                    Your rankings have been permanently registered in the ceremony ledger.
                  </p>
                  <button
                    onClick={() => navigate('/vote/success')}
                    className="w-full py-3 px-4 rounded-xl border border-[#4A3D24] hover:border-[#D4AF57] text-[#F5F0E6] text-xs font-sans uppercase tracking-widest transition-colors cursor-pointer mt-2"
                  >
                    View Sealed Ballot Receipt
                  </button>
                </div>
              ) : (
                /* State C: Passcode Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="votingPasscode"
                        className="text-xs font-sans uppercase tracking-wider text-[#F5F0E6] font-semibold"
                      >
                        Enter Voting Code
                      </label>

                      {/* Paste & Clear Helpers */}
                      <div className="flex items-center gap-2">
                        {code && (
                          <button
                            type="button"
                            onClick={handleClear}
                            className="text-[10px] font-sans text-[#A69D8B] hover:text-[#F5F0E6] transition-colors flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Clear</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handlePaste}
                          className="text-[10px] font-sans text-[#D4AF57] hover:text-[#E8C97B] transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded border border-[#554628] bg-[#16130E]"
                        >
                          {copiedSuccess ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Pasted</span>
                            </>
                          ) : (
                            <>
                              <ClipboardPaste className="w-3 h-3" />
                              <span>Paste</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Generalized Input */}
                    <input
                      id="votingPasscode"
                      type="text"
                      value={code}
                      onChange={handleCodeChange}
                      placeholder="ENTER VOTING CODE"
                      disabled={!platformStatus.isVotingOpen}
                      className="w-full py-3 px-4 rounded-xl bg-[#0A0907] border border-[#4A3D24] text-center text-base sm:text-lg font-mono font-bold tracking-widest text-[#F5F0E6] uppercase placeholder-[#706859]/50 focus:outline-none focus:border-[#D4AF57] focus:ring-1 focus:ring-[#D4AF57]/40 transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                      autoComplete="off"
                      spellCheck="false"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs flex items-center gap-2 font-sans">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !platformStatus.isVotingOpen}
                    className="w-full py-3.5 px-6 rounded-xl font-sans font-semibold text-xs tracking-[0.2em] uppercase text-[#0A0907] bg-[#D4AF57] hover:bg-[#E8C97B] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(212,175,87,0.25)]"
                  >
                    {loading ? (
                      <span>Verifying Code...</span>
                    ) : !platformStatus.isVotingOpen ? (
                      <span>Voting Closed</span>
                    ) : (
                      <>
                        <span>Authenticate Ballot</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Link to Shortlist */}
          <div className="pt-1">
            <Link
              to="/nominees"
              className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-[#E8D5A3] hover:text-[#FFF0CA] font-semibold transition-colors group"
            >
              <span>Explore Full Nominees Roster</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D4AF57] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Column: Intentionally open & clear to showcase the heroic golden trophy! */}
        <div className="hidden lg:block lg:col-span-5 xl:col-span-6 pointer-events-none" aria-hidden="true" />
      </div>
    </div>
  );
};

export default AccessPage;
