import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Eye, X, Trash2, AlertTriangle, RefreshCw, Download, FileText } from 'lucide-react';
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

  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Export all submitted ballots into a master CSV file (Admin Only)
  const handleExportVotesCsv = () => {
    if (!ballots || ballots.length === 0) {
      toast.info('No submitted ballots available to export.');
      return;
    }

    const headers = [
      'Ballot ID',
      'Voter Discord',
      'Category',
      'Submission Timestamp (UTC)',
      'Total Points Awarded',
      'Rank 1 Nominee',
      'Rank 1 Discord',
      'Rank 1 Points',
      'Rank 2 Nominee',
      'Rank 2 Discord',
      'Rank 2 Points',
      'Rank 3 Nominee',
      'Rank 3 Discord',
      'Rank 3 Points',
      'Rank 4 Nominee',
      'Rank 4 Discord',
      'Rank 4 Points',
      'Rank 5 Nominee',
      'Rank 5 Discord',
      'Rank 5 Points',
      'Rank 6 Nominee',
      'Rank 6 Discord',
      'Rank 6 Points',
      'Rank 7 Nominee',
      'Rank 7 Discord',
      'Rank 7 Points',
      'Rank 8 Nominee',
      'Rank 8 Discord',
      'Rank 8 Points',
      'Rank 9 Nominee',
      'Rank 9 Discord',
      'Rank 9 Points',
      'Rank 10 Nominee',
      'Rank 10 Discord',
      'Rank 10 Points'
    ];

    const rows = ballots.map((b) => {
      const voter = b.voterId || {};
      const sorted = (b.rankings || []).slice().sort((x, y) => x.rank - y.rank);
      const totalPts = sorted.reduce((sum, r) => sum + (r.points || 0), 0);

      const rankCols = [];
      for (let i = 1; i <= 10; i++) {
        const item = sorted.find((r) => r.rank === i) || {};
        const nom = item.nomineeId || {};
        rankCols.push(escapeCsv(nom.displayName || ''));
        rankCols.push(escapeCsv(nom.discordUsername ? `@${nom.discordUsername.replace(/^@/, '')}` : ''));
        rankCols.push(escapeCsv(item.points || 0));
      }

      return [
        escapeCsv(b._id),
        escapeCsv(voter.discordUsername || 'Unknown'),
        escapeCsv(voter.category || 'Member'),
        escapeCsv(b.submittedAt ? new Date(b.submittedAt).toISOString() : ''),
        escapeCsv(totalPts),
        ...rankCols
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rfut_dor_all_votes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${ballots.length} submitted ballots to CSV.`);
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
      `Category:        ${voter.category || 'Regular Member'}`,
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
    toast.success('Ballot text archive downloaded.');
  };

  // Download a single ballot's individual breakdown CSV (Admin Only)
  const handleDownloadSingleBallotCsv = (ballot) => {
    if (!ballot) return;
    const voter = ballot.voterId || {};
    const sorted = (ballot.rankings || []).slice().sort((a, b) => a.rank - b.rank);

    const headers = ['Rank', 'Nominee Display Name', 'Discord Username', 'Points Awarded'];
    const rows = sorted.map((r) => {
      const nom = r.nomineeId || {};
      return [
        escapeCsv(r.rank),
        escapeCsv(nom.displayName || 'Unknown'),
        escapeCsv(nom.discordUsername ? `@${nom.discordUsername.replace(/^@/, '')}` : ''),
        escapeCsv(r.points || 0)
      ].join(',');
    });

    const meta = [
      `"Ballot ID",${escapeCsv(ballot._id)}`,
      `"Voter Discord",${escapeCsv(voter.discordUsername || 'Unknown')}`,
      `"Category",${escapeCsv(voter.category || 'Member')}`,
      `"Submitted At",${escapeCsv(ballot.submittedAt ? new Date(ballot.submittedAt).toISOString() : '')}`,
      `"Total Points","67"`,
      ''
    ];

    const csvContent = '\uFEFF' + [...meta, headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeVoter = (voter.discordUsername || 'voter').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.download = `Ballot_${safeVoter}_${ballot._id.slice(-6)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Ballot CSV downloaded.');
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Submitted Ballots Audit
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-3 py-1.5 rounded-lg bg-surface-card border border-surface-border text-xs font-mono text-[#D4AF57]">
            {ballots.length} Sealed Ballots
          </span>

          <button
            onClick={handleExportVotesCsv}
            disabled={ballots.length === 0}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] font-sans font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_12px_rgba(212,175,87,0.25)] active:scale-95"
            title="Download full CSV ledger of all submitted votes and rankings"
          >
            <Download className="w-3.5 h-3.5 text-[#0A0907]" />
            <span>Download Votes (CSV)</span>
          </button>

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
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#0C0B08] border-b border-surface-border text-typography-secondary font-medium uppercase tracking-wider text-[11px]">
              <tr>
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedBallot(b)}
                            className="px-2.5 py-1 rounded-lg bg-[#1A1813] hover:bg-[#25221B] text-[#D4AF57] border border-[#554628]/60 hover:border-[#D4AF57] transition flex items-center gap-1.5 text-xs cursor-pointer shadow-sm"
                            title="Inspect complete Top 10 rankings"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Top 10</span>
                          </button>

                          <button
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
                <h3 className="font-playfair font-bold text-xl uppercase tracking-wide text-[#F5F0E6]">
                  {selectedBallot.voterId?.discordUsername || 'Voter'}'s Top 10 Ballot
                </h3>
                <p className="text-xs text-typography-secondary mt-0.5">
                  Category: <strong className="text-typography-primary">{selectedBallot.voterId?.category === 'Journo' ? 'Journalist' : selectedBallot.voterId?.category}</strong> &bull; Submitted: {new Date(selectedBallot.submittedAt).toLocaleString()}
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
                <span className="text-typography-secondary">Total Awarded:</span>
                <span className="font-semibold text-[#D4AF57] text-sm">67 Points Total</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
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
                  onClick={() => handleDownloadSingleBallotCsv(selectedBallot)}
                  className="px-3 py-1.5 rounded-lg bg-[#14120E] hover:bg-[#1C1812] text-[#E8C97B] border border-[#4A3D24] text-xs font-sans transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Download CSV breakdown of this ballot"
                >
                  <Download className="w-3.5 h-3.5 text-[#D4AF57]" />
                  <span>Download CSV</span>
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
    </div>
  );
};

export default AdminBallots;
