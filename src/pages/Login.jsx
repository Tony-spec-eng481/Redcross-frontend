import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { Eye, EyeOff, CheckCircle, Loader, ArrowLeft } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pre-fill email from registration redirect
  const registrationState = location.state || {};
  const [email, setEmail] = useState(registrationState.email || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(registrationState.message || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  
  const [attempts, setAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  // Check lockout status
  useEffect(() => {
    if (lockoutUntil) {
      const remaining = lockoutUntil - Date.now();
      if (remaining <= 0) {
        setLockoutUntil(null);
        setAttempts(0);
        setError('');
      } else {
        const timer = setTimeout(() => {
          setLockoutUntil(null);
          setAttempts(0);
          setError('');
        }, remaining);
        return () => clearTimeout(timer);
      }
    }
  }, [lockoutUntil]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (lockoutUntil && Date.now() < lockoutUntil) {
      return setError('Account locked for 3 minutes due to too many failed attempts.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return setError('Please enter a valid email address');
    }

    if (!password) {
      return setError('Please enter your password');
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: email.trim(),
        password,
      });

      if (response.data.success) {
        setAttempts(0);
        const token = response.data.token || response.data.accessToken;
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
        const memberData = response.data.data?.member || response.data.member;
        if (memberData) {
          sessionStorage.setItem('user', JSON.stringify(memberData));
          localStorage.removeItem('user');
        }
        sessionStorage.setItem('portal_last_activity', Date.now().toString());
        navigate('/portal/dashboard');
      }
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockoutUntil(Date.now() + 3 * 60 * 1000);
        setError('Account locked for 3 minutes due to too many failed attempts.');
      } else {
        const errMsg = err.response?.data?.message || `Failed to login. ${5 - newAttempts} attempts remaining.`;
        setError(errMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="auth-back-link" title="Return to home page">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <h2>Member Login</h2>
        <p>Welcome back to KYU Red Cross</p>

        <form onSubmit={handleLogin} className="auth-form">
          {successMessage && (
            <div className="success-banner">
              <CheckCircle size={16} />
              <span>{successMessage}</span>
            </div>
          )}
          {error && (
            <div className="error-banner">
              <span>{error}</span>
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={isLoading || !!lockoutUntil}
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--red-600, #dc2626)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={isLoading || !!lockoutUntil}
              />
              {showPassword ? (
                <EyeOff className="password-toggle-icon" size={20} onClick={() => setShowPassword(false)} />
              ) : (
                <Eye className="password-toggle-icon" size={20} onClick={() => setShowPassword(true)} />
              )}
            </div>
          </div>
          <button type="submit" className="button button-red" disabled={isLoading || !!lockoutUntil}>
            {isLoading ? 'Logging in...' : 'Login to Portal'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: '0.75rem' }}>
          <Link to="/" style={{ color: 'var(--gray-500, #6b7280)', fontWeight: 'normal', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>← Back to Home</span>
          </Link>
        </p>
      </div>
    </div>
  );
}