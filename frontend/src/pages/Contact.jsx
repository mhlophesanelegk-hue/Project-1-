import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <section className="contact-page">

      {/* ── HEADER ── */}
      <div className="contact-header">
        <div className="contact-header-left">
          <span className="lux-eyebrow">Get In Touch</span>
          <h1>Contact<br />Us</h1>
        </div>
        <div className="contact-header-right">
          <p>
            We are here to assist you with membership applications,
            general enquiries, and support. Reach out through any
            of the channels below.
          </p>
        </div>
      </div>

      {/* ── CONTACT CARDS ── */}
      <div className="contact-grid">

        <div className="contact-card">
          <span className="contact-card-num">01</span>
          <h3>Email<br />Support</h3>
          <span className="contact-detail">support@eshlahleni.co.za</span>
        </div>

        <div className="contact-card">
          <span className="contact-card-num">02</span>
          <h3>WhatsApp</h3>
          <span className="contact-detail">+27 81 234 5678</span>
        </div>

        <div className="contact-card">
          <span className="contact-card-num">03</span>
          <h3>Phone</h3>
          <span className="contact-detail">+27 11 234 5678</span>
        </div>

      </div>

      {/* ── SOCIAL SECTION ── */}
      <div className="social-section">

        <div className="social-section-left">
          <span className="lux-eyebrow">Follow Us</span>
          <h2>Stay in<br /><em>the loop.</em></h2>
        </div>

        <div className="social-handles">

          <div className="social-box">
            <span className="social-box-icon">Instagram</span>
            <h4>@eshlahleni_<br />social_club</h4>
            <span className="contact-detail">@eshlahleni_social_club</span>
          </div>

          <div className="social-box">
            <span className="social-box-icon">Facebook</span>
            <h4>ES'HLAHLENI<br />SOCIAL CLUB SA</h4>
            <span className="contact-detail">Es'hlahleni Social Club SA</span>
          </div>

        </div>
      </div>

      {/* ── FOOTER STRIP ── */}
      <div className="contact-footer-strip">
        <span className="brand">Es'hlahleni</span>
        <span className="tagline">Private · Social · Good Vibes Only</span>
        <span className="age">18+ Only</span>
      </div>

    </section>
  );
};

export default Contact;
