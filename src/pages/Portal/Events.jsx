import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { API_BASE, BACKEND_URL } from '../../config';
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
  Layers,
  UploadCloud,
  Link,
  Loader2
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

  // Modals & Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deletingId, setDeletingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'link'

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Field Level Validation
  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'title':
        if (!value.trim()) {
          errorMsg = 'Event title is required.';
        } else if (value.trim().length < 3) {
          errorMsg = 'Title must be at least 3 characters long.';
        }
        break;
      case 'category':
        if (!value) {
          errorMsg = 'Please select a category.';
        }
        break;
      case 'date':
        if (!value) {
          errorMsg = 'Event date is required.';
        }
        break;
      case 'time':
        if (!value) {
          errorMsg = 'Start time is required.';
        }
        break;
      case 'location':
        if (!value.trim()) {
          errorMsg = 'Venue / Location is required.';
        }
        break;
      case 'description':
        if (!value.trim()) {
          errorMsg = 'Event description & objectives are required.';
        } else if (value.trim().length < 10) {
          errorMsg = 'Description must be at least 10 characters.';
        }
        break;
      case 'image_url':
        if (value && value.trim() && !value.startsWith('http://') && !value.startsWith('https://') && !value.startsWith('/') && !value.startsWith('data:')) {
          errorMsg = 'Please enter a valid URL (starting with http:// or https://).';
        }
        break;
      default:
        break;
    }

    setErrors(prev => {
      const copy = { ...prev };
      if (errorMsg) copy[name] = errorMsg;
      else delete copy[name];
      return copy;
    });
    return !errorMsg;
  };

  const validateAll = () => {
    const newErrors = {};
    if (!form.title.trim()) {
      newErrors.title = 'Event title is required.';
    } else if (form.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long.';
    }

    if (!form.category) {
      newErrors.category = 'Please select an event category.';
    }

    if (!form.date) {
      newErrors.date = 'Proposed event date is required.';
    }

    if (!form.time) {
      newErrors.time = 'Start time is required.';
    }

    if (!form.location.trim()) {
      newErrors.location = 'Venue / Location is required.';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Event description & objectives are required.';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long.';
    }

    if (form.image_url && form.image_url.trim() && !form.image_url.startsWith('http://') && !form.image_url.startsWith('https://') && !form.image_url.startsWith('/') && !form.image_url.startsWith('data:')) {
      newErrors.image_url = 'Please enter a valid URL (starting with http:// or https://).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image File Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image_url: 'Please select a valid image file (PNG, JPG, WEBP, etc).' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image_url: 'Image file size should be less than 5MB.' }));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'events');
    setUploading(true);
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.image_url;
      return copy;
    });

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const url = res.data?.data?.url || res.data?.url;
      if (url) {
        setForm(prev => ({ ...prev, image_url: url }));
        showToast('Image uploaded successfully!');
      } else {
        throw new Error('No URL returned from server.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setErrors(prev => ({ ...prev, image_url: 'Failed to upload image. Please try again or paste a link.' }));
      showToast('Failed to upload image.', 'error');
    } finally {
      setUploading(false);
    }
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
      const res = await axios.get(`${API_BASE}/events`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data;
      if (Array.isArray(data)) setApprovedEvents(data);
    } catch {
      try {
        const res2 = await axios.get(`${BACKEND_URL}/api/events`);
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
      const res = await axios.get(`${API_BASE}/events/my?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.data;
      if (Array.isArray(data)) setMyEvents(data);
    } catch {
      try {
        const email = currentUser.email || '';
        const name = currentUser.name || '';
        const res2 = await axios.get(`${BACKEND_URL}/api/events/my?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`);
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
    setErrors({});
    setImageTab('upload');
    setShowModal(true);
  };

  const openEditModal = (ev) => {
    setEditingId(ev.id);
    const imgUrl = ev.image_url || '';
    setForm({
      title: ev.title || '',
      category: ev.category || 'General',
      date: ev.date || '',
      time: ev.time || '09:00',
      location: ev.location || '',
      description: ev.description || '',
      image_url: imgUrl
    });
    setErrors({});
    setImageTab(imgUrl ? 'link' : 'upload');
    setShowModal(true);
  };

  const handleSaveProposal = async (e) => {
    e?.preventDefault();
    if (!validateAll()) {
      showToast('Please fix the highlighted errors before submitting.', 'error');
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
        await axios.patch(`${API_BASE}/events/${editingId}`, payload);
        showToast('Event updated and re-submitted for admin review.');
      } else {
        await axios.post(`${API_BASE}/events`, payload);
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
      await axios.delete(`${API_BASE}/events/${deletingId}`);
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

            <form onSubmit={handleSaveProposal} className="portal-modal-form" noValidate>
              <div className={`portal-form-group ${errors.title ? 'has-error' : ''}`}>
                <label htmlFor="event-title">Event Title *</label>
                <input
                  id="event-title"
                  type="text"
                  placeholder="e.g. Peer First Aid Refresher Workshop"
                  value={form.title}
                  onChange={e => {
                    setForm({ ...form, title: e.target.value });
                    validateField('title', e.target.value);
                  }}
                  className={errors.title ? 'input-error' : ''}
                />
                {errors.title && (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    {errors.title}
                  </span>
                )}
              </div>

              <div className={`portal-form-group ${errors.category ? 'has-error' : ''}`}>
                <label htmlFor="event-category">Category *</label>
                <select
                  id="event-category"
                  value={form.category}
                  onChange={e => {
                    setForm({ ...form, category: e.target.value });
                    validateField('category', e.target.value);
                  }}
                  className={errors.category ? 'input-error' : ''}
                >
                  <option value="">-- Select a Category --</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    {errors.category}
                  </span>
                )}
              </div>

              <div className="portal-form-grid">
                <div className={`portal-form-group ${errors.date ? 'has-error' : ''}`}>
                  <label htmlFor="event-date">Proposed Date *</label>
                  <input
                    id="event-date"
                    type="date"
                    value={form.date}
                    onChange={e => {
                      setForm({ ...form, date: e.target.value });
                      validateField('date', e.target.value);
                    }}
                    className={errors.date ? 'input-error' : ''}
                  />
                  {errors.date && (
                    <span className="field-error-msg">
                      <AlertCircle size={13} />
                      {errors.date}
                    </span>
                  )}
                </div>

                <div className={`portal-form-group ${errors.time ? 'has-error' : ''}`}>
                  <label htmlFor="event-time">Start Time *</label>
                  <input
                    id="event-time"
                    type="time"
                    value={form.time}
                    onChange={e => {
                      setForm({ ...form, time: e.target.value });
                      validateField('time', e.target.value);
                    }}
                    className={errors.time ? 'input-error' : ''}
                  />
                  {errors.time && (
                    <span className="field-error-msg">
                      <AlertCircle size={13} />
                      {errors.time}
                    </span>
                  )}
                </div>
              </div>

              <div className={`portal-form-group ${errors.location ? 'has-error' : ''}`}>
                <label htmlFor="event-location">Proposed Venue / Location *</label>
                <input
                  id="event-location"
                  type="text"
                  placeholder="e.g. Science Complex Lab 2 / Hostel Common Room"
                  value={form.location}
                  onChange={e => {
                    setForm({ ...form, location: e.target.value });
                    validateField('location', e.target.value);
                  }}
                  className={errors.location ? 'input-error' : ''}
                />
                {errors.location && (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    {errors.location}
                  </span>
                )}
              </div>

              {/* Event Image Upload or Link Section */}
              <div className={`portal-form-group ${errors.image_url ? 'has-error' : ''}`}>
                <div className="image-section-header">
                  <label>Event Image / Banner</label>
                  <div className="image-input-tabs">
                    <button
                      type="button"
                      className={`image-tab-btn ${imageTab === 'upload' ? 'active' : ''}`}
                      onClick={() => setImageTab('upload')}
                    >
                      <UploadCloud size={13} />
                      Upload File
                    </button>
                    <button
                      type="button"
                      className={`image-tab-btn ${imageTab === 'link' ? 'active' : ''}`}
                      onClick={() => setImageTab('link')}
                    >
                      <Link size={13} />
                      Paste URL
                    </button>
                  </div>
                </div>

                {imageTab === 'upload' ? (
                  <div className="dropzone-container">
                    <label htmlFor="event-file-upload" className={`dropzone-box ${uploading ? 'uploading' : ''}`}>
                      {uploading ? (
                        <>
                          <Loader2 size={24} className="spin-loader" />
                          <p>Uploading image to server...</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud size={26} color="#dc2626" />
                          <p><strong>Click to select an image file</strong> from your device</p>
                          <span>Supports PNG, JPG, JPEG, WEBP (Max 5MB)</span>
                        </>
                      )}
                    </label>
                    <input
                      id="event-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                  </div>
                ) : (
                  <input
                    id="event-image-url"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={form.image_url}
                    onChange={e => {
                      setForm({ ...form, image_url: e.target.value });
                      validateField('image_url', e.target.value);
                    }}
                    className={errors.image_url ? 'input-error' : ''}
                  />
                )}

                {/* Live Banner Image Preview */}
                {form.image_url && (
                  <div className="image-preview-wrapper">
                    <img src={resolveEventImage(form.image_url)} alt="Banner Preview" />
                    <button
                      type="button"
                      className="btn-remove-preview"
                      title="Remove image"
                      onClick={() => setForm({ ...form, image_url: '' })}
                    >
                      <X size={14} />
                    </button>
                    <span className="preview-tag">
                      {form.image_url.startsWith('http') ? 'Image Preview' : 'Uploaded File'}
                    </span>
                  </div>
                )}

                {errors.image_url && (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    {errors.image_url}
                  </span>
                )}
              </div>

              <div className={`portal-form-group ${errors.description ? 'has-error' : ''}`}>
                <label htmlFor="event-description">Event Description & Objectives *</label>
                <textarea
                  id="event-description"
                  rows={4}
                  placeholder="Describe what the event entails, intended participants, expected supplies or preparation needed..."
                  value={form.description}
                  onChange={e => {
                    setForm({ ...form, description: e.target.value });
                    validateField('description', e.target.value);
                  }}
                  className={errors.description ? 'input-error' : ''}
                />
                {errors.description && (
                  <span className="field-error-msg">
                    <AlertCircle size={13} />
                    {errors.description}
                  </span>
                )}
              </div>

              <div className="portal-modal-footer">
                <button
                  type="button"
                  className="btn-card-edit"
                  onClick={() => setShowModal(false)}
                  disabled={saving || uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-propose-event"
                  disabled={saving || uploading}
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