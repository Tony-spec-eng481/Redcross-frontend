import { SectionHeading, programs } from '../data';
import { Link } from 'react-router-dom';

export default function Programs() {
  return (
    <section className="section section-muted" id="programs">
      <SectionHeading eyebrow="WHAT WE DO" title="Our Programs">
        Guided by humanitarian principles, we run impactful programs that serve our campus and surrounding communities.
      </SectionHeading>
      <div className="program-grid">
        {programs.map(([icon, title, description], index) => (
          <article className="program-card" key={title}>
            <span className={`program-icon program-icon-${index}`}>{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <Link to="/contact">Learn More <span>→</span></Link>
          </article>
        ))}
      </div>
    </section>
  );
}