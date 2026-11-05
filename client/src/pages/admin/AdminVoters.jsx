import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Search,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  Key,
  Copy,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  UserPlus,
  UserMinus,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminVoters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal states
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedVoterForCode, setSelectedVoterForCode] = useState(null);
  const [deleteConfirmVoter, setDeleteConfirmVoter] = useState(null); // for Delete Code
  const [voterToDelete, setVoterToDelete] = useState(null); // for Delete Voter (single)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false); // for Delete All Voters
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Single voter / code form
  const [singleDiscord, setSingleDiscord] = useState('');
  const [singleCategory, setSingleCategory] = useState('Regular Member');
  const [generateCodeImmediately, setGenerateCodeImmediately] = useState(true);
  const [generatedSingle, setGeneratedSingle] = useState(null);

  // Bulk codes form
  const [bulkText, setBulkText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('Regular Member');
  const [generatedBulk, setGeneratedBulk] = useState(null);

  const [generating, setGenerating] = useState(false);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/voters', {
        params: {
          search,
          category,
          status,
          page,
          limit: 20
        }
      });
      if (res.data?.success) {
        setVoters(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load voters list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, [search, category, status, page]);

  const handleExportVotersCsv = async () => {
    try {
      const res = await api.get('/admin/voters/export');
      if (res.data?.success) {
        const data = res.data.data;
        if (!data || data.length === 0) {
          toast.info('No voters to export.');
          return;
        }

        const headers = Object.keys(data[0]);
        const csvContent =
          'data:text/csv;charset=utf-8,' +
          [
            headers.join(','),
            ...data.map((row) => headers.map((h) => `"${row[h] || ''}"`).join(','))
          ].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `rfut_voters_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Voters CSV exported successfully.');
      }
    } catch (err) {
      toast.error('Failed to export CSV.');
    }
  };

  const handleAddVoter = async (e) => {
    e.preventDefault();
    if (!singleDiscord.trim()) {
      toast.warning('Please enter a Discord username.');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/admin/voters/generate', {
        discordUsername: singleDiscord.trim(),
        category: singleCategory,
        generateCode: generateCodeImmediately
      });
      if (res.data?.success) {
        if (generateCodeImmediately && res.data.plaintextCode) {
          setGeneratedSingle({
            discordUsername: res.data.voter.discordUsername,
            category: res.data.voter.category,
            plaintextCode: res.data.plaintextCode
          });
          toast.success(`Voter added and voting code generated for ${res.data.voter.discordUsername}`);
        } else {
          toast.success(`Voter ${res.data.voter.discordUsername} added to registry.`);
          setShowSingleModal(false);
        }
        fetchVoters();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add voter.');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateBulk = async (e) => {
    e.preventDefault();
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      toast.warning('Please enter at least one Discord username.');
      return;
    }

    const payload = lines.map((username) => ({
      discordUsername: username,
      category: bulkCategory
    }));

    setGenerating(true);
    try {
      const res = await api.post('/admin/voters/bulk-generate', { voters: payload });
      if (res.data?.success) {
        setGeneratedBulk(res.data);
        toast.success(`Generated ${res.data.generatedCount} codes.`);
        fetchVoters();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to bulk generate codes.');
    } finally {
      setGenerating(false);
    }
  };

  const downloadBulkCsv = (results) => {
    if (!results || results.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Discord Username,Category,Plaintext Code',
        ...results.map((r) => `"${r.discordUsername}","${r.category}","${r.plaintextCode}"`)
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rfut_codes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success('Copied code to clipboard!');
  };

  // Inspect voter code: open modal showing active code
  const handleInspectCode = async (voter) => {
    if (voter.plaintextCode) {
      setSelectedVoterForCode(voter);
      return;
    }

    try {
      setActionLoadingId(voter._id);
      const res = await api.get(`/admin/voters/${voter._id}/code`);
      if (res.data?.success) {
        const fullVoter = { ...voter, plaintextCode: res.data.data.plaintextCode };
        setSelectedVoterForCode(fullVoter);
      }
    } catch (err) {
      toast.error('Could not retrieve code for this voter.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Generate / Regenerate code for an individual voter
  const handleGenerateForVoter = async (voter) => {
    try {
      setActionLoadingId(voter._id);
      const res = await api.post(`/admin/voters/${voter._id}/generate-code`);
      if (res.data?.success) {
        toast.success(`Generated code for ${voter.discordUsername}: ${res.data.plaintextCode}`);
        setVoters((prev) =>
          prev.map((v) =>
            v._id === voter._id
              ? {
                  ...v,
                  plaintextCode: res.data.plaintextCode,
                  codeStatus: 'Assigned'
                }
              : v
          )
        );

        if (selectedVoterForCode?._id === voter._id) {
          setSelectedVoterForCode({
            ...selectedVoterForCode,
            plaintextCode: res.data.plaintextCode,
            codeStatus: 'Assigned'
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate code.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete code for an individual voter
  const handleDeleteCodeForVoter = async (voter) => {
    try {
      setActionLoadingId(voter._id);
      const res = await api.delete(`/admin/voters/${voter._id}/code`);
      if (res.data?.success) {
        toast.success(`Voting code removed for ${voter.discordUsername}`);
        setVoters((prev) =>
          prev.map((v) =>
            v._id === voter._id
              ? {
                  ...v,
                  plaintextCode: null,
                  codeStatus: 'Unassigned'
                }
              : v
          )
        );

        if (selectedVoterForCode?._id === voter._id) {
          setSelectedVoterForCode({
            ...selectedVoterForCode,
            plaintextCode: null,
            codeStatus: 'Unassigned'
          });
        }

        setDeleteConfirmVoter(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete code.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete single voter entirely
  const handleDeleteIndividualVoter = async (voter) => {
    try {
      setActionLoadingId(voter._id);
      const res = await api.delete(`/admin/voters/${voter._id}`);
      if (res.data?.success) {
        toast.success(`Voter ${voter.discordUsername} deleted successfully.`);
        setVoters((prev) => prev.filter((v) => v._id !== voter._id));
        setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        setVoterToDelete(null);
        if (selectedVoterForCode?._id === voter._id) {
          setSelectedVoterForCode(null);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete voter.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete all voters
  const handleDeleteAllVoters = async () => {
    try {
      setActionLoadingId('all');
      const res = await api.delete('/admin/voters/all');
      if (res.data?.success) {
        toast.success('All voters and associated ballots have been purged.');
        setVoters([]);
        setPagination({ total: 0, totalPages: 1 });
        setShowDeleteAllModal(false);
        setSelectedVoterForCode(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete all voters.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Invalidate and remove ballot for an individual voter
  const handleRemoveBallotForVoter = async (voter) => {
    try {
      setActionLoadingId(voter._id);
      const res = await api.delete(`/admin/voters/${voter._id}/ballot`);
      if (res.data?.success) {
        toast.success(`Ballot for ${voter.discordUsername} removed. Leaderboard updated.`);
        setVoters((prev) =>
          prev.map((v) =>
            v._id === voter._id
              ? {
                  ...v,
                  hasVoted: false,
                  votedAt: null
                }
              : v
          )
        );

        if (selectedVoterForCode?._id === voter._id) {
          setSelectedVoterForCode({
            ...selectedVoterForCode,
            hasVoted: false,
            votedAt: null
          });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove ballot.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-[#D4AF57] block mb-1">
            Governance &bull; Voter Registry
          </span>
          <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Voters & Codes
          </h1>
          <p className="text-typography-secondary text-sm font-sans mt-0.5">
            Issue, inspect, and manage authorized voters and single-use credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Add Voter Button */}
          <button
            onClick={() => {
              setGeneratedSingle(null);
              setSingleDiscord('');
              setGenerateCodeImmediately(true);
              setShowSingleModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-semibold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_2px_12px_rgba(212,175,87,0.25)]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Voter</span>
          </button>

          {/* Bulk Add Button */}
          <button
            onClick={() => {
              setGeneratedBulk(null);
              setBulkText('');
              setShowBulkModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-surface-card hover:bg-surface-hover text-typography-primary border border-surface-border hover:border-[#D4AF57]/50 font-sans font-medium text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4AF57]/80" />
            <span>Bulk Add</span>
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportVotersCsv}
            className="px-3.5 py-2 rounded-xl border border-surface-border bg-surface-card hover:bg-surface-hover text-typography-secondary hover:text-typography-primary text-xs font-sans transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {/* Delete All Voters Button */}
          {voters.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 hover:text-rose-200 text-xs font-sans transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Delete all voters and clear the entire registry"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete All Voters</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-surface-card border border-surface-border flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-typography-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Discord handle..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-background border border-surface-border text-sm font-sans text-typography-primary placeholder-typography-muted focus:outline-none focus:border-[#D4AF57] focus:ring-1 focus:ring-[#D4AF57]/30 transition"
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44 px-3 py-2 rounded-lg bg-background border border-surface-border text-xs font-sans text-typography-primary focus:outline-none focus:border-[#D4AF57]"
        >
          <option value="">All Categories</option>
          <option value="Regular Member">Regular Member</option>
          <option value="Staff">Staff</option>
          <option value="Journo">Journo</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-48 px-3 py-2 rounded-lg bg-background border border-surface-border text-xs font-sans text-typography-primary focus:outline-none focus:border-[#D4AF57]"
        >
          <option value="">All Ballot Statuses</option>
          <option value="VOTED">Ballot Submitted (Voted)</option>
          <option value="PENDING">Ballot Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#0C0B08] border-b border-surface-border text-typography-secondary font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Discord Handle</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Code Status</th>
                <th className="py-3.5 px-4">Ballot Status</th>
                <th className="py-3.5 px-4">Recorded At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-typography-muted">
                    Loading registry records...
                  </td>
                </tr>
              ) : voters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-typography-muted">
                    No voters found matching your search.
                  </td>
                </tr>
              ) : (
                voters.map((v) => (
                  <tr key={v._id} className="hover:bg-surface-hover/70 transition-colors">
                    {/* Discord Handle */}
                    <td className="py-3 px-4 font-mono font-medium text-typography-primary">
                      {v.discordUsername}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium uppercase tracking-wider bg-surface-muted text-[#D4AF57] border border-surface-border">
                        {v.category}
                      </span>
                    </td>

                    {/* Code Status */}
                    <td className="py-3 px-4">
                      {v.codeStatus === 'Assigned' ? (
                        <button
                          type="button"
                          onClick={() => handleInspectCode(v)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#D4AF57]/10 hover:bg-[#D4AF57]/20 border border-[#D4AF57]/40 hover:border-[#D4AF57] text-[#D4AF57] font-mono text-[11px] transition-all cursor-pointer group shadow-sm active:scale-95"
                          title="Click to view generated voting code"
                        >
                          <Key className="w-3.5 h-3.5 text-[#D4AF57] group-hover:rotate-12 transition-transform" />
                          <span className="font-semibold underline decoration-dotted underline-offset-2">
                            Assigned
                          </span>
                          <span className="text-[10px] text-[#E8C97B]/70 group-hover:text-[#E8C97B] font-sans">
                            (view)
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateForVoter(v)}
                          disabled={actionLoadingId === v._id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/40 hover:bg-[#D4AF57]/10 border border-dashed border-stone-700 hover:border-[#D4AF57]/50 text-stone-400 hover:text-[#D4AF57] text-[11px] font-mono transition-all cursor-pointer disabled:opacity-50"
                          title="Click to generate code"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="underline decoration-dotted">Unassigned</span>
                        </button>
                      )}
                    </td>

                    {/* Ballot Status */}
                    <td className="py-3 px-4">
                      {v.hasVoted ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium tracking-wide">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Submitted</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/20 text-amber-300/80 border border-amber-600/20 text-[11px] font-medium tracking-wide">
                          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* Recorded At */}
                    <td className="py-3 px-4 text-typography-secondary font-mono text-[11px]">
                      {v.votedAt ? new Date(v.votedAt).toLocaleString() : '—'}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.codeStatus === 'Assigned' ? (
                          <>
                            {/* View Code */}
                            <button
                              type="button"
                              onClick={() => handleInspectCode(v)}
                              className="px-2 py-1 rounded-lg bg-[#1A1813] hover:bg-[#25221B] text-[#D4AF57] hover:text-[#E8C97B] border border-[#554628]/60 hover:border-[#D4AF57] text-[11px] font-sans transition flex items-center gap-1 cursor-pointer shadow-sm"
                              title="View code"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">View</span>
                            </button>

                            {/* Regenerate Code */}
                            <button
                              type="button"
                              onClick={() => handleGenerateForVoter(v)}
                              disabled={actionLoadingId === v._id}
                              className="px-2 py-1 rounded-lg bg-[#1A1813] hover:bg-[#25221B] text-typography-secondary hover:text-[#D4AF57] border border-surface-border hover:border-[#554628] text-[11px] font-sans transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Generate new code (replaces current code)"
                            >
                              <RefreshCw
                                className={`w-3.5 h-3.5 ${actionLoadingId === v._id ? 'animate-spin' : ''}`}
                              />
                              <span className="hidden xl:inline">Regen</span>
                            </button>

                            {/* Delete Code */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmVoter(v)}
                              disabled={actionLoadingId === v._id}
                              className="px-2 py-1 rounded-lg bg-amber-950/20 hover:bg-amber-900/35 text-amber-400 hover:text-amber-300 border border-amber-900/40 hover:border-amber-700/60 text-[11px] font-sans transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Delete code only (leaves voter in registry)"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Del Code</span>
                            </button>
                          </>
                        ) : (
                          /* Generate Code when Unassigned */
                          <button
                            type="button"
                            onClick={() => handleGenerateForVoter(v)}
                            disabled={actionLoadingId === v._id}
                            className="px-2.5 py-1 rounded-lg bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] text-[11px] font-sans font-semibold transition flex items-center gap-1 cursor-pointer shadow-[0_2px_8px_rgba(212,175,87,0.2)] disabled:opacity-50"
                            title="Generate a code for this voter"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Generate Code</span>
                          </button>
                        )}

                        {/* Delete Voter Button (Completely removes voter) */}
                        <button
                          type="button"
                          onClick={() => setVoterToDelete(v)}
                          disabled={actionLoadingId === v._id}
                          className="px-2 py-1 rounded-lg bg-rose-950/25 hover:bg-rose-900/40 text-rose-400 hover:text-rose-300 border border-rose-900/40 hover:border-rose-700/60 text-[11px] font-sans transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Delete voter permanently from registry"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Delete Voter</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between text-xs text-typography-secondary font-sans bg-[#0C0B08]/60">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total voters)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-surface-border hover:bg-surface disabled:opacity-20 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-surface-border hover:bg-surface disabled:opacity-20 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CODE INSPECTOR MODAL */}
      {selectedVoterForCode && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#110F0B] border border-[#554628] rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,87,0.15)] relative space-y-5">
            <button
              onClick={() => setSelectedVoterForCode(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-typography-muted hover:text-typography-primary hover:bg-[#1A1813] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#D4AF57] block mb-1">
                VOTING CODE ACCESS
              </span>
              <h3 className="font-playfair font-bold text-xl uppercase tracking-wide text-[#F5F0E6]">
                {selectedVoterForCode.discordUsername}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium uppercase tracking-wider bg-[#1A1813] text-[#D4AF57] border border-[#4A3D24]">
                  {selectedVoterForCode.category}
                </span>
                {selectedVoterForCode.hasVoted ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium uppercase tracking-wider bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Ballot: Submitted
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-medium uppercase tracking-wider bg-amber-950/30 text-amber-300/80 border border-amber-800/40 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Ballot: Pending
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#0A0907] border border-[#4A3D24] text-center space-y-3">
              <span className="text-[10px] text-[#A69D8B] uppercase tracking-widest block font-mono">
                Active Plaintext Voting Code
              </span>
              {selectedVoterForCode.plaintextCode ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="py-2.5 px-6 rounded-lg bg-[#14120D] border border-[#D4AF57]/40 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
                    <span className="font-mono font-bold text-3xl text-[#D4AF57] tracking-[0.25em] select-all">
                      {selectedVoterForCode.plaintextCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedVoterForCode.plaintextCode)}
                    className="py-2 px-5 rounded-lg bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer transition shadow-[0_2px_12px_rgba(212,175,87,0.25)]"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4 text-[#0A0907]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-4 text-stone-400 text-xs font-sans">
                  No active code assigned to this voter yet.
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-surface-border/60">
              {selectedVoterForCode.plaintextCode ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleGenerateForVoter(selectedVoterForCode)}
                    disabled={actionLoadingId === selectedVoterForCode._id}
                    className="px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover text-typography-secondary hover:text-[#D4AF57] border border-surface-border text-xs font-sans flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${actionLoadingId === selectedVoterForCode._id ? 'animate-spin' : ''}`}
                    />
                    <span>Regen Code</span>
                  </button>
                  <div className="flex items-center gap-2">
                    {selectedVoterForCode.hasVoted && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBallotForVoter(selectedVoterForCode)}
                        disabled={actionLoadingId === selectedVoterForCode._id}
                        className="px-3 py-2 rounded-lg bg-amber-950/20 hover:bg-amber-900/30 text-amber-400 hover:text-amber-300 border border-amber-900/30 text-xs font-sans flex items-center gap-1.5 transition cursor-pointer"
                        title="Invalidate ballot and deduct votes from leaderboard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Invalidate Ballot</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setVoterToDelete(selectedVoterForCode);
                        setSelectedVoterForCode(null);
                      }}
                      className="px-3 py-2 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 hover:text-rose-300 border border-rose-900/30 text-xs font-sans flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <UserMinus className="w-3.5 h-3.5" />
                      <span>Delete Voter</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between w-full gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateForVoter(selectedVoterForCode)}
                    className="py-2.5 px-4 rounded-lg bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 flex-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Generate Code Now</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVoterToDelete(selectedVoterForCode);
                      setSelectedVoterForCode(null);
                    }}
                    className="py-2.5 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 text-xs font-sans transition cursor-pointer flex items-center gap-1.5"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Delete Voter</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CODE CONFIRMATION MODAL */}
      {deleteConfirmVoter && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#110F0B] border border-amber-900/50 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.15)] relative space-y-4 font-sans">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-900/50">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-lg text-[#F5F0E6]">Delete Voting Code</h3>
                <p className="text-xs text-typography-muted">
                  Discord: <span className="font-mono text-amber-300">{deleteConfirmVoter.discordUsername}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-typography-secondary leading-relaxed">
              Are you sure you want to delete the active code for this voter? Their voter record will remain in the registry, but their code status will be set to <strong className="text-typography-primary">Unassigned</strong>.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmVoter(null)}
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs text-typography-secondary hover:text-typography-primary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCodeForVoter(deleteConfirmVoter)}
                disabled={actionLoadingId === deleteConfirmVoter._id}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-semibold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {actionLoadingId === deleteConfirmVoter._id ? 'Deleting...' : 'Delete Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE SINGLE VOTER CONFIRMATION MODAL */}
      {voterToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#110F0B] border border-rose-900/60 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(244,63,94,0.2)] relative space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-900/50">
                <UserMinus className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-lg text-[#F5F0E6]">Delete Voter</h3>
                <p className="text-xs text-typography-muted">
                  Discord: <span className="font-mono text-rose-300 font-semibold">{voterToDelete.discordUsername}</span>
                </p>
              </div>
            </div>

            <p className="text-xs text-typography-secondary leading-relaxed">
              Are you sure you want to permanently delete this voter from the registry?
            </p>

            <div className="p-3 rounded-xl bg-[#0A0907] border border-[#4A3D24] text-[11px] text-[#A69D8B] space-y-1">
              <p className="text-rose-300">&bull; The voter is removed permanently from the registry.</p>
              <p className="text-[#D4AF57]">&bull; Any assigned voting code is revoked immediately.</p>
              {voterToDelete.hasVoted && (
                <p className="text-rose-400 font-semibold">&bull; Any submitted ballot will be removed and deducted from the live leaderboard.</p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setVoterToDelete(null)}
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs text-typography-secondary hover:text-typography-primary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteIndividualVoter(voterToDelete)}
                disabled={actionLoadingId === voterToDelete._id}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {actionLoadingId === voterToDelete._id ? 'Deleting...' : 'Delete Voter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ALL VOTERS CONFIRMATION MODAL */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#110F0B] border border-rose-800/80 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_40px_rgba(244,63,94,0.3)] relative space-y-4 font-sans">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-playfair font-bold text-xl text-[#F5F0E6]">Delete All Voters?</h3>
                <p className="text-xs text-rose-300 font-mono">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-typography-secondary leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#F5F0E6]">ALL {pagination.total || voters.length} voters</strong>?
            </p>

            <div className="p-3.5 rounded-xl bg-[#0A0907] border border-rose-900/40 text-[11px] text-rose-300/90 space-y-1.5">
              <p>&bull; The entire voter registry will be wiped to 0 records.</p>
              <p>&bull; All generated voting codes will be invalidated.</p>
              <p>&bull; All cast ballots will be cleared and the leaderboard reset.</p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                className="px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs text-typography-secondary hover:text-typography-primary transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllVoters}
                disabled={actionLoadingId === 'all'}
                className="px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_4px_16px_rgba(244,63,94,0.35)] disabled:opacity-50"
              >
                {actionLoadingId === 'all' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging All...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete All Voters</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SINGLE VOTER MODAL */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-surface-border rounded-2xl p-6 relative space-y-4 shadow-2xl">
            <button
              onClick={() => setShowSingleModal(false)}
              className="absolute top-4 right-4 text-typography-muted hover:text-typography-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-playfair font-semibold text-xl uppercase tracking-wide text-typography-primary">
              Add Voter to Registry
            </h3>

            {!generatedSingle ? (
              <form onSubmit={handleAddVoter} className="space-y-4 pt-1 font-sans">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                    Discord Username
                  </label>
                  <input
                    type="text"
                    value={singleDiscord}
                    onChange={(e) => setSingleDiscord(e.target.value)}
                    placeholder="e.g. Member#1001"
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-[#D4AF57]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                    Category
                  </label>
                  <select
                    value={singleCategory}
                    onChange={(e) => setSingleCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-[#D4AF57]"
                  >
                    <option value="Regular Member">Regular Member</option>
                    <option value="Staff">Staff</option>
                    <option value="Journo">Journo</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="genImmediately"
                    checked={generateCodeImmediately}
                    onChange={(e) => setGenerateCodeImmediately(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D4AF57] cursor-pointer"
                  />
                  <label htmlFor="genImmediately" className="text-xs text-typography-secondary cursor-pointer select-none">
                    Generate voting code immediately
                  </label>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSingleModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-sans text-typography-secondary hover:text-typography-primary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-5 py-2.5 rounded-lg bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-semibold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {generating ? 'Adding...' : 'Add Voter'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-1 font-sans">
                <div className="p-3 rounded-xl bg-[#D4AF57]/10 border border-[#D4AF57]/30 text-[#D4AF57] text-xs">
                  Voter registered: <strong>{generatedSingle.discordUsername}</strong> ({generatedSingle.category}).
                </div>

                <div className="p-4 rounded-xl bg-background border border-surface-border text-center space-y-2">
                  <span className="text-[10px] text-typography-muted uppercase tracking-widest block font-mono">
                    Generated Plaintext Code
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-bold text-2xl text-[#D4AF57] tracking-widest select-all">
                      {generatedSingle.plaintextCode}
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedSingle.plaintextCode)}
                      className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-typography-secondary hover:text-[#D4AF57] transition cursor-pointer"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowSingleModal(false)}
                  className="w-full py-2.5 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs font-sans font-medium uppercase tracking-wider text-typography-primary cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BULK GENERATION MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-surface-card border border-surface-border rounded-2xl p-6 relative space-y-4 shadow-2xl">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 text-typography-muted hover:text-typography-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-playfair font-semibold text-xl uppercase tracking-wide text-typography-primary">
              Bulk Add Voters & Generate Codes
            </h3>

            {!generatedBulk ? (
              <form onSubmit={handleGenerateBulk} className="space-y-4 pt-1 font-sans">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                    Assign Category
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-surface-border text-xs text-typography-primary focus:outline-none focus:border-[#D4AF57]"
                  >
                    <option value="Regular Member">Regular Member</option>
                    <option value="Staff">Staff</option>
                    <option value="Journo">Journo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                    Discord Usernames (One per line)
                  </label>
                  <textarea
                    rows={6}
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="DiscordUser#0001&#10;DiscordUser#0002&#10;DiscordUser#0003"
                    className="w-full p-3 rounded-lg bg-background border border-surface-border text-xs font-mono text-typography-primary placeholder-typography-muted focus:outline-none focus:border-[#D4AF57]"
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 rounded-lg text-xs text-typography-secondary hover:text-typography-primary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-5 py-2.5 rounded-lg bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-semibold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {generating ? 'Processing Codes...' : 'Generate Codes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-1 font-sans">
                <div className="p-3 rounded-xl bg-[#D4AF57]/10 border border-[#D4AF57]/30 text-[#D4AF57] text-xs">
                  Successfully generated <strong>{generatedBulk.generatedCount}</strong> voting codes.
                </div>

                <div className="p-4 rounded-xl bg-background border border-surface-border text-center space-y-3">
                  <p className="text-xs text-typography-secondary">
                    Download the CSV to distribute codes to your members.
                  </p>
                  <button
                    onClick={() => downloadBulkCsv(generatedBulk.results)}
                    className="px-5 py-2.5 rounded-lg bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-semibold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Generated Codes CSV</span>
                  </button>
                </div>

                {generatedBulk.errors?.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300 text-[11px] space-y-1">
                    <p className="font-semibold">Skipped entries ({generatedBulk.errors.length}):</p>
                    {generatedBulk.errors.map((e, idx) => (
                      <p key={idx}>{e.discordUsername}: {e.error}</p>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowBulkModal(false)}
                  className="w-full py-2.5 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-xs font-sans font-medium uppercase tracking-wider text-typography-primary cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVoters;
