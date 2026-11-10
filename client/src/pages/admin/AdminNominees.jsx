import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Award,
  Plus,
  Search,
  Edit,
  Trash2,
  Power,
  X,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminNominees = () => {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add / Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingNominee, setEditingNominee] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    discordUsername: '',
    description: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  // Delete confirmations
  const [nomineeToDelete, setNomineeToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchNominees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/nominees/admin');
      if (res.data?.success) {
        setNominees(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load nominees list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominees();
  }, []);

  const openAddModal = () => {
    setEditingNominee(null);
    setFormData({
      displayName: '',
      discordUsername: '',
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (nominee) => {
    setEditingNominee(nominee);
    setFormData({
      displayName: nominee.displayName || '',
      discordUsername: nominee.discordUsername || '',
      description: nominee.description || '',
      isActive: nominee.isActive !== false
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.discordUsername.trim()) {
      toast.warning('Display name and Discord username are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingNominee) {
        const res = await api.put(`/nominees/${editingNominee._id}`, formData);
        if (res.data?.success) {
          toast.success('Nominee updated successfully.');
          setNominees((prev) =>
            prev.map((n) => (n._id === editingNominee._id ? res.data.data : n))
          );
          setShowModal(false);
          fetchNominees();
        }
      } else {
        const res = await api.post('/nominees', formData);
        if (res.data?.success) {
          toast.success('Nominee added successfully.');
          setNominees((prev) => [res.data.data, ...prev]);
          setShowModal(false);
          fetchNominees();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save nominee.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (nominee) => {
    try {
      const res = await api.patch(`/nominees/${nominee._id}/toggle`);
      if (res.data?.success) {
        toast.success(res.data.message);
        setNominees((prev) =>
          prev.map((n) => (n._id === nominee._id ? { ...n, isActive: !n.isActive } : n))
        );
      }
    } catch (err) {
      toast.error('Failed to toggle status.');
    }
  };

  const handleDeleteNominee = async () => {
    if (!nomineeToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/nominees/${nomineeToDelete._id}`);
      if (res.data?.success) {
        toast.success(res.data.message);
        setNominees((prev) => prev.filter((n) => n._id !== nomineeToDelete._id));
        setNomineeToDelete(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete nominee.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllNominees = async () => {
    setDeleting(true);
    try {
      const res = await api.delete('/nominees/all');
      if (res.data?.success) {
        toast.success(res.data.message || 'All nominees have been cleared.');
        setNominees([]);
        setShowDeleteAllModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete all nominees.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = nominees.filter((n) => {
    const term = search.toLowerCase().trim();
    return (
      (n.displayName || '').toLowerCase().includes(term) ||
      (n.discordUsername || '').toLowerCase().includes(term)
    );
  });

  const totalCount = nominees.length;
  const activeCount = nominees.filter((n) => n.isActive).length;
  const inactiveCount = totalCount - activeCount;

  const cleanDiscord = (handle) => {
    if (!handle) return '';
    return handle.replace(/^@/, '');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Nominee Roster
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {nominees.length > 0 && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              className="px-4 py-2 rounded-xl border border-rose-900/50 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 font-sans font-medium text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Delete All Nominees</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] font-sans font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-[0_2px_14px_rgba(212,175,87,0.3)] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Nominee</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Badges & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-widest text-typography-muted">Total Shortlist</p>
            <p className="font-playfair text-2xl font-bold text-typography-primary mt-0.5">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4AF57]/10 border border-[#D4AF57]/20 flex items-center justify-center text-[#D4AF57]">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-widest text-typography-muted">Active in Ballot</p>
            <p className="font-playfair text-2xl font-bold text-emerald-400 mt-0.5">{activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/30 border border-emerald-800/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-sans uppercase tracking-widest text-typography-muted">Inactive / Benched</p>
            <p className="font-playfair text-2xl font-bold text-typography-secondary mt-0.5">{inactiveCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#1A1712] border border-surface-border flex items-center justify-center text-typography-muted">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-surface-card border border-surface-border flex items-center shadow-sm">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-typography-muted">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or Discord..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-surface-border text-xs font-sans text-typography-primary placeholder-typography-muted focus:outline-none focus:border-[#D4AF57] focus:ring-1 focus:ring-[#D4AF57]/30 transition"
            />
          </div>
        </div>
      </div>

      {/* Grid of Nominees (Pure Awards Plaque - No Profile Photos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-20 text-center text-typography-muted font-sans text-xs flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#D4AF57] border-t-transparent rounded-full animate-spin" />
            <span>Loading candidate shortlist from database...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-20 text-center text-typography-muted font-sans text-xs bg-surface-card/40 border border-surface-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3">
            <Award className="w-10 h-10 text-[#D4AF57]/40" />
            <p className="text-sm font-medium text-typography-secondary">
              {search ? 'No nominees match your search.' : 'No candidates registered in database.'}
            </p>
            <p className="text-xs text-typography-muted max-w-sm">
              {search
                ? 'Try searching with a different keyword or clear your filter.'
                : 'Click "Add New Nominee" above to create candidate entries for the ballot.'}
            </p>
            {!search && (
              <button
                onClick={openAddModal}
                className="mt-2 px-4 py-2 rounded-xl bg-[#D4AF57] hover:bg-[#E8C97B] text-[#0A0907] font-sans font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Nominee</span>
              </button>
            )}
          </div>
        ) : (
          filtered.map((nominee) => (
            <div
              key={nominee._id}
              className={`p-5 rounded-2xl border transition-all duration-300 bg-surface-card flex flex-col justify-between relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.7),0_0_20px_rgba(212,175,87,0.12)] hover:border-[#D4AF57]/60 ${
                nominee.isActive ? 'border-surface-border' : 'border-surface-border/50 opacity-60'
              }`}
            >
              {/* Subtle Luxury Top Accent Bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 transition-all ${
                  nominee.isActive
                    ? 'bg-gradient-to-r from-transparent via-[#D4AF57]/60 to-transparent group-hover:via-[#D4AF57]'
                    : 'bg-transparent'
                }`}
              />

              <div>
                {/* Header row: Initial Monogram Badge + Name + Active Status Badge */}
                <div className="flex items-start gap-3.5">
                  {/* Luxury Monogram Badge (replaces photo completely) */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#262016] to-[#14110C] border border-[#52442A] group-hover:border-[#D4AF57] flex items-center justify-center text-[#D4AF57] font-playfair font-bold text-lg shadow-inner flex-shrink-0 transition-colors">
                    {nominee.displayName?.charAt(0)?.toUpperCase() || <Award className="w-5 h-5 text-[#D4AF57]" />}
                  </div>

                  {/* Nominee Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <h3 className="font-playfair font-bold text-lg text-typography-primary uppercase tracking-wide truncate group-hover:text-[#E8C97B] transition-colors">
                        {nominee.displayName}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider border flex items-center gap-1.5 flex-shrink-0 ${
                          nominee.isActive
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50 shadow-sm'
                            : 'bg-[#181510] text-typography-muted border-surface-border'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            nominee.isActive ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-[#706859]'
                          }`}
                        />
                        <span>{nominee.isActive ? 'Active' : 'Inactive'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#D4AF57] font-mono truncate mt-0.5">
                      @{cleanDiscord(nominee.discordUsername)}
                    </p>
                  </div>
                </div>

                {/* Description / Accolades quote */}
                <div className="mt-4 pt-3 border-t border-surface-border/60">
                  <p className="text-xs text-typography-secondary font-sans leading-relaxed line-clamp-2 italic pl-2.5 border-l-2 border-[#D4AF57]/40">
                    {nominee.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Reworked Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-surface-border flex items-center justify-between gap-2 text-xs font-sans">
                {/* Activate / Deactivate Pill Button */}
                <button
                  type="button"
                  onClick={() => handleToggleActive(nominee)}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-[11px] font-sans uppercase tracking-wider font-semibold transition-all cursor-pointer shadow-sm active:scale-95 ${
                    nominee.isActive
                      ? 'border-surface-border bg-[#181510] hover:bg-amber-950/30 text-typography-secondary hover:text-amber-300 hover:border-amber-700/60'
                      : 'border-emerald-800/60 bg-emerald-950/30 hover:bg-emerald-950/50 text-emerald-400 hover:border-emerald-500'
                  }`}
                  title="Toggle ballot eligibility"
                >
                  <Power className={`w-3.5 h-3.5 ${nominee.isActive ? 'text-[#D4AF57]' : 'text-emerald-400'}`} />
                  <span>{nominee.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(nominee)}
                    className="px-3 py-1.5 rounded-xl border border-surface-border bg-[#181510] hover:bg-[#D4AF57]/15 text-typography-secondary hover:text-[#E8C97B] hover:border-[#D4AF57]/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    title="Edit Nominee"
                  >
                    <Edit className="w-3.5 h-3.5 text-[#D4AF57]" />
                    <span className="text-[11px] uppercase tracking-wider font-medium">Edit</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setNomineeToDelete(nominee)}
                    className="p-2 rounded-xl border border-surface-border bg-[#181510] hover:bg-rose-950/30 text-typography-muted hover:text-rose-400 hover:border-rose-800/60 transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Delete Nominee"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL (No Profile Picture Input) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-surface-border rounded-2xl p-6 relative space-y-4 font-sans shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-typography-muted hover:text-typography-primary p-1 rounded-lg hover:bg-[#181510] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#D4AF57] block mb-0.5">
                {editingNominee ? 'Edit Candidate' : 'New Shortlist Entry'}
              </span>
              <h3 className="font-playfair font-bold text-xl uppercase tracking-wide text-typography-primary">
                {editingNominee ? 'Update Candidate Profile' : 'Add Candidate Nominee'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                  Display / Candidate Name <span className="text-[#D4AF57]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. Kylian Mbappe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-[#D4AF57] focus:ring-1 focus:ring-[#D4AF57]/30 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                  Discord Username <span className="text-[#D4AF57]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.discordUsername}
                  onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                  placeholder="e.g. mbappe_9"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-[#D4AF57] focus:ring-1 focus:ring-[#D4AF57]/30 transition font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                  Accolades & Achievements
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Role, major accomplishments, community highlights..."
                  className="w-full p-3 rounded-xl bg-background border border-surface-border text-xs text-typography-primary focus:outline-none focus:border-[#D4AF57] focus:ring-1 focus:ring-[#D4AF57]/30 transition"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#D4AF57] cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs text-typography-secondary cursor-pointer select-none">
                  Active on voting ballot (Eligible for voter selection)
                </label>
              </div>

              <div className="pt-3 border-t border-surface-border flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-typography-secondary hover:text-typography-primary hover:bg-[#181510] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF57] via-[#E8C97B] to-[#D4AF57] hover:brightness-110 text-[#0A0907] font-sans font-bold text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingNominee ? 'Update Nominee' : 'Save Nominee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SINGLE NOMINEE CONFIRMATION MODAL */}
      {nomineeToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-rose-900/50 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-playfair font-bold text-lg text-typography-primary uppercase">
                  Delete Nominee?
                </h3>
                <p className="text-xs text-typography-secondary mt-1">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-typography-primary font-mono">
                    {nomineeToDelete.displayName}
                  </span>{' '}
                  (@{cleanDiscord(nomineeToDelete.discordUsername)})?
                </p>
                <p className="text-[11px] text-rose-400/80 mt-2">
                  Notice: Nominees that have already received votes in submitted ballots cannot be deleted. If votes have been cast, deactivate them instead.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setNomineeToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs text-typography-secondary hover:text-typography-primary hover:bg-[#181510] transition cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteNominee}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-sans font-semibold text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ALL NOMINEES CONFIRMATION MODAL */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-rose-900/60 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-playfair font-bold text-lg text-typography-primary uppercase">
                  Purge All Nominees?
                </h3>
                <p className="text-xs text-typography-secondary mt-1">
                  This will permanently delete <span className="font-semibold text-rose-400">ALL {nominees.length} nominees</span> from the candidate database.
                </p>
                <p className="text-[11px] text-rose-400/80 mt-2 font-mono">
                  This action is irreversible. The ballot shortlist will be completely emptied.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-typography-secondary hover:text-typography-primary hover:bg-[#181510] transition cursor-pointer"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllNominees}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-sans font-semibold text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {deleting ? 'Purging All...' : 'Purge All Nominees'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNominees;
