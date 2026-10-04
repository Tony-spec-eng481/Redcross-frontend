import { useState, useEffect } from 'react';
import axios from 'axios';
import { SectionHeading, events as defaultEvents } from '../data';

const parseEventDate = (dateStr) => {
  if (!dateStr) return { day: 'TBD', monthYear: 'Upcoming' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: 'TBD', monthYear: dateStr };
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return { day, monthYear: `${month} ${year}` };
  } catch {
    return { day: 'TBD', monthYear: dateStr };
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return 'TBD';
  // If format is HH:MM:SS or HH:MM
  try {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    }
    return timeStr;
  } catch {
    return timeStr;
  }
};

export default function Events() {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchApprovedEvents = async () => {
      try {
        // Try v1 API first, then fallback
        const res = await axios.get('http://localhost:5000/api/v1/events');
        const rawData = Array.isArray(res.data) ? res.data : res.data?.data;
        
        if (isMounted && Array.isArray(rawData) && rawData.length > 0) {
          const transformed = rawData.map(ev => {
            const { day, monthYear } = parseEventDate(ev.date);
            return {
              id: ev.id,
              day,
              date: monthYear,
              tag: ev.category || 'General',
              title: ev.title,
              description: ev.description || 'Join us for this chapter event.',
              location: ev.location || 'Kirinyaga University',
              time: formatTime(ev.time),
              image_url: ev.image_url,
            };
          });
          setEventsList(transformed);
          setLoading(false);
          return;
        }
      } catch {
        // Try fallback legacy /api/events route
        try {
          const res2 = await axios.get('http://localhost:5000/api/events');
          const rawData2 = Array.isArray(res2.data) ? res2.data : res2.data?.data;
          if (isMounted && Array.isArray(rawData2) && rawData2.length > 0) {
            const transformed = rawData2.map(ev => {
              const { day, monthYear } = parseEventDate(ev.date);
              return {
                id: ev.id,
                day,
                date: monthYear,
                tag: ev.category || 'General',
                title: ev.title,
                description: ev.description || 'Join us for this chapter event.',
                location: ev.location || 'Kirinyaga University',
                time: formatTime(ev.time),
                image_url: ev.image_url,
              };
            });
            setEventsList(transformed);
            setLoading(false);
            return;
          }
        } catch {
          // If server fails or offline, use default static events
        }
      }

      // Fallback to static data from data.jsx
      if (isMounted) {
        const fallback = defaultEvents.map(([day, date, tag, title, description, location, time], idx) => ({
          id: `default-${idx}`,
          day,
          date,
          tag,
          title,
          description,
          location,
          time,
        }));
        setEventsList(fallback);
        setLoading(false);
      }
    };

    fetchApprovedEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section section-muted" id="events">
      <SectionHeading eyebrow="WHAT'S HAPPENING" title="Upcoming Events">
        Stay up to date with our latest programs, training sessions, and community outreach initiatives.
      </SectionHeading>
      
      <div className="event-grid">
        {eventsList.map((ev) => (
          <article className="event-card" key={ev.id || ev.title}>
            <div className="event-date">
              <strong>{ev.day}</strong>
              <span>{ev.date}</span>
              <b>{ev.tag}</b>
            </div>
            <div className="event-details">
              <h3>{ev.title}</h3>
              <p>{ev.description}</p>
              <div className="event-meta">
                <span>⌖ {ev.location}</span>
                <span>◷ {ev.time}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}