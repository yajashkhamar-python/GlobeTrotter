import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Map, Compass, CalendarDays, Wallet, Share2,
  ArrowRight, ChevronDown
} from 'lucide-react';
import './Landing.css';

const FEATURES = [
  {
    icon: Map,
    title: 'Multi-City Journeys',
    desc: 'Plan complex multi-stop trips with ease. Add cities, set dates, and build your perfect route.',
  },
  {
    icon: Compass,
    title: 'Discover Destinations',
    desc: 'Explore thousands of destinations with curated insights, cost guides, and local tips.',
  },
  {
    icon: CalendarDays,
    title: 'Day-Wise Itineraries',
    desc: 'Build detailed day-by-day plans with activities, timings, and durations for every stop.',
  },
  {
    icon: Wallet,
    title: 'Budget Tracking',
    desc: 'Estimate and track your travel budget across flights, accommodation, activities and meals.',
  },
  {
    icon: Share2,
    title: 'Share Adventures',
    desc: 'Share your itineraries with travel companions or inspire others with your journey.',
  },
  {
    icon: Globe,
    title: 'Global Coverage',
    desc: 'Destinations spanning every continent — from iconic cities to hidden gems.',
  },
];

const SHOWCASE = [
  { city: 'Santorini', country: 'Greece', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80' },
  { city: 'Tokyo',     country: 'Japan',  img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80' },
  { city: 'Bali',      country: 'Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
  { city: 'Paris',     country: 'France', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { city: 'Marrakech', country: 'Morocco',img: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&q=80' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav" role="navigation" aria-label="Main">
        <div className="landing-nav-logo">
          <div className="landing-nav-logo-icon">
            <Globe size={18} color="white" />
          </div>
          <span className="landing-nav-logo-text">GlobeTrotter</span>
        </div>
        <div className="landing-nav-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1800&q=85"
            alt="Beautiful travel landscape"
            className="landing-hero-img"
          />
          <div className="landing-hero-overlay" />
        </div>

        <div className="landing-hero-content">
          <div className="landing-hero-eyebrow">
            ✦ Personalized Travel Planning
          </div>
          <h1 className="landing-hero-title" id="hero-title">
            Plan the journey.<br />
            <span>Experience the world.</span>
          </h1>
          <p className="landing-hero-subtitle">
            GlobeTrotter helps you craft unforgettable multi-city adventures —
            with smart itineraries, budget tracking, and destination discovery
            built for the modern traveler.
          </p>
          <div className="landing-hero-cta">
            <button
              className="btn-hero-primary"
              onClick={() => navigate('/signup')}
              id="hero-start-planning"
            >
              Start Planning
              <ArrowRight size={18} />
            </button>
            <button
              className="btn-hero-secondary"
              onClick={() => navigate('/dashboard')}
              id="hero-explore-trips"
            >
              <Compass size={18} />
              Explore Trips
            </button>
          </div>
        </div>

        <div className="landing-hero-scroll" aria-hidden="true">
          <ChevronDown size={20} />
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" aria-labelledby="features-title">
        <div className="landing-section-label">Why GlobeTrotter</div>
        <h2 className="landing-section-title" id="features-title">
          Everything you need to<br />travel smarter
        </h2>
        <p className="landing-section-subtitle">
          From your first destination idea to the final itinerary — we've built the
          tools serious travelers need.
        </p>
        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div className="feature-card" key={title}>
              <div className="feature-icon">
                <Icon size={22} />
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations Showcase */}
      <section className="landing-destinations" aria-labelledby="destinations-title">
        <div className="landing-destinations-inner">
          <div className="landing-section-label">Popular Destinations</div>
          <h2 className="landing-section-title" id="destinations-title">
            The world is waiting for you
          </h2>
          <p className="landing-section-subtitle">
            Discover iconic destinations and hidden gems from every corner of the globe.
          </p>
          <div className="dest-showcase-grid">
            {SHOWCASE.map(({ city, country, img }) => (
              <div className="dest-showcase-card" key={city}>
                <img
                  src={img}
                  alt={`${city}, ${country}`}
                  className="dest-showcase-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80';
                  }}
                />
                <div className="dest-showcase-overlay" />
                <div className="dest-showcase-label">
                  <div className="dest-showcase-city">{city}</div>
                  <div className="dest-showcase-country">{country}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta" aria-labelledby="cta-title">
        <div className="landing-section-label">Ready to go?</div>
        <h2 className="landing-cta-title" id="cta-title">
          Your next adventure starts here
        </h2>
        <p className="landing-cta-desc">
          Join thousands of travelers who plan their trips with GlobeTrotter.
          Free to start. No credit card required.
        </p>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/signup')}
          id="cta-start-planning"
        >
          Start Planning for Free
          <ArrowRight size={18} />
        </button>
      </section>

      {/* Footer */}
      <footer className="landing-footer" role="contentinfo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={14} color="var(--color-accent)" />
          <span>© 2026 GlobeTrotter. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: 'var(--color-text-muted)' }}>Privacy</a>
          <a href="#" style={{ color: 'var(--color-text-muted)' }}>Terms</a>
          <a href="#" style={{ color: 'var(--color-text-muted)' }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
