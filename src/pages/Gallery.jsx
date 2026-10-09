import { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { SectionHeading, gallery as fallbackGallery, imageUrl } from '../data';

export default function Gallery() {
  const [galleryFilter, setGalleryFilter] = useState('All');
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${API_BASE}/gallery`);
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data?.data || []);
        if (items.length > 0) {
          setGallery(items);
        } else {
          // If no items from backend, use fallback data
          setGallery(fallbackGallery.map(([title, category, image]) => ({
            id: title,
            title,
            category,
            image_url: imageUrl(image),
            url: imageUrl(image),
          })));
          setUsingFallback(true);
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
        // Fallback to hardcoded data
        setGallery(fallbackGallery.map(([title, category, image]) => ({
          id: title,
          title,
          category,
          image_url: imageUrl(image),
          url: imageUrl(image),
        })));
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  // Collect unique categories from fetched data
  const categories = ['All', ...new Set(gallery.map(item => item.category || 'General').filter(Boolean))];

  const filteredGallery = gallery.filter(item => {
    if (galleryFilter === 'All') return true;
    return (item.category || 'General') === galleryFilter;
  });

  return (
    <section className="section section-muted gallery-section" id="gallery">
      <SectionHeading eyebrow="OUR MOMENTS" title="Photo Gallery">
        A glimpse into our activities, events, and the lives we touch across the campus and community.
      </SectionHeading>
      <div className="gallery-filters" role="group" aria-label="Filter gallery">
        {categories.map(filter => (
          <button key={filter} className={galleryFilter === filter ? 'selected' : ''} onClick={() => setGalleryFilter(filter)} aria-pressed={galleryFilter === filter}>
            {filter}
          </button>
        ))}
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#717984' }}>
          <p>Loading gallery...</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredGallery.map(item => {
            const imgSrc = item.image_url || item.url;
            return (
              <a className="gallery-card" href={imgSrc} target="_blank" rel="noreferrer" key={item.id || item.title}>
                <img src={imgSrc} alt={item.title} loading="lazy" />
                <div>
                  <span>{item.category || 'General'}</span>
                  <h3>{item.title}</h3>
                </div>
                <span className="gallery-plus">+</span>
              </a>
            );
          })}
          {filteredGallery.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#717984' }}>
              <p>No photos found for this category.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}