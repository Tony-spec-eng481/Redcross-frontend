import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { slides as defaultSlides } from '../data';
import About from './About';
import Programs from './Programs';
import Principles from './Principles';
import Events from './Events';
import Team from './Team';
import Gallery from './Gallery';
import Contact from './Contact';

export default function Home() {
  const [slides, setSlides] = useState(defaultSlides);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/v1/hero');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const activeSlides = res.data.data.filter((s) => s.status !== 'inactive');
          if (activeSlides.length > 0) {
            setSlides(activeSlides);
          }
        }
      } catch (err) {
        // Silently keep defaultSlides on error or offline
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[slideIndex] || slides[0] || defaultSlides[0];

  return (
    <>
      <section className="hero" id="hero" style={{ '--hero-image': `url("${slide.image}")` }}>
        <div className="hero-shade"/>
        <div className="hero-content" key={slideIndex}>
          <p className="hero-eyebrow">{slide.eyebrow}</p>
          <h1>{slide.first}<br/><span>{slide.accent}</span></h1>
          <p className="hero-copy">{slide.description}</p>
          <div className="hero-actions">
            <Link className="button button-red" to={slide.primaryHref || slide.primary_href || '/about'}>
              {slide.primary || slide.primary_button_text || 'Learn More'}<span>→</span>
            </Link>
            <Link className="button button-outline" to={slide.secondaryHref || slide.secondary_href || '/contact'}>
              {slide.secondary || slide.secondary_button_text || 'Contact Us'}
            </Link>
          </div>
        </div>
        <div className="slide-dots" aria-label="Hero slides">
          {slides.map((item, index) => (
            <button
              key={item.id || item.first || index}
              className={index === slideIndex ? 'active' : ''}
              onClick={() => setSlideIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-pressed={index === slideIndex}
            />
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