import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './FirstAid.css';
import { API_BASE, BACKEND_URL } from '../../config';
import {
  HeartPulse,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Eye,
  Upload,
  Video,
  Image as ImageIcon,
  Play,
  User,
  Clock,
  ShieldAlert,
  Share2,
  X,
  RefreshCw,
  Send,
  HelpCircle,
  MessageSquare,
  ChevronUp,
  ArrowBigUp,
  Flame,
  Sparkles,
  Tag,
  CornerDownRight,
  ChevronRight,
  Check,
  ThumbsUp
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Critical Care',
  'CPR & Life Support',
  'Trauma & Bleeding',
  'Thermal Injuries',
  'Medical Emergencies',
  'Fractures & Sprains',
  'Poisoning & Overdose',
  'Choking & Airway',
  'Bites & Stings',
  'General Care',
];

const INITIAL_SUBMIT_FORM = {
  title: '',
  content: '',
  category: 'Critical Care',
  media_type: 'image',
  image_url: '',
  video_url: '',
};

const INITIAL_ASK_FORM = {
  title: '',
  question: '',
  category: 'CPR & Life Support',
  tags: 'cpr, first-aid, emergency',
};

export default function FirstAid() {
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkId = searchParams.get('id');
  const deepLinkTab = searchParams.get('tab');
  const deepLinkQid = searchParams.get('qid');

  // Logged in user
  const [user] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  });

  const [resources, setResources] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(deepLinkTab === 'ask' ? 'ask' : 'browse'); // 'browse', 'my', 'ask'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Submission Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitForm, setSubmitForm] = useState(INITIAL_SUBMIT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Detail / Full Protocol Modal
  const [selectedGuide, setSelectedGuide] = useState(null);

  // ── Q&A (Reddit / Stack Overflow style) States ──
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [qSort, setQSort] = useState('newest'); // 'newest', 'votes', 'answers', 'unanswered'
  const [qCategory, setQCategory] = useState('All');
  const [qSearch, setQSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState(null); // detailed thread
  const [loadingThread, setLoadingThread] = useState(false);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askForm, setAskForm] = useState(INITIAL_ASK_FORM);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [newAnswerText, setNewAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [userVotes, setUserVotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('rc_qa_votes') || '{}');
    } catch {
      return {};
    }
  });

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // Fetch approved first aid resources
  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/firstaid`)
        .catch(() => axios.get(`${BACKEND_URL}/api/firstaid`));

      if (res?.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setResources(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Error fetching first aid resources:', err);
      showToast('Could not load first aid resources. Check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch member's own submissions
  const fetchMySubmissions = useCallback(async () => {
    const identifier = user.email || user.id;
    if (!identifier) return;

    try {
      const res = await axios.get(`${API_BASE}/firstaid/my/${encodeURIComponent(identifier)}`)
        .catch(() => axios.get(`${BACKEND_URL}/api/firstaid/my/${encodeURIComponent(identifier)}`));

      if (res?.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setMySubmissions(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.warn('Could not fetch user submissions:', err);
    }
  }, [user.email, user.id]);

  // Fetch Q&A Questions
  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const params = new URLSearchParams();
      if (qSort) params.append('sort', qSort);
      if (qCategory && qCategory !== 'All') params.append('category', qCategory);
      if (qSearch && qSearch.trim()) params.append('search', qSearch.trim());

      const res = await axios.get(`${API_BASE}/firstaid/questions?${params.toString()}`)
        .catch(() => axios.get(`${BACKEND_URL}/api/firstaid/questions?${params.toString()}`));

      if (res?.data?.success) {
        setQuestions(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error('Error fetching Q&A questions:', err);
    } finally {
      setLoadingQuestions(false);
    }
  }, [qSort, qCategory, qSearch]);

  // Fetch single question details with community answers
  const openQuestionThread = useCallback(async (qId) => {
    setLoadingThread(true);
    try {
      const res = await axios.get(`${API_BASE}/firstaid/questions/${qId}`)
        .catch(() => axios.get(`${BACKEND_URL}/api/firstaid/questions/${qId}`));

      if (res?.data?.success) {
        setSelectedQuestion(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching question thread:', err);
      showToast('Could not load question thread.', 'error');
    } finally {
      setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
    fetchMySubmissions();
  }, [fetchResources, fetchMySubmissions]);

  useEffect(() => {
    if (activeTab === 'ask') {
      fetchQuestions();
    }
  }, [activeTab, fetchQuestions]);

  // Deep Link Handling (e.g. from email link: /portal/firstaid?id=2 or ?tab=ask&qid=3)
  useEffect(() => {
    if (deepLinkId) {
      const existing = resources.find(r => String(r.id) === String(deepLinkId));
      if (existing) {
        setSelectedGuide(existing);
      } else {
        axios.get(`${API_BASE}/firstaid/${deepLinkId}`)
          .then(res => {
            if (res.data?.success && res.data?.data) {
              setSelectedGuide(res.data.data);
            }
          })
          .catch(err => console.warn('Could not load linked guide:', err));
      }
    }

    if (deepLinkTab === 'ask') {
      setActiveTab('ask');
      if (deepLinkQid) {
        openQuestionThread(deepLinkQid);
      }
    }
  }, [deepLinkId, deepLinkTab, deepLinkQid, resources, openQuestionThread]);

  // Filtered approved resources
  const filteredResources = useMemo(() => {
    return resources.filter(item => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchContent = (item.content || '').toLowerCase().includes(q);
        const matchCat = (item.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchContent && !matchCat) return false;
      }
      return true;
    });
  }, [resources, selectedCategory, searchTerm]);

  // File Upload Handler (Image or Video)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setUploadStatus(`Uploading ${file.name} to cloud storage...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'firstaid');

    try {
      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.success && res.data?.data?.url) {
        const uploadedUrl = res.data.data.url;
        const isVideo = file.type.startsWith('video/');

        setSubmitForm(prev => ({
          ...prev,
          media_type: isVideo ? 'video' : 'image',
          image_url: isVideo ? prev.image_url : uploadedUrl,
          video_url: isVideo ? uploadedUrl : prev.video_url,
          title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        }));
        showToast(`${isVideo ? 'Video' : 'Image'} uploaded successfully!`, 'success');
      } else {
        throw new Error(res.data?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('File upload error:', err);
      showToast(err.response?.data?.message || 'File upload failed. Ensure file size is below 20MB.', 'error');
    } finally {
      setUploadingFile(false);
      setUploadStatus(null);
      e.target.value = '';
    }
  };

  // Submit First Aid Guide for Admin Review
  const handleSubmitGuide = async (e) => {
    e.preventDefault();
    if (!submitForm.title.trim()) {
      showToast('Please provide a protocol title.', 'error');
      return;
    }
    if (!submitForm.content.trim()) {
      showToast('Please provide step-by-step instructions for the procedure.', 'error');
      return;
    }

    setSubmitting(true);
    const payload = {
      ...submitForm,
      submitted_by_name: user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Red Cross Member'),
      submitted_by_email: user.email || null,
      submitted_by_id: user.id || null,
    };

    try {
      const res = await axios.post(`${API_BASE}/firstaid/submit`, payload, { headers });
      if (res.data?.success) {
        showToast(res.data.message || 'Guide submitted! Once approved by admin, all members will be notified via email.', 'success');
        setShowSubmitModal(false);
        setSubmitForm(INITIAL_SUBMIT_FORM);
        setActiveTab('my');
        fetchMySubmissions();
      }
    } catch (err) {
      console.error('Error submitting first aid guide:', err);
      showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to submit first aid guide.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Q&A Action Handlers ──

  // Ask Question Handler
  const handleAskQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!askForm.title.trim() && !askForm.question.trim()) {
      showToast('Please provide a question title and details.', 'error');
      return;
    }

    setSubmittingQuestion(true);
    const tagArray = askForm.tags
      .split(',')
      .map(t => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ''))
      .filter(Boolean);

    const payload = {
      title: askForm.title.trim(),
      question: askForm.question.trim(),
      category: askForm.category || 'CPR & Life Support',
      tags: tagArray.length > 0 ? tagArray : ['first-aid'],
      asked_by: user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Chapter Member'),
      asked_by_email: user.email || null,
      asked_by_id: user.id || null,
      asked_by_role: user.role || 'Member',
    };

    try {
      const res = await axios.post(`${API_BASE}/firstaid/questions`, payload, { headers });
      if (res.data?.success) {
        showToast(res.data.message || 'Question posted! Email broadcast dispatched to all members and admins.', 'success');
        setShowAskModal(false);
        setAskForm(INITIAL_ASK_FORM);
        fetchQuestions();
        if (res.data.data?.id) {
          openQuestionThread(res.data.data.id);
        }
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      showToast(err.response?.data?.error || 'Failed to post question.', 'error');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Post Answer Handler
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswerText.trim() || !selectedQuestion) return;

    setSubmittingAnswer(true);
    const authorName = user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Red Cross Member');
    const authorRole = user.role || 'Member';

    try {
      const res = await axios.post(`${API_BASE}/firstaid/questions/${selectedQuestion.id}/answers`, {
        answer_text: newAnswerText.trim(),
        author_name: authorName,
        author_email: user.email || null,
        author_role: authorRole,
      }, { headers });

      if (res.data?.success) {
        showToast('Your answer has been posted! All members can now see your advice.', 'success');
        setNewAnswerText('');
        // Reload question thread
        openQuestionThread(selectedQuestion.id);
        // Refresh question list
        fetchQuestions();
      }
    } catch (err) {
      console.error('Error posting answer:', err);
      showToast(err.response?.data?.error || 'Failed to post answer.', 'error');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Upvote Question (Reddit / Stack Overflow style)
  const handleVoteQuestion = async (qId, e) => {
    if (e) e.stopPropagation();
    const userIdentifier = user.email || user.id || 'guest_user';

    try {
      const res = await axios.post(`${API_BASE}/firstaid/questions/${qId}/vote`, { userIdentifier });
      if (res.data?.success) {
        const newVotes = res.data.votes;
        const hasVoted = res.data.hasVoted;

        // Update list state
        setQuestions(prev => prev.map(q => q.id === qId ? { ...q, votes: newVotes } : q));

        // Update active thread state if open
        if (selectedQuestion && selectedQuestion.id === qId) {
          setSelectedQuestion(prev => ({ ...prev, votes: newVotes }));
        }

        // Store vote in localStorage
        setUserVotes(prev => {
          const updated = { ...prev, [`q_${qId}`]: hasVoted };
          localStorage.setItem('rc_qa_votes', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Error voting on question:', err);
    }
  };

  // Upvote Answer
  const handleVoteAnswer = async (ansId) => {
    const userIdentifier = user.email || user.id || 'guest_user';

    try {
      const res = await axios.post(`${API_BASE}/firstaid/answers/${ansId}/vote`, { userIdentifier });
      if (res.data?.success) {
        const newVotes = res.data.votes;
        const hasVoted = res.data.hasVoted;

        if (selectedQuestion && Array.isArray(selectedQuestion.answers)) {
          setSelectedQuestion(prev => ({
            ...prev,
            answers: prev.answers.map(a => a.id === ansId ? { ...a, votes: newVotes } : a),
          }));
        }

        setUserVotes(prev => {
          const updated = { ...prev, [`ans_${ansId}`]: hasVoted };
          localStorage.setItem('rc_qa_votes', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Error voting on answer:', err);
    }
  };

  // Accept Answer as Best Solution
  const handleAcceptAnswer = async (ansId) => {
    try {
      const res = await axios.patch(`${API_BASE}/firstaid/answers/${ansId}/accept`, {}, { headers });
      if (res.data?.success) {
        showToast(res.data.message || 'Accepted status updated!');
        if (selectedQuestion) {
          openQuestionThread(selectedQuestion.id);
        }
      }
    } catch (err) {
      console.error('Error accepting answer:', err);
    }
  };

  // Share Link
  const handleShare = (guide) => {
    const url = `${window.location.origin}/portal/firstaid?id=${guide.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Protocol link copied to clipboard!', 'info');
    } else {
      window.prompt('Copy protocol link:', url);
    }
  };

  const handleShareQuestion = (qId) => {
    const url = `${window.location.origin}/portal/firstaid?tab=ask&qid=${qId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Question link copied to clipboard!', 'info');
    } else {
      window.prompt('Copy question link:', url);
    }
  };

  return (
    <div className="portal-firstaid-page">
      {/* Toast */}
      {toast && (
        <div className={`portal-fa-toast toast-${toast.type}`}>
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="fa-hero-header">
        <div className="hero-content">
          <div className="hero-badge">
            <HeartPulse size={15} className="hero-heartbeat" />
            <span>Red Cross Clinical Protocols & Life Support</span>
          </div>
          <h1>First Aid Knowledge Base & Community Tutorials</h1>
          <p>
            Standard operating procedures, emergency resuscitation, and medical tutorials.
            Contribute verified techniques with step-by-step videos and photos to empower chapter responders.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-hero-primary"
              onClick={() => {
                setSubmitForm(INITIAL_SUBMIT_FORM);
                setShowSubmitModal(true);
              }}
            >
              <Upload size={16} />
              <span>Contribute First Aid Guide</span>
            </button>
            <button
              className="btn-hero-secondary"
              onClick={() => {
                setActiveTab('ask');
                setShowAskModal(true);
              }}
            >
              <HelpCircle size={16} />
              <span>Ask Community Question</span>
            </button>
          </div>
        </div>

        {/* Emergency Hotline Notice */}
        <div className="emergency-callout">
          <div className="emergency-icon-wrap">
            <ShieldAlert size={28} />
          </div>
          <div className="emergency-text">
            <strong>Critical Campus Emergency?</strong>
            <span>Do not wait. Immediately call KyU First Response or Red Cross Ambulance Dispatch:</span>
            <div className="hotline-numbers">
              <span className="hotline-pill">🚨 Hotline: 1199</span>
              <span className="hotline-pill">🚑 Emergency: 999</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="portal-tabs-nav">
        <button
          className={`portal-tab ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <HeartPulse size={16} />
          <span>Verified Protocols ({resources.length})</span>
        </button>

        <button
          className={`portal-tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          <User size={16} />
          <span>My Submissions ({mySubmissions.length})</span>
        </button>

        <button
          className={`portal-tab ${activeTab === 'ask' ? 'active' : ''}`}
          onClick={() => setActiveTab('ask')}
        >
          <MessageSquare size={16} />
          <span>Community Q&A Forum ({questions.length})</span>
        </button>
      </div>

      {/* ── TAB 1: BROWSE VERIFIED PROTOCOLS ── */}
      {activeTab === 'browse' && (
        <div className="tab-pane">
          {/* Controls: Search & Category Pills */}
          <div className="fa-filters-bar">
            <div className="fa-search-box">
              <Search size={16} className="fa-search-icon" />
              <input
                type="text"
                placeholder="Search symptom, injury, or technique (e.g. CPR, bleeding, burn)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="fa-clear-search" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="category-chips-scroll">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="fa-loading-state">
              <RefreshCw size={36} className="spin" />
              <p>Fetching clinical first aid protocols...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="fa-empty-state">
              <HeartPulse size={44} className="empty-fa-icon" />
              <h3>No protocols found matching your criteria</h3>
              <p>Try searching for a different medical keyword or clear your active category filter.</p>
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  className="btn-secondary"
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="fa-cards-grid">
              {filteredResources.map(item => {
                const isVideo = item.media_type === 'video' || item.video_url;

                return (
                  <div key={item.id} className="fa-resource-card">
                    {/* Media Display */}
                    <div className="fa-card-media" onClick={() => setSelectedGuide(item)}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="fa-card-img" />
                      ) : item.video_url ? (
                        <div className="fa-card-video-thumb">
                          <div className="fa-video-play-btn">
                            <Play size={24} />
                          </div>
                          <span>Watch Video Tutorial</span>
                        </div>
                      ) : (
                        <div className="fa-card-fallback-media">
                          <HeartPulse size={36} />
                          <span>Red Cross Emergency Procedure</span>
                        </div>
                      )}

                      {/* Badges on Media */}
                      <div className="fa-media-overlay">
                        <span className="fa-category-badge">{item.category || 'First Aid'}</span>
                        {isVideo && (
                          <span className="fa-video-indicator">
                            <Video size={12} /> Video Tutorial
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="fa-card-content">
                      <h3 className="fa-title" onClick={() => setSelectedGuide(item)}>
                        {item.title}
                      </h3>

                      <div className="fa-contributor">
                        <User size={13} />
                        <span>
                          {item.submitted_by_name ? (
                            <>Contributed by <strong>{item.submitted_by_name}</strong></>
                          ) : (
                            <>Official Kenya Red Cross Guide</>
                          )}
                        </span>
                      </div>

                      <p className="fa-excerpt">
                        {item.content ? item.content.slice(0, 140) + (item.content.length > 140 ? '...' : '') : 'Read protocol for step-by-step response steps.'}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="fa-card-footer">
                      <button
                        className="btn-view-protocol"
                        onClick={() => setSelectedGuide(item)}
                      >
                        <Eye size={15} />
                        <span>View Full Protocol</span>
                      </button>
                      <button
                        className="btn-share-icon"
                        onClick={() => handleShare(item)}
                        title="Share link to this first aid protocol"
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY SUBMISSIONS ── */}
      {activeTab === 'my' && (
        <div className="tab-pane">
          <div className="my-submissions-header">
            <div>
              <h2>My Contributed First Aid Protocols</h2>
              <p>
                Every submission is clinically reviewed by Red Cross certified administrators before publication.
                Once approved, your guide is posted live and broadcasted directly to all chapter members' emails!
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setSubmitForm(INITIAL_SUBMIT_FORM);
                setShowSubmitModal(true);
              }}
            >
              <Plus size={16} />
              <span>Submit Another Protocol</span>
            </button>
          </div>

          {mySubmissions.length === 0 ? (
            <div className="fa-empty-state">
              <Upload size={44} className="empty-fa-icon" />
              <h3>You have not submitted any first aid guides yet</h3>
              <p>
                Have experience with CPR, fracture stabilization, or emergency trauma response?
                Share your knowledge with video or photo demonstrations!
              </p>
              <button
                className="btn-primary"
                style={{ marginTop: '12px' }}
                onClick={() => {
                  setSubmitForm(INITIAL_SUBMIT_FORM);
                  setShowSubmitModal(true);
                }}
              >
                <Upload size={16} />
                <span>Upload First Aid Guide Now</span>
              </button>
            </div>
          ) : (
            <div className="my-submissions-list">
              {mySubmissions.map(item => {
                const isPending = item.status === 'pending';
                const isApproved = item.status === 'approved' || !item.status;
                const isRejected = item.status === 'rejected';

                return (
                  <div key={item.id} className="submission-item-card">
                    <div className="submission-left">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="submission-thumb" />
                      ) : (
                        <div className="submission-thumb-placeholder">
                          {item.media_type === 'video' ? <Video size={22} /> : <HeartPulse size={22} />}
                        </div>
                      )}
                      <div className="submission-info">
                        <div className="submission-cat-wrap">
                          <span className="category-pill-small">{item.category}</span>
                          <span className="submission-date">
                            Submitted on {new Date(item.created_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="submission-title">{item.title}</h4>
                        <p className="submission-preview">
                          {item.content ? item.content.slice(0, 110) + '...' : ''}
                        </p>
                        {isRejected && item.rejection_reason && (
                          <div className="rejection-alert">
                            <strong>Reviewer Feedback:</strong> {item.rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="submission-right">
                      {isPending && (
                        <div className="status-badge-pending">
                          <span className="pulse-dot"></span>
                          <span>Pending Admin Review</span>
                        </div>
                      )}
                      {isApproved && (
                        <div className="status-badge-approved">
                          <CheckCircle2 size={16} />
                          <span>Approved & Broadcasted</span>
                        </div>
                      )}
                      {isRejected && (
                        <div className="status-badge-rejected">
                          <AlertCircle size={16} />
                          <span>Revision Requested</span>
                        </div>
                      )}

                      <button
                        className="btn-secondary btn-sm"
                        style={{ marginTop: '8px' }}
                        onClick={() => setSelectedGuide(item)}
                      >
                        <Eye size={14} /> Preview
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: COMMUNITY Q&A (Reddit / Stack Overflow Style) ── */}
      {activeTab === 'ask' && (
        <div className="tab-pane">
          {/* Header & Ask Button */}
          <div className="so-header-panel">
            <div className="so-header-info">
              <h2>Emergency & First Aid Community Q&A</h2>
              <p>
                Ask clinical questions, get advice from certified first aiders and chapter medical leads,
                and vote on life-saving responses.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setAskForm(INITIAL_ASK_FORM);
                setShowAskModal(true);
              }}
            >
              <Plus size={16} />
              <span>Ask a Question</span>
            </button>
          </div>

          {/* Stack Overflow Controls Bar (Sorting + Search) */}
          <div className="so-controls-bar">
            {/* Sort Tabs (Reddit / Stack Overflow style) */}
            <div className="so-sort-tabs">
              <button
                className={`so-sort-btn ${qSort === 'newest' ? 'active' : ''}`}
                onClick={() => setQSort('newest')}
              >
                <Sparkles size={14} /> Newest
              </button>
              <button
                className={`so-sort-btn ${qSort === 'votes' ? 'active' : ''}`}
                onClick={() => setQSort('votes')}
              >
                <Flame size={14} /> Top Voted
              </button>
              <button
                className={`so-sort-btn ${qSort === 'answers' ? 'active' : ''}`}
                onClick={() => setQSort('answers')}
              >
                <MessageSquare size={14} /> Most Answered
              </button>
              <button
                className={`so-sort-btn ${qSort === 'unanswered' ? 'active' : ''}`}
                onClick={() => setQSort('unanswered')}
              >
                <HelpCircle size={14} /> Unanswered
              </button>
            </div>

            {/* Search Input */}
            <div className="so-search-box">
              <Search size={15} className="so-search-icon" />
              <input
                type="text"
                placeholder="Search questions or tags..."
                value={qSearch}
                onChange={e => setQSearch(e.target.value)}
              />
              {qSearch && (
                <button className="so-search-clear" onClick={() => setQSearch('')}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Question Feed */}
          {loadingQuestions ? (
            <div className="fa-loading-state">
              <RefreshCw size={32} className="spin" />
              <p>Loading community questions and discussions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="fa-empty-state">
              <HelpCircle size={44} className="empty-fa-icon" />
              <h3>No questions found</h3>
              <p>Be the first to ask an emergency question! All members and admins will be notified to answer.</p>
              <button
                className="btn-primary"
                style={{ marginTop: '12px' }}
                onClick={() => setShowAskModal(true)}
              >
                <Plus size={16} /> Ask Question Now
              </button>
            </div>
          ) : (
            <div className="so-questions-list">
              {questions.map(q => {
                const hasAnswers = (q.answers_count || 0) > 0;
                const isUpvoted = Boolean(userVotes[`q_${q.id}`]);

                return (
                  <div
                    key={q.id}
                    className="so-question-card"
                    onClick={() => openQuestionThread(q.id)}
                  >
                    {/* Left Metric Column (Votes & Answers) */}
                    <div className="so-stats-col">
                      <div className="so-stat-box">
                        <button
                          type="button"
                          className={`so-vote-btn ${isUpvoted ? 'voted' : ''}`}
                          onClick={(e) => handleVoteQuestion(q.id, e)}
                          title="Upvote question"
                        >
                          <ChevronUp size={20} />
                        </button>
                        <span className="so-stat-num">{q.votes || 0}</span>
                        <span className="so-stat-label">votes</span>
                      </div>

                      <div className={`so-stat-box so-answers-box ${hasAnswers ? 'has-answers' : ''}`}>
                        <span className="so-stat-num">{q.answers_count || 0}</span>
                        <span className="so-stat-label">answers</span>
                      </div>
                    </div>

                    {/* Middle Column (Title, Body snippet, Tags) */}
                    <div className="so-summary-col">
                      <h3 className="so-question-title">{q.title}</h3>
                      <p className="so-question-excerpt">
                        {q.question ? q.question.slice(0, 160) + (q.question.length > 160 ? '...' : '') : ''}
                      </p>

                      <div className="so-tags-row">
                        <span className="so-category-badge">{q.category}</span>
                        {Array.isArray(q.tags) && q.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="so-tag-pill">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right / Footer Column (Author & Timestamp) */}
                    <div className="so-author-col">
                      <div className="so-user-info">
                        <div className="so-avatar">
                          {(q.asked_by || 'U')[0].toUpperCase()}
                        </div>
                        <div className="so-user-meta">
                          <span className="so-author-name">{q.asked_by}</span>
                          <span className="so-author-role">{q.asked_by_role || 'Member'}</span>
                          <span className="so-timestamp">
                            asked {new Date(q.created_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── QUESTION THREAD MODAL (Stack Overflow Style Discussion) ── */}
      {selectedQuestion && (
        <div className="fa-modal-overlay" onClick={() => setSelectedQuestion(null)}>
          <div className="fa-modal fa-modal-thread" onClick={e => e.stopPropagation()}>
            {/* Thread Header */}
            <div className="fa-modal-header">
              <div className="modal-title-flex">
                <span className="category-pill-active">{selectedQuestion.category || 'First Aid'}</span>
                <h2>{selectedQuestion.title}</h2>
              </div>
              <button className="fa-close-btn" onClick={() => setSelectedQuestion(null)}>
                <X size={20} />
              </button>
            </div>

            {/* Thread Body */}
            <div className="thread-scroll-body">
              {/* Main Question Post */}
              <div className="thread-question-post">
                <div className="thread-vote-sidebar">
                  <button
                    className={`thread-vote-arrow ${userVotes[`q_${selectedQuestion.id}`] ? 'voted' : ''}`}
                    onClick={() => handleVoteQuestion(selectedQuestion.id)}
                    title="Upvote question"
                  >
                    <ChevronUp size={28} />
                  </button>
                  <span className="thread-vote-score">{selectedQuestion.votes || 0}</span>
                </div>

                <div className="thread-post-content">
                  <div className="thread-post-text">
                    {(selectedQuestion.question || '').split('\n').filter(Boolean).map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>

                  <div className="so-tags-row" style={{ marginTop: '16px' }}>
                    {Array.isArray(selectedQuestion.tags) && selectedQuestion.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="so-tag-pill">#{tag}</span>
                    ))}
                  </div>

                  {/* Asker Card */}
                  <div className="thread-asker-card">
                    <span className="asked-time">
                      Asked on {new Date(selectedQuestion.created_at).toLocaleString()}
                    </span>
                    <div className="asker-profile">
                      <div className="asker-avatar">
                        {(selectedQuestion.asked_by || 'U')[0].toUpperCase()}
                      </div>
                      <div className="asker-details">
                        <strong>{selectedQuestion.asked_by}</strong>
                        <span>{selectedQuestion.asked_by_role || 'Member'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Answers Header */}
              <div className="answers-header-bar">
                <h3>
                  <MessageSquare size={18} />
                  <span>
                    {Array.isArray(selectedQuestion.answers) ? selectedQuestion.answers.length : 0} Response(s)
                  </span>
                </h3>
                <span className="community-notice">Responses from medical leads & chapter peers</span>
              </div>

              {/* Answers List */}
              {loadingThread ? (
                <div className="fa-loading-state" style={{ padding: '30px' }}>
                  <RefreshCw size={24} className="spin" />
                  <p>Loading answers...</p>
                </div>
              ) : (!selectedQuestion.answers || selectedQuestion.answers.length === 0) ? (
                <div className="no-answers-box">
                  <HelpCircle size={32} />
                  <p>No answers have been posted yet. Be the first to provide certified first aid advice!</p>
                </div>
              ) : (
                <div className="answers-list">
                  {selectedQuestion.answers.map(ans => {
                    const isAccepted = ans.is_accepted;
                    const ansVoted = Boolean(userVotes[`ans_${ans.id}`]);

                    return (
                      <div key={ans.id} className={`answer-card ${isAccepted ? 'accepted-answer' : ''}`}>
                        {/* Vote Sidebar */}
                        <div className="answer-vote-sidebar">
                          <button
                            className={`thread-vote-arrow ${ansVoted ? 'voted' : ''}`}
                            onClick={() => handleVoteAnswer(ans.id)}
                            title="Upvote answer"
                          >
                            <ChevronUp size={24} />
                          </button>
                          <span className="thread-vote-score">{ans.votes || 0}</span>

                          {/* Accepted Checkmark */}
                          {isAccepted ? (
                            <div className="accepted-badge-icon" title="Accepted Solution by Community & Asker">
                              <CheckCircle2 size={24} />
                            </div>
                          ) : (
                            (user.role === 'Admin' || user.role === 'superadmin' || user.email === selectedQuestion.asked_by_email) && (
                              <button
                                className="btn-mark-accepted"
                                onClick={() => handleAcceptAnswer(ans.id)}
                                title="Mark this answer as accepted solution"
                              >
                                <Check size={16} />
                              </button>
                            )
                          )}
                        </div>

                        {/* Answer Body */}
                        <div className="answer-main">
                          {isAccepted && (
                            <div className="accepted-banner">
                              <CheckCircle2 size={16} />
                              <span>Accepted Best Emergency Solution</span>
                            </div>
                          )}

                          <div className="answer-text">
                            {(ans.answer_text || '').split('\n').filter(Boolean).map((p, idx) => (
                              <p key={idx}>{p}</p>
                            ))}
                          </div>

                          <div className="answer-footer">
                            <span className="answer-timestamp">
                              answered {new Date(ans.created_at).toLocaleString()}
                            </span>
                            <div className="answer-author-badge">
                              <div className="ans-avatar">
                                {(ans.author_name || 'R')[0].toUpperCase()}
                              </div>
                              <div className="ans-meta">
                                <strong>{ans.author_name}</strong>
                                <span className="role-tag">{ans.author_role || 'Member'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* "Your Answer" Form */}
              <div className="your-answer-section">
                <h3>Your Answer</h3>
                <p className="answer-instruction">
                  Please provide medically sound, constructive first aid steps according to Red Cross clinical guidelines.
                </p>

                <form onSubmit={handlePostAnswer} className="your-answer-form">
                  <textarea
                    rows="5"
                    required
                    placeholder="Write your detailed first aid response or procedure here..."
                    value={newAnswerText}
                    onChange={e => setNewAnswerText(e.target.value)}
                  />

                  <div className="your-answer-footer">
                    <span className="posting-as">
                      Posting as: <strong>{user.name || 'Red Cross Member'}</strong> ({user.role || 'Member'})
                    </span>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submittingAnswer || !newAnswerText.trim()}
                    >
                      {submittingAnswer ? (
                        <>
                          <RefreshCw size={15} className="spin" />
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          <span>Post Your Answer</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="fa-modal-actions">
              <button className="btn-secondary" onClick={() => handleShareQuestion(selectedQuestion.id)}>
                <Share2 size={15} /> Copy Question Link
              </button>
              <button className="btn-primary" onClick={() => setSelectedQuestion(null)}>
                Close Thread
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASK QUESTION MODAL (Broadcast to all members & admin) ── */}
      {showAskModal && (
        <div className="fa-modal-overlay" onClick={() => setShowAskModal(false)}>
          <div className="fa-modal" onClick={e => e.stopPropagation()}>
            <div className="fa-modal-header">
              <div className="modal-title-flex">
                <HelpCircle size={22} className="modal-header-icon" />
                <div>
                  <h2>Ask a First Aid / Emergency Question</h2>
                  <p className="modal-sub">Notifies all members and admins so you get fast, reliable answers</p>
                </div>
              </div>
              <button className="fa-close-btn" onClick={() => setShowAskModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAskQuestionSubmit} className="fa-modal-form">
              <div className="approval-notice-banner" style={{ background: '#eff6ff', borderColor: '#3b82f6', color: '#1e40af' }}>
                <Send size={20} style={{ color: '#2563eb' }} />
                <div>
                  <strong>Broadcast Notification:</strong> When you post this question, an instant email announcement is sent to all chapter members and administrators so our certified medical responders can assist you!
                </div>
              </div>

              <div className="form-group">
                <label>Question Title <span className="req">*</span></label>
                <div className="input-hint">Be specific and imagine you are asking a question to another responder (e.g. "What is the recommended compression rate during hypothermic cardiac arrest?")</div>
                <input
                  type="text"
                  required
                  placeholder="e.g. What is the proper procedure for treating suspected internal bleeding?"
                  value={askForm.title}
                  onChange={e => setAskForm({ ...askForm, title: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group flex-1">
                  <label>Category <span className="req">*</span></label>
                  <select
                    value={askForm.category}
                    onChange={e => setAskForm({ ...askForm, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="cpr, bleeding, trauma"
                    value={askForm.tags}
                    onChange={e => setAskForm({ ...askForm, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Detailed Question & Scenario <span className="req">*</span></label>
                <div className="input-hint">Describe the victim's symptoms, the scene, and any initial first aid steps taken.</div>
                <textarea
                  rows="6"
                  required
                  placeholder="Describe your situation or technical inquiry in detail..."
                  value={askForm.question}
                  onChange={e => setAskForm({ ...askForm, question: e.target.value })}
                />
              </div>

              <div className="fa-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAskModal(false)}
                  disabled={submittingQuestion}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submittingQuestion}
                >
                  {submittingQuestion ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      <span>Broadcasting Question...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Post & Broadcast to All</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── UPLOAD / CONTRIBUTE GUIDE MODAL ── */}
      {showSubmitModal && (
        <div className="fa-modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="fa-modal" onClick={e => e.stopPropagation()}>
            <div className="fa-modal-header">
              <div className="modal-title-flex">
                <HeartPulse size={22} className="modal-header-icon" />
                <div>
                  <h2>Contribute First Aid Guide</h2>
                  <p className="modal-sub">Share emergency procedures with video or image demonstration</p>
                </div>
              </div>
              <button className="fa-close-btn" onClick={() => setShowSubmitModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitGuide} className="fa-modal-form">
              <div className="approval-notice-banner">
                <ShieldAlert size={20} />
                <div>
                  <strong>Admin Verification & Email Broadcast:</strong> Once submitted, your guide will be reviewed by our Red Cross medical administrators. Upon approval, it will be posted to the portal and dispatched to all chapter members via email!
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group flex-2">
                  <label>Protocol Title <span className="req">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Relief of Choking in Adults (Heimlich Maneuver)"
                    value={submitForm.title}
                    onChange={e => setSubmitForm({ ...submitForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Category <span className="req">*</span></label>
                  <select
                    value={submitForm.category}
                    onChange={e => setSubmitForm({ ...submitForm, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Media Demonstration Upload Section */}
              <div className="media-upload-section">
                <label className="section-heading">Media Demonstration (Upload Video or Photo)</label>
                <div className="media-selector-tabs">
                  <button
                    type="button"
                    className={`selector-tab ${submitForm.media_type === 'image' ? 'active' : ''}`}
                    onClick={() => setSubmitForm({ ...submitForm, media_type: 'image' })}
                  >
                    <ImageIcon size={16} /> Photo Demonstration
                  </button>
                  <button
                    type="button"
                    className={`selector-tab ${submitForm.media_type === 'video' ? 'active' : ''}`}
                    onClick={() => setSubmitForm({ ...submitForm, media_type: 'video' })}
                  >
                    <Video size={16} /> Video Tutorial
                  </button>
                </div>

                {/* Dropzone */}
                <div className="fa-dropzone">
                  <input
                    type="file"
                    id="portalMediaInput"
                    style={{ display: 'none' }}
                    accept={submitForm.media_type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'}
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="portalMediaInput" className="fa-dropzone-inner">
                    {uploadingFile ? (
                      <div className="upload-loading">
                        <RefreshCw size={26} className="spin" />
                        <span>{uploadStatus || 'Streaming file to Supabase cloud storage...'}</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} className="upload-icon-pulse" />
                        <span className="dropzone-main-text">
                          Click to select and upload <strong>{submitForm.media_type === 'video' ? 'Video Demonstration (MP4, WebM)' : 'Photo Guide (JPG, PNG, WebP)'}</strong>
                        </span>
                        <span className="dropzone-sub-text">File is securely stored and streamed via Supabase CDN</span>
                      </>
                    )}
                  </label>
                </div>

                {/* External link fallback */}
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>
                    Or External {submitForm.media_type === 'video' ? 'Video' : 'Image'} URL
                  </label>
                  <input
                    type="url"
                    placeholder={submitForm.media_type === 'video' ? 'https://www.youtube.com/watch?v=... or direct MP4 link' : 'https://images.unsplash.com/...'}
                    value={submitForm.media_type === 'video' ? submitForm.video_url : submitForm.image_url}
                    onChange={e => {
                      if (submitForm.media_type === 'video') {
                        setSubmitForm({ ...submitForm, video_url: e.target.value });
                      } else {
                        setSubmitForm({ ...submitForm, image_url: e.target.value });
                      }
                    }}
                  />
                </div>

                {/* Media Preview */}
                {(submitForm.image_url || submitForm.video_url) && (
                  <div className="media-preview-area">
                    <span className="preview-heading">Attached Media Preview:</span>
                    {submitForm.media_type === 'image' && submitForm.image_url && (
                      <div className="preview-img-container">
                        <img src={submitForm.image_url} alt="Attached Preview" />
                        <button
                          type="button"
                          className="btn-clear-media"
                          onClick={() => setSubmitForm({ ...submitForm, image_url: '' })}
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    )}
                    {submitForm.media_type === 'video' && submitForm.video_url && (
                      <div className="preview-video-container">
                        {submitForm.video_url.includes('youtube.com') || submitForm.video_url.includes('youtu.be') ? (
                          <div className="yt-notice">
                            <Video size={20} />
                            <span>YouTube Video Connected: {submitForm.video_url}</span>
                          </div>
                        ) : (
                          <video src={submitForm.video_url} controls className="preview-player" />
                        )}
                        <button
                          type="button"
                          className="btn-clear-media"
                          onClick={() => setSubmitForm({ ...submitForm, video_url: '' })}
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step by step procedure */}
              <div className="form-group">
                <label>Step-by-Step Medical Procedure <span className="req">*</span></label>
                <div className="input-hint">
                  Please list each action clearly (e.g. 1. Assess the scene, 2. Check responsiveness, 3. Call 999, 4. Begin treatment)
                </div>
                <textarea
                  rows="6"
                  required
                  placeholder={"1. Ensure personal and victim safety.\n2. Gently tap shoulders and ask loudly 'Are you OK?'.\n3. Call 999 or Red Cross 1199 immediately.\n4. Perform standard treatment technique.\n5. Re-evaluate vital signs until paramedics arrive."}
                  value={submitForm.content}
                  onChange={e => setSubmitForm({ ...submitForm, content: e.target.value })}
                />
              </div>

              {/* Modal Actions */}
              <div className="fa-modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitting || uploadingFile}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="spin" />
                      <span>Submitting for Review...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAIL / FULL PROTOCOL MODAL ── */}
      {selectedGuide && (
        <div className="fa-modal-overlay" onClick={() => setSelectedGuide(null)}>
          <div className="fa-modal fa-modal-detail" onClick={e => e.stopPropagation()}>
            <div className="fa-modal-header">
              <div className="modal-title-flex">
                <span className="category-pill-active">{selectedGuide.category || 'General Care'}</span>
                <h2>{selectedGuide.title}</h2>
              </div>
              <button className="fa-close-btn" onClick={() => setSelectedGuide(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="fa-detail-body">
              {/* Media Demonstration */}
              {selectedGuide.video_url ? (
                <div className="detail-media-video">
                  {selectedGuide.video_url.includes('youtube.com') || selectedGuide.video_url.includes('youtu.be') ? (
                    <iframe
                      src={selectedGuide.video_url.replace('watch?v=', 'embed/')}
                      title={selectedGuide.title}
                      allowFullScreen
                      className="detail-iframe"
                    />
                  ) : (
                    <video src={selectedGuide.video_url} controls autoPlay muted className="detail-video" />
                  )}
                </div>
              ) : selectedGuide.image_url ? (
                <div className="detail-media-img">
                  <img src={selectedGuide.image_url} alt={selectedGuide.title} />
                </div>
              ) : null}

              {/* Author & Verification Info */}
              <div className="detail-author-bar">
                <div className="author-left">
                  <User size={16} />
                  <span>
                    Contributed by <strong>{selectedGuide.submitted_by_name || 'Kenya Red Cross KyU Chapter'}</strong>
                  </span>
                </div>
                <div className="author-right">
                  <span className="verified-pill">
                    <CheckCircle2 size={14} /> Red Cross Verified Procedure
                  </span>
                </div>
              </div>

              {/* Formatted Procedure Steps */}
              <div className="detail-steps-card">
                <h3>Recommended Action Protocol:</h3>
                <div className="steps-container">
                  {(selectedGuide.content || '').split('\n').filter(Boolean).map((step, idx) => (
                    <div key={idx} className="procedure-step-row">
                      <div className="step-circle">{idx + 1}</div>
                      <div className="step-desc">{step.replace(/^\d+[\.\)]\s*/, '')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety & Medical Warning */}
              <div className="detail-emergency-warning">
                <ShieldAlert size={22} className="warning-icon" />
                <div>
                  <strong>Medical Safety Disclaimer:</strong> This guide provides initial emergency support steps. If the individual's condition is deteriorating, or if they lose consciousness, call <strong>999</strong> or Kenya Red Cross Ambulance dispatch at <strong>1199</strong> immediately.
                </div>
              </div>
            </div>

            <div className="fa-modal-actions">
              <button className="btn-secondary" onClick={() => handleShare(selectedGuide)}>
                <Share2 size={15} /> Copy Protocol Link
              </button>
              <button className="btn-primary" onClick={() => setSelectedGuide(null)}>
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}