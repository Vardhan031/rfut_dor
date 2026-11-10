import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Trophy,
  Download,
  Radio,
  Crown,
  RefreshCw
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
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Official Results & Standings
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchResults}
            className="p-2.5 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover text-typography-secondary hover:text-typography-primary transition cursor-pointer active:scale-95 shadow-sm"
            title="Recalculate Scores"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={exportResultsCsv}
            className="px-4 py-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover text-typography-primary text-xs font-sans font-medium flex items-center gap-2 transition cursor-pointer active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4 text-gold/80" />
            <span>Export Standings CSV</span>
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={updating}
            className={`px-4 py-2 rounded-xl font-sans font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition duration-200 cursor-pointer shadow-sm active:scale-95 ${
              data?.resultsAnnounced
                ? 'bg-surface-muted border border-surface-border text-gold'
                : 'bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] shadow-[0_2px_14px_rgba(212,175,87,0.3)]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>{data?.resultsAnnounced ? 'Officially Announced' : 'Announce Winner'}</span>
          </button>
        </div>
      </div>

      {/* THE BALLON D'OR PODIUM */}
      {top1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
          {/* 2nd Place */}
          {top2 && (
            <div className="order-2 md:order-1 p-6 rounded-2xl bg-surface-card border border-surface-border text-center space-y-3.5 relative shadow-md">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#181510] text-[#E8C97B] font-playfair font-bold text-base flex items-center justify-center border border-[#423825]">
                2
              </div>
              <div className="pt-1">
                <h3 className="font-playfair font-bold text-xl uppercase tracking-wide text-typography-primary">
                  {top2.displayName}
                </h3>
                <p className="text-xs text-[#D4AF57] font-mono mt-0.5">@{top2.discordUsername?.replace(/^@/, '')}</p>
              </div>
              <div className="pt-3 border-t border-surface-border flex justify-around text-xs font-sans">
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase tracking-wider">Points</span>
                  <span className="font-playfair font-bold text-lg text-gold">{top2.totalPoints}</span>
                </div>
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase tracking-wider">1st Votes</span>
                  <span className="font-mono text-typography-primary font-medium">{top2.firstPlaceVotes}</span>
                </div>
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase tracking-wider">Top 10s</span>
                  <span className="font-mono text-typography-primary font-medium">{top2.top10Appearances}</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place - r/FUT d'Or CHAMPION */}
          <div className="order-1 md:order-2 p-7 rounded-2xl bg-surface-card border-2 border-[#D4AF57] text-center space-y-4 relative shadow-2xl">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] text-[#0B0A08] px-4 py-0.5 rounded-full font-playfair font-bold text-[11px] tracking-wide flex items-center gap-1.5 shadow-md">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>r/FUT d'Or 2026 WINNER</span>
            </div>

            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-[#D4AF57] to-[#997A2C] text-[#0A0907] font-playfair font-bold text-xl flex items-center justify-center shadow-md mt-1">
              1
            </div>

            <div className="pt-1">
              <h2 className="font-playfair font-bold text-2xl uppercase tracking-wide text-gold">
                {top1.displayName}
              </h2>
              <p className="text-xs text-[#E8C97B] font-mono mt-0.5">@{top1.discordUsername?.replace(/^@/, '')}</p>
            </div>

            <div className="pt-3.5 border-t border-surface-border flex justify-around text-xs font-sans">
              <div>
                <span className="text-[10px] text-typography-muted block uppercase tracking-wider">Total Score</span>
                <span className="font-playfair font-bold text-2xl text-gold">{top1.totalPoints} pts</span>
              </div>
              <div>
                <span className="text-[10px] text-typography-muted block uppercase tracking-wider">1st Place Votes</span>
                <span className="font-mono font-medium text-typography-primary text-base">{top1.firstPlaceVotes}</span>
              </div>
              <div>
                <span className="text-[10px] text-typography-muted block uppercase tracking-wider">Appearances</span>
                <span className="font-mono font-medium text-typography-primary text-base">{top1.top10Appearances}</span>
              </div>
            </div>
          </div>

          {/* 3rd Place */}
          {top3 && (
            <div className="order-3 p-6 rounded-2xl bg-surface-card border border-surface-border text-center space-y-3.5 relative shadow-md">
              <div className="w-10 h-10 mx-auto rounded-full bg-[#181510] text-[#A68A38] font-playfair font-bold text-base flex items-center justify-center border border-[#423825]">
                3
              </div>
              <div className="pt-1">
                <h3 className="font-playfair font-bold text-xl uppercase tracking-wide text-typography-primary">
                  {top3.displayName}
                </h3>
                <p className="text-xs text-[#D4AF57] font-mono mt-0.5">@{top3.discordUsername?.replace(/^@/, '')}</p>
              </div>
              <div className="pt-3 border-t border-surface-border flex justify-around text-xs font-sans">
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase tracking-wider">Points</span>
                  <span className="font-playfair font-bold text-lg text-[#C9A050]">{top3.totalPoints}</span>
                </div>
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase tracking-wider">1st Votes</span>
                  <span className="font-mono text-typography-primary font-medium">{top3.firstPlaceVotes}</span>
                </div>
                <div>
                  <span className="text-[10px] text-typography-muted block uppercase tracking-wider">Top 10s</span>
                  <span className="font-mono text-typography-primary font-medium">{top3.top10Appearances}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FULL STANDINGS TABLE */}
      <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-surface-border flex items-center justify-between font-sans">
          <h3 className="font-playfair font-bold text-lg text-typography-primary uppercase tracking-wide">
            Full Order of Merit
          </h3>
          <span className="text-xs font-mono text-[#D4AF57]">
            {leaderboard.length} Shortlisted Candidates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#181510] border-b border-surface-border text-typography-secondary font-medium uppercase tracking-wider text-[11px]">
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
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-typography-muted font-sans text-xs">
                    No nominees registered or votes recorded yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((item) => (
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
                    <div>
                      <p className="font-playfair font-semibold text-typography-primary text-sm uppercase tracking-wide">
                        {item.displayName}
                      </p>
                      <p className="text-[10px] text-[#D4AF57] font-mono">@{item.discordUsername?.replace(/^@/, '')}</p>
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
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
