import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const WorkerDashboard = () => {
    const { logout, user } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchAssignedComplaints();
    }, []);

    const fetchAssignedComplaints = async () => {
        try {
            const res = await api.get('/complaints/worker');
            setComplaints(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const updateStatus = async (id, newStatus, resolutionNote = '') => {
        try {
            await api.put(`/complaints/${id}/status`, {
                status: newStatus,
                resolutionNote: resolutionNote
            });
            fetchAssignedComplaints();
        } catch (error) {
            alert('Status update failed');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const filtered = complaints.filter(c => {
        const matchesSearch = c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">Task <span className="text-amber-400">Hub</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Maintenance requests for {user?.department?.name || 'Assigned Department'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-dark px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">{complaints.filter(c => c.status !== 'RESOLVED').length} Active Tasks</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterStatus === s ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-900/50 text-slate-500 border-white/5 hover:border-white/10'
                                }`}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="glass-card p-20 text-center rounded-3xl border-dashed border-white/10 opacity-50">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">No tasks found in this view</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map(complaint => (
                        <ComplaintCard
                            key={complaint.id}
                            complaint={complaint}
                            onUpdate={updateStatus}
                            getStatusStyles={getStatusStyles}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const ComplaintCard = ({ complaint, onUpdate, getStatusStyles }) => {
    const [showResolveForm, setShowResolveForm] = useState(false);
    const [note, setNote] = useState('');

    const handleResolve = () => {
        onUpdate(complaint.id, 'RESOLVED', note);
        setShowResolveForm(false);
    };

    return (
        <div className={`glass-card rounded-3xl overflow-hidden group border-t-4 transition-all hover:-translate-y-1 ${complaint.priority === 'CRITICAL' ? 'border-t-rose-500' :
                complaint.priority === 'HIGH' ? 'border-t-amber-500' : 'border-t-slate-700/50'
            }`}>
            <div className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors uppercase tracking-tight">{complaint.category}</h3>
                        <p className="text-[10px] font-black text-slate-500 tracking-widest">TASK #CP-{complaint.id.toString().padStart(4, '0')}</p>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full border uppercase tracking-widest ${getStatusStyles(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                    </span>
                </div>

                {complaint.imageUrl && (
                    <div className="h-40 rounded-2xl border border-white/5 overflow-hidden shadow-inner bg-slate-900/20">
                        <img src={complaint.imageUrl} className="w-full h-full object-cover" alt="Task" />
                    </div>
                )}

                <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 min-h-[80px]">
                    <p className="text-slate-400 text-sm font-medium leading-relaxed italic line-clamp-3">"{complaint.description}"</p>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                    <div className="flex items-center gap-2">
                        <span className={complaint.priority === 'CRITICAL' ? 'text-rose-400 animate-pulse' : ''}>⚠️ {complaint.priority} Priority</span>
                    </div>
                    <span>{complaint.latitude ? '📍 Located' : 'No GPS'}</span>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                    {complaint.status === 'OPEN' && (
                        <button
                            onClick={() => onUpdate(complaint.id, 'IN_PROGRESS')}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-amber-500/10"
                        >
                            Accept Task
                        </button>
                    )}

                    {complaint.status === 'IN_PROGRESS' && !showResolveForm && (
                        <button
                            onClick={() => setShowResolveForm(true)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition shadow-lg shadow-emerald-500/10"
                        >
                            Resolve Issue
                        </button>
                    )}

                    {showResolveForm && (
                        <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
                            <textarea
                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder:text-slate-600 min-h-[80px]"
                                placeholder="Resolution notes..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleResolve}
                                    className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-500 transition"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setShowResolveForm(false)}
                                    className="flex-1 bg-slate-800 text-slate-400 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {complaint.status === 'RESOLVED' && (
                        <div className="w-full text-center py-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Resolved</p>
                            {complaint.resolutionNote && (
                                <p className="text-[10px] italic text-slate-500 mt-2 px-4 font-medium line-clamp-2">"{complaint.resolutionNote}"</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkerDashboard;
