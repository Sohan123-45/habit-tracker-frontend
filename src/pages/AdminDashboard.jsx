import React, { useState, useEffect } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, Ban, CheckCircle, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth(); // Has info like role
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/all-users');
      setUsers(res.data?.users || res.data || []);
    } catch (e) {
      console.error(e);
      if (e.response?.status === 404) {
        setUsers([
           { _id: '1', username: 'sohan', email: 'sohan@example.com', role: 'owner', isBanned: false },
           { _id: '2', username: 'admin_test', email: 'admin@example.com', role: 'admin', isBanned: false },
           { _id: '3', username: 'john_doe', email: 'john@example.com', role: 'user', isBanned: false },
           { _id: '4', username: 'spammer_123', email: 'spam@example.com', role: 'user', isBanned: true },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (targetUser) => {
    if (user.role === 'admin' && (targetUser.role === 'admin' || targetUser.role === 'owner')) {
      toast.error("Admins cannot ban other Admins or Owners.");
      return;
    }
    if (user.role === 'owner' && targetUser.role === 'owner') {
      toast.error("Owners cannot be banned.");
      return;
    }

    try {
      if (targetUser.isBanned) {
        await api.patch(`/admin/unban/${targetUser._id || targetUser.id}`);
      } else {
        await api.patch(`/admin/ban/${targetUser._id || targetUser.id}`);
      }
      const targetId = targetUser._id || targetUser.id;
      setUsers(users.map(u => ((u._id || u.id) === targetId) ? { ...u, isBanned: !targetUser.isBanned } : u));
      toast.success(targetUser.isBanned ? 'User unbanned' : 'User banned');
    } catch(e) {
      toast.error("Failed to change ban status");
    }
  };

  const handleMakeAdmin = async (targetUserId) => {
    if (user.role !== 'owner') return toast.error("Only owners can elevate roles.");
    try {
      await api.patch(`/admin/make-admin/${targetUserId}`);
      setUsers(users.map(u => (u._id || u.id) === targetUserId ? { ...u, role: 'admin' } : u));
      toast.success('Elevated to Admin');
    } catch(e) {
      toast.error("Failed to elevate to Admin");
    }
  };

  const handleRemoveAdmin = async (targetUserId) => {
    if (user.role !== 'owner') return toast.error("Only owners can demote roles.");
    try {
      await api.patch(`/admin/remove-admin/${targetUserId}`);
      setUsers(users.map(u => (u._id || u.id) === targetUserId ? { ...u, role: 'user' } : u));
      toast.success('Demoted to User');
    } catch(e) {
      toast.error("Failed to demote Admin");
    }
  };

  const handleExportData = async (targetUserId) => {
    if (user.role !== 'owner') return toast.error("Only owners can export data.");
    try {
      const res = await api.get(`/admin/all-data/${targetUserId}`);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `user_${targetUserId}_data.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success('Data exported successfully');
    } catch(e) {
      toast.error("Failed to export all data");
    }
  };

  if(!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return <div className="page-container flex-center" style={{ color: 'var(--text-secondary)' }}>Access Denied. Admins Only.</div>;
  }

  if (loading) return (
    <div className="page-container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
      <span style={{ color: 'var(--text-secondary)' }}>Loading management system...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ 
          width: '48px', height: '48px', borderRadius: '14px', 
          background: 'var(--accent)', color: '#0A0A0F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px var(--accent-glow), 0 4px 12px rgba(255, 140, 0, 0.2)'
        }}>
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 style={{ margin: 0 }} className="text-gradient">System Administration</h1>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Role: <span style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role}</span></p>
        </div>
      </div>

      <motion.div className="glass-panel" style={{ padding: '0', overflow: 'hidden', borderTop: '1px solid rgba(255, 160, 50, 0.08)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ overflowX: 'auto' }} className="admin-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>User</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Banning</th>
                {user.role === 'owner' && (
                  <>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Role Authority</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Controls</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isSelf = (u._id || u.id) === user.id;
                const isProtectedAdminOwner = user.role === 'admin' && (u.role === 'admin' || u.role === 'owner');
                const isOwner = u.role === 'owner';
                
                return (
                  <tr key={u._id || u.id}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
                        backgroundColor: u.role === 'owner' ? 'rgba(168, 85, 247, 0.12)' : u.role === 'admin' ? 'rgba(255, 140, 0, 0.12)' : 'rgba(138, 138, 154, 0.08)',
                        color: u.role === 'owner' ? '#a855f7' : u.role === 'admin' ? 'var(--accent)' : 'var(--text-tertiary)',
                        border: u.role === 'owner' ? '1px solid rgba(168, 85, 247, 0.2)' : u.role === 'admin' ? '1px solid rgba(255, 140, 0, 0.2)' : '1px solid rgba(138, 138, 154, 0.1)'
                      }}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {u.isBanned ? (
                        <span style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--danger)', fontWeight: 600, fontSize: '0.85rem' }}><Ban size={15}/> Banned</span>
                      ) : (
                        <span style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}><CheckCircle size={15}/> Active</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      {!isSelf && !isProtectedAdminOwner && !isOwner ? (
                        <button 
                          className={`btn ${u.isBanned ? 'btn-outline' : 'btn-danger'}`} 
                          style={{ padding: '7px 16px', fontSize: '0.8rem' }}
                          onClick={() => handleToggleBan(u)}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Protected</span>
                      )}
                    </td>

                    {user.role === 'owner' && (
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        {!isSelf && u.role !== 'owner' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {u.role === 'user' && (
                              <button className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '0.8rem', background: '#a855f7', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)' }} onClick={() => handleMakeAdmin(u._id || u.id)}>
                                <Shield size={14}/> Make Admin
                              </button>
                            )}
                            {u.role === 'admin' && (
                              <button className="btn btn-outline" style={{ padding: '7px 16px', fontSize: '0.8rem' }} onClick={() => handleRemoveAdmin(u._id || u.id)}>
                                Remove Admin
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{isSelf ? "N/A (Self)" : "Locked"}</span>
                        )}
                      </td>
                    )}
                    {user.role === 'owner' && (
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <button className="btn btn-outline" title="Export User Data" style={{ padding: '8px 16px' }} onClick={() => handleExportData(u._id || u.id)}>
                          <Database size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No users found.</div>}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
