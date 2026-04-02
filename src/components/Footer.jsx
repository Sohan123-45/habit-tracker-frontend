import React from 'react';
import { Globe, Mail, Link as LinkIcon } from 'lucide-react';
import HabitFlowLogo from './HabitFlowLogo';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <HabitFlowLogo size={28} />
      </div>
      <p style={{ marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem', color: 'var(--text-tertiary)' }}>
        Helping you build better habits, one day at a time. Track, analyze, and master your routines.
      </p>
      
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <a href="#" className="flex-center" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }} aria-label="Website"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <Globe size={20} />
        </a>
        <a href="#" className="flex-center" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }} aria-label="Email"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <Mail size={20} />
        </a>
        <a href="#" className="flex-center" style={{ color: 'var(--text-tertiary)', transition: 'color 0.2s' }} aria-label="Links"
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <LinkIcon size={20} />
        </a>
      </div>
      
      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
        © {new Date().getFullYear()} HabitFlow. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
