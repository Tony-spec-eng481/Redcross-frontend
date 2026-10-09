import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleForgot = async (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return setError('Please enter a valid email address');
    }

    setIsLoading(true);

    try {
      await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, {
        email: email.trim(),
      });
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not process password reset. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p>Enter your registered email to receive reset instructions</p>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                lineHeight: '48px',
                borderRadius: '50%',
                background: '#ECFDF5',
                color: '#059669',
                fontSize: '24px',
                margin: '0 auto 1rem auto',
                fontWeight: 'bold',
              }}
            >
              ✓
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '0.5rem' }}>
              Instructions Dispatched
            </h3>
            <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              If an account exists for <strong>{email}</strong>, we have sent a secure password reset link to your inbox.
            </p>
            <Link to="/login" className="button button-red" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleForgot} className="auth-form" noValidate>
            {error && (
              <p className="error-message" style={{ color: 'red', fontSize: '0.875rem', margin: 0 }}>
                {error}
              </p>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="button button-red" disabled={isLoading}>
              {isLoading ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
