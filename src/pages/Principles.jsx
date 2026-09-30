import { SectionHeading, principles } from '../data';

export default function Principles() {
  return (
    <section className="section principles-section" id="principles">
      <SectionHeading eyebrow="OUR FOUNDATION" title="The 7 Fundamental Principles" light>
        The Red Cross Red Crescent Movement is guided by seven fundamental principles that define our actions.
      </SectionHeading>
      <div className="principles-grid">
        {principles.map(([icon, title, description], index) => (
          <article className="principle-item" key={title}>
            <span className={`principle-icon principle-icon-${index}`}>{icon}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}