import { useState, useEffect } from 'react';
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
}