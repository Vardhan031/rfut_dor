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
    <div className="space-y-8 max-w-5xl mx-auto py-2 font-sans">
      {/* Page Title */}
      <div className="border-b border-surface-border pb-6 space-y-1">
        <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
          Overview
        </h1>
        <p className="text-typography-secondary text-xs sm:text-sm font-sans">
          Current participation figures and governance controls for the awards ceremony.
        </p>
      </div>

      {/* 4 Essential Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Eligible Voters */}
        <div className="p-5 bg-surface-card border border-surface-border rounded-2xl space-y-2 shadow-sm hover:border-[#D4AF57]/40 transition">
          <div className="flex items-center justify-between text-typography-secondary">
            <span className="text-xs font-sans uppercase tracking-wider">Eligible Voters</span>
            <Users className="w-4 h-4 text-[#D4AF57]" />
          </div>
          <p className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary">
            {data?.totalVoters ?? 0}
          </p>
          <span className="text-[10px] text-typography-muted font-mono block">Authorized codes issued</span>
        </div>

        {/* 2. Votes Submitted */}
        <div className="p-5 bg-surface-card border border-surface-border rounded-2xl space-y-2 shadow-sm hover:border-[#D4AF57]/40 transition">
          <div className="flex items-center justify-between text-typography-secondary">
            <span className="text-xs font-sans uppercase tracking-wider">Votes Submitted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-playfair font-bold text-3xl sm:text-4xl text-gold">
            {data?.totalSubmitted ?? 0}
          </p>
          <span className="text-[10px] text-typography-muted font-mono block">Official sealed ballots</span>
        </div>

        {/* 3. Pending Votes */}
        <div className="p-5 bg-surface-card border border-surface-border rounded-2xl space-y-2 shadow-sm hover:border-[#D4AF57]/40 transition">
          <div className="flex items-center justify-between text-typography-secondary">
            <span className="text-xs font-sans uppercase tracking-wider">Pending Votes</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary">
            {data?.totalPending ?? 0}
          </p>
          <span className="text-[10px] text-typography-muted font-mono block">Unused voter codes</span>
        </div>

        {/* 4. Total Nominees */}
        <div className="p-5 bg-surface-card border border-surface-border rounded-2xl space-y-2 shadow-sm hover:border-[#D4AF57]/40 transition">
          <div className="flex items-center justify-between text-typography-secondary">
            <span className="text-xs font-sans uppercase tracking-wider">Total Nominees</span>
            <Award className="w-4 h-4 text-[#D4AF57]" />
          </div>
          <p className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary">
            {data?.totalNominees ?? 0}
          </p>
          <span className="text-[10px] text-typography-muted font-mono block">Shortlist candidates</span>
        </div>
      </div>

      {/* Two Essential Governance Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Section A: Voting Control */}
        <div className="p-6 bg-surface-card border border-surface-border rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF57]">
                Voting Gate Control
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                  data?.isVotingOpen
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50 shadow-sm'
                    : 'bg-rose-950/30 text-rose-400 border-rose-800/50 shadow-sm'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    data?.isVotingOpen ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-rose-400 shadow-[0_0_6px_#f43f5e]'
                  }`}
                />
                <span>Status: {data?.isVotingOpen ? 'OPEN' : 'CLOSED'}</span>
              </span>
            </div>

            <h3 className="font-playfair font-bold text-2xl text-typography-primary uppercase tracking-wide">
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
              className={`w-full py-2.5 px-4 rounded-xl font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                data?.isVotingOpen
                  ? 'border border-surface-border hover:border-amber-700/60 text-typography-secondary hover:text-amber-300 bg-[#181510] hover:bg-amber-950/30'
                  : 'bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] shadow-[0_2px_14px_rgba(212,175,87,0.3)]'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{data?.isVotingOpen ? 'Close Voting Gate' : 'Open Voting Gate'}</span>
            </button>
          </div>
        </div>

        {/* Section B: Results Privacy */}
        <div className="p-6 bg-surface-card border border-surface-border rounded-2xl space-y-4 flex flex-col justify-between shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#D4AF57]">
                Ceremony Confidentiality
              </span>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                  data?.resultsAnnounced
                    ? 'bg-amber-950/40 text-amber-300 border-amber-800/50 shadow-sm'
                    : 'bg-[#181510] text-typography-secondary border-surface-border'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    data?.resultsAnnounced ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-[#706859]'
                  }`}
                />
                <span>{data?.resultsAnnounced ? 'ANNOUNCED' : 'CONFIDENTIAL'}</span>
              </span>
            </div>

            <h3 className="font-playfair font-bold text-2xl text-typography-primary uppercase tracking-wide">
              Results & Winner Privacy
            </h3>

            <p className="text-xs text-typography-secondary font-sans leading-relaxed">
              Standings and point calculations are restricted to authorized administrators. The ceremony winner remains secret until officially announced.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/admin/results"
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl border border-surface-border bg-[#181510] hover:bg-[#D4AF57]/15 hover:border-[#D4AF57]/60 text-typography-primary text-xs font-sans font-semibold uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-center cursor-pointer shadow-sm active:scale-95"
            >
              <Eye className="w-3.5 h-3.5 text-[#D4AF57]" />
              <span>View Results</span>
            </Link>

            <button
              onClick={handleToggleAnnouncement}
              disabled={updatingControl}
              className={`w-full sm:w-auto py-2.5 px-5 rounded-xl font-sans font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-95 ${
                data?.resultsAnnounced
                  ? 'border border-surface-border text-typography-secondary hover:text-typography-primary bg-[#181510] hover:bg-surface-hover'
                  : 'bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] shadow-[0_2px_14px_rgba(212,175,87,0.3)]'
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
