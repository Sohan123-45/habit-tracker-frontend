import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to login';
      // If the backend made a mistake and sent an error status with a success message
      if (errorMessage.toLowerCase().includes('success')) {
        errorMessage = 'Login failed (Invalid credentials or restricted account)';
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="page-container flex-center" style={{ minHeight: '80vh' }}>
      <motion.div 
        className="glass-panel" 
        style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }} className="text-gradient">Welcome Back</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Username / Email</label>
            <input 
              className="input-field" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Sign In
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
