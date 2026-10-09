import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config';

export default function Profile() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : { name: '', email: '', phone: '', role: 'Member' };
    } catch {
      return { name: '', email: '', phone: '', role: 'Member' };
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    axios
      .get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success && res.data.data) {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
      })
      .catch((err) => {
        console.warn('Using cached profile details:', err);
      });
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setUpdatingProfile(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `${API_BASE}/auth/profile`,
        {
          name: user.name,
          phone: user.phone,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        if (res.data.data) {
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        }
      } else {
        setProfileMsg({ type: 'error', text: res.data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Error updating profile. Please try again.',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!passwordData.newPassword) {
      setPasswordMsg({ type: 'error', text: 'Please enter a new password.' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setChangingPassword(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/auth/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setPasswordMsg({
          type: 'success',
          text: '🎉 Your password has been changed successfully! Use your new password next time you log in.',
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg({ type: 'error', text: res.data.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Error changing password. Verify your current password and try again.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="portal-page" style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem 0' }}>
          My Member Profile
        </h1>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '0.95rem' }}>
          Manage your account credentials, personal information, and password security.
        </p>
      </div>

      {/* Guide Card for Default Password */}
      <div
        style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderLeft: '4px solid #2563eb',
          borderRadius: '0 8px 8px 0',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          color: '#1e40af',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🔒</span>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e3a8a' }}>
            Account Security & Default Password Guide
          </h3>
        </div>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.925rem', lineHeight: '1.5' }}>
          When created by an administrator, your default account password is set to <strong>Redcross</strong>.
          For security purposes, we strongly recommend changing your password below immediately upon your first login.
        </p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#1d4ed8' }}>
          💡 If you ever forget your password, you can also use the <strong>"Forgot Password?"</strong> link on the login page to receive a password reset link in your email.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        {/* Personal Details Form */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '1.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>👤</span>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>
              Personal Information
            </h2>
          </div>

          {profileMsg.text && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                background: profileMsg.type === 'success' ? '#def7ec' : '#fde8e8',
                color: profileMsg.type === 'success' ? '#03543f' : '#9b1c1c',
                border: `1px solid ${profileMsg.type === 'success' ? '#bcf0da' : '#fbd5d5'}`,
              }}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={user.name || ''}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user.email || ''}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  color: '#6b7280',
                  fontSize: '0.95rem',
                  cursor: 'not-allowed',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                value={user.phone || ''}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                placeholder="+254 700 000000"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>
                  Member Code
                </label>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginTop: '2px' }}>
                  {user.member_code || 'RC-MEM-OFFICIAL'}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>
                  Role / Status
                </label>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#cc0000', marginTop: '2px' }}>
                  {user.role || 'Member'} • Active
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              style={{
                width: '100%',
                background: '#cc0000',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: updatingProfile ? 'wait' : 'pointer',
              }}
            >
              {updatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div
          style={{
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '1.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🔑</span>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#111827' }}>
              Change Password
            </h2>
          </div>

          {passwordMsg.text && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
                background: passwordMsg.type === 'success' ? '#def7ec' : '#fde8e8',
                color: passwordMsg.type === 'success' ? '#03543f' : '#9b1c1c',
                border: `1px solid ${passwordMsg.type === 'success' ? '#bcf0da' : '#fbd5d5'}`,
              }}
            >
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Current Password (Default: Redcross)
              </label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              style={{
                width: '100%',
                background: '#111827',
                color: '#fff',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: changingPassword ? 'wait' : 'pointer',
              }}
            >
              {changingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
            <a
              href="/forgot-password"
              style={{ fontSize: '0.875rem', color: '#cc0000', textDecoration: 'none', fontWeight: 600 }}
            >
              Forgot your current password? Request reset link →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}