import { useState, useEffect } from 'react';
import { API_BASE, BACKEND_URL } from '../config';
import { SectionHeading, leaders as defaultLeaders, imageUrl } from '../data';

// Helper to resolve image URL for both uploaded Supabase assets and static assets
const resolveTeamImage = (img) => {
  if (!img) return null;
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:') || img.startsWith('/uploads/')) {
    return img;
  }
  return imageUrl(img);
};

export default function Team() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaders = async () => {
      try {
        const endpoints = [
          `${API_BASE}/leaders?status=active`,
          `${BACKEND_URL}/api/leaders?status=active`
        ];

        let fetchedData = null;

        for (const url of endpoints) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const json = await res.json();
              if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
                fetchedData = json.data;
                break;
              }
            }
          } catch {
            // continue to next endpoint
          }
        }

        if (isMounted) {
          if (fetchedData && fetchedData.length > 0) {
            // Normalize backend leaders
            const normalized = fetchedData.map(item => ({
              id: item.id,
              name: item.name,
              role: item.role,
              image: item.image,
              bio: item.bio
            }));
            setTeam(normalized);
          } else {
            // Fallback to static data
            const normalizedDefaults = defaultLeaders.map(([name, role, image], idx) => ({
              id: `default_${idx}`,
              name,
              role,
              image,
              bio: ''
            }));
            setTeam(normalizedDefaults);
          }
        }
      } catch (err) {
        console.error('Failed to load leaders:', err);
        if (isMounted) {
          const normalizedDefaults = defaultLeaders.map(([name, role, image], idx) => ({
            id: `default_${idx}`,
            name,
            role,
            image,
            bio: ''
          }));
          setTeam(normalizedDefaults);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaders();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section team-section" id="team">
      <SectionHeading eyebrow="THE PEOPLE" title="Meet Our Leadership Team">
        Dedicated student leaders committed to humanitarian service and the growth of the chapter.
      </SectionHeading>

      <div className="team-grid">
        {team.map((member) => {
          const resolvedSrc = resolveTeamImage(member.image);

          return (
            <article className="team-card" key={member.id || member.name}>
              {resolvedSrc ? (
                <img
                  src={resolvedSrc}
                  alt={member.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 330,
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '3rem',
                    fontWeight: 'bold'
                  }}
                >
                  ✚
                </div>
              )}
              <div>
                <span>{member.role}</span>
                <h3>{member.name}</h3>
                {member.bio && (
                  <p style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '4px', opacity: 0.9 }}>
                    {member.bio}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}