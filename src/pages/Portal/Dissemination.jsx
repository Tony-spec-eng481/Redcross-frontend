import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config';

export default function Dissemination() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);

  const categories = [
    'All',
    'Principles',
    'IHL (International Humanitarian Law)',
    'Movement History',
    'Emblem Protection',
    'Humanitarian Values',
  ];

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE}/dissemination`)
      .then((res) => {
        if (res.data.success) {
          setModules(res.data.data);
        } else if (Array.isArray(res.data)) {
          setModules(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch dissemination modules:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredModules = modules.filter((mod) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (mod.category && mod.category.toLowerCase().includes(activeCategory.split(' ')[0].toLowerCase()));
    const matchesSearch =
      !search ||
      mod.title?.toLowerCase().includes(search.toLowerCase()) ||
      mod.description?.toLowerCase().includes(search.toLowerCase()) ||
      mod.content?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="portal-page" style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Banner / Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #cc0000 0%, #990000 100%)',
          color: '#fff',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 15px rgba(204, 0, 0, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '2rem' }}>🌐</span>
          <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, color: '#ffffff' }}>
            Red Cross Dissemination Portal
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: '1.05rem', opacity: 0.95, maxWidth: '800px', lineHeight: '1.6' }}>
          Explore the Fundamental Principles of the International Red Cross & Red Crescent Movement, International
          Humanitarian Law (IHL), emblem protection, and core humanitarian values.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: '10px',
          padding: '1.25rem',
          marginBottom: '2rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="🔍 Search dissemination topics, principles, or IHL rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                border: activeCategory === cat ? 'none' : '1px solid #d1d5db',
                background: activeCategory === cat ? '#cc0000' : '#f9fafb',
                color: activeCategory === cat ? '#fff' : '#374151',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <p style={{ fontSize: '1.1rem' }}>Loading Dissemination Modules...</p>
        </div>
      ) : filteredModules.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#fff',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
          }}
        >
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📚</span>
          <h3 style={{ color: '#111827', margin: '0 0 0.5rem 0' }}>No Dissemination Modules Found</h3>
          <p style={{ color: '#6b7280', margin: 0 }}>Try clearing your search or choosing another category.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredModules.map((mod) => (
            <div
              key={mod.id}
              style={{
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div>
                {mod.image_url ? (
                  <img
                    src={mod.image_url}
                    alt={mod.title}
                    style={{ width: '100%', height: '170px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      height: '120px',
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                      color: '#cc0000',
                      fontSize: '2.5rem',
                    }}
                  >
                    🚩
                  </div>
                )}

                <div style={{ padding: '1.25rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background: '#fee2e2',
                      color: '#990000',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {mod.category || 'Dissemination'}
                  </span>

                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#111827',
                      margin: '0 0 0.5rem 0',
                      lineHeight: '1.3',
                    }}
                  >
                    {mod.title}
                  </h3>

                  <p
                    style={{
                      color: '#4b5563',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      margin: '0 0 1rem 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {mod.description || mod.content}
                  </p>

                  {mod.tags && mod.tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {(Array.isArray(mod.tags) ? mod.tags : String(mod.tags).split(',')).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            background: '#f3f4f6',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem 1.25rem',
                  background: '#f9fafb',
                  borderTop: '1px solid #f3f4f6',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                }}
              >
                {mod.pdf_url ? (
                  <a
                    href={mod.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#cc0000',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    📄 PDF Document
                  </a>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Reading Module</span>
                )}

                <button
                  onClick={() => setSelectedModule(mod)}
                  style={{
                    background: '#cc0000',
                    color: '#fff',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Read Module →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Module Detail Modal */}
      {selectedModule && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setSelectedModule(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              maxWidth: '750px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedModule(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                border: 'none',
                background: '#f3f4f6',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
              }}
            >
              ✕
            </button>

            <span
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                borderRadius: '12px',
                background: '#fee2e2',
                color: '#cc0000',
                fontSize: '0.8rem',
                fontWeight: 700,
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              {selectedModule.category}
            </span>

            <h2 style={{ fontSize: '1.8rem', color: '#111827', margin: '0 0 1rem 0' }}>{selectedModule.title}</h2>

            {selectedModule.image_url && (
              <img
                src={selectedModule.image_url}
                alt={selectedModule.title}
                style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }}
              />
            )}

            {selectedModule.description && (
              <div
                style={{
                  background: '#fef2f2',
                  borderLeft: '4px solid #cc0000',
                  padding: '1rem 1.25rem',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: '1.5rem',
                  fontSize: '1rem',
                  color: '#990000',
                  fontWeight: 500,
                }}
              >
                {selectedModule.description}
              </div>
            )}

            <div
              style={{
                fontSize: '1rem',
                lineHeight: '1.7',
                color: '#374151',
                whiteSpace: 'pre-line',
                marginBottom: '1.5rem',
              }}
            >
              {selectedModule.content || selectedModule.description}
            </div>

            {selectedModule.video_url && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>🎥 Video Presentation</h4>
                <a
                  href={selectedModule.video_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#cc0000', fontWeight: 600 }}
                >
                  Watch Video Resource →
                </a>
              </div>
            )}

            {selectedModule.pdf_url && (
              <div
                style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#111827' }}>Dissemination Reference Guide (PDF)</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>Download for offline study & dissemination training</p>
                </div>
                <a
                  href={selectedModule.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#cc0000',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
