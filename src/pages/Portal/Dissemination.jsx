import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { API_BASE, BACKEND_URL } from '../../config';
import './Dissemination.css';

const SEVEN_PRINCIPLES = [
  {
    name: 'Humanity',
    icon: '🕊️',
    motto: 'Alleviate human suffering wherever it is found',
    desc: 'Brought forth by a desire to assist without discrimination the wounded on the battlefield.',
  },
  {
    name: 'Impartiality',
    icon: '⚖️',
    motto: 'No discrimination as to nationality, race, or beliefs',
    desc: 'Relieves suffering guided solely by priority of needs without prejudice or bias.',
  },
  {
    name: 'Neutrality',
    icon: '🛡️',
    motto: 'Never taking sides in conflicts or political disputes',
    desc: 'Maintains confidence of all factions to provide aid in armed hostilities.',
  },
  {
    name: 'Independence',
    icon: '🏛️',
    motto: 'Autonomous auxiliary to humanitarian authorities',
    desc: 'Maintains institutional autonomy to act according to Movement principles.',
  },
  {
    name: 'Voluntary Service',
    icon: '🤝',
    motto: 'Service not prompted by desire for gain',
    desc: 'Driven by selfless dedication to emergency relief, first aid, and community well-being.',
  },
  {
    name: 'Unity',
    icon: '🌐',
    motto: 'Only one Red Cross Society in each country',
    desc: 'Open to all citizens and carrying on humanitarian work throughout national territory.',
  },
  {
    name: 'Universality',
    icon: '🌍',
    motto: 'Worldwide movement with equal status and duty',
    desc: 'All national societies have equal status and responsibilities to assist one another.',
  },
];

const CATEGORIES = [
  'All',
  'Fundamental Principles',
  'International Humanitarian Law',
  'Emblem & Heritage',
  'Youth & Community',
  'General',
];

export default function Dissemination() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [selectedModule, setSelectedModule] = useState(null);
  const [toast, setToast] = useState(null);

  // Track completed modules locally so volunteers can see their study progress
  const [completedMap, setCompletedMap] = useState(() => {
    try {
      const saved = localStorage.getItem('kyu_rc_dissemination_completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const fetchModules = useCallback(() => {
    setLoading(true);
    const endpoints = [
      `${API_BASE}/dissemination`,
      `${BACKEND_URL}/api/dissemination`,
      `${BACKEND_URL}/api/v1/dissemination`,
    ];

    const tryFetch = (index) => {
      if (index >= endpoints.length) {
        setLoading(false);
        return;
      }
      axios
        .get(endpoints[index])
        .then((res) => {
          const raw = res.data?.data || (Array.isArray(res.data) ? res.data : []);
          setModules(raw);
          setLoading(false);
        })
        .catch(() => tryFetch(index + 1));
    };

    tryFetch(0);
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Handle URL query parameter `?id=...` to automatically open modal for shared links
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam && modules.length > 0) {
      const found = modules.find((m) => String(m.id) === String(idParam));
      if (found) {
        setSelectedModule(found);
      }
    }
  }, [searchParams, modules]);

  // Toggle completion status for a module
  const toggleCompleted = (modId, e) => {
    if (e) e.stopPropagation();
    setCompletedMap((prev) => {
      const next = { ...prev, [modId]: !prev[modId] };
      try {
        localStorage.setItem('kyu_rc_dissemination_completed', JSON.stringify(next));
      } catch {}
      showToast(next[modId] ? 'Module marked as completed!' : 'Module marked as unread.', 'info');
      return next;
    });
  };

  // Share module link to clipboard
  const handleShare = (mod, e) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/portal/dissemination?id=${mod.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast('Link copied to clipboard!', 'success');
      });
    } else {
      showToast(shareUrl, 'info');
    }
  };

  // Close detail modal and clean URL
  const closeModal = () => {
    setSelectedModule(null);
    if (searchParams.get('id')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('id');
      setSearchParams(nextParams, { replace: true });
    }
  };

  const openModule = (mod) => {
    setSelectedModule(mod);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('id', mod.id);
    setSearchParams(nextParams, { replace: true });
  };

  // Filter & Sort
  const filteredModules = useMemo(() => {
    const s = search.toLowerCase().trim();

    return modules
      .filter((mod) => {
        const matchesCategory =
          activeCategory === 'All' ||
          (mod.category &&
            mod.category.toLowerCase().includes(activeCategory.toLowerCase().split(' ')[0]));

        const matchesSearch =
          !s ||
          mod.title?.toLowerCase().includes(s) ||
          mod.description?.toLowerCase().includes(s) ||
          mod.content?.toLowerCase().includes(s) ||
          (Array.isArray(mod.tags) && mod.tags.some((t) => t.toLowerCase().includes(s)));

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'order') {
          return (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [modules, activeCategory, search, sortBy]);

  // Statistics
  const completedCount = useMemo(() => {
    return modules.filter((m) => completedMap[m.id]).length;
  }, [modules, completedMap]);

  const ihlCount = useMemo(() => {
    return modules.filter((m) => m.category?.toLowerCase().includes('ihl') || m.category?.toLowerCase().includes('law')).length;
  }, [modules]);

  // Current module navigation index inside modal
  const currentIndex = selectedModule
    ? filteredModules.findIndex((m) => m.id === selectedModule.id)
    : -1;

  const handleNext = () => {
    if (currentIndex >= 0 && currentIndex < filteredModules.length - 1) {
      openModule(filteredModules[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      openModule(filteredModules[currentIndex - 1]);
    }
  };

  return (
    <div className="portal-dissemination-page">
      {/* Toast Notification */}
      {toast && <div className={`diss-toast ${toast.type}`}>ℹ️ {toast.msg}</div>}

      {/* Hero Banner */}
      <div className="diss-hero-banner">
        <div className="diss-hero-badge">
          🌐 Movement Heritage & International Humanitarian Law
        </div>
        <div className="diss-hero-content">
          <h1 className="diss-hero-title">Dissemination & IHL Knowledge Center</h1>
          <p className="diss-hero-desc">
            Explore the foundational ethos of the International Red Cross & Red Crescent Movement:
            our Seven Fundamental Principles, the Geneva Conventions, emblem protection regulations,
            and ethical humanitarian conduct during peace and armed conflict.
          </p>
        </div>
      </div>

      {/* Stats Highlights Bar */}
      <div className="diss-stats-grid">
        <div className="diss-stat-card">
          <div className="diss-stat-icon-wrap red">🕊️</div>
          <div className="diss-stat-info">
            <span className="diss-stat-number">7</span>
            <span className="diss-stat-label">Core Fundamental Principles</span>
          </div>
        </div>

        <div className="diss-stat-card">
          <div className="diss-stat-icon-wrap blue">⚖️</div>
          <div className="diss-stat-info">
            <span className="diss-stat-number">{ihlCount || '4+'}</span>
            <span className="diss-stat-label">IHL & Geneva Protocols</span>
          </div>
        </div>

        <div className="diss-stat-card">
          <div className="diss-stat-icon-wrap emerald">📚</div>
          <div className="diss-stat-info">
            <span className="diss-stat-number">{modules.length}</span>
            <span className="diss-stat-label">Total Published Modules</span>
          </div>
        </div>

        <div className="diss-stat-card">
          <div className="diss-stat-icon-wrap amber">🎓</div>
          <div className="diss-stat-info">
            <span className="diss-stat-number">{completedCount}</span>
            <span className="diss-stat-label">Your Completed Modules</span>
          </div>
        </div>
      </div>

      {/* The 7 Fundamental Principles Interactive Strip */}
      <div className="diss-principles-section">
        <div className="diss-principles-header">
          <div className="diss-section-title-wrap">
            <h3>🕊️ The Seven Fundamental Principles</h3>
            <p>Proclaimed in Vienna (1965), these principles guide every Red Cross action worldwide.</p>
          </div>
          <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>
            Click any principle to filter topics
          </span>
        </div>

        <div className="diss-principles-scroll">
          {SEVEN_PRINCIPLES.map((principle) => {
            const isFilterActive = search.toLowerCase() === principle.name.toLowerCase();
            return (
              <div
                key={principle.name}
                className={`diss-principle-pill ${isFilterActive ? 'active' : ''}`}
                onClick={() => {
                  if (isFilterActive) {
                    setSearch('');
                  } else {
                    setSearch(principle.name);
                    setActiveCategory('All');
                  }
                }}
                title={principle.desc}
              >
                <span className="diss-principle-icon">{principle.icon}</span>
                <span className="diss-principle-name">{principle.name}</span>
                <span className="diss-principle-desc">{principle.motto}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="diss-toolbar">
        <div className="diss-search-row">
          <div className="diss-search-box">
            <span className="diss-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search principles, Geneva Conventions, emblem rules, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="diss-search-input"
            />
            {search && (
              <button
                className="diss-search-clear"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="diss-sort-select"
          >
            <option value="order">Sort: Recommended Order</option>
            <option value="newest">Sort: Newest First</option>
            <option value="title">Sort: Title (A-Z)</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="diss-categories-wrap">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'All'
                ? modules.length
                : modules.filter((m) =>
                    m.category?.toLowerCase().includes(cat.toLowerCase().split(' ')[0])
                  ).length;

            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`diss-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              >
                {cat}
                <span className="diss-cat-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modules Grid */}
      {loading ? (
        <div className="diss-empty-state">
          <div className="diss-empty-icon">⏳</div>
          <h3 className="diss-empty-title">Loading Dissemination Curriculum...</h3>
          <p className="diss-empty-desc">Fetching official Red Cross modules from secure database.</p>
        </div>
      ) : filteredModules.length === 0 ? (
        <div className="diss-empty-state">
          <div className="diss-empty-icon">🔍</div>
          <h3 className="diss-empty-title">No Dissemination Modules Found</h3>
          <p className="diss-empty-desc">
            No modules match your current search "{search || activeCategory}". Try searching for
            "Principles", "Geneva", "Humanity", or clearing your filters.
          </p>
          <button
            className="diss-reset-btn"
            onClick={() => {
              setSearch('');
              setActiveCategory('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="diss-modules-grid">
          {filteredModules.map((mod) => {
            const isCompleted = !!completedMap[mod.id];
            const hasDoc = !!(mod.document_url || mod.pdf_url);
            const hasVideo = !!mod.video_url;

            return (
              <div key={mod.id} className="diss-card" onClick={() => openModule(mod)}>
                <div className="diss-card-banner">
                  {mod.image_url ? (
                    <img
                      src={mod.image_url}
                      alt={mod.title}
                      className="diss-card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="diss-card-placeholder">🌐</div>
                  )}

                  <span className="diss-card-category-badge">
                    {mod.category || 'Dissemination'}
                  </span>

                  <span className="diss-card-read-time">⏱️ 4 min read</span>

                  {isCompleted && (
                    <span className="diss-completed-indicator" title="Completed by you">
                      ✓ Completed
                    </span>
                  )}
                </div>

                <div className="diss-card-body">
                  <h3 className="diss-card-title">{mod.title}</h3>

                  <p className="diss-card-desc">
                    {mod.description || mod.content?.slice(0, 160) + '...'}
                  </p>

                  {mod.tags && mod.tags.length > 0 && (
                    <div className="diss-tags-wrap">
                      {(Array.isArray(mod.tags) ? mod.tags : String(mod.tags).split(',')).map(
                        (tag, idx) => (
                          <span key={idx} className="diss-tag-chip">
                            #{tag.trim()}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="diss-card-footer" onClick={(e) => e.stopPropagation()}>
                  <div>
                    {hasDoc ? (
                      <a
                        href={mod.document_url || mod.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="diss-resource-link"
                        title="Download PDF reference guide"
                      >
                        📄 PDF Guide
                      </a>
                    ) : hasVideo ? (
                      <a
                        href={mod.video_url}
                        target="_blank"
                        rel="noreferrer"
                        className="diss-resource-link"
                        title="Watch video presentation"
                      >
                        🎥 Video Lecture
                      </a>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>📖 Core Reading</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="diss-read-btn"
                      onClick={() => openModule(mod)}
                      title="Read full module"
                    >
                      Read Module →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Reading Modal / Study Drawer */}
      {selectedModule && (
        <div className="diss-modal-overlay" onClick={closeModal}>
          <div className="diss-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="diss-modal-header">
              <div>
                <span className="diss-modal-badge">{selectedModule.category}</span>
                <h2 className="diss-modal-title">{selectedModule.title}</h2>
              </div>
              <button className="diss-modal-close" onClick={closeModal} title="Close module">
                ✕
              </button>
            </div>

            <div className="diss-modal-body">
              {selectedModule.image_url && (
                <img
                  src={selectedModule.image_url}
                  alt={selectedModule.title}
                  className="diss-modal-cover-img"
                />
              )}

              {selectedModule.description && (
                <div className="diss-modal-callout">
                  💡 <strong>Overview & Context:</strong> {selectedModule.description}
                </div>
              )}

              <div className="diss-modal-text">
                {selectedModule.content || selectedModule.description}
              </div>

              {/* Video Presentation Section */}
              {selectedModule.video_url && (
                <div className="diss-modal-video-card">
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>
                      🎥 Multimedia Video Resource
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      Official presentation and lecture recording on this topic.
                    </p>
                  </div>
                  <a
                    href={selectedModule.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="diss-read-btn"
                  >
                    Watch Video Resource →
                  </a>
                </div>
              )}

              {/* PDF Document Section */}
              {(selectedModule.document_url || selectedModule.pdf_url) && (
                <div className="diss-modal-pdf-card">
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#065f46' }}>
                      📄 Official Document & Reference Guide (PDF)
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#047857' }}>
                      Downloadable handbook for offline study, training, and volunteer dissemination.
                    </p>
                  </div>
                  <a
                    href={selectedModule.document_url || selectedModule.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="diss-modal-pdf-btn"
                    download
                  >
                    Download PDF Guide ⬇
                  </a>
                </div>
              )}

              {/* Tags Section */}
              {selectedModule.tags && selectedModule.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {(Array.isArray(selectedModule.tags)
                    ? selectedModule.tags
                    : String(selectedModule.tags).split(',')
                  ).map((tag, idx) => (
                    <span key={idx} className="diss-tag-chip">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="diss-modal-footer">
              <div className="diss-modal-footer-left">
                <button
                  className={`diss-toggle-complete-btn ${
                    completedMap[selectedModule.id] ? 'completed' : ''
                  }`}
                  onClick={() => toggleCompleted(selectedModule.id)}
                >
                  {completedMap[selectedModule.id] ? '✓ Completed' : 'Mark as Completed'}
                </button>

                <button
                  className="diss-share-btn"
                  onClick={(e) => handleShare(selectedModule, e)}
                  title="Copy module link to share with fellow volunteers"
                >
                  🔗 Share
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="diss-reset-btn"
                  onClick={handlePrev}
                  disabled={currentIndex <= 0}
                  style={{ opacity: currentIndex <= 0 ? 0.4 : 1, cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer' }}
                >
                  ← Previous
                </button>

                <button
                  className="diss-read-btn"
                  onClick={handleNext}
                  disabled={currentIndex >= filteredModules.length - 1}
                  style={{
                    opacity: currentIndex >= filteredModules.length - 1 ? 0.4 : 1,
                    cursor: currentIndex >= filteredModules.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next Module →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
