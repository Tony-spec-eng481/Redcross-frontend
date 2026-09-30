import { useState } from 'react';
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
}