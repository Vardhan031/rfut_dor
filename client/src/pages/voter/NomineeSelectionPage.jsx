import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useVoterAuth } from '../../context/VoterAuthContext';
import { NomineeCard } from '../../components/NomineeCard';
import { Search, ArrowRight, RotateCcw, AlertCircle, Check } from 'lucide-react';

export const NomineeSelectionPage = () => {
  const { voter, selectedNominees, toggleSelectNominee, isNomineeSelected, getNomineeRank, setSelectedNominees } = useVoterAuth();
  const navigate = useNavigate();

  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!voter) {
      navigate('/');
      return;
    }
    if (voter.hasVoted) {
      navigate('/vote/success');
      return;
    }

    const fetchNominees = async () => {
      try {
        setLoading(true);
        const res = await api.get('/voter/nominees');
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
  }, [voter, navigate]);

  const filteredNominees = nominees.filter((n) => {
    const term = searchTerm.toLowerCase().trim();
    return (
      n.displayName.toLowerCase().includes(term) ||
      n.discordUsername.toLowerCase().includes(term) ||
      (n.description && n.description.toLowerCase().includes(term))
    );
  });

  const count = selectedNominees.length;
  const isComplete = count === 10;

  return (
    <div className="flex-1 min-h-screen flex flex-col relative text-[#F5F0E6]">
      {/* 1. Dark Obsidian Ceremony Stage Ambient Lighting (z-0) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0907]">
        {/* Soft overhead golden gala spotlight beam */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF57]/14 via-[#D4AF57]/3 to-transparent blur-3xl pointer-events-none" />
        {/* Deep stage vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0907]/30 via-transparent to-[#0A0907]" />
      </div>

      {/* 2. Main Content Container (z-10 ensures everything renders crisply above background) */}
      <div className="relative z-10 max-w-6xl w-full mx-auto px-3 sm:px-6 pt-20 sm:pt-28 pb-16 flex flex-col">
        {/* Editorial Header */}
        <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-[#3D3321] pb-5 sm:pb-6">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#D4AF57] block mb-1">
              STAGE 1 OF 3 &bull; CANDIDATE SELECTION
            </span>
            <h2 className="font-playfair font-bold text-2xl sm:text-4xl text-[#F5F0E6] uppercase tracking-wide">
              Select Your Top 10 Nominees
            </h2>
            <p className="text-[#A69D8B] text-xs sm:text-sm font-sans mt-1">
              Choose exactly ten candidates from the official shortlist to enter your ranked ballot.
            </p>
          </div>

          {/* Voter Identity */}
          {voter && (
            <div className="bg-[#12100C]/90 border border-[#3D3321] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-left sm:text-right flex-shrink-0 self-start sm:self-auto shadow-md">
              <span className="text-[9px] text-[#706859] uppercase tracking-widest block font-mono">Verified Voter</span>
              <span className="text-xs font-mono font-semibold text-[#F5F0E6]">{voter.discordUsername}</span>
              <span className="text-[10px] text-[#D4AF57] ml-2 uppercase font-mono">
                [{voter.category}]
              </span>
            </div>
          )}
        </div>

        {/* Welcome Alert Banner for Authenticated Voter */}
        {voter && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-[#14120E] border border-[#554628] text-xs font-sans text-[#E8C97B] flex items-center justify-between gap-3 shadow-lg backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF57] animate-pulse flex-shrink-0" />
              <span className="leading-snug">
                Welcome, <strong className="text-[#F5F0E6] font-bold uppercase tracking-wider">{voter.discordUsername}</strong>! Your official ballot has been authenticated. Please select your Top 10 nominees below.
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#A69D8B] uppercase tracking-widest hidden sm:inline-block border border-[#3D3321] px-2 py-0.5 rounded bg-[#100E0A]">
              Single-Use Session
            </span>
          </div>
        )}

        {/* Sticky Progress Bar & Actions */}
        <div className="sticky top-16 sm:top-20 z-30 mb-6 sm:mb-8 p-3 sm:p-4 rounded-2xl bg-[#12100C]/95 border border-[#3D3321] backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="font-cinzel font-bold text-lg sm:text-xl text-[#F5F0E6] tracking-wide">
                  SELECTED: <span className={isComplete ? 'text-[#D4AF57]' : 'text-[#F5F0E6]'}>{count}</span> / 10
                </span>
                {isComplete && (
                  <span className="text-[#D4AF57] text-[11px] sm:text-xs font-mono uppercase tracking-wider flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    Ready
                  </span>
                )}
              </div>

              {/* Subtle Progress Bar */}
              <div className="w-full sm:w-48 h-1 bg-[#1A1610] rounded-full overflow-hidden mt-1 sm:mt-1.5">
                <div
                  className="h-full bg-[#D4AF57] transition-all duration-300 rounded-full"
                  style={{ width: `${(count / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Mobile Reset Button */}
            {count > 0 && (
              <button
                type="button"
                onClick={() => setSelectedNominees([])}
                className="sm:hidden px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider text-[#A69D8B] hover:text-[#F5F0E6] transition-colors flex items-center gap-1 border border-[#3D3321] rounded-lg"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {count > 0 && (
              <button
                type="button"
                onClick={() => setSelectedNominees([])}
                className="hidden sm:flex px-3 py-2 text-xs font-sans uppercase tracking-wider text-[#A69D8B] hover:text-[#F5F0E6] transition-colors items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Selection</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/vote/rank')}
              disabled={!isComplete}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md ${
                isComplete
                  ? 'bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] text-[#0C0C0B] cursor-pointer shadow-[0_0_15px_rgba(212,175,87,0.3)] hover:brightness-110'
                  : 'border border-[#3D3321] text-[#706859] cursor-not-allowed opacity-50 bg-[#12100C]'
              }`}
            >
              <span>Proceed to Ranking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 relative max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#706859]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter nominees..."
            className="w-full pl-9 pr-3 py-2.5 bg-[#12100C]/90 border border-[#3D3321] rounded-xl text-sm font-sans text-[#F5F0E6] placeholder-[#706859] focus:outline-none focus:border-[#D4AF57] transition-colors"
          />
        </div>

        {/* Nominees Grid */}
        {loading ? (
          <div className="py-20 text-center text-[#706859] font-sans text-xs uppercase tracking-widest">
            Loading candidate profiles...
          </div>
        ) : fetchError ? (
          <div className="p-4 bg-[#14120E] border border-[#3D3321] text-rose-300 text-center font-sans space-y-2 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 mx-auto" />
            <p>{fetchError}</p>
          </div>
        ) : filteredNominees.length === 0 ? (
          <div className="py-16 text-center text-[#706859] bg-[#12100C] border border-[#3D3321] rounded-xl font-sans text-xs">
            No candidates found matching "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNominees.map((nominee) => (
              <NomineeCard
                key={nominee._id}
                nominee={nominee}
                isSelected={isNomineeSelected(nominee._id)}
                rank={getNomineeRank(nominee._id)}
                onToggle={toggleSelectNominee}
                disabled={count >= 10}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NomineeSelectionPage;
