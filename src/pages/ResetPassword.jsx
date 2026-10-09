import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Eye, EyeOff } from 'lucide-react';
import './Auth.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      return setError('Reset token is required.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/auth/reset-password/${token.trim()}`, {
        password,
        confirmPassword,
      });

      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Password reset token is invalid or has expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Set New Password</h2>
        <p>Choose a new password for your account</p>

        {success ? (
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
              Password Reset Complete!
            </h3>
            <p style={{ color: '#4B5563', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your password has been successfully updated. You can now log in with your new credentials.
            </p>
            <Link to="/login" className="button button-red" style={{ display: 'inline-block', textDecoration: 'none' }}>
              Proceed to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="auth-form" noValidate>
            {error && (
              <p className="error-message" style={{ color: 'red', fontSize: '0.875rem', margin: 0 }}>
                {error}
              </p>
            )}

            <div className="form-group">
              <label>Reset Token</label>
              <input
                type="text"
                required
                placeholder="Reset Token"
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                />
                {showPassword ? (
                  <EyeOff className="password-toggle-icon" size={20} onClick={() => setShowPassword(false)} />
                ) : (
                  <Eye className="password-toggle-icon" size={20} onClick={() => setShowPassword(true)} />
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError('');
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button type="submit" className="button button-red" disabled={isLoading}>
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Back to <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
