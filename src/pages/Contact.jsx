import { useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: 'join',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (status.message) setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!formData.firstName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please provide your name, a valid email address, and your message.',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/messages/contact`, {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject,
        message: formData.message.trim(),
      });

      if (response.data.success) {
        setStatus({
          type: 'success',
          message: 'Thank you for reaching out! Your message has been sent to the chapter team and a confirmation email has been dispatched to your inbox.',
        });
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          subject: 'join',
          message: '',
        });
      } else {
        setStatus({
          type: 'error',
          message: response.data.message || 'Unable to submit your message. Please try again.',
        });
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      const errorMsg =
        err.response?.data?.message ||
        'Unable to connect to the server. Please check your internet connection or email redcross@kyu.ac.ke directly.';
      setStatus({ type: 'error', message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section contact-section" id="contact">
      <div className="contact-copy">
        <p className="eyebrow">GET IN TOUCH</p>
        <h2>Contact Us or Join the Chapter</h2>
        <p className="body-copy">
          Whether you want to volunteer, join our team, request emergency first aid coverage, or partner with us — we'd love to hear from you.
        </p>
        <div className="contact-list">
          <div>
            <span>⌖</span>
            <p>
              <strong>Location</strong>
              <br />
              Kirinyaga University, Kutus
              <br />
              Kirinyaga County, Kenya
            </p>
          </div>
          <div>
            <span>✉</span>
            <p>
              <strong>Email</strong>
              <br />
              <a href="mailto:redcross@kyu.ac.ke">redcross@kyu.ac.ke</a>
            </p>
          </div>
          <div>
            <span>☎</span>
            <p>
              <strong>Phone & Emergency Desk</strong>
              <br />
              <a href="tel:+254700000000">+254 700 000 000</a>
            </p>
          </div>
        </div>
      </div>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <h3>Send Us a Message</h3>

        {status.message && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              lineHeight: '1.5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: status.type === 'success' ? '#ECFDF5' : '#FEF2F2',
              border: `1px solid ${status.type === 'success' ? '#10B981' : '#EF4444'}`,
              color: status.type === 'success' ? '#065F46' : '#991B1B',
            }}
            role="status"
          >
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {status.type === 'success' ? '✓' : '⚠️'}
            </span>
            <span>{status.message}</span>
          </div>
        )}

        <div className="form-row">
          <label>
            First Name <span style={{ color: '#DC2626' }}>*</span>
            <input
              name="firstName"
              placeholder="Jane"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>
          <label>
            Last Name
            <input
              name="lastName"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              disabled={loading}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            Email Address <span style={{ color: '#DC2626' }}>*</span>
            <input
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </label>
          <label>
            Phone Number (optional)
            <input
              name="phone"
              type="tel"
              placeholder="+254 700 000 000"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </label>
        </div>

        <label>
          Subject
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="join">I want to join the chapter</option>
            <option value="volunteer">Volunteer opportunity</option>
            <option value="partnership">Partnership inquiry</option>
            <option value="question">General question</option>
          </select>
        </label>

        <label>
          Message <span style={{ color: '#DC2626' }}>*</span>
          <textarea
            name="message"
            rows="4"
            placeholder="Tell us a bit about yourself or your inquiry..."
            value={formData.message}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </label>

        <button
          className="button button-red"
          type="submit"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Sending Message...' : 'Send Message'} <span>→</span>
        </button>
      </form>
    </section>
  );
}