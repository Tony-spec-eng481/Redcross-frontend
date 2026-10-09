import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE, BACKEND_URL } from '../config';
import './Portal.css';

const menuItems = [
  {
    to: '/portal/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/>
        <rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>
      </svg>
    )
  },
  {
    to: '/portal/gallery',
    label: 'Gallery',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    )
  },
  {
    to: '/portal/events',
    label: 'Events',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    )
  },
  {
    to: '/portal/firstaid',
    label: 'First Aid',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M2 12h20"/>
      </svg>
    )
  },
  {
    to: '/portal/dissemination',
    label: 'Dissemination',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    )
  },
  {
    to: '/portal/messages',
    label: 'Messages',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  },
  {
    to: '/portal/profile',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  },
  {
    to: '/portal/settings',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )
  }
];

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes in ms

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('portal_last_activity');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('user') || localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: 'Member User', email: 'member@kyu.ac.ke', role: 'Member' };
    } catch {
      return { name: 'Member User', email: 'member@kyu.ac.ke', role: 'Member' };
    }
  });

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // 30-Minute Inactivity Auto-Logout & Session Verification
  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (!token) {
      handleLogout();
      return;
    }

    const checkInactivity = () => {
      const lastActivityStr = sessionStorage.getItem('portal_last_activity');
      if (lastActivityStr) {
        const elapsed = Date.now() - parseInt(lastActivityStr, 10);
        if (elapsed >= INACTIVITY_LIMIT) {
          handleLogout();
        }
      } else {
        sessionStorage.setItem('portal_last_activity', Date.now().toString());
      }
    };

    checkInactivity();

    let lastRecorded = 0;
    const updateActivity = () => {
      const now = Date.now();
      if (now - lastRecorded > 2000) {
        lastRecorded = now;
        sessionStorage.setItem('portal_last_activity', now.toString());
      }
    };

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    activityEvents.forEach(evt => window.addEventListener(evt, updateActivity, { passive: true }));

    const timer = setInterval(checkInactivity, 10000);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkInactivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, updateActivity));
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const fetchNotifs = () => {
      axios.get(`${API_BASE}/messages`)
        .then(res => {
          const raw = Array.isArray(res.data) ? res.data : res.data?.data || [];
          if (Array.isArray(raw) && raw.length > 0) {
            const formatted = raw.map(m => ({
              id: m.id,
              text: m.is_broadcast
                ? `📢 Announcement: ${m.subject || m.text}`
                : `💬 Message from ${m.sender_name || 'Coordinator'}: ${m.text}`,
              created_at: m.created_at,
              is_read: m.is_read !== false,
              link: '/portal/messages'
            }));
            setNotifications(formatted);
          }
        })
        .catch(() => {
          axios.get(`${BACKEND_URL}/api/messages`)
            .then(res2 => {
              const raw2 = Array.isArray(res2.data) ? res2.data : res2.data?.data || [];
              if (Array.isArray(raw2) && raw2.length > 0) {
                const formatted = raw2.map(m => ({
                  id: m.id,
                  text: m.is_broadcast
                    ? `📢 Announcement: ${m.subject || m.text}`
                    : `💬 Message from ${m.sender_name || 'Coordinator'}: ${m.text}`,
                  created_at: m.created_at,
                  is_read: m.is_read !== false,
                  link: '/portal/messages'
                }));
                setNotifications(formatted);
              }
            })
            .catch(() => {
              setNotifications([
                { id: 1, text: 'Welcome to the Red Cross Member Portal!', created_at: new Date().toISOString(), is_read: false, link: '/portal/messages' },
                { id: 2, text: 'New First Aid training scheduled for Saturday.', created_at: new Date().toISOString(), is_read: false, link: '/portal/firstaid' }
              ]);
            });
        });
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = (notif) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    setShowNotifications(false);
    navigate(notif.link || '/portal/messages');
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="portal-app-container">
      {/* Top Navbar */}
      <nav className="portal-navbar">
        <div className="navbar-left">
          <button
            className={`hamburger-btn ${sidebarOpen ? 'active' : ''}`}
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <Link to="/portal/dashboard" className="navbar-brand">
            <span className="brand-icon">✚</span>
            <div className="brand-name">
              Red Cross <span className="brand-sub">Kirinyaga University</span>
            </div>
          </Link>
        </div>

        <div className="navbar-right">
          {/* Quick link: Dashboard */}
          <button
            className={`nav-icon-btn ${location.pathname === '/portal/dashboard' ? 'active-icon' : ''}`}
            onClick={() => navigate('/portal/dashboard')}
            title="Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>

          {/* Quick link: Gallery */}
          <button
            className={`nav-icon-btn ${location.pathname === '/portal/gallery' ? 'active-icon' : ''}`}
            onClick={() => navigate('/portal/gallery')}
            title="Gallery"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>

          {/* Notifications */}
          <div className="notification-wrapper" ref={notifRef}>
            <button
              className="nav-icon-btn"
              onClick={() => setShowNotifications(prev => !prev)}
              title="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="dropdown notification-dropdown">
                <div className="dropdown-header">
                  <span>Notifications ({unreadCount} new)</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="mark-all-btn"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="dropdown-empty">No notifications</div>
                ) : (
                  notifications.slice(0, 10).map(notif => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notif-dot"></div>
                      <div className="notif-content">
                        <p>{notif.text}</p>
                        <span>{formatTime(notif.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="profile-wrapper" ref={profileRef}>
            <button className="profile-btn" onClick={() => setProfileDropdownOpen(prev => !prev)}>
              <div className="avatar">
                {user?.name?.charAt(0) || 'M'}
              </div>
              <span className="member-name">{user?.name || 'Member'}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {profileDropdownOpen && (
              <div className="dropdown profile-dropdown">
                <div className="dropdown-user-info">
                  <div className="avatar large">{user?.name?.charAt(0) || 'M'}</div>
                  <div>
                    <p className="dropdown-user-name">{user?.name}</p>
                    <p className="dropdown-user-email">{user?.email || 'Member Portal'}</p>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <Link
                  to="/portal/profile"
                  className="dropdown-item"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Profile Details
                </Link>
                <Link
                  to="/portal/settings"
                  className="dropdown-item"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                  Account Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile & Desktop Drawer Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Unified Connected Sidebar */}
      <aside className={`portal-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">✚</span>
            <div className="brand-text">
              <span className="brand-title">Red Cross</span>
              <span className="brand-subtitle">Kirinyaga University</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close sidebar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Portal Navigation</div>
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {location.pathname === item.to && <span className="active-indicator"></span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-status">
            <span className="status-dot"></span>
            <span>Member Portal Active</span>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} Red Cross Kirinyaga</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main-content">
        <Outlet />
      </main>
    </div>
  );
}