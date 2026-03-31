import React from 'react';
import { Globe, Mail, Link as LinkIcon } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo text-gradient">
        HabitFlow
      </div>
      <p style={{ marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
        Helping you build better habits, one day at a time. Track, analyze, and master your routines.
      </p>
      
      <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '2rem' }}>
        <a href="#" className="flex-center" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="Website">
          <Globe size={20} />
        </a>
        <a href="#" className="flex-center" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="Email">
          <Mail size={20} />
        </a>
        <a href="#" className="flex-center" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} aria-label="Links">
          <LinkIcon size={20} />
        </a>
      </div>
      
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} HabitFlow. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
