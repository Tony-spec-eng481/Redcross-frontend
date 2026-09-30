import { useState } from 'react';
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
}