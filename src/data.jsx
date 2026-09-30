export const slides = [
  { eyebrow: 'KIRINYAGA UNIVERSITY · RED CROSS CHAPTER', first: 'Ready to Help.', accent: 'Always.', description: 'Serving humanity through compassion, courage, and community care — right here on campus.', primary: 'Learn About Us', primaryHref: '/about', secondary: 'Join the Chapter', secondaryHref: '/contact', image: 'https://kyuchapter.netlify.app/1.jpeg' },
  { eyebrow: 'FIRST AID · BLOOD DRIVES · OUTREACH', first: 'Compassion in', accent: 'Every Action.', description: 'From first aid training to community outreach — we show up when it matters most.', primary: 'See Our Events', primaryHref: '/events', secondary: 'Volunteer With Us', secondaryHref: '/contact', image: 'https://kyuchapter.netlify.app/2.jpeg' },
  { eyebrow: 'HUMANITY · IMPARTIALITY · NEUTRALITY', first: 'One Chapter.', accent: 'Countless Lives.', description: 'United by the seven fundamental principles of the Red Cross Movement, we serve without boundaries.', primary: 'Our Mission', primaryHref: '/about', secondary: 'Meet the Team', secondaryHref: '/team', image: 'https://kyuchapter.netlify.app/3.jpeg' },
]

export const programs = [
  ['✚', 'First Aid & Emergency Response', 'We train students and community members in basic first aid, CPR, and emergency response protocols to save lives on campus and beyond.'],
  ['♥', 'Blood Donation Drives', 'Organizing regular blood donation campaigns in partnership with Kenya National Blood Transfusion Service to support critical medical needs.'],
  ['◎', 'Community Outreach', 'Visiting local schools, health centres and vulnerable communities to provide medical support, hygiene education, and relief supplies.'],
  ['↗', 'Capacity Building', 'Workshops, leadership seminars, and drill exercises that empower students to become effective humanitarian volunteers.'],
  ['⌁', 'Disaster Preparedness', 'Equipping students with knowledge and skills to respond effectively to natural disasters, accidents and mass casualty incidents.'],
  ['✳', 'Youth Development', 'Promoting youth-led volunteerism, peer support programs, and sustainable humanitarian action among university students.'],
]

export const principles = [
  ['♡', 'Humanity', 'To prevent and alleviate human suffering wherever it may be found.'],
  ['⚖', 'Impartiality', 'No discrimination based on nationality, race, religion, class or political opinions.'],
  ['◉', 'Neutrality', 'Refraining from taking sides in hostilities or engaging in controversies.'],
  ['◇', 'Independence', 'Autonomous and independent from governments and institutions.'],
  ['♥', 'Voluntary Service', 'A voluntary relief movement not prompted by desire for gain.'],
  ['∞', 'Unity', 'There can only be one Red Cross or Red Crescent Society in any one country.'],
  ['◎', 'Universality', 'A worldwide institution where all Societies have equal status and responsibilities.'],
  ['✚', 'Our Commitment', 'At KYU Red Cross we uphold all seven principles in every action we take.'],
]

export const events = [
  ['25', 'Sep 2026', 'First Aid', 'Basic First Aid & CPR Training', 'Open to all university students. Learn life-saving skills including CPR, wound management, and emergency response protocols.', 'Main Hall, KYU', '9:00 AM'],
  ['31', 'Mar 2026', 'AGM', 'Annual General Meeting', "Join us for our annual general meeting to discuss the chapter's progress, upcoming initiatives, and community impact.", 'Auditorium B', '4:00 PM'],
  ['16', 'May 2026', 'Walk', 'County Walk — Kirinyaga', 'Visiting local schools and health centres to provide basic medical support, health education, and distribute hygiene kits.', 'Kirinyaga County', '7:30 AM'],
]

export const leaders = [
  ['Dennis Kiptanui', 'Chairperson', 'Dennis.jpeg'], ['Ian Kamau', 'Vice Chairperson', 'Ian.jpeg'], ['Mary Kahora', 'Secretary', 'Mary1.jpeg'],
  ['Tabitha Cherotich', 'Treasurer', 'Tabitha.jpeg'], ['Kennedy Macharia', 'First Aid Officer', 'ken2.jpeg'], ['Francis Lobun', 'Asst. First Aid Officer', 'Portfolio%20.jpg'],
  ['Amos Maliro', 'Organising Secretary', 'Amos.jpeg'], ['Holinda Kiarie', 'Dissemination Officer', 'Holinda.jpeg'], ['Orange', 'IT Personnel', 'Orange.jpeg'],
]

export const gallery = [
  ['Executive Team', 'Team', 'Executive.png'], ['Children Visit', 'Outreach', 'Childrenvisit1.jpeg'], ['Campus Awareness Week', 'Events', 'Awareness.jpeg'],
  ['Community Outreach', 'Outreach', 'community.jpeg'], ['Chapter Members', 'Team', 'Red%20Cross%20Team.png'], ['Leadership Workshop', 'Events', 'Leaderdhip.jpeg'],
]

export const imageUrl = (name) => `https://kyuchapter.netlify.app/images/${name}`

export function SectionHeading({ eyebrow, title, children, light = false }) {
  return <div className={`section-heading${light ? ' section-heading-light' : ''}`}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children && <p className="section-description">{children}</p>}</div>
}
