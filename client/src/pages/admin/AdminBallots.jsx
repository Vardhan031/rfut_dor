import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { toBlob, toPng } from 'html-to-image';
import {
  Search,
  Eye,
  X,
  Trash2,
  AlertTriangle,
  RefreshCw,
  FileText,
  Camera,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import ThemedSelect from '../../components/ui/ThemedSelect';

export const AdminBallots = () => {
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedBallot, setSelectedBallot] = useState(null);
  const [ballotToDelete, setBallotToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // States for Image Capture
  const [activeCaptureBallot, setActiveCaptureBallot] = useState(null);
  const [capturingId, setCapturingId] = useState(null);
  const captureCardRef = useRef(null);

  const fetchBallots = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/ballots');
      if (res.data?.success) {
        setBallots(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load submitted ballots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBallots();
  }, []);

  const handleRemoveBallot = async (ballot) => {
    try {
      setDeletingId(ballot._id);
      const res = await api.delete(`/admin/ballots/${ballot._id}`);
      if (res.data?.success) {
        toast.success(`Ballot for ${ballot.voterId?.discordUsername || 'voter'} removed. Leaderboard updated.`);
        setBallots((prev) => prev.filter((b) => b._id !== ballot._id));
        if (selectedBallot?._id === ballot._id) {
          setSelectedBallot(null);
        }
        setBallotToDelete(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove ballot.');
    } finally {
      setDeletingId(null);
    }
  };

  // Download a single ballot's formatted text receipt (Admin Only)
  const handleDownloadSingleBallotTxt = (ballot) => {
    if (!ballot) return;
    const voter = ballot.voterId || {};
    const sorted = (ballot.rankings || []).slice().sort((a, b) => a.rank - b.rank);
    const rows = sorted.map((r) => {
      const nom = r.nomineeId || {};
      const name = nom.displayName || 'Unknown';
      const handle = nom.discordUsername ? `(@${nom.discordUsername.replace(/^@/, '')})` : '';
      return `RANK #${String(r.rank).padStart(2, '0')}:  ${name.padEnd(24)} ${handle.padEnd(20)} [+${r.points} PTS]`;
    });

    const fileContent = [
      '================================================================================',
      "               r/FUT d'Or 2026 • OFFICIAL AUDITED BALLOT ARCHIVE",
      '================================================================================',
      '',
      `Ballot ID:       ${ballot._id}`,
      `Voter Discord:   ${voter.discordUsername || 'Unknown'}`,
      `Category:        ${voter.category === 'Journo' ? 'Journalist' : voter.category || 'Regular Member'}`,
      `Submitted At:    ${ballot.submittedAt ? new Date(ballot.submittedAt).toUTCString() : 'N/A'}`,
      `Audit Status:    SEALED & RECORDED IN DATABASE`,
      `Total Points:    67 Points Distributed Across Top 10 Nominees`,
      '',
      '--------------------------------------------------------------------------------',
      '                        VERIFIED TOP 10 NOMINEE RANKINGS',
      '--------------------------------------------------------------------------------',
      ...rows,
      '',
      '================================================================================',
      "   r/FUT d'Or 2026 • Admin Oversight Archive • Confidential Ballot Record",
      '================================================================================'
    ].join('\n');

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeVoter = (voter.discordUsername || 'voter').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Ballot_${safeVoter}_${ballot._id.slice(-6)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Ballot text receipt for ${voter.discordUsername || 'voter'} downloaded.`);
  };

  // Download high-resolution PNG receipt card for any voter
  const handleDownloadBallotImage = async (ballot) => {
    if (!ballot) return;
    const voterName = ballot.voterId?.discordUsername || 'voter';
    setCapturingId(ballot._id);
    setActiveCaptureBallot(ballot);

    const toastId = toast.loading(`Rendering ballot image receipt for ${voterName}...`);

    setTimeout(async () => {
      try {
        if (!captureCardRef.current) {
          throw new Error('Capture template not initialized.');
        }

        if (document.fonts) {
          await document.fonts.ready;
        }

        const sanitized = voterName.replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `Ballot_Receipt_${sanitized}_${ballot._id.slice(-6)}.png`;

        const options = {
          pixelRatio: 2,
          cacheBust: true,
          skipFonts: true,
          backgroundColor: null
        };

        let downloadUrl = '';
        let isBlob = false;

        try {
          const blob = await toBlob(captureCardRef.current, options);
          if (blob) {
            downloadUrl = URL.createObjectURL(blob);
            isBlob = true;
          }
        } catch (blobErr) {
          console.warn('toBlob fallback to toPng:', blobErr);
        }

        if (!downloadUrl) {
          downloadUrl = await toPng(captureCardRef.current, options);
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

        toast.success(`Ballot image for ${voterName} downloaded (PNG)!`, { id: toastId });
      } catch (err) {
        console.error('Failed to capture ballot card image:', err);
        toast.error('Image capture failed. Downloading text ballot instead.', { id: toastId });
        handleDownloadSingleBallotTxt(ballot);
      } finally {
        setCapturingId(null);
        setActiveCaptureBallot(null);
      }
    }, 180);
  };

  // Render 480px luxury trophy ballot receipt template for off-screen image capture
  const renderBallotCardTemplate = (ballot) => {
    if (!ballot) return null;
    const voter = ballot.voterId || {};
    const voterName = voter.discordUsername || 'Voter';
    const sorted = (ballot.rankings || []).slice().sort((a, b) => a.rank - b.rank);
    const top1 = sorted[0]?.nomineeId || {};
    const top1Pts = sorted[0]?.points || 15;
    const top2 = sorted[1]?.nomineeId || {};
    const top2Pts = sorted[1]?.points || 12;
    const top3 = sorted[2]?.nomineeId || {};
    const top3Pts = sorted[2]?.points || 10;
    const rest = sorted.slice(3, 10);

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
        className="relative p-5 rounded-[32px] border-2 border-[#D4AF57]/60 flex flex-col gap-3 select-none text-left overflow-hidden box-border"
      >
        {/* Full Trophy Background Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src="/assets/receipt_trophy_bg.png"
            alt="r/FUT d'Or Trophy Background"
            className="w-full h-full object-cover object-top filter brightness-[0.95] contrast-[1.12]"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/65" />
        </div>

        {/* Top Header Strip */}
        <div className="relative z-10 flex items-center justify-between pb-1 px-1">
          <div>
            <span className="font-playfair font-bold text-sm tracking-wide text-[#F5F0E6] block leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              r/FUT <span className="text-[#D4AF57]">d'Or</span>
            </span>
            <span className="text-[9px] font-mono text-[#E8C97B] uppercase tracking-widest block drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              2026 CEREMONY
            </span>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-[#D4AF57]/50 text-[9px] font-mono tracking-widest text-[#E8C97B] uppercase font-bold shadow-md whitespace-nowrap flex-shrink-0">
            OFFICIAL BALLOT RECORD
          </div>
        </div>

        {/* Rank #1 Choice */}
        <div className="relative z-10 rounded-[22px] bg-black/35 backdrop-blur-md border border-[#D4AF57]/45 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 rounded-full font-mono text-[10px] font-bold tracking-widest uppercase bg-black/60 text-[#E8C97B] border border-[#D4AF57]/50 flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8C97B]" />
              APEX SELECTION • RANK #01
            </span>
            <span className="font-mono text-sm font-black text-[#E8C97B] bg-black/75 px-3 py-0.5 rounded-full border border-[#D4AF57]/50 shadow-md">
              +{top1Pts} PTS
            </span>
          </div>
          <div className="pt-1">
            <h2 className="font-playfair font-bold text-2xl text-white truncate drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
              {top1.displayName || 'Nominee #1'}
            </h2>
            {top1.discordUsername && (
              <p className="font-mono text-xs text-[#E8C97B] mt-0.5 truncate drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                @{top1.discordUsername.replace(/^@/, '')}
              </p>
            )}
          </div>
        </div>

        {/* Podium Runners-Up (#02 & #03) */}
        <div className="grid grid-cols-2 gap-2.5 relative z-10">
          <div className="rounded-[20px] bg-black/35 backdrop-blur-md border border-[#D4AF57]/40 p-3 flex flex-col justify-between shadow-[0_6px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-widest uppercase bg-black/60 text-[#E8C97B] border border-[#D4AF57]/40">
                #02
              </span>
              <span className="font-mono text-xs font-bold text-[#E8C97B] bg-black/75 px-2 py-0.5 rounded-full border border-[#D4AF57]/40">
                +{top2Pts} PTS
              </span>
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {top2.displayName || 'Nominee #2'}
              </h3>
              {top2.discordUsername && (
                <span className="font-mono text-[10px] text-[#D8CEB8] block truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  @{top2.discordUsername.replace(/^@/, '')}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-[20px] bg-black/35 backdrop-blur-md border border-[#D4AF57]/40 p-3 flex flex-col justify-between shadow-[0_6px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold tracking-widest uppercase bg-black/60 text-[#E8C97B] border border-[#D4AF57]/40">
                #03
              </span>
              <span className="font-mono text-xs font-bold text-[#E8C97B] bg-black/75 px-2 py-0.5 rounded-full border border-[#D4AF57]/40">
                +{top3Pts} PTS
              </span>
            </div>
            <div>
              <h3 className="font-sans font-bold text-base text-white truncate drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {top3.displayName || 'Nominee #3'}
              </h3>
              {top3.discordUsername && (
                <span className="font-mono text-[10px] text-[#D8CEB8] block truncate mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  @{top3.discordUsername.replace(/^@/, '')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Positions #04 through #10 */}
        <div className="relative z-10 rounded-[20px] bg-black/35 backdrop-blur-md border border-[#D4AF57]/35 p-3 shadow-[0_6px_24px_rgba(0,0,0,0.5)]">
          <div className="space-y-1">
            {rest.map((r, idx) => {
              const nom = r.nomineeId || {};
              const rankNum = r.rank || idx + 4;
              return (
                <div
                  key={rankNum}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-black/40 border border-[#D4AF57]/20"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-3">
                    <span className="w-5 text-center font-mono text-[9px] font-bold py-0.5 rounded bg-black/60 text-[#E8C97B] border border-[#D4AF57]/30 flex-shrink-0">
                      #{String(rankNum).padStart(2, '0')}
                    </span>
                    <span className="font-sans font-semibold text-xs text-white truncate max-w-[210px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {nom.displayName || `Candidate #${rankNum}`}
                    </span>
                    {nom.discordUsername && (
                      <span className="font-mono text-[9px] text-[#D8CEB8] truncate hidden xs:inline drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        @{nom.discordUsername.replace(/^@/, '')}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#E8C97B] bg-black/75 px-2.5 py-0.5 rounded-md border border-[#D4AF57]/35 flex-shrink-0 shadow-sm whitespace-nowrap leading-tight">
                    +{r.points || 0}&nbsp;PTS
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Bar */}
        <div className="relative z-10 pt-1 pb-0.5 px-1.5 flex items-center justify-between border-t border-[#D4AF57]/30">
          <div className="text-left">
            <span className="font-sans font-semibold text-sm text-[#FFFDF7] block leading-tight truncate max-w-[200px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              @{voterName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#E8C97B] shadow-[0_0_8px_rgba(232,201,123,0.9)]" />
              <span className="font-mono text-[10px] font-bold tracking-wider text-[#E8C97B] uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] whitespace-nowrap">
                VERIFIED BALLOT &bull; 67 PTS
              </span>
            </div>
          </div>

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

  const filteredBallots = ballots.filter((b) => {
    const term = search.toLowerCase().trim();
    const voter = b.voterId;
    const matchUser = voter?.discordUsername?.toLowerCase().includes(term);
    const matchCategory =
      !categoryFilter ||
      voter?.category === categoryFilter ||
      (categoryFilter === 'Journalist' && (voter?.category === 'Journo' || voter?.category === 'Journalist'));
    return matchUser && matchCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Submitted Ballots Audit
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs font-mono text-[#D4AF57]">
            {ballots.length} Sealed Ballots
          </span>

          <button
            onClick={fetchBallots}
            className="px-3 py-1.5 rounded-lg border border-surface-border hover:bg-surface-card text-xs font-sans text-typography-secondary hover:text-typography-primary transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-typography-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by voter's Discord handle..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-surface-border text-sm font-sans text-typography-primary placeholder-typography-muted focus:outline-none focus:border-[#D4AF57] transition"
          />
        </div>

        <ThemedSelect
          value={categoryFilter}
          onChange={(val) => setCategoryFilter(val)}
          className="w-full sm:w-48"
          options={[
            { value: '', label: 'All Categories' },
            { value: 'Regular Member', label: 'Regular Member' },
            { value: 'Staff', label: 'Staff' },
            { value: 'Journalist', label: 'Journalist' }
          ]}
        />
      </div>

      {/* Ballots Table */}
      <div className="rounded-2xl border border-surface-border bg-surface-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="border-b border-surface-border bg-[#0C0B08] text-[11px] font-mono uppercase text-typography-secondary tracking-wider">
                <th className="py-3.5 px-4">Voter Handle</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-typography-muted">
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredBallots.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-typography-muted">
                    No submitted ballots found.
                  </td>
                </tr>
              ) : (
                filteredBallots.map((b) => {
                  return (
                    <tr key={b._id} className="hover:bg-surface-hover/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-typography-primary">
                        {b.voterId?.discordUsername || 'Anonymous Voter'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-sans font-medium bg-surface-muted text-[#D4AF57] border border-surface-border">
                          {(b.voterId?.category === 'Journo' ? 'Journalist' : b.voterId?.category) || 'Member'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-typography-secondary font-mono text-[11px]">
                        {new Date(b.submittedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* 1. Download Image Receipt Button */}
                          <button
                            type="button"
                            onClick={() => handleDownloadBallotImage(b)}
                            disabled={capturingId === b._id}
                            className="px-2.5 py-1 rounded-lg bg-[#14120E] hover:bg-[#1E1A13] text-[#E8C97B] hover:text-[#FFF4D0] border border-[#554628]/60 hover:border-[#D4AF57] transition flex items-center gap-1.5 text-xs cursor-pointer shadow-sm disabled:opacity-50"
                            title="Download official ballot image receipt (PNG)"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#D4AF57]" />
                            <span>{capturingId === b._id ? 'Rendering...' : 'Image'}</span>
                          </button>

                          {/* 2. Download Text Record Button */}
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleBallotTxt(b)}
                            className="px-2.5 py-1 rounded-lg bg-[#14120E] hover:bg-[#1E1A13] text-[#D8D2C4] hover:text-white border border-surface-border hover:border-[#554628] transition flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
                            title="Download official text record (.txt)"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#D4AF57]" />
                            <span>Text</span>
                          </button>

                          {/* 3. Inspect Top 10 Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedBallot(b)}
                            className="px-2.5 py-1 rounded-lg bg-[#1A1813] hover:bg-[#25221B] text-[#D4AF57] border border-[#554628]/60 hover:border-[#D4AF57] transition flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
                            title="Inspect complete Top 10 rankings"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Top 10</span>
                          </button>

                          {/* 4. Remove Ballot Button */}
                          <button
                            type="button"
                            onClick={() => setBallotToDelete(b)}
                            className="px-2.5 py-1 rounded-lg bg-rose-950/20 hover:bg-rose-900/35 text-rose-400 hover:text-rose-300 border border-rose-900/40 hover:border-rose-700/60 transition flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
                            title="Invalidate ballot and deduct votes from leaderboard"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Ballot</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {selectedBallot && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-xl w-full max-h-[90vh] flex flex-col bg-[#110F0B] border border-[#554628] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,87,0.15)] relative overflow-hidden font-sans">
            <div className="p-5 border-b border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#D4AF57] tracking-widest block">
                  Ballot Inspection
                </span>
                <h3 className="font-playfair font-bold text-xl text-typography-primary">
                  {selectedBallot.voterId?.discordUsername || 'Anonymous Voter'}
                </h3>
                <p className="text-xs text-typography-muted font-mono mt-0.5">
                  Category: <span className="text-[#D4AF57]">{selectedBallot.voterId?.category || 'Member'}</span> &bull; Submitted:{' '}
                  {new Date(selectedBallot.submittedAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedBallot(null)}
                className="text-typography-muted hover:text-typography-primary p-1 rounded-lg hover:bg-surface cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2 flex-1">
              {selectedBallot.rankings
                .sort((a, b) => a.rank - b.rank)
                .map((r) => {
                  const nominee = r.nomineeId;
                  return (
                    <div
                      key={r.rank}
                      className="p-3 rounded-xl bg-[#0A0907] border border-surface-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            r.rank === 1
                              ? 'bg-[#D4AF57] text-[#0A0907]'
                              : r.rank === 2
                              ? 'bg-[#E8C97B] text-[#0A0907]'
                              : r.rank === 3
                              ? 'bg-[#A68A38] text-[#0A0907]'
                              : 'bg-surface-muted text-typography-secondary border border-surface-border'
                          }`}
                        >
                          #{r.rank}
                        </span>

                        <div>
                          <p className="font-playfair font-semibold text-typography-primary text-sm tracking-wide">
                            {nominee?.displayName || 'Unknown'}
                          </p>
                          <p className="text-[10px] text-typography-secondary font-mono">@{nominee?.discordUsername?.replace(/^@/, '')}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-semibold text-[#D4AF57]">+{r.points} pts</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-4 border-t border-surface-border bg-[#0C0B08] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-typography-secondary">Total Points:</span>
                <span className="font-semibold text-[#D4AF57] text-sm">67 Points Total</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDownloadBallotImage(selectedBallot)}
                  disabled={capturingId === selectedBallot._id}
                  className="px-3 py-1.5 rounded-lg bg-[#14120E] hover:bg-[#1C1812] text-[#E8C97B] border border-[#4A3D24] text-xs font-sans transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  title="Download image receipt (PNG) for this voter"
                >
                  <Camera className="w-3.5 h-3.5 text-[#D4AF57]" />
                  <span>Download Image</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSingleBallotTxt(selectedBallot)}
                  className="px-3 py-1.5 rounded-lg bg-[#14120E] hover:bg-[#1C1812] text-[#E8C97B] border border-[#4A3D24] text-xs font-sans transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Download formatted text receipt for this voter"
                >
                  <FileText className="w-3.5 h-3.5 text-[#D4AF57]" />
                  <span>Download .txt</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const b = selectedBallot;
                    setBallotToDelete(b);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/25 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 border border-rose-900/50 text-xs font-sans transition flex items-center gap-1.5 cursor-pointer ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Invalidate Ballot</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REMOVE / INVALIDATE CONFIRMATION MODAL */}
      {ballotToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#110F0B] border border-rose-900/50 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(244,63,94,0.15)] relative space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-900/50">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-lg text-[#F5F0E6]">Invalidate Ballot</h3>
                <p className="text-xs text-typography-muted">
                  Voter: <span className="font-mono text-rose-300">{ballotToDelete.voterId?.discordUsername || 'Voter'}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-typography-secondary leading-relaxed">
              Are you sure you want to invalidate and remove this ballot?
            </p>

            <div className="p-3 rounded-xl bg-[#0A0907] border border-[#4A3D24] text-[11px] text-[#A69D8B] space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300">
                <span>&bull;</span>
                <span>All 67 points awarded by this voter will be immediately <strong>deducted from the live leaderboard</strong>.</span>
              </div>
              <div className="flex items-center gap-2 text-[#D4AF57]">
                <span>&bull;</span>
                <span>The voter's status will reset from <strong>Submitted</strong> back to <strong>Pending</strong>.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setBallotToDelete(null)}
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs text-typography-secondary hover:text-typography-primary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRemoveBallot(ballotToDelete)}
                disabled={deletingId === ballotToDelete._id}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {deletingId === ballotToDelete._id ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Invalidation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFF-SCREEN CAPTURE CANVAS FOR HIGH-RES IMAGE GENERATION */}
      {activeCaptureBallot && (
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
          <div ref={captureCardRef} style={{ width: '480px' }}>
            {renderBallotCardTemplate(activeCaptureBallot)}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBallots;
