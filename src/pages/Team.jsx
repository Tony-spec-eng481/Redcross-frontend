import { SectionHeading, leaders, imageUrl } from '../data';

export default function Team() {
  return (
    <section className="section team-section" id="team">
      <SectionHeading eyebrow="THE PEOPLE" title="Meet Our Leadership Team">
        Dedicated student leaders committed to humanitarian service and the growth of the chapter.
      </SectionHeading>
      <div className="team-grid">
        {leaders.map(([name, role, image]) => (
          <article className="team-card" key={name}>
            <img src={imageUrl(image)} alt={name} loading="lazy" />
            <div>
              <span>{role}</span>
              <h3>{name}</h3>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}