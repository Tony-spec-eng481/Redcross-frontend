import { useState } from 'react';

export default function Contact() {
  const [notice, setNotice] = useState('');

  return (
    <section className="section contact-section" id="contact">
      <div className="contact-copy">
        <p className="eyebrow">GET IN TOUCH</p>
        <h2>Contact Us or Join the Chapter</h2>
        <p className="body-copy">Whether you want to volunteer, join our team, or partner with us — we'd love to hear from you.</p>
        <div className="contact-list">
          <div>
            <span>⌖</span>
            <p><strong>Location</strong><br/>Kirinyaga University, Kutus<br/>Kirinyaga County, Kenya</p>
          </div>
          <div>
            <span>✉</span>
            <p><strong>Email</strong><br/><a href="mailto:redcross@kyu.ac.ke">redcross@kyu.ac.ke</a></p>
          </div>
          <div>
            <span>☎</span>
            <p><strong>Phone</strong><br/><a href="tel:+254700000000">+254 700 000 000</a></p>
          </div>
        </div>
      </div>
      <form className="contact-form" onSubmit={(event) => {
        event.preventDefault();
        setNotice('Thank you for reaching out. Your message is ready for the chapter team.');
        event.currentTarget.reset();
      }}>
        <h3>Send Us a Message</h3>
        <div className="form-row">
          <label>First Name<input name="firstName" placeholder="Jane" required/></label>
          <label>Last Name<input name="lastName" placeholder="Doe" required/></label>
        </div>
        <label>Email Address<input name="email" type="email" placeholder="jane@example.com" required/></label>
        <label>Subject
          <select name="subject" defaultValue="join">
            <option value="join">I want to join the chapter</option>
            <option value="volunteer">Volunteer opportunity</option>
            <option value="partnership">Partnership inquiry</option>
            <option value="question">General question</option>
          </select>
        </label>
        <label>Message<textarea name="message" rows="4" placeholder="Tell us a bit about yourself or your inquiry..." required/></label>
        <button className="button button-red" type="submit">Send Message <span>→</span></button>
        {notice && <p className="form-notice" role="status">{notice}</p>}
      </form>
    </section>
  );
}