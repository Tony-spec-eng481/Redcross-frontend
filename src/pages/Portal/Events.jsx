import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './Events.css';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  XCircle,
  Tag,
  Info,
  Layers
} from 'lucide-react';

const CATEGORIES = [
  'General',
  'First Aid & CPR',
  'Blood Donation',
  'Community Outreach',
  'Training Workshop',
  'Disaster Preparedness',
  'Youth & Leadership',
  'Annual Meeting'
];

const INITIAL_FORM = {
  title: '',
  category: 'General',
  date: '',
  time: '09:00',
  location: '',
  description: '',
  image_url: ''
};

const resolveEventImage = (img) => {
  if (!img) return 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('/uploads/')) {
    return img;
  }
  return `https://kyuchapter.netlify.app/images/${img}`;
};

export default function PortalEvents() {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-events'
  const [approvedEvents, setApprovedEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deletingId, setDeletingId] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Get current logged-in member
  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Member User', email: 'member@student.ku.ac.ke' };
    } catch {
      return { name: 'Member User', email: 'member@student.ku.ac.ke' };
    }
  }, []);

  // Fetch Approved Events
  const fetchApprovedEvents = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/v1/events');
      const data = Array.isArray(res.data) ? res.data : res.data?.data;
      if (Array.isArray(data)) setApprovedEvents(data);
    } catch {
      try {
        const res2 = await axios.get('http://localhost:5000/api/events');
        const data2 = Array.isArray(res2.data) ? res2.data : res2.data?.data;
        if (Array.isArray(data2)) setApprovedEvents(data2);
      } catch (err) {
        console.error('Error fetching approved events:', err);
      }
    }
  }, []);

  // Fetch Member's Submitted Events
  const fetchMyEvents = useCallback(async () => {
    if (!currentUser?.email && !currentUser?.name) return;
    try {
      const email = currentUser.email || '';
      const name = currentUser.name || '';
      const res = await axios.get(`http://localhost:5000/api/v1/events/my?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data;
      if (Array.isArray(data)) setMyEvents(data);
    } catch {
      try {
        const email = currentUser.email || '';
        const name = currentUser.name || '';
        const res2 = await axios.get(`http://localhost:5000/api/events/my?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
        const data2 = Array.isArray(res2.data) ? res2.data : res2.data?.data;
        if (Array.isArray(data2)) setMyEvents(data2);
      } catch (err) {
        console.error('Error fetching my events:', err);
      }
    }
  }, [currentUser]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchApprovedEvents(), fetchMyEvents()]);
    setLoading(false);
  }, [fetchApprovedEvents, fetchMyEvents]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Filtered lists
  const filteredApproved = useMemo(() => {
    return approvedEvents.filter(ev => {
      if (categoryFilter !== 'all' && (ev.category || 'General').toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const titleMatch = (ev.title || '').toLowerCase().includes(q);
        const locMatch = (ev.location || '').toLowerCase().includes(q);
        const descMatch = (ev.description || '').toLowerCase().includes(q);
        if (!titleMatch && !locMatch && !descMatch) return false;
      }
      return true;
    });
  }, [approvedEvents, categoryFilter, searchTerm]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEditModal = (ev) => {
    setEditingId(ev.id);
    setForm({
      title: ev.title || '',
      category: ev.category || 'General',
      date: ev.date || '',
      time: ev.time || '09:00',
      location: ev.location || '',
      description: ev.description || '',
      image_url: ev.image_url || ''
    });
    setShowModal(true);
  };

  const handleSaveProposal = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) {
      showToast('Event title is required.', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      submitted_by_name: currentUser.name || 'Member',
      submitted_by_email: currentUser.email || '',
      submitted_by: currentUser.id || null,
    };

    try {
      if (editingId) {
        await axios.patch(`http://localhost:5000/api/v1/events/${editingId}`, payload);
        showToast('Event updated and re-submitted for admin review.');
      } else {
        await axios.post('http://localhost:5000/api/v1/events', payload);
        showToast('Event proposed successfully! An admin will review and approve it soon.');
        setActiveTab('my-events');
      }
      setShowModal(false);
      loadAll();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error saving event proposal.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteProposal = async () => {
    if (!deletingId) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/events/${deletingId}`);
      showToast('Event proposal removed.');
      setDeletingId(null);
      loadAll();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete event proposal.', 'error');
    }
  };

  return (
    <div className="portal-events-page">
      {/* Toast */}
      {toast && (
        <div className={`portal-toast ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="portal-events-header">
        <div className="portal-header-text">
          <h2>
            <Calendar size={26} color="#dc2626" />
            Chapter Events & Activities
          </h2>
          <p>
            Stay informed on upcoming university volunteer events or propose activities for admin approval.
          </p>
        </div>
        <button className="btn-propose-event" onClick={openCreateModal}>
          <Plus size={18} />
          + Propose New Event
        </button>
      </div>

      {/* Tabs */}
      <div className="portal-tabs-nav">
        <button
          className={`portal-tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <Calendar size={16} />
          Upcoming Chapter Events
          <span className="badge-counter">{approvedEvents.length}</span>
        </button>
        <button
          className={`portal-tab-btn ${activeTab === 'my-events' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-events')}
        >
          <Layers size={16} />
          My Submitted Events
          <span className="badge-counter">{myEvents.length}</span>
        </button>
      </div>

      {/* TAB 1: BROWSE UPCOMING APPROVED EVENTS */}
      {activeTab === 'browse' && (
        <>
          {/* Filters */}
          <div className="portal-filter-bar">
            <div className="portal-search-wrap">
              <Search size={15} className="search-icon-pos" />
              <input
                type="text"
                className="portal-search-input"
                placeholder="Search upcoming events..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="portal-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="portal-empty-box">
              <Clock3 size={32} color="#94a3b8" />
              <h4>Loading chapter events...</h4>
            </div>
          ) : filteredApproved.length === 0 ? (
            <div className="portal-empty-box">
              <Calendar size={36} color="#dc2626" />
              <h4>No Upcoming Events Found</h4>
              <p>There are currently no events matching your filter. Check back soon or propose one!</p>
              <button className="btn-propose-event" onClick={openCreateModal}>
                + Propose an Event
              </button>
            </div>
          ) : (
            <div className="portal-events-grid">
              {filteredApproved.map(ev => (
                <div key={ev.id} className="portal-event-card">
                  <div className="portal-card-thumb">
                    <img
                      src={resolveEventImage(ev.image_url)}
                      alt={ev.title}
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800';
                      }}
                    />
                    <span className="thumb-tag-badge">{ev.category || 'General'}</span>
                    <span className="thumb-status-badge approved">
                      <CheckCircle2 size={12} /> Live Event
                    </span>
                  </div>

                  <div className="portal-card-body">
                    <div className="portal-event-date-row">
                      <Calendar size={13} />
                      <span>{ev.date ? new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date to be announced'}</span>
                      {ev.time && (
                        <>
                          <span>•</span>
                          <Clock size={13} />
                          <span>{ev.time}</span>
                        </>
                      )}
                    </div>

                    <h3>{ev.title}</h3>

                    <div className="portal-card-meta">
                      <MapPin size={13} color="#dc2626" />
                      <span>{ev.location || 'Kirinyaga University Campus'}</span>
                    </div>

                    <p className="portal-card-desc">{ev.description || 'Open to all chapter members and students.'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY SUBMITTED EVENTS (PENDING / APPROVED / REJECTED) */}
      {activeTab === 'my-events' && (
        <>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Info size={20} color="#dc2626" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13.5px', color: '#475569' }}>
              Events you propose are reviewed by chapter administrators. Once approved, they automatically appear on the main website and chapter schedule.
            </span>
          </div>

          {loading ? (
            <div className="portal-empty-box">
              <Clock3 size={32} color="#94a3b8" />
              <h4>Loading your submissions...</h4>
            </div>
          ) : myEvents.length === 0 ? (
            <div className="portal-empty-box">
              <Layers size={36} color="#94a3b8" />
              <h4>No Proposed Events Yet</h4>
              <p>You haven't submitted any event proposals. Organizing a volunteer activity or workshop?</p>
              <button className="btn-propose-event" onClick={openCreateModal}>
                + Propose Your First Event
              </button>
            </div>
          ) : (
            <div className="portal-events-grid">
              {myEvents.map(ev => {
                const status = (ev.status || 'pending').toLowerCase();
                return (
                  <div key={ev.id} className="portal-event-card">
                    <div className="portal-card-thumb">
                      <img
                        src={resolveEventImage(ev.image_url)}
                        alt={ev.title}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800';
                        }}
                      />
                      <span className="thumb-tag-badge">{ev.category || 'General'}</span>
                      <span className={`thumb-status-badge ${status}`}>
                        {status === 'approved' && <CheckCircle2 size={12} />}
                        {status === 'pending' && <Clock size={12} />}
                        {status === 'rejected' && <XCircle size={12} />}
                        {status === 'approved' ? 'Approved' : status === 'pending' ? 'Pending Approval' : 'Rejected'}
                      </span>
                    </div>

                    <div className="portal-card-body">
                      <div className="portal-event-date-row">
                        <Calendar size={13} />
                        <span>{ev.date ? new Date(ev.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}</span>
                        {ev.time && (
                          <>
                            <span>•</span>
                            <Clock size={13} />
                            <span>{ev.time}</span>
                          </>
                        )}
                      </div>

                      <h3>{ev.title}</h3>

                      <div className="portal-card-meta">
                        <MapPin size={13} color="#dc2626" />
                        <span>{ev.location || 'Venue TBD'}</span>
                      </div>

                      <p className="portal-card-desc">{ev.description || 'No description provided.'}</p>

                      {status === 'rejected' && ev.rejection_reason && (
                        <div className="portal-rejection-alert">
                          <strong>Admin Feedback:</strong>
                          {ev.rejection_reason}
                        </div>
                      )}
                    </div>

                    <div className="portal-card-footer">
                      <button
                        className="btn-card-edit"
                        onClick={() => openEditModal(ev)}
                      >
                        <Edit2 size={13} />
                        Edit Proposal
                      </button>
                      <button
                        className="btn-card-delete"
                        onClick={() => setDeletingId(ev.id)}
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PROPOSE / EDIT EVENT MODAL */}
      {showModal && (
        <div className="portal-modal-overlay" onClick={() => !saving && setShowModal(false)}>
          <div className="portal-modal" onClick={e => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3>{editingId ? 'Edit Proposed Event' : 'Propose a Chapter Event'}</h3>
              <button
                className="portal-modal-close"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProposal} className="portal-modal-form">
              <div className="portal-form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peer First Aid Refresher Workshop"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="portal-form-group">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="portal-form-grid">
                <div className="portal-form-group">
                  <label>Proposed Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div className="portal-form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="portal-form-group">
                <label>Proposed Venue / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Science Complex Lab 2 / Hostel Common Room"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </div>

              <div className="portal-form-group">
                <label>Banner Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                />
              </div>

              <div className="portal-form-group">
                <label>Event Description & Objectives</label>
                <textarea
                  rows={4}
                  placeholder="Describe what the event entails, intended participants, expected supplies or preparation needed..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="btn-card-edit"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-propose-event"
                  disabled={saving}
                >
                  {saving ? 'Submitting...' : editingId ? 'Update Proposal' : 'Submit for Admin Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingId && (
        <div className="portal-modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="portal-modal" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="portal-modal-header">
              <h3>Delete Event Proposal</h3>
              <button className="portal-modal-close" onClick={() => setDeletingId(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="portal-modal-form">
              <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
                Are you sure you want to delete this event proposal? This action cannot be undone.
              </p>

              <div className="portal-modal-footer" style={{ padding: '14px 0 0 0', background: 'transparent' }}>
                <button
                  className="btn-card-edit"
                  onClick={() => setDeletingId(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-card-delete"
                  onClick={confirmDeleteProposal}
                >
                  Delete Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}