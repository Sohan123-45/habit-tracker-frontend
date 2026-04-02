import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Flame, CalendarDays, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  
  const getFireConfig = (streak, baseColor) => {
    const s = streak || 0;
    if (s === 0) return { size: 24, fill: "none", color: 'var(--text-muted)', pulse: false };
    if (s < 3) return { size: 28, fill: baseColor, color: baseColor, pulse: false };
    if (s < 7) return { size: 34, fill: baseColor, color: baseColor, pulse: true, duration: 1.5 };
    return { size: 40, fill: baseColor, color: baseColor, pulse: true, duration: 1.0, glow: true };
  };
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#FFB347');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      // Assuming your habit router is mounted under /habits in Express, 
      // router.get('/gethabits') maps to /habits/gethabits
      const res = await api.get('/habits/gethabits');
      // Adjust according to backend response wrap
      setHabits(res.data?.habits || res.data || []);
    } catch (e) {
      // Intentionally omitting console.error to prevent verbose 403 logs in console
      // fallback for demo purposes if nothing comes back
      if(e.response?.status === 404) setHabits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabit = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if(!window.confirm('Are you sure you want to delete this habit and all its logs?')) return;
    try {
      await api.delete(`/habits/${id}`);
      setHabits(habits.filter(h => (h._id || h.id) !== id));
      toast.success('Habit deleted successfully');
    } catch (err) {
      toast.error("Failed to delete habit");
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/habits', { name: newHabitName, color: newHabitColor });
      const newHabit = res.data?.habit || { _id: Math.random().toString(), name: newHabitName, color: newHabitColor, count: 0, streak: 0 };
      setHabits([newHabit, ...habits]);
      setShowModal(false);
      setNewHabitName('');
      setNewHabitColor('#FFB347');
      toast.success('Habit successfully created!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error creating habit');
    }
  };

  if (loading) return <div className="page-container flex-center">Loading...</div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient" style={{ margin: 0 }}>My Habits</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> New Habit
        </button>
      </div>

      {habits.length === 0 ? (
        <motion.div 
          className="glass-panel flex-center" 
          style={{ flexDirection: 'column', height: '300px', gap: '1rem', textAlign: 'center' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CalendarDays size={64} color="var(--text-muted)" />
          <h2 style={{ color: 'var(--text-muted)', marginBottom: 0 }}>Nothing here yet!</h2>
          <p style={{ maxWidth: '400px' }}>Start tracking your goals by creating your very first habit. You can set custom colors and track your daily streaks.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>Create Habit</button>
        </motion.div>
      ) : (
        <div className="habits-grid">
          <AnimatePresence>
            {habits.map((habit, i) => (
              <motion.div
                key={habit._id || habit.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/habit/${habit._id || habit.id}`} style={{ textDecoration: 'none' }}>
                  <div 
                    className="glass-panel" 
                    style={{ 
                      padding: '1.5rem', 
                      position: 'relative', 
                      overflow: 'hidden',
                      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = `0 12px 32px 0 ${habit.color}33`; 
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                    }}
                  >
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, left: 0, width: '6px', height: '100%', 
                      backgroundColor: habit.color || '#FFB347'
                    }} />
                    
                    <h2 style={{ color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', margin: 0, minHeight: '40px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{habit.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {(() => {
                          const fire = getFireConfig(habit.streak, habit.color || '#FFB347');
                          return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: habit.streak > 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                                {habit.streak || 0}
                              </span>
                              <motion.div
                                animate={fire.pulse ? { scale: [1, 1.15, 1] } : {}}
                                transition={fire.pulse ? { repeat: Infinity, duration: fire.duration, ease: "easeInOut" } : {}}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  color: fire.color, 
                                  filter: fire.glow ? `drop-shadow(0 0 12px ${fire.color}80)` : 'none' 
                                }}
                              >
                                <Flame size={fire.size} fill={fire.fill} color={fire.color} strokeWidth={1.5} />
                              </motion.div>
                            </div>
                          );
                        })()}
                        <button 
                          onClick={(e) => handleDeleteHabit(e, habit._id || habit.id)}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', 
                            color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', borderRadius: '50%', transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
                          title="Delete Habit"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </h2>
                    
                    <div className="dashboard-stat-row">
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>LONGEST STREAK</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {habit.longestStreak || 0} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>days</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL LOGS</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>{habit.count || 0}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            style={{ 
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
              background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 
            }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div 
              className="glass-panel" 
              style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative', background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            >
              <button 
                onClick={() => setShowModal(false)} 
                style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
              <h2 style={{ marginBottom: '0.5rem' }}>Start Something New</h2>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Define a clear habit name and assign a unique color code to track it seamlessly.</p>
              
              <form onSubmit={handleCreateHabit}>
                <div className="input-group">
                  <label className="input-label">Habit Name</label>
                  <input 
                    className="input-field" autoFocus required
                    value={newHabitName} onChange={e => setNewHabitName(e.target.value)} 
                    placeholder="e.g. Morning Meditation"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Color Theme</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                      type="color" 
                      value={newHabitColor} onChange={e => setNewHabitColor(e.target.value)} 
                      style={{ width: '48px', height: '48px', padding: 0, border: 'none', borderRadius: '12px', cursor: 'pointer', background: 'transparent' }}
                    />
                    <span style={{ fontWeight: 600, color: newHabitColor, letterSpacing: '1px' }}>{newHabitColor.toUpperCase()}</span>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '14px' }}>
                  Start Tracking Goal
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
