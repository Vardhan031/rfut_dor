import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Trophy,
  Download,
  ShieldCheck,
  Radio,
  Crown,
  RefreshCw,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminResults = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/results');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load private results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleTogglePublish = async () => {
    if (!data) return;
    const newState = !data.resultsAnnounced;
    const promptMsg = newState
      ? 'Officially announce the results and reveal the r/FUT d\'Or winner?'
      : 'Return results to confidential admin-only status?';

    if (!window.confirm(promptMsg)) return;

    setUpdating(true);
    try {
      const res = await api.post('/admin/controls', {
        resultsAnnounced: newState
      });
      if (res.data?.success) {
        setData((prev) => ({ ...prev, resultsAnnounced: newState }));
        toast.success(`Results status changed to: ${newState ? 'OFFICIALLY ANNOUNCED' : 'CONFIDENTIAL'}`);
      }
    } catch (err) {
      toast.error('Failed to update announcement status.');
    } finally {
      setUpdating(false);
    }
  };

  const exportResultsCsv = () => {
    if (!data?.leaderboard || data.leaderboard.length === 0) return;

    const rows = [
      'Rank,Candidate,Discord Handle,Total Points,1st Place Votes,2nd Place Votes,3rd Place Votes,Top 10 Appearances,Status,Tie Status'
    ];

    for (const item of data.leaderboard) {
      rows.push(
        `"${item.rank}","${item.displayName}","${item.discordUsername}","${item.totalPoints}","${item.firstPlaceVotes}","${item.secondPlaceVotes}","${item.thirdPlaceVotes}","${item.top10Appearances}","${item.isActive ? 'Active' : 'Inactive'}","${item.isTied ? 'Tied' : 'Clear'}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rfut_dor_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Results CSV exported successfully.');
  };

  if (loading && !data) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-typography-secondary space-y-3 font-sans">
        <div className="w-7 h-7 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-wider">Aggregating Official Results & Tie-Breakers...</p>
      </div>
    );
  }

  const leaderboard = data?.leaderboard || [];
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-sans font-medium mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>CONFIDENTIAL &bull; CEREMONY STEWARD CLEARANCE</span>
          </div>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Official Results & Standings
          </h1>
          <p className="text-typography-secondary text-sm font-sans mt-0.5">
            Calculated across {data?.totalBallots} sealed ballots ({data?.totalBallots * 67} points total distributed).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchResults}
            className="p-2 rounded-none border border-surface-border hover:bg-surface-card text-typography-secondary hover:text-typography-primary transition"
            title="Recalculate Scores"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportResultsCsv}
            className="px-3.5 py-2 rounded-none border border-surface-border bg-surface-card hover:bg-surface-hover text-typography-primary text-xs font-sans font-medium flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4 text-gold/80" />
            <span>Export Standings CSV</span>
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={updating}
            className={`px-4 py-2 rounded-none font-display font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition duration-200 cursor-pointer shadow-sm ${
              data?.resultsAnnounced
                ? 'bg-surface-muted border border-surface-border text-gold'
                : 'bg-gold hover:bg-gold text-[#0B0A08]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{data?.resultsAnnounced ? 'Officially Announced' : 'Announce Winner'}</span>
          </button>
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="p-4 rounded-none bg-surface-card border border-surface-border flex items-start gap-3 text-xs font-sans text-typography-secondary">
        <Info className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-typography-primary">Tie-Breaking Protocol:</strong> 1. Total Points &rarr; 2. Higher number of 1st-place votes &rarr; 3. Higher number of 2nd-place votes &rarr; 4. Higher number of 3rd-place votes &rarr; 5. Marked as Tied.
        </p>
      </div>

      {/* THE BALLON D'OR PODIUM */}
      {top1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
          {/* 2nd Place */}
          {top2 && (
            <div className="order-2 md:order-1 p-6 rounded-none bg-surface-card border border-surface-border text-center space-y-3 relative shadow-sm">
              <div className="w-9 h-9 mx-auto rounded-full bg-surface-muted text-gold font-display font-semibold text-base flex items-center justify-center border border-surface-border">
                2
              </div>
              <img
                src={top2.imageUrl}
                alt={top2.displayName}
                className="w-20 h-20 mx-auto rounded-none object-cover border border-surface-border"
              />
              <div>
                <h3 className="font-display font-semibold text-xl uppercase tracking-wide text-typography-primary">
                  {top2.displayName}
                </h3>
                <p className="text-xs text-typography-secondary font-mono">{top2.discordUsername}</p>
              </div>
              <div className="pt-3 border-t border-surface-border flex justify-around text-xs font-sans">
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase">Points</span>
                  <span className="font-display font-semibold text-lg text-gold">{top2.totalPoints}</span>
                </div>
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase">1st Votes</span>
                  <span className="font-mono text-typography-primary">{top2.firstPlaceVotes}</span>
                </div>
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase">Top 10s</span>
                  <span className="font-mono text-typography-primary">{top2.top10Appearances}</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place - r/FUT d'Or CHAMPION */}
          <div className="order-1 md:order-2 p-7 rounded-3xl bg-surface-card border-2 border-gold text-center space-y-3.5 relative border border-surface-border">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gold text-[#0B0A08] px-3.5 py-0.5 rounded-full font-playfair font-bold text-[11px] tracking-wide flex items-center gap-1 shadow-sm">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>r/FUT d'Or 2026 WINNER</span>
            </div>

            <div className="w-11 h-11 mx-auto rounded-full bg-gold text-[#0B0A08] font-display font-semibold text-xl flex items-center justify-center shadow-sm mt-1">
              1
            </div>

            <img
              src={top1.imageUrl}
              alt={top1.displayName}
              className="w-28 h-28 mx-auto rounded-none object-cover border-2 border-gold shadow-md"
            />

            <div>
              <h2 className="font-display font-semibold text-2xl uppercase tracking-wide text-gold">
                {top1.displayName}
              </h2>
              <p className="text-xs text-typography-secondary font-mono">{top1.discordUsername}</p>
            </div>

            <div className="pt-3.5 border-t border-surface-border flex justify-around text-xs font-sans">
              <div>
                <span className="text-[10px] text-typography-muted block uppercase">Total Score</span>
                <span className="font-display font-semibold text-2xl text-gold">{top1.totalPoints} pts</span>
              </div>
              <div>
                <span className="text-[10px] text-typography-muted block uppercase">1st Place Votes</span>
                <span className="font-mono font-medium text-typography-primary text-base">{top1.firstPlaceVotes}</span>
              </div>
              <div>
                <span className="text-[10px] text-typography-muted block uppercase">Appearances</span>
                <span className="font-mono font-medium text-typography-primary text-base">{top1.top10Appearances}</span>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          {top3 && (
            <div className="order-3 p-6 rounded-none bg-surface-card border border-surface-border text-center space-y-3 relative shadow-sm">
              <div className="w-9 h-9 mx-auto rounded-full bg-surface-muted text-gold-dark font-display font-semibold text-base flex items-center justify-center border border-surface-border">
                3
              </div>
              <img
                src={top3.imageUrl}
                alt={top3.displayName}
                className="w-20 h-20 mx-auto rounded-none object-cover border border-surface-border"
              />
              <div>
                <h3 className="font-display font-semibold text-xl uppercase tracking-wide text-typography-primary">
                  {top3.displayName}
                </h3>
                <p className="text-xs text-typography-secondary font-mono">{top3.discordUsername}</p>
              </div>
              <div className="pt-3 border-t border-surface-border flex justify-around text-xs font-sans">
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase">Points</span>
                  <span className="font-display font-semibold text-lg text-[#C9A050]">{top3.totalPoints}</span>
                </div>
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase">1st Votes</span>
                  <span className="font-mono text-typography-primary">{top3.firstPlaceVotes}</span>
                </div>
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase">Top 10s</span>
                  <span className="font-mono text-typography-primary">{top3.top10Appearances}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL STANDINGS TABLE */}
      <div className="bg-surface-card border border-surface-border rounded-none overflow-hidden border border-surface-border">
        <div className="p-4 border-b border-surface-border flex items-center justify-between font-sans">
          <h3 className="font-display font-semibold text-lg text-typography-primary uppercase tracking-wide">
            Full Order of Merit
          </h3>
          <span className="text-xs font-mono text-typography-secondary">
            {leaderboard.length} Shortlisted Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface border-b border-surface-border text-typography-secondary font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4 text-center">Total Points</th>
                <th className="py-3 px-4 text-center">1st Votes</th>
                <th className="py-3 px-4 text-center">2nd Votes</th>
                <th className="py-3 px-4 text-center">3rd Votes</th>
                <th className="py-3 px-4 text-center">Top 10 Appearances</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {leaderboard.map((item) => (
                <tr
                  key={item._id}
                  className={`hover:bg-surface-hover transition-colors ${
                    item.rank === 1
                      ? 'bg-gold/5'
                      : item.rank === 2
                      ? 'bg-gold/5'
                      : item.rank === 3
                      ? 'bg-gold-dark/5'
                      : ''
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-display font-semibold text-xs ${
                          item.rank === 1
                            ? 'bg-gold text-[#0B0A08]'
                            : item.rank === 2
                            ? 'bg-gold text-[#0B0A08]'
                            : item.rank === 3
                            ? 'bg-gold-dark text-typography-primary'
                            : 'bg-surface-muted text-typography-secondary border border-surface-border'
                        }`}
                      >
                        {item.rank}
                      </span>
                      {item.isTied && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-muted text-gold text-[9px] uppercase font-mono">
                          TIED
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover border border-surface-border flex-shrink-0"
                      />
                      <div>
                        <p className="font-display font-semibold text-typography-primary text-sm uppercase tracking-wide">{item.displayName}</p>
                        <p className="text-[10px] text-typography-secondary font-mono">{item.discordUsername}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center font-display font-semibold text-base text-gold">
                    {item.totalPoints}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-medium text-gold">
                    {item.firstPlaceVotes}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-typography-secondary">
                    {item.secondPlaceVotes}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-typography-secondary">
                    {item.thirdPlaceVotes}
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-typography-secondary">
                    {item.top10Appearances}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium uppercase tracking-wider border ${
                        item.isActive
                          ? 'bg-gold/10 text-gold border-gold/30'
                          : 'bg-surface-muted text-typography-muted border-surface-border'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
