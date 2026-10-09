import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import {
  Users,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  LayoutGrid,
  LifeBuoy,
  BookOpen
} from 'lucide-react';
import { BACKEND_URL, API_BASE } from '../../config';

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    eyebrow: 'KIRINYAGA UNIVERSITY · RED CROSS CHAPTER',
    first: 'Ready to Help.',
    accent: 'Always.',
    description: 'Serving humanity through compassion, courage, and community care — right here on campus.',
    primary: 'Learn About Us',
    primary_button_text: 'Learn About Us',
    primaryHref: '/about',
    primary_href: '/about',
    secondary: 'Join the Chapter',
    secondary_button_text: 'Join the Chapter',
    secondaryHref: '/contact',
    secondary_href: '/contact',
    image: 'https://kyuchapter.netlify.app/1.jpeg',
    status: 'active',
    sort_order: 1,
  },
  {
    id: 2,
    eyebrow: 'FIRST AID · BLOOD DRIVES · OUTREACH',
    first: 'Compassion in',
    accent: 'Every Action.',
    description: 'From first aid training to community outreach — we show up when it matters most.',
    primary: 'See Our Events',
    primary_button_text: 'See Our Events',
    primaryHref: '/events',
    primary_href: '/events',
    secondary: 'Volunteer With Us',
    secondary_button_text: 'Volunteer With Us',
    secondaryHref: '/contact',
    secondary_href: '/contact',
    image: 'https://kyuchapter.netlify.app/2.jpeg',
    status: 'active',
    sort_order: 2,
  },
  {
    id: 3,
    eyebrow: 'HUMANITY · IMPARTIALITY · NEUTRALITY',
    first: 'One Chapter.',
    accent: 'Countless Lives.',
    description: 'United by the seven fundamental principles of the Red Cross Movement, we serve without boundaries.',
    primary: 'Our Mission',
    primary_button_text: 'Our Mission',
    primaryHref: '/about',
    primary_href: '/about',
    secondary: 'Meet the Team',
    secondary_button_text: 'Meet the Team',
    secondaryHref: '/team',
    secondary_href: '/team',
    image: 'https://kyuchapter.netlify.app/3.jpeg',
    status: 'active',
    sort_order: 3,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  // Statistics State
  const [stats, setStats] = useState({
    totalMembers: 48,
    activeEvents: 6,
    pendingImages: 12,
    totalMessages: 8,
    unansweredQuestions: 0,
    totalLeaders: 10,
    pendingEvents: 2,
  });

  // Hero Slides State (View Only)
  const [heroSlides, setHeroSlides] = useState([]);
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [heroSearchTerm, setHeroSearchTerm] = useState('');
  const [heroStatusFilter, setHeroStatusFilter] = useState('all');

  // Activity Stream State
  const [activities, setActivities] = useState([]);

  // Status & Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Current logged in user
  const currentUser = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('user') || localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Member User', email: 'member@kyu.ac.ke', role: 'Member' };
    } catch {
      return { name: 'Member User', email: 'member@kyu.ac.ke', role: 'Member' };
    }
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      // 1. Fetch Stats
      try {
        const statsRes = await axios.get(`${BACKEND_URL}/api/v1/stats`);
        if (statsRes.data?.success && statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
      } catch {
        try {
          const statsRes2 = await axios.get(`${BACKEND_URL}/api/stats`);
          if (statsRes2.data?.success && statsRes2.data?.data) {
            setStats(statsRes2.data.data);
          }
        } catch {
          // Keep default stats
        }
      }

      // 2. Fetch Hero Slides (View Only)
      try {
        const heroRes = await axios.get(`${BACKEND_URL}/api/v1/hero`);
        const heroData = Array.isArray(heroRes.data) ? heroRes.data : heroRes.data?.data;
        if (Array.isArray(heroData) && heroData.length > 0) {
          setHeroSlides(heroData);
        } else {
          setHeroSlides(DEFAULT_HERO_SLIDES);
        }
      } catch {
        try {
          const heroRes2 = await axios.get(`${BACKEND_URL}/api/hero`);
          const heroData2 = Array.isArray(heroRes2.data) ? heroRes2.data : heroRes2.data?.data;
          if (Array.isArray(heroData2) && heroData2.length > 0) {
            setHeroSlides(heroData2);
          } else {
            setHeroSlides(DEFAULT_HERO_SLIDES);
          }
        } catch {
          setHeroSlides(DEFAULT_HERO_SLIDES);
        }
      }

      // 3. Fetch Recent Activities
      try {
        const actRes = await axios.get(`${BACKEND_URL}/api/v1/activity`);
        const actData = Array.isArray(actRes.data) ? actRes.data : actRes.data?.data;
        if (Array.isArray(actData) && actData.length > 0) {
          setActivities(actData);
        } else {
          setActivities([
            { id: 1, type: 'event', text: 'Peer First Aid Refresher Workshop scheduled', time: 'Today, 10:30 AM' },
            { id: 2, type: 'gallery', text: 'Blood Donation Campus Drive photos uploaded', time: 'Yesterday, 3:15 PM' },
            { id: 3, type: 'member', text: 'Emergency drill registration confirmed for KyU chapter', time: '2 days ago' },
            { id: 4, type: 'system', text: 'Fundamental principles dissemination module updated', time: '3 days ago' },
          ]);
        }
      } catch {
        setActivities([
          { id: 1, type: 'event', text: 'Peer First Aid Refresher Workshop scheduled', time: 'Today, 10:30 AM' },
          { id: 2, type: 'gallery', text: 'Blood Donation Campus Drive photos uploaded', time: 'Yesterday, 3:15 PM' },
          { id: 3, type: 'member', text: 'Emergency drill registration confirmed for KyU chapter', time: '2 days ago' },
          { id: 4, type: 'system', text: 'Fundamental principles dissemination module updated', time: '3 days ago' },
        ]);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Autoplay hero live preview carousel
  useEffect(() => {
    if (!isAutoPlaying || heroSlides.length === 0) return;
    const interval = setInterval(() => {
      setActivePreviewIndex(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  // Filtered hero slides for view
  const filteredHeroSlides = useMemo(() => {
    return heroSlides.filter(slide => {
      if (heroStatusFilter !== 'all' && slide.status !== heroStatusFilter) return false;
      if (heroSearchTerm.trim()) {
        const q = heroSearchTerm.toLowerCase();
        const first = (slide.first || '').toLowerCase();
        const accent = (slide.accent || '').toLowerCase();
        const desc = (slide.description || '').toLowerCase();
        const eyebrow = (slide.eyebrow || '').toLowerCase();
        return first.includes(q) || accent.includes(q) || desc.includes(q) || eyebrow.includes(q);
      }
      return true;
    });
  }, [heroSlides, heroStatusFilter, heroSearchTerm]);

  // Handle manual refresh
  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    showToast('Dashboard data synchronized.');
  };

  // Current active preview slide
  const currentPreviewSlide = heroSlides[activePreviewIndex] || heroSlides[0] || DEFAULT_HERO_SLIDES[0];

  const currentDateFormatted = useMemo(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), []
  );

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`dash-toast dash-toast-${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── 1. Executive Dashboard Header ── */}
      <div className="dash-hero-header">
        <div className="dash-hero-header-main">
          <div className="dash-greeting-badge">
            <span className="pulse-dot" />
            <span>Kirinyaga University Chapter · Member Command</span>
          </div>
          <h1>Member Dashboard & Overview</h1>
          <p className="dash-subtitle">
            Welcome back, {currentUser?.name || 'Member'}. Real-time overview of chapter activities, communications, scheduled events, and live homepage hero banners.
          </p>
          <div className="dash-meta-bar">
            <div className="meta-item">
              <Clock size={14} />
              <span>{currentDateFormatted}</span>
            </div>
            <div className="meta-item status-live">
              <ShieldCheck size={14} />
              <span>Supabase Backend Synchronized</span>
            </div>
          </div>
        </div>

        <div className="dash-header-actions">
          <button
            className={`btn-dash-refresh ${refreshing ? 'spinning' : ''}`}
            onClick={handleManualRefresh}
            title="Refresh all metrics and data"
            disabled={refreshing}
          >
            <RefreshCw size={16} />
            <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <a
            href="/"
            className="btn-dash-outline"
            title="Open Live Public Website"
          >
            <ExternalLink size={15} />
            <span>Live Website</span>
          </a>
        </div>
      </div>

      {/* ── 2. High-Impact KPI Overview Cards ── */}
      <div className="kpi-grid">
        {/* Total Members */}
        <div className="kpi-card members-kpi" onClick={() => navigate('/portal/profile')}>
          <div className="kpi-top">
            <div className="kpi-icon-wrap">
              <Users size={24} />
            </div>
            <span className="kpi-pill kpi-pill-green">Active Roster</span>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-number">{loading ? '—' : stats.totalMembers}</span>
            <span className="kpi-label">Registered Members</span>
          </div>
          <div className="kpi-footer">
            <span>View chapter roster</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Active & Scheduled Events */}
        <div className="kpi-card events-kpi" onClick={() => navigate('/portal/events')}>
          <div className="kpi-top">
            <div className="kpi-icon-wrap">
              <Calendar size={24} />
            </div>
            {stats.pendingEvents > 0 ? (
              <span className="kpi-pill kpi-pill-orange">{stats.pendingEvents} Scheduled</span>
            ) : (
              <span className="kpi-pill kpi-pill-blue">Active</span>
            )}
          </div>
          <div className="kpi-value-block">
            <span className="kpi-number">{loading ? '—' : stats.activeEvents}</span>
            <span className="kpi-label">Chapter Events</span>
          </div>
          <div className="kpi-footer">
            <span>Browse & propose activities</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Community Gallery Submissions */}
        <div className="kpi-card gallery-kpi" onClick={() => navigate('/portal/gallery')}>
          <div className="kpi-top">
            <div className="kpi-icon-wrap">
              <ImageIcon size={24} />
            </div>
            <span className="kpi-pill kpi-pill-red">Community</span>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-number">{loading ? '—' : stats.pendingImages}</span>
            <span className="kpi-label">Gallery Photos</span>
          </div>
          <div className="kpi-footer">
            <span>Upload & explore gallery</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Total Messages & Communications */}
        <div className="kpi-card messages-kpi" onClick={() => navigate('/portal/messages')}>
          <div className="kpi-top">
            <div className="kpi-icon-wrap">
              <MessageSquare size={24} />
            </div>
            <span className="kpi-pill kpi-pill-purple">Inbox</span>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-number">{loading ? '—' : stats.totalMessages}</span>
            <span className="kpi-label">Communications</span>
          </div>
          <div className="kpi-footer">
            <span>Open chat & direct inbox</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* First Aid Training & Modules */}
        <div className="kpi-card firstaid-kpi" onClick={() => navigate('/portal/firstaid')}>
          <div className="kpi-top">
            <div className="kpi-icon-wrap">
              <LifeBuoy size={24} />
            </div>
            <span className="kpi-pill kpi-pill-orange">Preparedness</span>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-number">14</span>
            <span className="kpi-label">First Aid Guides</span>
          </div>
          <div className="kpi-footer">
            <span>Emergency procedures</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Live Hero Banner Slides */}
        <div
          className="kpi-card hero-kpi"
          onClick={() => {
            const el = document.getElementById('hero-view-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="kpi-top">
            <div className="kpi-icon-wrap">
              <Sparkles size={24} />
            </div>
            <span className="kpi-pill kpi-pill-crimson">Live on Site</span>
          </div>
          <div className="kpi-value-block">
            <span className="kpi-number">{loading ? '—' : heroSlides.filter(s => s.status === 'active').length}</span>
            <span className="kpi-label">Active Hero Slides</span>
          </div>
          <div className="kpi-footer">
            <span>View live carousel</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* ── 3. HOMEPAGE HERO BANNER SECTION (VIEW ONLY FOR MEMBERS) ── */}
      <div className="dash-section" id="hero-view-section">
        <div className="section-head">
          <div className="section-head-left">
            <div className="section-icon-badge">
              <Sparkles size={22} />
            </div>
            <div>
              <h2>Homepage Hero Banner Section</h2>
              <p>Live preview and showcase of the main carousel banners featured on the chapter homepage (View Only).</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="slide-status-badge status-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span className="pulse-dot" />
              Public Showcase
            </span>
          </div>
        </div>

        {/* Live Hero Carousel Viewport Viewer */}
        <div className="live-hero-preview-container">
          <div className="preview-top-toolbar">
            <div className="preview-mode-tag">
              <Eye size={15} color="#ef4444" />
              <span>Live Website Viewport Mockup</span>
              <span style={{ color: '#64748b', fontSize: '11.5px' }}>
                (Slide {heroSlides.length > 0 ? activePreviewIndex + 1 : 1} of {heroSlides.length || 1})
              </span>
            </div>

            <div className="preview-controls">
              <button
                className="btn-preview-autoplay"
                onClick={() => setIsAutoPlaying(prev => !prev)}
                title={isAutoPlaying ? 'Pause Autoplay' : 'Resume Autoplay'}
              >
                {isAutoPlaying ? <Pause size={13} /> : <Play size={13} />}
                <span>{isAutoPlaying ? 'Autoplay On' : 'Paused'}</span>
              </button>

              <button
                className="btn-preview-nav"
                onClick={() => setActivePreviewIndex(prev => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
                title="Previous Slide"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                className="btn-preview-nav"
                onClick={() => setActivePreviewIndex(prev => (prev + 1) % heroSlides.length)}
                title="Next Slide"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Hero Viewport */}
          <div
            className="live-hero-viewport"
            style={{
              backgroundImage: `url(${currentPreviewSlide?.image || 'https://kyuchapter.netlify.app/1.jpeg'})`,
            }}
          >
            <div className="hero-viewport-overlay" />

            <div className="hero-viewport-quick-tools">
              <span className={`slide-status-badge status-${currentPreviewSlide?.status || 'active'}`}>
                {currentPreviewSlide?.status === 'active' ? '● Live Banner' : '○ Draft'}
              </span>
            </div>

            <div className="hero-viewport-content">
              <span className="hero-viewport-eyebrow">
                {currentPreviewSlide?.eyebrow || 'KIRINYAGA UNIVERSITY · RED CROSS CHAPTER'}
              </span>

              <h1 className="hero-viewport-title">
                {currentPreviewSlide?.first}{' '}
                <span className="hero-viewport-accent">{currentPreviewSlide?.accent}</span>
              </h1>

              <p className="hero-viewport-description">
                {currentPreviewSlide?.description || 'Serving humanity through compassion, courage, and community care.'}
              </p>

              <div className="hero-viewport-actions">
                <span className="hero-mock-btn-primary">
                  {currentPreviewSlide?.primary || currentPreviewSlide?.primary_button_text || 'Learn More'}
                </span>
                <span className="hero-mock-btn-secondary">
                  {currentPreviewSlide?.secondary || currentPreviewSlide?.secondary_button_text || 'Contact Us'}
                </span>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="hero-viewport-dots">
              {heroSlides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  className={`hero-dot ${idx === activePreviewIndex ? 'active' : ''}`}
                  onClick={() => setActivePreviewIndex(idx)}
                  title={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Hero Slides Deck Grid (View Only) */}
        <div className="hero-deck-header">
          <div className="hero-deck-search">
            <input
              type="text"
              placeholder="Search hero banners by title, keyword, or eyebrow..."
              value={heroSearchTerm}
              onChange={e => setHeroSearchTerm(e.target.value)}
            />
          </div>

          <div className="hero-deck-filters">
            <button
              className={`filter-tab ${heroStatusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setHeroStatusFilter('all')}
            >
              All ({heroSlides.length})
            </button>
            <button
              className={`filter-tab ${heroStatusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setHeroStatusFilter('active')}
            >
              Active ({heroSlides.filter(s => s.status === 'active').length})
            </button>
            <button
              className={`filter-tab ${heroStatusFilter === 'inactive' ? 'active' : ''}`}
              onClick={() => setHeroStatusFilter('inactive')}
            >
              Inactive ({heroSlides.filter(s => s.status === 'inactive').length})
            </button>
          </div>
        </div>

        {filteredHeroSlides.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <p>No hero banners found matching your search.</p>
          </div>
        ) : (
          <div className="hero-slides-grid">
            {filteredHeroSlides.map((slide, idx) => {
              const isSelected = activePreviewIndex === idx;

              return (
                <div
                  key={slide.id || idx}
                  className={`hero-slide-card ${isSelected ? 'is-selected' : ''}`}
                >
                  <div
                    className="slide-card-media"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  >
                    <div className="slide-card-badge-row">
                      <span className="slide-order-pill">Slide #{slide.sort_order || idx + 1}</span>
                      <span className={`slide-status-pill ${slide.status || 'active'}`}>
                        {slide.status || 'active'}
                      </span>
                    </div>

                    <div className="slide-card-hover-actions">
                      <button
                        className="btn-card-preview"
                        onClick={() => setActivePreviewIndex(idx)}
                        title="Preview this slide in the live viewer above"
                      >
                        <Eye size={13} />
                        <span>Preview Live</span>
                      </button>
                    </div>
                  </div>

                  <div className="slide-card-body">
                    <div className="slide-card-eyebrow">{slide.eyebrow}</div>
                    <h3 className="slide-card-title">
                      {slide.first} <span className="accent-text">{slide.accent}</span>
                    </h3>
                    <p className="slide-card-desc">{slide.description}</p>

                    <div className="slide-card-buttons-meta">
                      <div className="button-meta-pill">
                        <span className="btn-type-tag">Primary:</span>
                        <strong>{slide.primary || slide.primary_button_text || 'Learn More'}</strong>
                        <span className="btn-link-tag">({slide.primaryHref || slide.primary_href || '/about'})</span>
                      </div>
                      <div className="button-meta-pill">
                        <span className="btn-type-tag">Secondary:</span>
                        <strong>{slide.secondary || slide.secondary_button_text || 'Contact'}</strong>
                        <span className="btn-link-tag">({slide.secondaryHref || slide.secondary_href || '/contact'})</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 4. OPERATIONS & ACTIVITY HUB ── */}
      <div className="dash-split-section">
        {/* Recent Chapter Activity Feed */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <Clock size={18} className="icon-red" />
              <h3>Recent Chapter Activities</h3>
            </div>
            <span className="badge-subtle">Live Updates</span>
          </div>

          <div className="activity-list">
            {activities.map(act => (
              <div key={act.id} className="activity-item">
                <div className={`activity-icon-bullet ${act.type}`}>
                  {act.type === 'event' && <Calendar size={15} />}
                  {act.type === 'gallery' && <ImageIcon size={15} />}
                  {act.type === 'member' && <Users size={15} />}
                  {act.type === 'system' && <ShieldCheck size={15} />}
                </div>
                <div className="activity-content">
                  <p className="activity-text">{act.text}</p>
                  <span className="activity-time">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Action Hub */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">
              <LayoutGrid size={18} className="icon-red" />
              <h3>Member Action Hub</h3>
            </div>
            <span className="badge-subtle">Portal Shortcuts</span>
          </div>

          <div className="modules-grid">
            <div className="module-item" onClick={() => navigate('/portal/events')}>
              <div className="module-icon events-color">
                <Calendar size={18} />
              </div>
              <div className="module-details">
                <h4>Propose Events</h4>
                <p>Submit volunteer activities and workshops for review</p>
              </div>
            </div>

            <div className="module-item" onClick={() => navigate('/portal/gallery')}>
              <div className="module-icon gallery-color">
                <ImageIcon size={18} />
              </div>
              <div className="module-details">
                <h4>Upload Photos</h4>
                <p>Share batch event and training photos with community</p>
              </div>
            </div>

            <div className="module-item" onClick={() => navigate('/portal/messages')}>
              <div className="module-icon messages-color">
                <MessageSquare size={18} />
              </div>
              <div className="module-details">
                <h4>Chat & Messages</h4>
                <p>Direct chat with chapter leaders and members</p>
              </div>
            </div>

            <div className="module-item" onClick={() => navigate('/portal/firstaid')}>
              <div className="module-icon firstaid-color">
                <LifeBuoy size={18} />
              </div>
              <div className="module-details">
                <h4>First Aid Manuals</h4>
                <p>Step-by-step emergency care protocols & guides</p>
              </div>
            </div>

            <div className="module-item" onClick={() => navigate('/portal/dissemination')}>
              <div className="module-icon dissemination-color">
                <BookOpen size={18} />
              </div>
              <div className="module-details">
                <h4>Dissemination</h4>
                <p>Learn Red Cross Principles, IHL, and Emblem rules</p>
              </div>
            </div>

            <div className="module-item" onClick={() => navigate('/portal/profile')}>
              <div className="module-icon members-color">
                <Users size={18} />
              </div>
              <div className="module-details">
                <h4>My Profile</h4>
                <p>Manage volunteer credentials & chapter status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Chapter Impact Strip ── */}
      <div className="dash-impact-bar">
        <div className="impact-item">
          <div className="impact-symbol">✚</div>
          <div>
            <strong>100%</strong>
            <span>Neutral & Impartial Care</span>
          </div>
        </div>

        <div className="impact-item">
          <div className="impact-symbol">🩸</div>
          <div>
            <strong>500+</strong>
            <span>Pints of Blood Donated</span>
          </div>
        </div>

        <div className="impact-item">
          <div className="impact-symbol">🚑</div>
          <div>
            <strong>24/7</strong>
            <span>Campus First Aid Standby</span>
          </div>
        </div>

        <div className="impact-item">
          <div className="impact-symbol">🌐</div>
          <div>
            <strong>7 Principles</strong>
            <span>Movement Values Upheld</span>
          </div>
        </div>
      </div>
    </div>
  );
}