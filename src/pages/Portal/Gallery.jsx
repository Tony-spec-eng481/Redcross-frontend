import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PortalGallery() {
  const [images, setImages] = useState([]);
  const [newImage, setNewImage] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/gallery').then(res => setImages(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/gallery', { url: newImage });
      setMsg('Image submitted for admin review.');
      setNewImage('');
    } catch(err) {
      setMsg('Failed to submit.');
    }
  };

  return (
    <div className="portal-page">
      <h2>Community Gallery</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input placeholder="Image URL..." value={newImage} onChange={e => setNewImage(e.target.value)} required style={{ padding: '0.5rem', width: '300px' }} />
        <button type="submit" className="button button-red" style={{ marginLeft: '1rem' }}>Submit Photo</button>
        {msg && <span style={{ marginLeft: '1rem', color: 'green' }}>{msg}</span>}
      </form>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {images.map(img => (
          <div key={img.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0.5rem' }}>
            <img src={img.url} alt="Gallery" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
            <a href={img.url} download target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', color: '#dc2626' }}>Download</a>
          </div>
        ))}
      </div>
    </div>
  );
}