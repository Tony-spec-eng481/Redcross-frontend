const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/DELL/Desktop/redcross/frontend/src';

const dirs = [
  path.join(baseDir, 'components'),
  path.join(baseDir, 'pages'),
  path.join(baseDir, 'pages', 'Portal')
];

dirs.forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
  }
});

const files = {
  'components/MainLayout.jsx': `import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { principles } from '../data';

export default function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    ['Home', '/'], 
    ['About', '/about'], 
    ['What We Do', '/programs'], 
    ['Events', '/events'], 
    ['Team', '/team'], 
    ['Gallery', '/gallery'], 
    ['Contact', '/contact']
  ];

  return (
    <>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-contact">
            <a href="mailto:redcross@kyu.ac.ke"><span>✉</span> redcross@kyu.ac.ke</a>
            <a href="tel:+254700000000"><span>☎</span> +254 700 000 000</a>
            <span><i>⌖</i> Kirinyaga University, Kutus</span>
          </div>
          <div className="social-links">
            <a href="#contact" aria-label="Facebook">f</a>
            <a href="https://www.tiktok.com/@kyu_redcross_chapter" aria-label="TikTok">♪</a>
            <a href="https://www.instagram.com/kyu_redcross_chapter" aria-label="Instagram">◎</a>
            <a href="#contact" aria-label="LinkedIn">in</a>
          </div>
        </div>
      </div>
      <header className="site-header">
        <Link to="/" className="brand">
          <img src="https://kyuchapter.netlify.app/images/at-60-logo-203x114-1%20(1).png" alt="Kenya Red Cross" />
        </Link>
        <nav className={menuOpen ? 'main-nav nav-open' : 'main-nav'} aria-label="Main navigation">
          {navItems.map(([label, href]) => (
            <Link key={label} to={href} onClick={() => setMenuOpen(false)} className={location.pathname === href ? 'active' : ''}>
              {label}
            </Link>
          ))}
          <Link className="nav-join" to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen}>
          {menuOpen ? '×' : '☰'}
        </button>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-about">
            <img src="https://kyuchapter.netlify.app/images/footer%20logo.jpeg" alt="Red Cross logo"/>
            <h2>Kirinyaga University<br/>Red Cross Chapter</h2>
            <p>Committed to the seven fundamental principles of the Red Cross Movement. Serving humanity on campus and beyond.</p>
            <div className="footer-social">
              <a href="#contact" aria-label="Facebook">f</a>
              <a href="https://www.tiktok.com/@kyu_redcross_chapter" aria-label="TikTok">♪</a>
              <a href="https://www.instagram.com/kyu_redcross_chapter" aria-label="Instagram">◎</a>
            </div>
          </div>
          <div className="footer-column">
            <h3>Quick Links</h3>
            {navItems.slice(1).map(([label, href]) => (
              <Link key={label} to={href}>› <span>{label === 'Team' ? 'Our Team' : label}</span></Link>
            ))}
          </div>
          <div className="footer-column">
            <h3>Fundamentals</h3>
            {principles.slice(0, 7).map(([, title]) => (
              <Link key={title} to="/principles">› <span>{title}</span></Link>
            ))}
          </div>
          <div className="footer-column">
            <h3>Get Involved</h3>
            {[
              ['Become a Member', '/register'], 
              ['Volunteer With Us', '/contact'], 
              ['Partner With Us', '/contact'], 
              ['Upcoming Events', '/events'], 
              ['Donate', '/contact']
            ].map(([label, href]) => (
              <Link key={label} to={href}>› <span>{label}</span></Link>
            ))}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Kirinyaga University Red Cross Chapter. All rights reserved.</span>
          <span>Made with <b>♥</b> by the KYU Red Cross Chapter</span>
        </div>
      </footer>
    </>
  );
}`,
  'pages/Home.jsx': `import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { slides } from '../data';

export default function Home() {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[slideIndex];

  return (
    <>
      <section className="hero" style={{ '--hero-image': \`url("\${slide.image}")\` }}>
        <div className="hero-shade"/>
        <div className="hero-content" key={slideIndex}>
          <p className="hero-eyebrow">{slide.eyebrow}</p>
          <h1>{slide.first}<br/><span>{slide.accent}</span></h1>
          <p className="hero-copy">{slide.description}</p>
          <div className="hero-actions">
            <Link className="button button-red" to={slide.primaryHref}>{slide.primary}<span>→</span></Link>
            <Link className="button button-outline" to={slide.secondaryHref}>{slide.secondary}</Link>
          </div>
        </div>
        <div className="slide-dots" aria-label="Hero slides">
          {slides.map((item, index) => (
            <button key={item.first} className={index === slideIndex ? 'active' : ''} onClick={() => setSlideIndex(index)} aria-label={\`Go to slide \${index + 1}\`} aria-pressed={index === slideIndex}/>
          ))}
        </div>
      </section>
      <section className="impact-strip" aria-label="Chapter impact">
        <div><span className="impact-icon">♧</span><strong>200+</strong><span>Active Members</span></div>
        <div><span className="impact-icon">▦</span><strong>50+</strong><span>Events Held</span></div>
        <div><span className="impact-icon">♡</span><strong>6+</strong><span>Years of Service</span></div>
        <div><span className="impact-icon">✳</span><strong>7</strong><span>Fundamental Principles</span></div>
      </section>
      <section className="join-band">
        <div>
          <h2>Become a Member or Volunteer With Us</h2>
          <p>Help us serve the Kirinyaga University community and beyond. Every hand counts — join the chapter today.</p>
        </div>
        <div className="join-actions">
          <Link className="button button-white" to="/register">Become a Member <span>→</span></Link>
          <Link className="button button-outline" to="/contact">Volunteer With Us</Link>
        </div>
      </section>
    </>
  );
}`,
  'pages/About.jsx': `import { imageUrl } from '../data';

export default function About() {
  return (
    <section className="section about-section" id="about">
      <div className="about-copy">
        <p className="eyebrow">WHO WE ARE</p>
        <h2>A Community Built on Humanity &amp; Service</h2>
        <p className="body-copy">The Kirinyaga University Red Cross Chapter is a student-led humanitarian organization committed to promoting the seven fundamental principles of the Red Cross Movement on campus and beyond.</p>
        <div className="service-grid">
          {[
            ['✚','First Aid','Training and responding to medical emergencies on and off campus.'],
            ['♥','Blood Drives','Organizing donation campaigns to support national blood banks.'],
            ['◎','Community Service','Reaching out to vulnerable groups in the surrounding community.'],
            ['↗','Capacity Building','Empowering students through workshops, drills, and leadership programs.']
          ].map(([icon,title,description]) => (
            <article className="service-item" key={title}>
              <span className="service-icon">{icon}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="about-photo-wrap">
        <img className="about-photo" src={imageUrl('Executive.png')} alt="KYU Red Cross executive team"/>
        <div className="member-badge">
          <strong>200+</strong>
          <span>Active Members<br/>Serving our community</span>
        </div>
      </div>
    </section>
  );
}`,
  'pages/Programs.jsx': `import { SectionHeading, programs } from '../data';
import { Link } from 'react-router-dom';

export default function Programs() {
  return (
    <section className="section section-muted" id="programs">
      <SectionHeading eyebrow="WHAT WE DO" title="Our Programs">
        Guided by humanitarian principles, we run impactful programs that serve our campus and surrounding communities.
      </SectionHeading>
      <div className="program-grid">
        {programs.map(([icon, title, description], index) => (
          <article className="program-card" key={title}>
            <span className={\`program-icon program-icon-\${index}\`}>{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <Link to="/contact">Learn More <span>→</span></Link>
          </article>
        ))}
      </div>
    </section>
  );
}`,
  'pages/Principles.jsx': `import { SectionHeading, principles } from '../data';

export default function Principles() {
  return (
    <section className="section principles-section" id="principles">
      <SectionHeading eyebrow="OUR FOUNDATION" title="The 7 Fundamental Principles" light>
        The Red Cross Red Crescent Movement is guided by seven fundamental principles that define our actions.
      </SectionHeading>
      <div className="principles-grid">
        {principles.map(([icon, title, description], index) => (
          <article className="principle-item" key={title}>
            <span className={\`principle-icon principle-icon-\${index}\`}>{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}`,
  'pages/Events.jsx': `import { SectionHeading, events } from '../data';

export default function Events() {
  return (
    <section className="section section-muted" id="events">
      <SectionHeading eyebrow="WHAT'S HAPPENING" title="Upcoming Events">
        Stay up to date with our latest programs, training sessions, and community outreach initiatives.
      </SectionHeading>
      <div className="event-grid">
        {events.map(([day, date, tag, title, description, location, time]) => (
          <article className="event-card" key={title}>
            <div className="event-date">
              <strong>{day}</strong>
              <span>{date}</span>
              <b>{tag}</b>
            </div>
            <div className="event-details">
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="event-meta">
                <span>⌖ {location}</span>
                <span>◷ {time}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}`,
  'pages/Team.jsx': `import { SectionHeading, leaders, imageUrl } from '../data';

export default function Team() {
  return (
    <section className="section team-section" id="team">
      <SectionHeading eyebrow="THE PEOPLE" title="Meet Our Leadership Team">
        Dedicated student leaders committed to humanitarian service and the growth of the chapter.
      </SectionHeading>
      <div className="team-grid">
        {leaders.map(([name, role, image]) => (
          <article className="team-card" key={name}>
            <img src={imageUrl(image)} alt={name} loading="lazy" />
            <div>
              <span>{role}</span>
              <h3>{name}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}`,
  'pages/Gallery.jsx': `import { useState } from 'react';
import { SectionHeading, gallery, imageUrl } from '../data';

export default function Gallery() {
  const [galleryFilter, setGalleryFilter] = useState('All');

  return (
    <section className="section section-muted gallery-section" id="gallery">
      <SectionHeading eyebrow="OUR MOMENTS" title="Photo Gallery">
        A glimpse into our activities, events, and the lives we touch across the campus and community.
      </SectionHeading>
      <div className="gallery-filters" role="group" aria-label="Filter gallery">
        {['All', 'Team', 'Outreach', 'Events'].map(filter => (
          <button key={filter} className={galleryFilter === filter ? 'selected' : ''} onClick={() => setGalleryFilter(filter)} aria-pressed={galleryFilter === filter}>
            {filter}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {gallery.filter(([, category]) => galleryFilter === 'All' || category === galleryFilter).map(([title, category, image]) => (
          <a className="gallery-card" href={imageUrl(image)} target="_blank" rel="noreferrer" key={title}>
            <img src={imageUrl(image)} alt={title} loading="lazy" />
            <div>
              <span>{category}</span>
              <h3>{title}</h3>
            </div>
            <span className="gallery-plus">+</span>
          </a>
        ))}
      </div>
    </section>
  );
}`,
  'pages/Contact.jsx': `import { useState } from 'react';

export default function Contact() {
  const [notice, setNotice] = useState('');

  return (
    <section className="section contact-section" id="contact">
      <div className="contact-copy">
        <p className="eyebrow">GET IN TOUCH</p>
        <h2>Contact Us or Join the Chapter</h2>
        <p className="body-copy">Whether you want to volunteer, join our team, or partner with us — we'd love to hear from you.</p>
        <div className="contact-list">
          <div>
            <span>⌖</span>
            <p><strong>Location</strong><br/>Kirinyaga University, Kutus<br/>Kirinyaga County, Kenya</p>
          </div>
          <div>
            <span>✉</span>
            <p><strong>Email</strong><br/><a href="mailto:redcross@kyu.ac.ke">redcross@kyu.ac.ke</a></p>
          </div>
          <div>
            <span>☎</span>
            <p><strong>Phone</strong><br/><a href="tel:+254700000000">+254 700 000 000</a></p>
          </div>
        </div>
      </div>
      <form className="contact-form" onSubmit={(event) => {
        event.preventDefault();
        setNotice('Thank you for reaching out. Your message is ready for the chapter team.');
        event.currentTarget.reset();
      }}>
        <h3>Send Us a Message</h3>
        <div className="form-row">
          <label>First Name<input name="firstName" placeholder="Jane" required/></label>
          <label>Last Name<input name="lastName" placeholder="Doe" required/></label>
        </div>
        <label>Email Address<input name="email" type="email" placeholder="jane@example.com" required/></label>
        <label>Subject
          <select name="subject" defaultValue="join">
            <option value="join">I want to join the chapter</option>
            <option value="volunteer">Volunteer opportunity</option>
            <option value="partnership">Partnership inquiry</option>
            <option value="question">General question</option>
          </select>
        </label>
        <label>Message<textarea name="message" rows="4" placeholder="Tell us a bit about yourself or your inquiry..." required/></label>
        <button className="button button-red" type="submit">Send Message <span>→</span></button>
        {notice && <p className="form-notice" role="status">{notice}</p>}
      </form>
    </section>
  );
}`,
  'pages/Login.jsx': `import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/portal/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Member Login</h2>
        <p>Welcome back to KYU Red Cross</p>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="Enter your password" />
          </div>
          <button type="submit" className="button button-red">Login to Portal</button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}`,
  'pages/Register.jsx': `import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join the Chapter</h2>
        <p>Register as a member of KYU Red Cross</p>
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required placeholder="Jane Doe" />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" required placeholder="jane@example.com" />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" required placeholder="+254..." />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="Create a password" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" required placeholder="Confirm your password" />
          </div>
          <button type="submit" className="button button-red">Register</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}`,
  'pages/Auth.css': `
.auth-container {
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--gray-50, #f9fafb);
  padding: 2rem;
}
.auth-card {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 450px;
}
.auth-card h2 {
  color: var(--red-600, #dc2626);
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
}
.auth-card p {
  color: var(--gray-500, #6b7280);
  margin-bottom: 2rem;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700, #374151);
}
.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-200, #e5e7eb);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}
.form-group input:focus {
  outline: none;
  border-color: var(--red-500, #ef4444);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.auth-form .button {
  margin-top: 1rem;
  width: 100%;
  justify-content: center;
}
.auth-footer {
  margin-top: 2rem !important;
  text-align: center;
  font-size: 0.875rem;
}
.auth-footer a {
  color: var(--red-600, #dc2626);
  font-weight: 500;
  text-decoration: none;
}
.auth-footer a:hover {
  text-decoration: underline;
}
  `,
  'components/PortalLayout.jsx': `import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, LayoutDashboard, Image as ImageIcon, Calendar, Activity, MessageSquare, Settings, LogOut, User, Bell } from 'lucide-react';
import './Portal.css';

export default function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const navLinks = [
    { to: '/portal/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/portal/gallery', icon: <ImageIcon size={20} />, label: 'Gallery' },
    { to: '/portal/events', icon: <Calendar size={20} />, label: 'Events' },
    { to: '/portal/firstaid', icon: <Activity size={20} />, label: 'First Aid' },
    { to: '/portal/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
  ];

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className={\`portal-sidebar \${sidebarOpen ? 'open' : ''}\`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <img src="https://kyuchapter.netlify.app/images/at-60-logo-203x114-1%20(1).png" alt="Logo" />
          </Link>
        </div>
        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => \`sidebar-link \${isActive ? 'active' : ''}\`} onClick={() => setSidebarOpen(false)}>
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="portal-main">
        {/* Navbar */}
        <header className="portal-navbar">
          <div className="navbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="navbar-title">Redcross Portal</h1>
          </div>
          
          <div className="navbar-right">
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="profile-menu">
              <button className="profile-btn" onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
                <User size={20} />
              </button>
              
              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <strong>John Doe</strong>
                    <span>Member</span>
                  </div>
                  <Link to="/portal/profile" onClick={() => setProfileDropdownOpen(false)}>
                    <User size={16} /> Profile
                  </Link>
                  <Link to="/portal/settings" onClick={() => setProfileDropdownOpen(false)}>
                    <Settings size={16} /> Settings
                  </Link>
                  <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="portal-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}`,
  'components/Portal.css': `
.portal-layout {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
  overflow: hidden;
}

.portal-sidebar {
  width: 260px;
  background-color: white;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 1000;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-brand img {
  height: 40px;
  object-fit: contain;
}

.sidebar-nav {
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  color: #64748b;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.sidebar-link:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.sidebar-link.active {
  background-color: #fee2e2;
  color: #dc2626;
}

.portal-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.portal-navbar {
  height: 72px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

.navbar-left, .navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.5rem;
}

.navbar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.2s;
}

.icon-btn:hover {
  background-color: #f1f5f9;
}

.profile-menu {
  position: relative;
}

.profile-btn {
  background-color: #f1f5f9;
  border: none;
  cursor: pointer;
  color: #0f172a;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.profile-btn:hover {
  background-color: #e2e8f0;
}

.profile-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
  width: 200px;
  z-index: 100;
  padding: 0.5rem 0;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
}

.dropdown-header strong {
  color: #0f172a;
  font-size: 0.875rem;
}

.dropdown-header span {
  color: #64748b;
  font-size: 0.75rem;
}

.profile-dropdown a, .logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  color: #475569;
  text-decoration: none;
  font-size: 0.875rem;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
}

.profile-dropdown a:hover, .logout-btn:hover {
  background-color: #f8fafc;
  color: #0f172a;
}

.logout-btn {
  color: #dc2626;
}

.logout-btn:hover {
  background-color: #fef2f2;
  color: #b91c1c;
}

.portal-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.portal-page {
  max-width: 1200px;
  margin: 0 auto;
}

.portal-page h2 {
  font-size: 1.875rem;
  color: #0f172a;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .portal-sidebar {
    position: fixed;
    height: 100%;
    transform: translateX(-100%);
  }

  .portal-sidebar.open {
    transform: translateX(0);
  }

  .menu-btn {
    display: block;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}
  `,
  'pages/Portal/Dashboard.jsx': `export default function Dashboard() {
  return (
    <div className="portal-page">
      <h2>Welcome Back!</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {[
          { title: 'Upcoming Events', value: '3', color: '#3b82f6' },
          { title: 'Total Hours Volunteered', value: '42', color: '#10b981' },
          { title: 'Trainings Completed', value: '5', color: '#8b5cf6' },
        ].map(stat => (
          <div key={stat.title} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>{stat.title}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  'pages/Portal/Gallery.jsx': `export default function PortalGallery() {
  return (
    <div className="portal-page">
      <h2>Gallery Updates</h2>
      <p>View internal event photos and resources.</p>
    </div>
  );
}`,
  'pages/Portal/Events.jsx': `export default function PortalEvents() {
  return (
    <div className="portal-page">
      <h2>My Events</h2>
      <p>Manage your registrations and upcoming activities.</p>
    </div>
  );
}`,
  'pages/Portal/FirstAid.jsx': `export default function FirstAid() {
  return (
    <div className="portal-page">
      <h2>First Aid Resources</h2>
      <p>Access training manuals and certificates.</p>
    </div>
  );
}`,
  'pages/Portal/Messages.jsx': `export default function Messages() {
  return (
    <div className="portal-page">
      <h2>Messages</h2>
      <p>Communicate with the leadership team and other members.</p>
    </div>
  );
}`,
  'pages/Portal/Profile.jsx': `export default function Profile() {
  return (
    <div className="portal-page">
      <h2>My Profile</h2>
      <p>Update your personal information.</p>
    </div>
  );
}`,
  'pages/Portal/Settings.jsx': `export default function Settings() {
  return (
    <div className="portal-page">
      <h2>Account Settings</h2>
      <p>Manage your account preferences and notifications.</p>
    </div>
  );
}`
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseDir, file), content);
});

console.log('Files created successfully.');
