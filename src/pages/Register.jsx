import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config';
import { Eye, EyeOff } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError('Please enter a valid email address');
    }

    const phoneRegex = /^(07|01|\+254)/;
    if (!phoneRegex.test(formData.phone)) {
      return setError('Phone number must start with 07, 01, or +254');
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      return setError('Password must be at least 8 characters long, and contain letters, numbers, and symbols');
    }

    if(formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      if (response.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Join the Chapter</h2>
        <p>Register as a member of KYU Red Cross</p>
        <form onSubmit={handleRegister} className="auth-form">
          {error && <p className="error-message" style={{color: 'red', fontSize: '0.875rem'}}>{error}</p>}
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" required placeholder="Henry James" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" required placeholder="james@example.com" onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" required placeholder="+254..." onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input type={showPassword ? "text" : "password"} name="password" required placeholder="Create a password" onChange={handleChange} />
              {showPassword ? (
                <EyeOff className="password-toggle-icon" size={20} onClick={() => setShowPassword(false)} />
              ) : (
                <Eye className="password-toggle-icon" size={20} onClick={() => setShowPassword(true)} />
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" required placeholder="Confirm your password" onChange={handleChange} />
              {showConfirmPassword ? (
                <EyeOff className="password-toggle-icon" size={20} onClick={() => setShowConfirmPassword(false)} />
              ) : (
                <Eye className="password-toggle-icon" size={20} onClick={() => setShowConfirmPassword(true)} />
              )}
            </div>
          </div>
          <button type="submit" className="button button-red">Register</button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}