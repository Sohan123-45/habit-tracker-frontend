import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/axios';
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data on app mount and setup global auth error listener
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse stored user', e);
    }
    setLoading(false);

    // Listen for 401/403 errors from the global API interceptor
    const handleAuthError = (e) => {
      toast.error(e.detail?.message || 'Session expired or unauthorized access.');
      
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // 🔥 add this too
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem("token",res.data.token);
    
    // Assume res.data.user exists, containing { username, role, id, isBanned }
    // If backend doesn't return user info natively, we'll mock it based on inputs
    const loggedInUser = res.data?.user || {
      username: username,
      role: username === 'owner' ? 'owner' : (username === 'admin' ? 'admin' : 'user'),
      id: res.data?.id || Math.random().toString(36).substr(2, 9),
      isBanned: res.data?.isBanned || false
    };
    
    setUser(loggedInUser);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {console.log(e)}

    localStorage.removeItem('user');
    localStorage.removeItem('token'); 
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
