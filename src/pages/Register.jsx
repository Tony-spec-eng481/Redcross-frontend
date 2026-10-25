import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!formData.name.trim()) {
      return setError('Please enter your full name.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError('Please enter a valid email address.');
    }

    if (formData.phone) {
      const phoneRegex = /^(07|01|\+254)/;
      if (!phoneRegex.test(formData.phone)) {
        return setError('Phone number must start with 07, 01, or +254.');
      }
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError('Password must be at least 8 characters long, and contain letters, numbers, and symbols.');
    }

    if(formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password
      });

      if (response.data.success) {
        setSuccess(response.data.message || 'Registration successful! Redirecting to login...');
        
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login with your credentials.',
              email: formData.email.trim()
            } 
          });
        }, 3000);
      }
    } catch (err) {
      const backendMsg = err.response?.data?.message;
      if (backendMsg) {
        setError(backendMsg);
      } else if (err.response?.status === 409) {
        setError('An account with this email already exists. Please login instead.');
      } else if (err.response?.status === 400) {
        setError('Please check your information and try again.');
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show success state
  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="success-icon-wrapper">
            <CheckCircle size={64} color="#16a34a" strokeWidth={1.5} />
          </div>
          <h2 style={{ color: '#16a34a', marginTop: '1rem' }}>Welcome Aboard!</h2>
          <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {success}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '1rem' }}>
            Check your email for a welcome message with your login details.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <div className="redirect-loader">
              <Loader size={18} className="spin-animation" />
              <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
                Redirecting to login...
              </span>
            </div>
          </div>
          <p className="auth-footer">
            <Link to="/login" style={{ fontWeight: 600 }}>Go to Login Now →</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join the Chapter</h2>
        <p>Register as a member of KYU Red Cross</p>
        <form onSubmit={handleRegister} className="auth-form">
          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="form-group">
            <label>Full Name <span style={{color: '#dc2626'}}>*</span></label>
            <input 
              type="text" 
              name="name" 
              required 
              placeholder="Henry James" 
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>Email Address <span style={{color: '#dc2626'}}>*</span></label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="james@example.com" 
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="+254..." 
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label>Password <span style={{color: '#dc2626'}}>*</span></label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                required 
                placeholder="Create a password" 
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              {showPassword ? (
                <EyeOff className="password-toggle-icon" size={20} onClick={() => setShowPassword(false)} />
              ) : (
                <Eye className="password-toggle-icon" size={20} onClick={() => setShowPassword(true)} />
              )}
            </div>
            <span className="field-hint">At least 8 characters with letters, numbers, and symbols</span>
          </div>
          <div className="form-group">
            <label>Confirm Password <span style={{color: '#dc2626'}}>*</span></label>
            <div className="password-input-wrapper">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                required 
                placeholder="Confirm your password" 
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
              />
              {showConfirmPassword ? (
                <EyeOff className="password-toggle-icon" size={20} onClick={() => setShowConfirmPassword(false)} />
              ) : (
                <Eye className="password-toggle-icon" size={20} onClick={() => setShowConfirmPassword(true)} />
              )}
            </div>
          </div>
          <button type="submit" className="button button-red" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader size={18} className="spin-animation" style={{ marginRight: '0.5rem' }} />
                Creating Account...
              </>
            ) : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}