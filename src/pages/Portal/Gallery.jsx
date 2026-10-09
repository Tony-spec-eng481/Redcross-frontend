import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config';

const API = `${API_BASE}/gallery`;

const CATEGORIES = ['General', 'Team', 'Outreach', 'Events', 'Training', 'Community', 'Blood Donation', 'Campus'];

export default function PortalGallery() {
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch { return {}; }
  });

  const [approvedGallery, setApprovedGallery] = useState([]);
  const [myGallery, setMyGallery] = useState([]);
  const [activeTab, setActiveTab] = useState('community');
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', image_url: '', category: 'General', description: '' });
  const [uploadedList, setUploadedList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  // Delete modal
  const [deletingItem, setDeletingItem] = useState(null);

  // Preview modal
  const [previewItem, setPreviewItem] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const [approvedRes, myRes] = await Promise.all([
        axios.get(`${API}/member/${user.id || 0}`, { headers }),
        user.id ? axios.get(`${API}/my/${user.id}`, { headers }) : Promise.resolve({ data: { data: [] } }),
      ]);

      const approved = approvedRes.data?.data || approvedRes.data || [];
      setApprovedGallery(Array.isArray(approved) ? approved : []);

      const mine = myRes.data?.data || myRes.data || [];
      setMyGallery(Array.isArray(mine) ? mine : []);
    } catch (err) {
      console.error('Error fetching gallery:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  // Multiple Image Upload Handler
  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('folder', 'gallery');

    try {
      const res = await axios.post(`${API_BASE}/upload/multiple`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrls = [];
      if (res.data?.success && Array.isArray(res.data?.data)) {
        res.data.data.forEach((fileObj) => {
          if (fileObj.url) uploadedUrls.push(fileObj.url);
        });
      } else if (Array.isArray(res.data)) {
        res.data.forEach((fileObj) => {
          if (fileObj.url) uploadedUrls.push(fileObj.url);
        });
      }

      if (uploadedUrls.length > 0) {
        const newItems = uploadedUrls.map((url, i) => ({
          id: Date.now() + i,
          url,
          title: form.title ? `${form.title} (${i + 1})` : files[i]?.name?.replace(/\.[^/.]+$/, '') || `Photo ${i + 1}`,
          category: form.category || 'General',
          description: form.description || '',
        }));

        setUploadedList((prev) => [...prev, ...newItems]);
        setForm((prev) => ({ ...prev, image_url: uploadedUrls[0] }));
        showToast(`${uploadedUrls.length} image(s) uploaded successfully!`);
      } else {
        showToast('No image URLs returned from server.', 'error');
      }
    } catch (err) {
      console.error('Multi upload error:', err);
      // Fallback to single sequential uploads
      try {
        const uploadedUrls = [];
        for (const file of files) {
          const singleData = new FormData();
          singleData.append('file', file);
          singleData.append('folder', 'gallery');
          const singleRes = await axios.post(`${API_BASE}/upload`, singleData, {
            headers: { ...headers, 'Content-Type': 'multipart/form-data' },
          });
          const url = singleRes.data?.data?.url || singleRes.data?.url;
          if (url) uploadedUrls.push({ url, name: file.name });
        }
        if (uploadedUrls.length > 0) {
          const newItems = uploadedUrls.map((item, i) => ({
            id: Date.now() + i,
            url: item.url,
            title: form.title ? `${form.title} (${i + 1})` : item.name?.replace(/\.[^/.]+$/, '') || `Photo ${i + 1}`,
            category: form.category || 'General',
            description: form.description || '',
          }));
          setUploadedList((prev) => [...prev, ...newItems]);
          setForm((prev) => ({ ...prev, image_url: uploadedUrls[0].url }));
          showToast(`${uploadedUrls.length} image(s) uploaded successfully!`);
        }
      } catch (fallbackErr) {
        console.error('Fallback upload error:', fallbackErr);
        showToast('Failed to upload images.', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  // Submit new gallery item or batch items
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingId && uploadedList.length > 0) {
      setSaving(true);
      try {
        const itemsToSubmit = uploadedList.map((item) => ({
          title: item.title || form.title || 'Submitted Photo',
          image_url: item.url,
          category: item.category || form.category || 'General',
          description: item.description || form.description || '',
          member_id: user.id,
          member_name: user.name || '',
          member_email: user.email || '',
        }));

        await axios.post(`${API}/submit-multiple`, {
          items: itemsToSubmit,
          member_id: user.id,
          member_name: user.name || '',
          member_email: user.email || '',
        }, { headers });

        showToast(`${itemsToSubmit.length} photo(s) submitted for admin review!`);
        setShowForm(false);
        setEditingId(null);
        setForm({ title: '', image_url: '', category: 'General', description: '' });
        setUploadedList([]);
        fetchGallery();
      } catch (err) {
        console.error('Submit multiple error:', err);
        showToast('Failed to submit photos.', 'error');
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!form.image_url) {
      showToast('Please upload or provide an image URL.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await axios.patch(`${API}/member/${editingId}`, {
          ...form,
          member_id: user.id,
        }, { headers });
        showToast('Photo updated! It will be re-reviewed by an admin.');
      } else {
        await axios.post(`${API}/submit`, {
          ...form,
          member_id: user.id,
          member_name: user.name || '',
          member_email: user.email || '',
        }, { headers });
        showToast('Photo submitted for admin review!');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', image_url: '', category: 'General', description: '' });
      setUploadedList([]);
      fetchGallery();
    } catch (err) {
      console.error('Submit error:', err);
      showToast('Failed to submit photo.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Edit own item
  const openEditForm = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title || '',
      image_url: item.image_url || '',
      category: item.category || 'General',
      description: item.description || '',
    });
    setShowForm(true);
    setActiveTab('my-photos');
  };

  // Delete own item
  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await axios.delete(`${API}/member/${deletingItem.id}`, {
        data: { member_id: user.id },
        headers,
      });
      showToast('Photo deleted.');
      setDeletingItem(null);
      fetchGallery();
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete photo.', 'error');
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { background: '#fef3c7', color: '#92400e' },
      approved: { background: '#dcfce7', color: '#166534' },
      rejected: { background: '#fee2e2', color: '#991b1b' },
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="portal-page">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 2000,
          padding: '14px 20px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          animation: 'fadeIn 0.2s ease',
          ...(toast.type === 'success'
            ? { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' }
            : { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' })
        }}>
          {toast.message}
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.6 }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a' }}>📸 Community Gallery</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Browse approved photos and submit your own</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', image_url: '', category: 'General', description: '' }); setActiveTab('my-photos'); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.target.style.background = '#b91c1c'; e.target.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.target.style.background = '#dc2626'; e.target.style.transform = 'none'; }}
        >
          ＋ Submit Photo
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 22, width: 'fit-content' }}>
        {[
          { key: 'community', label: `Community Gallery (${approvedGallery.length})` },
          { key: 'my-photos', label: `My Submissions (${myGallery.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              borderRight: tab.key === 'community' ? '1px solid #e2e8f0' : 'none',
              ...(activeTab === tab.key
                ? { background: '#dc2626', color: 'white' }
                : { background: 'white', color: '#64748b' }),
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submit/Edit Form */}
      {showForm && activeTab === 'my-photos' && (
        <div style={{
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
          padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750, color: '#0f172a' }}>
              {editingId ? '✏️ Edit Photo' : '📤 Submit New Photo'}
            </h3>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
          </div>
          <form onSubmit={handleSubmit}>
            {/* Image upload area */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: '#0f172a', marginBottom: 6 }}>
                Images (Select single or multiple files) *
              </label>

              {/* Uploaded items list preview */}
              {uploadedList.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 12 }}>
                  {uploadedList.map((item, index) => (
                    <div key={item.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #cbd5e1', background: '#0f172a' }}>
                      <img src={item.url} alt={`Upload ${index + 1}`} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = uploadedList.filter((_, i) => i !== index);
                          setUploadedList(updated);
                          if (updated.length > 0) setForm(prev => ({ ...prev, image_url: updated[0].url }));
                          else setForm(prev => ({ ...prev, image_url: '' }));
                        }}
                        style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                      >
                        ✕
                      </button>
                      <input
                        type="text"
                        placeholder={`Title #${index + 1}`}
                        value={item.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setUploadedList(prev => prev.map((it, idx) => idx === index ? { ...it, title: val } : it));
                        }}
                        style={{ width: '100%', border: 'none', padding: '4px 6px', fontSize: 11, background: '#1e293b', color: 'white', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {form.image_url && uploadedList.length === 0 ? (
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 8 }}>
                  <img src={form.image_url} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, image_url: '' }))}
                    style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '30px 20px', border: '2px dashed #dc2626', borderRadius: 10, cursor: 'pointer', color: '#64748b', background: '#fff5f5', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 28 }}>📸</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {uploading ? 'Uploading Images...' : 'Click or Drag to Upload Multiple Images'}
                  </span>
                  <span style={{ fontSize: 11.5, color: '#dc2626', fontWeight: 600 }}>
                    Select multiple files at the same time (JPG, PNG, WEBP)
                  </span>
                  <input type="file" multiple accept="image/*" onChange={handleMultipleUpload} disabled={uploading} hidden />
                </label>
              )}

              {uploading && <p style={{ fontSize: 12, color: '#dc2626', fontWeight: 600, margin: '6px 0 0' }}>Uploading files, please wait...</p>}

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>Or paste single image URL:</span>
                <input type="text" placeholder="https://example.com/image.jpg" value={form.image_url}
                  onChange={(e) => setForm(prev => ({ ...prev, image_url: e.target.value }))}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: '#0f172a', marginBottom: 6 }}>Title / Batch Headline *</label>
              <input type="text" required={uploadedList.length === 0} placeholder="Give your photo or batch a title" value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, boxSizing: 'border-box' }} />
            </div>

            {/* Category & Description row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: '#0f172a', marginBottom: 6 }}>Category</label>
                <select value={form.category} onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, boxSizing: 'border-box' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 650, color: '#0f172a', marginBottom: 6 }}>Description (optional)</label>
                <input type="text" placeholder="Brief description for your photo(s)..." value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>

            <p style={{ fontSize: 12, color: '#f59e0b', margin: '0 0 16px', fontWeight: 500 }}>
              ⚠️ Your photo(s) will be reviewed by an admin before appearing in the community gallery.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setUploadedList([]); }}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={saving || uploading}
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (saving || uploading) ? 0.6 : 1 }}>
                {saving ? 'Submitting...' : uploadedList.length > 1 ? `Submit ${uploadedList.length} Photos` : editingId ? 'Update Photo' : 'Submit Photo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <p style={{ fontSize: 14 }}>Loading gallery...</p>
        </div>
      ) : activeTab === 'community' ? (
        /* Community Gallery Grid */
        approvedGallery.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>📷</p>
            <h3 style={{ fontSize: 16, color: '#64748b', margin: '0 0 6px' }}>No photos yet</h3>
            <p style={{ fontSize: 13 }}>Be the first to submit a photo!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {approvedGallery.map(item => (
              <div key={item.id} onClick={() => setPreviewItem(item)} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ height: 180, overflow: 'hidden', background: '#f1f5f9' }}>
                  <img src={item.image_url || item.url} alt={item.title} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: '#f1f5f9', color: '#64748b' }}>{item.category || 'General'}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(item.created_at)}</span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.4 }}>{item.title}</h4>
                  {item.submitted_by_name && <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>by {item.submitted_by_name}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* My Submissions Grid */
        myGallery.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <p style={{ fontSize: 40, marginBottom: 8 }}>🖼️</p>
            <h3 style={{ fontSize: 16, color: '#64748b', margin: '0 0 6px' }}>No submissions yet</h3>
            <p style={{ fontSize: 13 }}>Submit your first photo to the community gallery!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {myGallery.map(item => (
              <div key={item.id} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ height: 180, overflow: 'hidden', background: '#f1f5f9', cursor: 'pointer' }} onClick={() => setPreviewItem(item)}>
                  <img src={item.image_url || item.url} alt={item.title} loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 650, padding: '3px 10px', borderRadius: 20,
                      ...getStatusStyle(item.status),
                    }}>
                      {item.status === 'pending' ? '⏳ Pending' : item.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: '#f1f5f9', color: '#64748b' }}>{item.category || 'General'}</span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{item.title}</h4>
                  {item.description && <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 8px', lineHeight: 1.5 }}>{item.description}</p>}
                  {item.rejection_reason && (
                    <p style={{ fontSize: 12, color: '#991b1b', margin: '0 0 8px', padding: '8px 10px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                      <strong>Rejection reason:</strong> {item.rejection_reason}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(item.created_at)}</span>
                    <span style={{ flex: 1 }}></span>
                    <button onClick={() => openEditForm(item)}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 11, fontWeight: 650, cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.target.style.background = '#e0e7ff'; e.target.style.borderColor = '#a5b4fc'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
                    >✏️ Edit</button>
                    <button onClick={() => setDeletingItem(item)}
                      style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#dc2626', fontSize: 11, fontWeight: 650, cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.target.style.background = '#fee2e2'; e.target.style.borderColor = '#fca5a5'; }}
                      onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e2e8f0'; }}
                    >🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div onClick={() => setPreviewItem(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 24,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            maxWidth: 720, width: '100%', background: 'white', borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          }}>
            <div style={{ position: 'relative' }}>
              <img src={previewItem.image_url || previewItem.url} alt={previewItem.title}
                style={{ width: '100%', maxHeight: 450, objectFit: 'contain', background: '#0f172a', display: 'block' }} />
              <button onClick={() => setPreviewItem(null)} style={{
                position: 'absolute', top: 14, right: 14, width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 750, margin: '0 0 8px', color: '#0f172a' }}>{previewItem.title}</h3>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: '#f1f5f9', color: '#64748b' }}>{previewItem.category || 'General'}</span>
                {previewItem.submitted_by_name && <span style={{ fontSize: 12, color: '#94a3b8' }}>by {previewItem.submitted_by_name}</span>}
              </div>
              {previewItem.description && <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{previewItem.description}</p>}
              <a href={previewItem.image_url || previewItem.url} target="_blank" rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 13, color: '#dc2626', fontWeight: 600, textDecoration: 'none' }}>
                🔗 Open Original
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingItem && (
        <div onClick={() => setDeletingItem(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: 24,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            maxWidth: 420, width: '100%', background: 'white', borderRadius: 14, overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750, color: '#dc2626' }}>🗑️ Delete Photo</h3>
              <button onClick={() => setDeletingItem(null)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 24, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.6 }}>
                Are you sure you want to delete <strong>"{deletingItem.title}"</strong>? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
                <button onClick={() => setDeletingItem(null)}
                  style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleDelete}
                  style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#ef4444', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}