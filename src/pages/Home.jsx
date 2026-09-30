import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { slides } from '../data';
import About from './About';
import Programs from './Programs';
import Principles from './Principles';
import Events from './Events';
import Team from './Team';
import Gallery from './Gallery';
import Contact from './Contact';

export default function Home() {
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const slide = slides[slideIndex];

  return (
    <>
      <section className="hero" id="hero" style={{ '--hero-image': `url("${slide.image}")` }}>
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
            <button key={item.first} className={index === slideIndex ? 'active' : ''} onClick={() => setSlideIndex(index)} aria-label={`Go to slide ${index + 1}`} aria-pressed={index === slideIndex}/>
          ))}
        </div>
      </section>

      <section className="impact-strip" aria-label="Chapter impact">
        <div><span className="impact-icon">♧</span><strong>200+</strong><span>Active Members</span></div>
        <div><span className="impact-icon">▦</span><strong>50+</strong><span>Events Held</span></div>
        <div><span className="impact-icon">♡</span><strong>6+</strong><span>Years of Service</span></div>
        <div><span className="impact-icon">✳</span><strong>7</strong><span>Fundamental Principles</span></div>
      </section>

      <About />
      <Programs />
      <Principles />

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

      <Events />
      <Team />
      <Gallery />
      <Contact />
    </>
  );
}