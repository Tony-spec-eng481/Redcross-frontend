import { SectionHeading, events } from '../data';

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
}