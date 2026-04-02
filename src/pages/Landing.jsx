import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, Zap, BarChart3, Target, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import HabitFlowLogo from '../components/HabitFlowLogo';

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading || user) {
    return (
      <div className="page-container flex-center" style={{ minHeight: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="page-container animate-fadeIn">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-logo-wrapper">
          <HabitFlowLogo size={72} withText={false} />
        </div>
        <h1 className="hero-title">
          Master Your Life, <br />
          <span className="text-gradient">One Habit at a Time</span>
        </h1>
        <p className="hero-subtitle">
          Join thousands of users who are transforming their routines. HabitFlow gives you the tools to track, analyze, and build lasting positive changes.
        </p>
        <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            Get Started <ArrowRight size={20} style={{ marginLeft: '4px' }} />
          </Link>
          <Link to="/login" className="btn btn-outline" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-divider"></div>

      {/* Features Section */}
      <section>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2rem' }}>
          Everything you need to <span className="text-gradient">succeed</span>
        </h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <Zap size={24} />
            </div>
            <h3 style={{ marginBottom: '0.75rem' }}>Streak Tracking</h3>
            <p>Maintain your momentum with visual streak indicators and daily reminders to keep going.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <BarChart3 size={24} />
            </div>
            <h3 style={{ marginBottom: '0.75rem' }}>Visual Insights</h3>
            <p>Track your progress over time with intuitive charts and detailed statistics for every habit.</p>
          </div>
          
          <div className="feature-card glass-panel">
            <div className="feature-icon">
              <Target size={24} />
            </div>
            <h3 style={{ marginBottom: '0.75rem' }}>Goal Oriented</h3>
            <p>Set specific targets and reach milestones as you turn temporary actions into lifelong routines.</p>
          </div>
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-divider"></div>

      {/* How it Works Section */}
      <section style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '3rem', fontSize: '2rem' }}>
          How it <span className="text-gradient">works</span>
        </h2>
        <div style={{ display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { step: '1', title: 'Create Habits', desc: 'Define what you want to achieve.' },
            { step: '2', title: 'Log Daily', desc: 'Mark your progress every single day.' },
            { step: '3', title: 'See Growth', desc: 'Watch your streaks and life improve.' }
          ].map((item, idx) => (
            <div key={idx} style={{ maxWidth: '250px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: 'var(--accent)', 
                color: '#0A0A0F', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontWeight: '800',
                fontSize: '1.1rem',
                boxShadow: '0 0 30px var(--accent-glow), 0 4px 12px rgba(255, 140, 0, 0.2)'
              }}>
                {item.step}
              </div>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>{item.title}</h4>
              <p style={{ fontSize: '0.9rem' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Glow divider */}
      <div className="glow-divider"></div>

      {/* Final CTA */}
      <section className="cta-section glass-panel">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Ready to <span className="text-gradient">start your journey?</span>
        </h2>
        <p style={{ marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem' }}>
          Stop waiting for the "right time". Build the future you want today with HabitFlow's premium tracking experience.
        </p>
        <Link to="/register" className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
          Create Your Account Now
        </Link>
      </section>
      <Footer />
    </div>
  );
};

export default Landing;
