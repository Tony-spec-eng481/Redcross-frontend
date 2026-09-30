export default function Dashboard() {
  return (
    <div className="portal-page">
      <h2>Welcome Back!</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {[
          { title: 'Upcoming Events', value: '3', color: '#3b82f6' },
          { title: 'Total Hours Volunteered', value: '42', color: '#10b981' },
          { title: 'Trainings Completed', value: '5', color: '#8b5cf6' },
        ].map(stat => (
          <div key={stat.title} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>{stat.title}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}