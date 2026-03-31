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
      // Fetch from the newly added /all-users endpoint
      // Assuming it's mounted under /admin, adjust if it's just /all-users
      const res = await api.get('/admin/all-users');
      setUsers(res.data?.users || res.data || []);
    } catch (e) {
      console.error(e);
      // For demonstration if endpoint is missing, define dummy data
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
    // Role logic prevention
    if (user.role === 'admin' && (targetUser.role === 'admin' || targetUser.role === 'owner')) {
      toast.error("Admins cannot ban other Admins or Owners.");
      return;
    }
    if (user.role === 'owner' && targetUser.role === 'owner') {
      toast.error("Owners cannot be banned.");
      return; // Optional security layer
    }

    try {
      if (targetUser.isBanned) {
        await api.patch(`/admin/unban/${targetUser._id || targetUser.id}`);
      } else {
        await api.patch(`/admin/ban/${targetUser._id || targetUser.id}`);
      }
      // Optimistic update
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
      // Simple download logic
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
    return <div className="page-container flex-center">Access Denied. Admins Only.</div>;
  }

  if (loading) return <div className="page-container flex-center">Loading Management System...</div>;

  return (
    <div className="page-container" style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <ShieldAlert size={40} color="var(--primary)" />
        <div>
          <h1 style={{ margin: 0 }} className="text-gradient">System Administration</h1>
          <p style={{ margin: 0, fontWeight: 600 }}>Role: <span style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{user.role}</span></p>
        </div>
      </div>

      <motion.div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>User</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'center' }}>Banning</th>
                {user.role === 'owner' && (
                  <>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'center' }}>Role Authority</th>
                    <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Controls</th>
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
                  <tr key={u._id || u.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.username}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                        backgroundColor: u.role === 'owner' ? 'rgba(168, 85, 247, 0.2)' : u.role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                        color: u.role === 'owner' ? '#a855f7' : u.role === 'admin' ? '#6366f1' : 'var(--text-muted)'
                      }}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      {u.isBanned ? (
                        <span style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--danger)', fontWeight: 600, fontSize: '0.9rem' }}><Ban size={16}/> Banned</span>
                      ) : (
                        <span style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem' }}><CheckCircle size={16}/> Active</span>
                      )}
                    </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      {!isSelf && !isProtectedAdminOwner && !isOwner ? (
                        <button 
                          className={`btn ${u.isBanned ? 'btn-outline' : 'btn-danger'}`} 
                          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                          onClick={() => handleToggleBan(u)}
                        >
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Protected</span>
                      )}
                    </td>

                    {user.role === 'owner' && (
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        {!isSelf && u.role !== 'owner' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {u.role === 'user' && (
                              <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.875rem', background: '#a855f7' }} onClick={() => handleMakeAdmin(u._id || u.id)}>
                                <Shield size={16}/> Make Admin
                              </button>
                            )}
                            {u.role === 'admin' && (
                              <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.875rem' }} onClick={() => handleRemoveAdmin(u._id || u.id)}>
                                Remove Admin
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{isSelf ? "N/A (Self)" : "Locked"}</span>
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
          {users.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</div>}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
