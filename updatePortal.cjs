const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/DELL/Desktop/redcross/frontend/src/pages/Portal';

const files = {
  'Profile.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/profile').then(res => setProfile(res.data));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/profile', profile);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      await axios.delete('http://localhost:5000/api/profile');
      window.location.href = '/login';
    }
  };

  return (
    <div className="portal-page">
      <h2>My Profile</h2>
      {message && <p style={{color: 'green'}}>{message}</p>}
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <label>Name <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></label>
        <label>Email <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /></label>
        <label>Phone <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} /></label>
        <label>New Password <input type="password" placeholder="Leave blank to keep current" onChange={e => setProfile({...profile, password: e.target.value})} /></label>
        <button type="submit" className="button button-red">Update Profile</button>
      </form>
      <button onClick={handleDelete} className="button" style={{ marginTop: '2rem', background: '#fee2e2', color: '#dc2626' }}>Delete Account</button>
    </div>
  );
}`,
  'Events.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PortalEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/events').then(res => setEvents(res.data));
  }, []);

  return (
    <div className="portal-page">
      <h2>Upcoming Events</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {events.map(ev => (
          <div key={ev.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3>{ev.title}</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{ev.date} at {ev.time}</p>
            <p style={{ marginTop: '0.5rem' }}>{ev.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  'Gallery.jsx': `import { useState, useEffect } from 'react';
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
}`,
  'FirstAid.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FirstAid() {
  const [data, setData] = useState([]);
  const [question, setQuestion] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/firstaid').then(res => setData(res.data));
  }, []);

  const handleAsk = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/firstaid/questions', { text: question });
    alert('Question submitted!');
    setQuestion('');
  };

  return (
    <div className="portal-page">
      <h2>First Aid Resources</h2>
      <div style={{ marginBottom: '2rem' }}>
        {data.map(item => (
          <div key={item.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h3>{item.title}</h3>
            <p>{item.content}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px' }}>
        <h3>Ask a Question</h3>
        <form onSubmit={handleAsk}>
          <textarea rows="3" style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }} value={question} onChange={e => setQuestion(e.target.value)} required placeholder="Type your question here..."></textarea>
          <button type="submit" className="button button-red" style={{ marginTop: '1rem' }}>Send to Everyone</button>
        </form>
      </div>
    </div>
  );
}`,
  'Messages.jsx': `import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const fetchMessages = () => {
    axios.get('http://localhost:5000/api/messages/1').then(res => setMessages(res.data));
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/messages', { text });
    setText('');
    fetchMessages();
  };

  return (
    <div className="portal-page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      <h2>Community Chat</h2>
      <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '1rem', overflowY: 'auto', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: '1rem', background: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '16px', display: 'inline-block', maxWidth: '80%' }}>
            {msg.text}
          </div>
        ))}
        {messages.length === 0 && <p style={{color:'#9ca3af'}}>No messages yet...</p>}
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
        <input value={text} onChange={e => setText(e.target.value)} style={{ flex: 1, padding: '0.75rem', borderRadius: '24px', border: '1px solid #ccc' }} placeholder="Type a message..." required />
        <button type="submit" className="button button-red" style={{ borderRadius: '24px' }}>Send</button>
      </form>
    </div>
  );
}`
};

Object.entries(files).forEach(([file, content]) => {
  fs.writeFileSync(path.join(baseDir, file), content);
});

console.log('Frontend Portal updated.');
