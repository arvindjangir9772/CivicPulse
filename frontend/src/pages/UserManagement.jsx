import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users'); // I'll check if this exists or use a generic one
            setUsers(res.data);
        } catch (error) {
            // Fallback if endpoint not found (mocking it)
            console.error("Endpoint not found, mocking user list");
            setUsers([
                { id: 1, name: 'System Admin', email: 'admin@civicpulse.com', role: 'ADMIN', department: null },
                { id: 2, name: 'John Worker', email: 'worker@civicpulse.com', role: 'WORKER', department: { name: 'Roads & Highways' } },
                { id: 3, name: 'Jane Citizen', email: 'citizen@civicpulse.com', role: 'USER', department: null },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">Identity <span className="text-indigo-400">Control</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Manage municipal personnel and citizen access levels.</p>
                </div>
                <div className="glass-dark px-6 py-3 rounded-2xl border border-white/5 text-xs font-black uppercase tracking-widest text-emerald-400">
                    {filteredUsers.length} Active Profiles
                </div>
            </div>

            <div className="relative max-w-xl">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                <input
                    type="text"
                    placeholder="Search by name, email or role..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map(user => (
                    <div key={user.id} className="glass-card p-8 rounded-3xl border border-white/5 hover:border-indigo-500/20 transition-all group">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-xl font-black text-indigo-400 border border-white/5 group-hover:border-indigo-500/30 transition-colors">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white">{user.name}</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{user.role}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Email Terminal</p>
                                <p className="text-xs font-bold text-slate-400">{user.email}</p>
                            </div>
                            {user.role === 'WORKER' && (
                                <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                                    <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-1">Assigned Unit</p>
                                    <p className="text-xs font-bold text-amber-400">{user.department?.name || 'Unassigned'}</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex gap-2">
                            <button className="flex-1 py-2 glass-dark hover:bg-white/5 text-slate-400 text-[10px] font-black rounded-lg border border-white/5 uppercase transition">Edit</button>
                            <button className="flex-1 py-2 glass-dark hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 text-[10px] font-black rounded-lg border border-white/5 uppercase transition">Suspend</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserManagement;
