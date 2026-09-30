import { imageUrl } from '../data';

export default function About() {
  return (
    <section className="section about-section" id="about">
      <div className="about-copy">
        <p className="eyebrow">WHO WE ARE</p>
        <h2>A Community Built on Humanity &amp; Service</h2>
        <p className="body-copy">The Kirinyaga University Red Cross Chapter is a student-led humanitarian organization committed to promoting the seven fundamental principles of the Red Cross Movement on campus and beyond.</p>
        <div className="service-grid">
          {[
            ['✚','First Aid','Training and responding to medical emergencies on and off campus.'],
            ['♥','Blood Drives','Organizing donation campaigns to support national blood banks.'],
            ['◎','Community Service','Reaching out to vulnerable groups in the surrounding community.'],
            ['↗','Capacity Building','Empowering students through workshops, drills, and leadership programs.']
          ].map(([icon,title,description]) => (
            <article className="service-item" key={title}>
              <span className="service-icon">{icon}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="about-photo-wrap">
        <img className="about-photo" src={imageUrl('Executive.png')} alt="KYU Red Cross executive team"/>
        <div className="member-badge">
          <strong>200+</strong>
          <span>Active Members<br/>Serving our community</span>
        </div>
      </div>
    </section>
  );
}