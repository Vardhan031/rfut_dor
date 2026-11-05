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
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export const AdminNominees = () => {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingNominee, setEditingNominee] = useState(null);
  const [formData, setFormData] = useState({
    displayName: '',
    discordUsername: '',
    imageUrl: '',
    description: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  const fetchNominees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/nominees');
      if (res.data?.success) {
        setNominees(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load nominees.');
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
      imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
      description: '',
      isActive: true
    });
    setShowModal(true);
  };

  const openEditModal = (nominee) => {
    setEditingNominee(nominee);
    setFormData({
      displayName: nominee.displayName,
      discordUsername: nominee.discordUsername,
      imageUrl: nominee.imageUrl,
      description: nominee.description || '',
      isActive: nominee.isActive
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
          fetchNominees();
          setShowModal(false);
        }
      } else {
        const res = await api.post('/nominees', formData);
        if (res.data?.success) {
          toast.success('Nominee added successfully.');
          fetchNominees();
          setShowModal(false);
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

  const handleDelete = async (nominee) => {
    if (!window.confirm(`Are you sure you want to delete "${nominee.displayName}"?`)) return;

    try {
      const res = await api.delete(`/nominees/${nominee._id}`);
      if (res.data?.success) {
        toast.success(res.data.message);
        setNominees((prev) => prev.filter((n) => n._id !== nominee._id));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete nominee.');
    }
  };

  const filtered = nominees.filter((n) => {
    const term = search.toLowerCase().trim();
    return (
      n.displayName.toLowerCase().includes(term) ||
      n.discordUsername.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-border pb-6">
        <div>
          <span className="text-[11px] font-sans font-semibold uppercase tracking-widest text-gold block mb-1">
            Governance &bull; Candidate Shortlist
          </span>
          <h1 className="font-display font-semibold text-3xl sm:text-4xl text-typography-primary uppercase tracking-wide">
            Nominee Roster
          </h1>
          <p className="text-typography-secondary text-sm font-sans mt-0.5">
            Manage official DOR award nominees, profile imagery, and ballot eligibility.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-none bg-gold hover:bg-gold text-[#0B0A08] font-display font-medium text-xs uppercase tracking-wider transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Nominee</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-none bg-surface-card border border-surface-border">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-typography-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nominees by name or Discord handle..."
            className="w-full pl-9 pr-3 py-2 rounded-none bg-background border border-surface-border text-sm font-sans text-typography-primary placeholder-typography-muted focus:outline-none focus:border-gold transition"
          />
        </div>
      </div>

      {/* Grid of Nominees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 py-16 text-center text-typography-muted font-sans text-xs">
            Loading candidate roster...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-typography-muted font-sans text-xs">
            No candidates found matching your query.
          </div>
        ) : (
          filtered.map((nominee) => (
            <div
              key={nominee._id}
              className={`p-5 rounded-none border transition-colors bg-surface-card flex flex-col justify-between ${
                nominee.isActive ? 'border-surface-border' : 'border-surface-border/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start gap-4">
                  <img
                    src={nominee.imageUrl}
                    alt={nominee.displayName}
                    className="w-16 h-16 rounded-none object-cover border border-surface-border flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80';
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-display font-semibold text-lg text-typography-primary uppercase tracking-wide truncate">
                        {nominee.displayName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium uppercase tracking-wider border ${
                          nominee.isActive
                            ? 'bg-gold/10 text-gold border-gold/30'
                            : 'bg-surface-muted text-typography-muted border-surface-border'
                        }`}
                      >
                        {nominee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-typography-secondary font-mono truncate mt-0.5">{nominee.discordUsername}</p>
                    <p className="text-xs text-typography-secondary/80 mt-2 line-clamp-2 leading-relaxed font-sans">
                      {nominee.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-surface-border flex items-center justify-between text-xs font-sans">
                <button
                  onClick={() => handleToggleActive(nominee)}
                  className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition ${
                    nominee.isActive
                      ? 'text-typography-secondary hover:text-typography-primary border-surface-border hover:border-gold/40'
                      : 'text-gold border-gold/30 hover:bg-gold/10'
                  }`}
                  title="Toggle active status"
                >
                  <Power className="w-3.5 h-3.5 text-gold/80" />
                  <span>{nominee.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(nominee)}
                    className="p-1.5 rounded-lg border border-surface-border hover:bg-surface text-typography-secondary hover:text-typography-primary transition"
                    title="Edit Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(nominee)}
                    className="p-1.5 rounded-lg border border-surface-border hover:bg-surface text-typography-muted hover:text-rose-400 transition"
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

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-card border border-surface-border rounded-none p-6 border border-surface-border relative space-y-4 font-sans">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-typography-muted hover:text-typography-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-semibold text-xl uppercase tracking-wide text-typography-primary">
              {editingNominee ? 'Edit Candidate Details' : 'Add Shortlist Nominee'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                  Display / Candidate Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="e.g. ViperX"
                  className="w-full px-3 py-2.5 rounded-none bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                  Discord Username
                </label>
                <input
                  type="text"
                  value={formData.discordUsername}
                  onChange={(e) => setFormData({ ...formData, discordUsername: e.target.value })}
                  placeholder="e.g. ViperX#1337"
                  className="w-full px-3 py-2.5 rounded-none bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-typography-secondary mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2.5 rounded-none bg-background border border-surface-border text-sm text-typography-primary focus:outline-none focus:border-gold"
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
                  placeholder="Role, major accomplishments, tournament records..."
                  className="w-full p-3 rounded-none bg-background border border-surface-border text-xs text-typography-primary focus:outline-none focus:border-gold"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded bg-background border-surface-border text-gold focus:ring-0"
                />
                <label htmlFor="isActive" className="text-xs text-typography-secondary">
                  Active in ballot candidate pool
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-none text-xs text-typography-secondary hover:text-typography-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-none bg-gold hover:bg-gold text-[#0B0A08] font-display font-medium text-xs uppercase tracking-wider shadow-sm"
                >
                  {saving ? 'Saving...' : editingNominee ? 'Update Nominee' : 'Save Nominee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
