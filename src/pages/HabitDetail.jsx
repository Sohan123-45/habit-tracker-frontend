import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Trash2, Edit3, Check, ArrowLeft, MoreVertical, Search, Target, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [habit, setHabit] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Log Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const fileInputRef = useRef(null);

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingPostTitle, setEditingPostTitle] = useState('');
  const [selectedImagePost, setSelectedImagePost] = useState(null);

  const settingsRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    if (showSettings) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && selectedImagePost) {
        setSelectedImagePost(null);
      }
      if (event.key === 'Escape' && showLogModal) {
        setShowLogModal(false);
      }
    };
    if (selectedImagePost || showLogModal) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImagePost, showLogModal]);
  
  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    // 1. Fetch posts independently
    try {
      const postsRes = await api.get(`/habits/${id}/posts`);
      setPosts(postsRes.data?.posts || []);
    } catch (e) {
      console.log("Posts not found or endpoint missing");
      setPosts([]);
    }
    
    // 2. Fetch specific habit independently
    try {
      const hRes = await api.get(`/habits/${id}`);
      setHabit(hRes.data?.habit || hRes.data);
    } catch(e) {
      // fallback to the new gethabits endpoint
      try {
        const allRes = await api.get(`/habits/gethabits`);
        const target = (allRes.data?.habits || allRes.data || []).find(h => h._id === id || h.id === id);
        setHabit(target || null);
      } catch (ignore) {}
    } 
    
    setLoading(false);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Image proof is required!");
      return;
    }
    
    setIsLogging(true);
    const formData = new FormData();
    formData.append('file', file);
    if(title) formData.append('title', title);
    
    try {
      const res = await api.post(`/habits/${id}/log`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Optimistic Update
      const newPost = res.data?.post || { _id: Math.random(), title: title || "Logged Entry", date: new Date(), uri: URL.createObjectURL(file) };
      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      setHabit(prev => ({ 
        ...prev, 
        count: res.data?.count !== undefined ? res.data.count : prev.count + 1, 
        streak: res.data?.currentStreak !== undefined ? res.data.currentStreak : prev.streak + 1,
        longestStreak: res.data?.longestStreak !== undefined ? res.data.longestStreak : prev.longestStreak
      }));
      setFile(null);
      setTitle('');
      if(fileInputRef.current) fileInputRef.current.value = '';
      setShowLogModal(false);
      toast.success('Habit logged successfully!');
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to log habit");
    } finally {
      setIsLogging(false);
    }
  };

  const handleDeleteHabit = async () => {
    if(!window.confirm('Are you sure you want to completely delete this habit and all its logs?')) return;
    try {
      await api.delete(`/habits/${id}`);
      toast.success('Habit deleted successfully!');
      navigate('/');
    } catch (e) {
      toast.error("Failed to delete habit");
    }
  };

  const handleUpdateName = async () => {
    try {
      await api.patch(`/habits/nameChange/${id}`, { newName });
      setHabit(prev => ({...prev, name: newName}));
      setIsEditingName(false);
      toast.success('Habit name updated!');
    } catch(e) {
      toast.error("Failed to update name");
    }
  };

  const handleColorChange = async (e) => {
    const newColor = e.target.value;
    try {
      await api.patch(`/habits/${id}/color`, { color: newColor });
      setHabit(prev => ({...prev, color: newColor}));
      toast.success('Habit color updated!');
    } catch(err) {
      toast.error("Failed to update color");
    }
  };

  const handleDeletePost = async (postId) => {
    if(!window.confirm('Delete this log permanently?')) return;
    try {
      const res = await api.delete(`/habits/post/${postId}`);
      setPosts(posts.filter(p => (p._id || p.id) !== postId));
      // update count
      if(res.data?.count !== undefined) {
         setHabit(prev => ({...prev, count: res.data.count}));
      }
      toast.success('Log deleted successfully!');
    } catch(e) {
      toast.error("Failed to delete log");
    }
  };

  const handleUpdatePostTitle = async (postId) => {
    try {
      await api.patch(`/habits/titleChange/${postId}`, { newName: editingPostTitle });
      setPosts(posts.map(p => (p._id || p.id) === postId ? { ...p, title: editingPostTitle } : p));
      setEditingPostId(null);
      toast.success('Log title updated!');
    } catch(e) {
      toast.error(e.response?.data?.message || "Failed to update log title");
    }
  };

  if(loading) return (
    <div className="page-container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
      <span style={{ color: 'var(--text-secondary)' }}>Loading data...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if(!habit) return <div className="page-container flex-center" style={{ minHeight: '40vh', color: 'var(--text-secondary)' }}>Habit not found</div>;

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <button className="btn" onClick={() => navigate('/dashboard')} style={{ background: 'transparent', padding: 0, marginBottom: '1.5rem', color: 'var(--text-secondary)', gap: '6px' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      {/* Hero Section — Habit Details */}
      <motion.div 
        className="glass-panel" 
        style={{ padding: '2rem', marginBottom: '2rem', position: 'relative', borderTop: `4px solid ${habit.color || 'var(--accent)'}`, boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 60px ${habit.color || 'var(--accent)'}11` }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="habit-hero-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditingName ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '1rem' }}>
                <input 
                  autoFocus
                  className="input-field habit-name-edit-input" 
                  style={{ flex: '1 1 0', minWidth: 0 }}
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleUpdateName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  onBlur={() => setTimeout(() => setIsEditingName(false), 200)}
                />
                <button 
                  onClick={handleUpdateName} 
                  style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                    background: habit.color || 'var(--accent)', color: '#0A0A0F',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, boxShadow: `0 4px 16px ${(habit.color || '#FF8C00')}44`,
                    transition: 'transform 0.15s'
                  }}
                ><Check size={18}/></button>
                <button 
                  onClick={() => setIsEditingName(false)} 
                  style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', 
                    border: '1px solid var(--border)', background: 'var(--bg-surface)', 
                    color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'transform 0.15s'
                  }}
                ><X size={18}/></button>
              </div>
            ) : (
              <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', wordBreak: 'break-word' }}>
                {habit.name}
                <button onClick={() => { setIsEditingName(true); setNewName(habit.name); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', flexShrink: 0, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  <Edit3 size={20} />
                </button>
              </h1>
            )}
            
            <div className="habit-stats-row">
               <div>
                 <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Current Streak</div>
                 <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, color: habit.color || 'var(--accent)' }}>{habit.streak || 0} <span style={{fontSize: '0.6em', color: 'var(--text-tertiary)'}}>days</span></div>
               </div>
               <div>
                 <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total Entries</div>
                 <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{habit.count || 0}</div>
               </div>
               <div>
                 <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Longest Streak</div>
                 <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{habit.longestStreak || 0}</div>
               </div>
            </div>
          </div>

          <div className="habit-settings-btn" style={{ position: 'relative', flexShrink: 0 }} ref={settingsRef}>
            <button className="btn btn-outline" style={{ padding: '8px' }} onClick={() => setShowSettings(!showSettings)}>
              <MoreVertical size={24} />
            </button>
            {showSettings && (
              <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', padding: '1rem', zIndex: 10, width: '200px', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Theme Color</span>
                  <input type="color" value={habit.color || '#FFB347'} onChange={handleColorChange} style={{ width: '32px', height: '32px', cursor: 'pointer', border: '2px solid var(--border)', borderRadius: '8px', background: 'transparent' }} />
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
                <button className="btn btn-danger" style={{ width: '100%', fontSize: '0.875rem' }} onClick={handleDeleteHabit}>
                  <Trash2 size={16} /> Delete Habit
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* History Log — Full Width Below */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>History Log</h3>
        {posts.length === 0 ? (
          <div className="glass-panel flex-center" style={{ height: '200px', flexDirection: 'column', color: 'var(--text-tertiary)' }}>
            <Search size={32} style={{ marginBottom: '1rem' }} />
            <p>No log entries found. Be the first to start the streak!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence>
              {posts.map((post) => (
                <motion.div 
                  key={post._id || post.id} 
                  className="glass-panel log-card" 
                  style={{ padding: '1.25rem' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedImagePost(post)}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)'; e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--glass-bg)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                >
                  <div className="log-card-thumb">
                    <img src={post.uri || 'https://via.placeholder.com/80'} alt="Log proof" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {editingPostId === (post._id || post.id) ? (
                      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <input 
                          autoFocus
                          className="input-field" 
                          style={{ padding: '4px 8px', fontSize: '0.9rem', flex: '1 1 0', minWidth: 0 }}
                          value={editingPostTitle}
                          onChange={e => setEditingPostTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleUpdatePostTitle(post._id || post.id);
                            if (e.key === 'Escape') setEditingPostId(null);
                          }}
                          onBlur={() => setTimeout(() => setEditingPostId(null), 200)}
                        />
                        <button 
                          onClick={() => handleUpdatePostTitle(post._id || post.id)}
                          style={{ 
                            width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                            background: habit.color || 'var(--accent)', color: '#0A0A0F',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0, boxShadow: `0 4px 12px ${(habit.color || '#FF8C00')}44`,
                            transition: 'transform 0.15s'
                          }}
                        ><Check size={14}/></button>
                        <button 
                          onClick={() => setEditingPostId(null)}
                          style={{ 
                            width: '30px', height: '30px', borderRadius: '50%', 
                            border: '1px solid var(--border)', background: 'var(--bg-surface)', 
                            color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', flexShrink: 0, transition: 'transform 0.15s'
                          }}
                        ><X size={14}/></button>
                      </div>
                    ) : (
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', wordBreak: 'break-word', color: 'var(--text-primary)' }}>
                        {post.title || new Date(post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                        <button onClick={(e) => { e.stopPropagation(); setEditingPostId(post._id || post.id); setEditingPostTitle(post.title || ''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', flexShrink: 0, transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                        >
                          <Edit3 size={16} />
                        </button>
                      </h4>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                      <div>Created: {new Date(post.createdAt || post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      {post.updatedAt && (
                        <div>Updated: {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      )}
                    </div>
                  </div>
                  <button 
                    className="btn btn-outline" 
                    style={{ padding: '8px', color: 'var(--danger)', borderColor: 'transparent', flexShrink: 0, transition: 'all 0.2s' }} 
                    onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id || post.id); }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Floating Action Button — Log Habit */}
      <motion.button
        className="fab"
        style={{ background: habit.color || 'var(--accent)', boxShadow: `0 8px 24px ${(habit.color || '#FF8C00')}55, 0 0 40px ${(habit.color || '#FF8C00')}15`, color: '#0A0A0F' }}
        onClick={() => setShowLogModal(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Log Today's Proof"
      >
        <Plus size={28} />
      </motion.button>

      {/* Log Modal */}
      <AnimatePresence>
        {showLogModal && (
          <motion.div 
            className="log-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLogModal(false)}
          >
            <motion.div 
              className="glass-panel log-modal-content" 
              style={{ padding: '2.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderTop: '1px solid rgba(255, 160, 50, 0.12)' }}
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowLogModal(false)} 
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
              >
                <X size={24} />
              </button>
              
              <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={20} style={{ color: habit.color || 'var(--accent)' }} />Log Today's Proof
              </h2>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upload an image as proof of your daily habit completion.</p>
              
              <form onSubmit={handleLogSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div 
                  style={{ border: `2px dashed ${file ? (habit.color || 'var(--accent)') : 'var(--border)'}`, borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.02)', position: 'relative', transition: 'border-color 0.2s' }}
                  onClick={() => fileInputRef.current.click()}
                  onMouseEnter={e => { if(!file) e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
                  onMouseLeave={e => { if(!file) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {file ? (
                    <img src={URL.createObjectURL(file)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <ImageIcon size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 1rem' }} />
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Click to upload image</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Required proof for streak validity</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={e => setFile(e.target.files[0])} 
                    style={{ display: 'none' }} 
                    accept="image/*"
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <input 
                    className="input-field" 
                    placeholder="Title / Note (Optional, defaults to date)" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={isLogging || !file} style={{ width: '100%', padding: '16px', background: habit.color || 'var(--accent)', boxShadow: `0 8px 20px ${habit.color || '#FF8C00'}33` }}>
                  {isLogging ? 'Uploading...' : 'Submit Entry'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImagePost && (
          <motion.div 
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImagePost(null)}
          >
            <button 
              onClick={() => setSelectedImagePost(null)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', zIndex: 1010, transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
            >
              <X size={36} />
            </button>
            <motion.img 
              src={selectedImagePost.uri} 
              alt={selectedImagePost.title}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            />
            <motion.h3 
              style={{ color: 'var(--text-primary)', marginTop: '1.5rem', fontSize: '1.5rem', fontWeight: 600, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {selectedImagePost.title || new Date(selectedImagePost.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
            </motion.h3>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitDetail;
