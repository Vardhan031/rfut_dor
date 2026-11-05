import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Eye, X, Trophy } from 'lucide-react';
import { toast } from 'sonner';

export const AdminBallots = () => {
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedBallot, setSelectedBallot] = useState(null);

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

  const filteredBallots = ballots.filter((b) => {
    const term = search.toLowerCase().trim();
    const voter = b.voterId;
    const matchUser = voter?.discordUsername?.toLowerCase().includes(term);
    const matchCategory = !categoryFilter || voter?.category === categoryFilter;
    return matchUser && matchCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-gold block mb-1">
            Governance &bull; Ballot Ledger
          </span>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Submitted Ballots Audit
          </h1>
          <p className="text-typography-secondary text-sm font-sans mt-0.5">
            Audit individual voter submissions, complete Top 10 rankings, and point allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-none bg-surface-card border border-surface-border text-xs font-mono text-gold">
            {ballots.length} Sealed Ballots
          </span>
          <button
            onClick={fetchBallots}
            className="px-3 py-1.5 rounded-none border border-surface-border hover:bg-surface-card text-xs font-sans text-typography-secondary hover:text-typography-primary transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-none bg-surface-card border border-surface-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-typography-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by voter's Discord handle..."
            className="w-full pl-9 pr-3 py-2 rounded-none bg-background border border-surface-border text-sm font-sans text-typography-primary placeholder-typography-muted focus:outline-none focus:border-gold transition"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-none bg-background border border-surface-border text-xs font-sans text-typography-primary focus:outline-none focus:border-gold"
        >
          <option value="">All Categories</option>
          <option value="Regular Member">Regular Member</option>
          <option value="Staff">Staff</option>
          <option value="Journo">Journo</option>
        </select>
      </div>

      {/* Ballots Table */}
      <div className="bg-surface-card border border-surface-border rounded-none overflow-hidden border border-surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface border-b border-surface-border text-typography-secondary font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Voter Handle</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">1st Place (15 pts)</th>
                <th className="py-3.5 px-4">2nd Place (12 pts)</th>
                <th className="py-3.5 px-4">3rd Place (10 pts)</th>
                <th className="py-3.5 px-4">Submitted At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-typography-muted">
                    Loading audit records...
                  </td>
                </tr>
              ) : filteredBallots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-typography-muted">
                    No submitted ballots found.
                  </td>
                </tr>
              ) : (
                filteredBallots.map((b) => {
                  const rank1 = b.rankings.find((r) => r.rank === 1)?.nomineeId;
                  const rank2 = b.rankings.find((r) => r.rank === 2)?.nomineeId;
                  const rank3 = b.rankings.find((r) => r.rank === 3)?.nomineeId;

                  return (
                    <tr key={b._id} className="hover:bg-surface-hover transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-typography-primary">
                        {b.voterId?.discordUsername || 'Anonymous Voter'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-sans font-medium bg-surface-muted text-gold border border-surface-border">
                          {b.voterId?.category || 'Member'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-display font-medium text-gold uppercase tracking-wide">
                          {rank1?.displayName || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-display font-medium text-gold uppercase tracking-wide">
                          {rank2?.displayName || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-display font-medium text-typography-primary uppercase tracking-wide">
                          {rank3?.displayName || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-typography-secondary font-mono text-[11px]">
                        {new Date(b.submittedAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedBallot(b)}
                          className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-hover text-gold border border-surface-border hover:border-gold/40 transition flex items-center gap-1.5 ml-auto text-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Top 10</span>
                        </button>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full max-h-[90vh] flex flex-col bg-surface-card border border-surface-border rounded-none border border-surface-border relative overflow-hidden font-sans">
            <div className="p-5 border-b border-surface-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-gold tracking-widest block">
                  Ballot Inspection
                </span>
                <h3 className="font-display font-semibold text-xl uppercase tracking-wide text-typography-primary">
                  {selectedBallot.voterId?.discordUsername || 'Voter'}'s Top 10 Ballot
                </h3>
                <p className="text-xs text-typography-secondary mt-0.5">
                  Category: <strong className="text-typography-primary">{selectedBallot.voterId?.category}</strong> &bull; Submitted: {new Date(selectedBallot.submittedAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedBallot(null)}
                className="text-typography-muted hover:text-typography-primary p-1 rounded-lg hover:bg-surface"
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
                      className="p-3 rounded-none bg-background border border-surface-border flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-semibold text-xs ${
                            r.rank === 1
                              ? 'bg-gold text-[#0B0A08]'
                              : r.rank === 2
                              ? 'bg-gold text-[#0B0A08]'
                              : r.rank === 3
                              ? 'bg-gold-dark text-typography-primary'
                              : 'bg-surface-muted text-typography-secondary border border-surface-border'
                          }`}
                        >
                          #{r.rank}
                        </span>

                        {nominee?.imageUrl && (
                          <img
                            src={nominee.imageUrl}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-surface-border"
                          />
                        )}

                        <div>
                          <p className="font-display font-semibold text-typography-primary text-sm uppercase tracking-wide">
                            {nominee?.displayName || 'Unknown'}
                          </p>
                          <p className="text-[10px] text-typography-secondary font-mono">{nominee?.discordUsername}</p>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <span className="font-semibold text-gold">+{r.points} pts</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="p-4 border-t border-surface-border bg-surface flex items-center justify-between text-xs font-mono">
              <span className="text-typography-secondary">Total Points Awarded:</span>
              <span className="font-semibold text-typography-primary text-sm">67 Points Total</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
