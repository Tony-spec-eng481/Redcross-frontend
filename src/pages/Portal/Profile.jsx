import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/profile').then(res => setProfile(res.data));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/profile', profile);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      await axios.delete('http://localhost:5000/api/profile');
      window.location.href = '/login';
    }
  };

  return (
    <div className="portal-page">
      <h2>My Profile</h2>
      {message && <p style={{color: 'green'}}>{message}</p>}
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
        <label>Name <input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></label>
        <label>Email <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /></label>
        <label>Phone <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} /></label>
        <label>New Password <input type="password" placeholder="Leave blank to keep current" onChange={e => setProfile({...profile, password: e.target.value})} /></label>
        <button type="submit" className="button button-red">Update Profile</button>
      </form>
      <button onClick={handleDelete} className="button" style={{ marginTop: '2rem', background: '#fee2e2', color: '#dc2626' }}>Delete Account</button>
    </div>
  );
}