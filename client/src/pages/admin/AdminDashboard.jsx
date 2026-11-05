import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  Award,
  Power,
  Eye,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingControl, setUpdatingControl] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/overview');
      if (res.data?.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleToggleVoting = async () => {
    if (!data) return;
    const newState = !data.isVotingOpen;
    const confirmText = newState
      ? 'Are you sure you want to OPEN voting? New ballots will be accepted.'
      : 'Are you sure you want to CLOSE voting? Ballots will no longer be accepted by the system.';

    if (!window.confirm(confirmText)) return;

    setUpdatingControl(true);
    try {
      const res = await api.post('/admin/controls', {
        isVotingOpen: newState
      });
      if (res.data?.success) {
        setData((prev) => ({ ...prev, isVotingOpen: newState }));
        toast.success(`Voting is now ${newState ? 'OPEN' : 'CLOSED'}`);
      }
    } catch (err) {
      toast.error('Failed to update voting status.');
    } finally {
      setUpdatingControl(false);
    }
  };

  const handleToggleAnnouncement = async () => {
    if (!data) return;
    const newState = !data.resultsAnnounced;
    const confirmText = newState
      ? 'Officially announce the results and reveal the winner?'
      : 'Return results to confidential admin-only status?';

    if (!window.confirm(confirmText)) return;

    setUpdatingControl(true);
    try {
      const res = await api.post('/admin/controls', {
        resultsAnnounced: newState
      });
      if (res.data?.success) {
        setData((prev) => ({ ...prev, resultsAnnounced: newState }));
        toast.success(`Results status changed to: ${newState ? 'OFFICIALLY ANNOUNCED' : 'CONFIDENTIAL'}`);
      }
    } catch (err) {
      toast.error('Failed to update announcement state.');
    } finally {
      setUpdatingControl(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-24 text-center text-typography-muted font-sans text-xs uppercase tracking-widest">
        Loading Overview...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Page Title */}
      <div className="border-b border-surface-border pb-6 space-y-1">
        <span className="text-[10px] font-sans font-semibold tracking-[0.2em] text-gold block">
          r/FUT d'Or 2026 &bull; STEWARD CONSOLE
        </span>
        <h1 className="font-display font-medium text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
          Overview
        </h1>
        <p className="text-typography-secondary text-xs sm:text-sm font-sans">
          Current participation figures and governance controls for the awards ceremony.
        </p>
      </div>

      {/* 4 Essential Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Eligible Voters */}
        <div className="p-5 bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-typography-secondary">
            <span className="text-xs font-sans uppercase tracking-wider">Eligible Voters</span>
            <Users className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="font-display font-medium text-3xl sm:text-4xl text-typography-primary">
            {data?.totalVoters ?? 0}
          </p>
          <span className="text-[10px] text-typography-muted font-mono block">Authorized codes issued</span>
        </div>

        {/* 2. Votes Submitted */}
        <div className="p-5 bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-typography-secondary">
            <span className="text-xs font-sans uppercase tracking-wider">Votes Submitted</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="font-display font-medium text-3xl sm:text-4xl text-gold">
            {data?.totalSubmitted ?? 0}
          </p>
          <span className="text-[10px] text-typography-muted font-mono block">Official sealed ballots</span>
        </div>

        {/* 3. Pending Votes */}
        <div className="p-5 bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-typography-secondary">
            <span className="text-xs font-sans uppercase tracking-wider">Pending Votes</span>
            <Clock className="w-3.5 h-3.5 text-typography-muted" />
          </div>
          <p className="font-display font-medium text-3xl sm:text-4xl text-typography-primary">
            {data?.totalPending ?? 0}
          </p>
          <span className="text-[10px] text-typography-muted font-mono block">Unused voter codes</span>
        </div>

        {/* 4. Total Nominees */}
        <div className="p-5 bg-surface border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-typography-secondary">
            <span className="text-xs font-sans uppercase tracking-wider">Total Nominees</span>
            <Award className="w-3.5 h-3.5 text-gold" />
          </div>
          <p className="font-display font-medium text-3xl sm:text-4xl text-typography-primary">
            {data?.totalNominees ?? 0}
          </p>
          <span className="text-[10px] text-typography-muted font-mono block">Shortlist candidates</span>
        </div>
      </div>

      {/* Two Essential Governance Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Section A: Voting Control */}
        <div className="p-6 bg-surface border border-surface-border space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
                Voting Gate Control
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-surface-border bg-background">
                Status: {data?.isVotingOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>

            <h3 className="font-display font-medium text-2xl text-typography-primary uppercase tracking-wide">
              {data?.isVotingOpen ? 'Voting Active' : 'Voting Closed'}
            </h3>

            <p className="text-xs text-typography-secondary font-sans leading-relaxed">
              {data?.isVotingOpen
                ? 'Authorized voters may authenticate using their unique codes and cast their Top 10 ballots.'
                : 'Ballot submissions are blocked by the backend. Existing ballots remain sealed.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleToggleVoting}
              disabled={updatingControl}
              className={`w-full py-2.5 px-4 font-sans font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                data?.isVotingOpen
                  ? 'border border-surface-border hover:border-gold text-typography-secondary hover:text-typography-primary bg-background'
                  : 'bg-gold hover:bg-[#A88A4A] text-[#0C0C0B]'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{data?.isVotingOpen ? 'Close Voting Gate' : 'Open Voting Gate'}</span>
            </button>
          </div>
        </div>

        {/* Section B: Results Privacy */}
        <div className="p-6 bg-surface border border-surface-border space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
                Ceremony Confidentiality
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border border-surface-border bg-background">
                {data?.resultsAnnounced ? 'ANNOUNCED' : 'CONFIDENTIAL'}
              </span>
            </div>

            <h3 className="font-display font-medium text-2xl text-typography-primary uppercase tracking-wide">
              Results & Winner Privacy
            </h3>

            <p className="text-xs text-typography-secondary font-sans leading-relaxed">
              Standings and point calculations are restricted to authorized administrators. The ceremony winner remains secret until officially announced.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/admin/results"
              className="w-full sm:flex-1 py-2.5 px-4 border border-surface-border hover:border-gold text-typography-primary text-xs font-sans uppercase tracking-widest flex items-center justify-center gap-2 transition-colors text-center"
            >
              <Eye className="w-3.5 h-3.5 text-gold" />
              <span>View Results</span>
            </Link>

            <button
              onClick={handleToggleAnnouncement}
              disabled={updatingControl}
              className={`w-full sm:w-auto py-2.5 px-4 font-sans font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                data?.resultsAnnounced
                  ? 'border border-surface-border text-typography-secondary hover:text-typography-primary bg-background'
                  : 'bg-gold hover:bg-[#A88A4A] text-[#0C0C0B]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{data?.resultsAnnounced ? 'Conceal' : 'Announce Winner'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
