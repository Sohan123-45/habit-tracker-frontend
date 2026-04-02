import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {LogOut, ShieldAlert} from 'lucide-react';
import toast from 'react-hot-toast';
import HabitFlowLogo from './HabitFlowLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (e) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="nav-bar glass-panel" style={{ margin: '1rem 2rem' }}>
      <Link to="/" className="brand-logo" style={{ textDecoration: 'none' }}>
        <HabitFlowLogo size={34} />
      </Link>
      
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontWeight: 600, marginRight: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }} className="hide-mobile">
              Hi, {user.username}
            </span>
            
            {(user.role === 'admin') && (
              <Link to="/admin" className="btn btn-outline" style={{ display: 'flex', gap: '6px', fontSize: '0.85rem', padding: '8px 16px' }}>
                <ShieldAlert size={16} /> Admin
              </Link>
            )}
            {(user.role === 'owner') && (
              <Link to="/admin" className="btn btn-outline" style={{ display: 'flex', gap: '6px', fontSize: '0.85rem', padding: '8px 16px' }}>
                <ShieldAlert size={16} /> Owner
              </Link>
            )}
            
            <button className="btn btn-danger" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <LogOut size={15} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
