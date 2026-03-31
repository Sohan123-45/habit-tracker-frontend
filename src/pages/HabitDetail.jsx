import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Trash2, Edit3, Check, ArrowLeft, MoreVertical, Search, Target, X } from 'lucide-react';
import toast from 'react-hot-toast';

const HabitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [habit, setHabit] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Forms
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
    };
    if (selectedImagePost) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedImagePost]);
  
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
      alert("Image proof is required!");
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

  if(loading) return <div className="page-container flex-center">Loading Data...</div>;
  if(!habit) return <div className="page-container flex-center">Habit not found</div>;

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <button className="btn" onClick={() => navigate('/')} style={{ background: 'transparent', padding: 0, marginBottom: '2rem', color: 'var(--text-muted)' }}>
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      {/* Hero Section */}
      <motion.div 
        className="glass-panel" 
        style={{ padding: '2.5rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden', borderTop: `6px solid ${habit.color || 'var(--primary)'}` }}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {isEditingName ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1rem' }}>
                <input 
                  autoFocus
                  className="input-field" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleUpdateName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  onBlur={() => setTimeout(() => setIsEditingName(false), 200)}
                  style={{ fontSize: '2rem', fontWeight: 800, padding: '8px', width: '300px' }} 
                />
                <button className="btn btn-primary" onClick={handleUpdateName} style={{ padding: '12px' }}><Check size={20}/></button>
                <button className="btn" onClick={() => setIsEditingName(false)} style={{ padding: '12px', background: 'var(--glass-bg)' }}><X size={20}/></button>
              </div>
            ) : (
              <h1 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {habit.name}
                <button onClick={() => { setIsEditingName(true); setNewName(habit.name); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <Edit3 size={20} />
                </button>
              </h1>
            )}
            
            <div style={{ display: 'flex', gap: '3rem', marginTop: '1.5rem' }}>
               <div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT STREAK</div>
                 <div style={{ fontSize: '2rem', fontWeight: 800, color: habit.color || 'var(--text-main)' }}>{habit.streak || 0} <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>days</span></div>
               </div>
               <div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ENTRIES</div>
                 <div style={{ fontSize: '2rem', fontWeight: 800 }}>{habit.count || 0}</div>
               </div>
               <div>
                 <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>LONGEST STREAK</div>
                 <div style={{ fontSize: '2rem', fontWeight: 800 }}>{habit.longestStreak || 0}</div>
               </div>
            </div>
          </div>

          <div style={{ position: 'relative' }} ref={settingsRef}>
            <button className="btn btn-outline" style={{ padding: '8px' }} onClick={() => setShowSettings(!showSettings)}>
              <MoreVertical size={24} />
            </button>
            {showSettings && (
              <div className="glass-panel" style={{ position: 'absolute', right: 0, top: '100%', marginTop: '8px', padding: '1rem', zIndex: 10, width: '200px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Theme Color</span>
                  <input type="color" value={habit.color || '#FFB347'} onChange={handleColorChange} style={{ width: '32px', height: '32px', cursor: 'pointer', border: 'none', background: 'transparent' }} />
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />
                <button className="btn btn-danger" style={{ width: '100%', fontSize: '0.875rem' }} onClick={handleDeleteHabit}>
                  <Trash2 size={16} /> Delete Habit
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 2fr)', gap: '2rem' }}>
        
        {/* Logger Section */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
          <h3><Target size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: habit.color }} />Log Today's Proof</h3>
          <form onSubmit={handleLogSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             
             <div 
               style={{ border: `2px dashed ${file ? habit.color : 'var(--glass-border)'}`, borderRadius: '12px', padding: '2rem', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', position: 'relative' }}
               onClick={() => fileInputRef.current.click()}
             >
               {file ? (
                 <img src={URL.createObjectURL(file)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
               ) : (
                 <>
                   <ImageIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                   <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>Click to upload image</p>
                   <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Required proof for streak validity</p>
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
                 style={{ background: 'rgba(0,0,0,0.03)' }}
               />
             </div>

             <button type="submit" className="btn btn-primary" disabled={isLogging || !file} style={{ width: '100%', padding: '16px', background: habit.color, boxShadow: `0 8px 16px ${habit.color}44` }}>
               {isLogging ? 'Uploading...' : 'Submit Entry'}
             </button>
          </form>
        </motion.div>

        {/* Timeline Section */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>History Log</h3>
          {posts.length === 0 ? (
            <div className="glass-panel flex-center" style={{ height: '200px', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <Search size={32} style={{ marginBottom: '1rem' }} />
              <p>No log entries found. Be the first to start the streak!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <AnimatePresence>
                {posts.map((post) => (
                  <motion.div 
                    key={post._id || post.id} 
                    className="glass-panel" 
                    style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', transition: 'background-color 0.2s' }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setSelectedImagePost(post)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--glass-bg)' }}
                  >
                    <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', background: '#eaeaea' }}>
                      <img src={post.uri || 'https://via.placeholder.com/80'} alt="Log proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      {editingPostId === (post._id || post.id) ? (
                        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <input 
                            autoFocus
                            className="input-field" 
                            style={{ padding: '4px 8px', fontSize: '0.9rem' }}
                            value={editingPostTitle}
                            onChange={e => setEditingPostTitle(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleUpdatePostTitle(post._id || post.id);
                              if (e.key === 'Escape') setEditingPostId(null);
                            }}
                            onBlur={() => setTimeout(() => setEditingPostId(null), 200)}
                          />
                          <button className="btn btn-primary" style={{ padding: '6px' }} onClick={() => handleUpdatePostTitle(post._id || post.id)}><Check size={16}/></button>
                          <button className="btn" style={{ padding: '6px', background: 'var(--glass-bg)' }} onClick={() => setEditingPostId(null)}><X size={16}/></button>
                        </div>
                      ) : (
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {post.title || new Date(post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}
                          <button onClick={(e) => { e.stopPropagation(); setEditingPostId(post._id || post.id); setEditingPostTitle(post.title || ''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <Edit3 size={16} />
                          </button>
                        </h4>
                      )}
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <div>Created: {new Date(post.createdAt || post.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        {post.updatedAt && (
                          <div>Updated: {new Date(post.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        )}
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '8px', color: 'var(--danger)', borderColor: 'transparent' }} 
                      onClick={(e) => { e.stopPropagation(); handleDeletePost(post._id || post.id); }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImagePost && (
          <motion.div 
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedImagePost(null)}
          >
            <button 
              onClick={() => setSelectedImagePost(null)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', zIndex: 1010 }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              <X size={36} />
            </button>
            <motion.img 
              src={selectedImagePost.uri} 
              alt={selectedImagePost.title}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '16px', objectFit: 'contain', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            />
            <motion.h3 
              style={{ color: 'white', marginTop: '1.5rem', fontSize: '1.5rem', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
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
