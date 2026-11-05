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
  X
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

  // Single code form
  const [singleDiscord, setSingleDiscord] = useState('');
  const [singleCategory, setSingleCategory] = useState('Regular Member');
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

  const handleGenerateSingle = async (e) => {
    e.preventDefault();
    if (!singleDiscord.trim()) {
      toast.warning('Please enter a Discord username.');
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post('/admin/voters/generate', {
        discordUsername: singleDiscord.trim(),
        category: singleCategory
      });
      if (res.data?.success) {
        setGeneratedSingle({
          discordUsername: res.data.voter.discordUsername,
          category: res.data.voter.category,
          plaintextCode: res.data.plaintextCode
        });
        toast.success(`Voting code generated for ${res.data.voter.discordUsername}`);
        fetchVoters();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate code.');
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
      ['Discord Username,Category,Plaintext Code',
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
    toast.success('Copied code to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-gold block mb-1">
            Governance &bull; Voter Registry
          </span>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Voters & Codes
          </h1>
          <p className="text-typography-secondary text-sm font-sans mt-0.5">
            Issue cryptographically salted single-use codes linked to authorized Discord members.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setGeneratedSingle(null);
              setSingleDiscord('');
              setShowSingleModal(true);
            }}
            className="px-4 py-2 rounded-none bg-gold hover:bg-gold text-[#0B0A08] font-display font-medium text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Single Code</span>
          </button>

          <button
            onClick={() => {
              setGeneratedBulk(null);
              setBulkText('');
              setShowBulkModal(true);
            }}
            className="px-4 py-2 rounded-none bg-surface-card hover:bg-surface-hover text-typography-primary border border-surface-border hover:border-gold/50 font-display font-medium text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-gold/80" />
            <span>Bulk Generation</span>
          </button>

          <button
            onClick={handleExportVotersCsv}
            className="px-3.5 py-2 rounded-none border border-surface-border bg-surface-card hover:bg-surface-hover text-typography-secondary hover:text-typography-primary text-xs font-sans transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-none bg-surface-card border border-surface-border flex flex-col sm:flex-row items-center gap-3">
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
            className="w-full pl-9 pr-3 py-2 rounded-none bg-background border border-surface-border text-sm font-sans text-typography-primary placeholder-typography-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition"
          />
        </div>

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44 px-3 py-2 rounded-none bg-background border border-surface-border text-xs font-sans text-typography-primary focus:outline-none focus:border-gold"
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
          className="w-full sm:w-40 px-3 py-2 rounded-none bg-background border border-surface-border text-xs font-sans text-typography-primary focus:outline-none focus:border-gold"
        >
          <option value="">All Statuses</option>
          <option value="VOTED">Voted</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-card border border-surface-border rounded-none overflow-hidden border border-surface-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-surface border-b border-surface-border text-typography-secondary font-medium uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Discord Handle</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Code Status</th>
                <th className="py-3.5 px-4">Ballot Status</th>
                <th className="py-3.5 px-4">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-typography-muted">
                    Loading registry records...
                  </td>
                </tr>
              ) : voters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-typography-muted">
                    No voters found matching your search.
                  </td>
                </tr>
              ) : (
                voters.map((v) => (
                  <tr key={v._id} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-typography-primary">
                      {v.discordUsername}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-sans font-medium uppercase tracking-wider bg-surface-muted text-gold border border-surface-border">
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-typography-muted font-mono text-[11px] flex items-center gap-1.5">
                        <Key className="w-3 h-3 text-gold/70" />
                        Assigned
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {v.hasVoted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/30 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3 text-gold" />
                          Voted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-muted text-typography-muted border border-surface-border text-[11px]">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-typography-secondary font-mono text-[11px]">
                      {v.votedAt ? new Date(v.votedAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-border flex items-center justify-between text-xs text-typography-secondary font-sans">
          <span>
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total voters)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-surface-border hover:bg-surface disabled:opacity-20 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-surface-border hover:bg-surface disabled:opacity-20 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SINGLE CODE MODAL */}
      {showSingleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-surface-border rounded-none p-6 border border-surface-border relative space-y-4">
            <button
              onClick={() => setShowSingleModal(false)}
              className="absolute top-4 right-4 text-typography-muted hover:text-typography-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-semibold text-xl uppercase tracking-wide text-typography-primary">
              Issue Individual Voting Code
            </h3>

            {!generatedSingle ? (
              <form onSubmit={handleGenerateSingle} className="space-y-4 pt-1 font-sans">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                    Discord Username
                  </label>
                  <input
                    type="text"
                    value={singleDiscord}
                    onChange={(e) => setSingleDiscord(e.target.value)}
                    placeholder="e.g. Member#1001"
                    className="w-full px-3 py-2.5 rounded-none bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-gold"
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
                    className="w-full px-3 py-2.5 rounded-none bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-gold"
                  >
                    <option value="Regular Member">Regular Member</option>
                    <option value="Staff">Staff</option>
                    <option value="Journo">Journo</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSingleModal(false)}
                    className="px-4 py-2 rounded-none text-xs font-sans text-typography-secondary hover:text-typography-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-5 py-2.5 rounded-none bg-gold hover:bg-gold text-[#0B0A08] font-display font-medium text-xs uppercase tracking-wider shadow-sm"
                  >
                    {generating ? 'Generating...' : 'Issue Code'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-1 font-sans">
                <div className="p-3 rounded-none bg-gold/10 border border-gold/30 text-gold text-xs">
                  Credentials issued for <strong>{generatedSingle.discordUsername}</strong> ({generatedSingle.category}).
                </div>

                <div className="p-4 rounded-none bg-background border border-surface-border text-center space-y-2">
                  <span className="text-[10px] text-typography-muted uppercase tracking-widest block font-mono">
                    Generated Plaintext Code
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-bold text-2xl text-gold tracking-widest">
                      {generatedSingle.plaintextCode}
                    </span>
                    <button
                      onClick={() => copyToClipboard(generatedSingle.plaintextCode)}
                      className="p-2 rounded-lg bg-surface hover:bg-surface-hover text-typography-secondary hover:text-gold transition"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-none bg-surface border border-surface-border text-typography-secondary text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-gold mt-0.5" />
                  <span>
                    Provide this code to the voter now. Plaintext codes are never stored in the database.
                  </span>
                </div>

                <button
                  onClick={() => setShowSingleModal(false)}
                  className="w-full py-2.5 rounded-none bg-surface hover:bg-surface-hover border border-surface-border text-xs font-display font-medium uppercase tracking-wider text-typography-primary"
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
          <div className="max-w-lg w-full bg-surface-card border border-surface-border rounded-none p-6 border border-surface-border relative space-y-4">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 text-typography-muted hover:text-typography-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-semibold text-xl uppercase tracking-wide text-typography-primary">
              Bulk Code Generation
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
                    className="w-full px-3 py-2 rounded-none bg-background border border-surface-border text-xs text-typography-primary focus:outline-none focus:border-gold"
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
                    className="w-full p-3 rounded-none bg-background border border-surface-border text-xs font-mono text-typography-primary placeholder-typography-muted focus:outline-none focus:border-gold"
                    required
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 rounded-none text-xs text-typography-secondary hover:text-typography-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generating}
                    className="px-5 py-2.5 rounded-none bg-gold hover:bg-gold text-[#0B0A08] font-display font-medium text-xs uppercase tracking-wider shadow-sm"
                  >
                    {generating ? 'Processing Codes...' : 'Generate Codes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-1 font-sans">
                <div className="p-3 rounded-none bg-gold/10 border border-gold/30 text-gold text-xs">
                  Successfully generated <strong>{generatedBulk.generatedCount}</strong> voting codes.
                </div>

                <div className="p-4 rounded-none bg-background border border-surface-border text-center space-y-3">
                  <p className="text-xs text-typography-secondary">
                    Download the CSV now to distribute the codes to your members. Plaintext codes are not retained on the server.
                  </p>
                  <button
                    onClick={() => downloadBulkCsv(generatedBulk.results)}
                    className="px-5 py-2.5 rounded-none bg-gold hover:bg-gold text-[#0B0A08] font-display font-medium text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Generated Codes CSV</span>
                  </button>
                </div>

                {generatedBulk.errors?.length > 0 && (
                  <div className="p-3 rounded-none bg-rose-950/20 border border-rose-900/40 text-rose-300 text-[11px] space-y-1">
                    <p className="font-semibold">Skipped entries ({generatedBulk.errors.length}):</p>
                    {generatedBulk.errors.map((e, idx) => (
                      <p key={idx}>{e.discordUsername}: {e.error}</p>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setShowBulkModal(false)}
                  className="w-full py-2.5 rounded-none bg-surface hover:bg-surface-hover border border-surface-border text-xs font-display font-medium uppercase tracking-wider text-typography-primary"
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
