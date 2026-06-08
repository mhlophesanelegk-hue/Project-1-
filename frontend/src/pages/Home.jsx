import './Home.css';
import { useNavigate } from 'react-router-dom';
import clubImage from '../assets/club.jpg';

const notices = [
  'Entry is at your own risk. You enter voluntarily and accept full responsibility for your conduct.',
  'Management reserves the right to refuse entry or remove any person at its discretion.',
  'No illegal substances, weapons, violence, harassment, or disruptive behaviour will be tolerated.',
  'Members are responsible for the conduct of their guests at all times.',
  'The club is not liable for loss, theft, injury, or damage to personal property on the premises.',
  'Photography or video recording may be restricted to protect member privacy.',
  'Intoxicated or disorderly persons may be denied entry or removed immediately.',
  'By remaining on the premises, you agree to comply with all club rules and applicable laws.',
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <section className="lux-home">

      {/* ── HERO ── */}
      <div className="lux-hero">
        <div className="lux-hero-content">
          <p className="lux-tag">Private Members Club</p>

          <h1 className="lux-title">Es'hlahleni</h1>

          <p className="lux-title-sub">Social Club</p>

          <p className="lux-subtitle">
            A curated private members experience for connection,
            culture, and elevated lifestyle — by invitation only.
          </p>

          <div className="lux-buttons">
            <button
              className="lux-btn lux-btn-primary"
              onClick={() => navigate('/register')}
            >
              Become a Member
            </button>
          </div>
        </div>

        <div className="lux-scroll-hint">
          <span>Scroll</span>
          <div className="lux-scroll-line" />
        </div>
      </div>

      {/* ── MARQUEE STRIP ── */}
      <div className="lux-marquee" aria-hidden="true">
        <div className="lux-marquee-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <span>Private</span>
              <span className="dot">·</span>
              <span>Exclusive</span>
              <span className="dot">·</span>
              <span>Members Only</span>
              <span className="dot">·</span>
              <span>Good Vibes</span>
              <span className="dot">·</span>
              <span>Es'hlahleni</span>
              <span className="dot">·</span>
              <span>Social Club</span>
              <span className="dot">·</span>
              <span>Verified Community</span>
              <span className="dot">·</span>
              <span>18+</span>
              <span className="dot">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── IMAGE + COPY ── */}
      <div className="lux-image-section">
        <img
          className="lux-image-main"
          src={clubImage}
          alt="Es'hlahleni Social Club interior"
        />
        <div className="lux-image-copy">
          <span className="lux-eyebrow">Our Space</span>
          <h2>
            Where culture<br />
            <em>meets comfort.</em>
          </h2>
          <p>
            Es'hlahleni is more than a club — it's a sanctuary
            built for those who value real connection, curated
            experiences, and a community of verified, like-minded
            individuals.
          </p>
          <div className="lux-buttons" style={{ justifyContent: 'flex-start' }}>
            <button
              className="lux-btn lux-btn-ghost"
              onClick={() => navigate('/register')}
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div className="lux-features">
        <div className="lux-card">
          <span className="lux-card-num">01</span>
          <h3>Exclusive<br />Access</h3>
          <p>Invitation-only membership. Every member is personally vetted to protect the integrity of the community.</p>
        </div>
        <div className="lux-card">
          <span className="lux-card-num">02</span>
          <h3>Premium<br />Events</h3>
          <p>From intimate gatherings to curated social experiences — every event is designed to elevate.</p>
        </div>
        <div className="lux-card">
          <span className="lux-card-num">03</span>
          <h3>Verified<br />Community</h3>
          <p>A trusted network of individuals who respect the space, the vibe, and each other.</p>
        </div>
      </div>

      {/* ── HOURS ── */}
      <div className="lux-hours">
        <div className="lux-hours-left">
          <span className="lux-eyebrow">Operating Hours</span>
          <h2>
            Open most<br />
            <em>days of the week.</em>
          </h2>
        </div>
        <div className="lux-hours-right">
          <div className="lux-hours-row">
            <span className="day">Monday – Thursday</span>
            <span className="time">07:00 – 22:00</span>
          </div>
          <div className="lux-hours-row">
            <span className="day">Friday – Sunday</span>
            <span className="time">07:00 – 00:00</span>
          </div>
        </div>
      </div>

      {/* ── LOCATION ── */}
      <div className="lux-location">
        <div className="lux-location-left">
          <span className="lux-eyebrow">Find Us</span>
          <h2>
            Come find<br />
            <em>our space.</em>
          </h2>
        </div>
        <div className="lux-location-right">
          <p className="lux-address-line">32 Albany Grove</p>
          <p className="lux-address-line">Durban, 4000</p>
          <p className="lux-address-sub">KwaZulu-Natal, South Africa</p>
        </div>
      </div>

      {/* ── NOTICE ── */}
      <div className="lux-notice">
        <div className="lux-notice-left">
          <span className="lux-eyebrow">Club Rules</span>
          <h2>
            Respect the<br />
            space.<br />
            <em>Enjoy responsibly.</em>
          </h2>
        </div>
        <div className="lux-notice-right">
          {notices.map((text, i) => (
            <div className="lux-notice-item" key={i}>
              <span className="notice-num">0{i + 1}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER STRIP ── */}
      <div className="lux-footer-strip">
        <span className="brand">Es'hlahleni</span>
        <span className="tagline">Private · Social · Good Vibes Only</span>
        <span className="age">18+ Only</span>
      </div>

    </section>
  );
};

export default Home;
