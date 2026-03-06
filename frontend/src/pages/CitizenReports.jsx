import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CategoryIcon = ({ category }) => {
    switch (category) {
        case 'Pothole': return '🕳️';
        case 'Garbage': return '🗑️';
        case 'Water': return '💧';
        case 'Electricity': return '⚡';
        case 'Accident': return '🚨';
        default: return '📝';
    }
};

const CitizenReports = () => {
    const [complaints, setComplaints] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/my');
            setComplaints(res.data);
        } catch (error) {
            console.error(error);
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

    const filteredComplaints = complaints.filter(c =>
        c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">My <span className="text-emerald-400">Reports</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Detailed history of all your submitted complaints.</p>
                </div>
                <div className="glass-dark px-6 py-3 rounded-2xl border border-white/5 text-xs font-black uppercase tracking-widest text-slate-400">
                    {filteredComplaints.length} Total Records
                </div>
            </div>

            <div className="relative max-w-xl">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                <input
                    type="text"
                    placeholder="Search your reports..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredComplaints.length === 0 ? (
                    <div className="glass-card p-20 text-center rounded-3xl border-dashed border-white/10 opacity-50">
                        <div className="text-5xl mb-4">📁</div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">No reports found</p>
                    </div>
                ) : (
                    filteredComplaints.map(c => (
                        <ComplaintItem key={c.id} complaint={c} onUpdate={fetchComplaints} getStyles={getStatusStyles} />
                    ))
                )}
            </div>
        </div>
    );
};

const ComplaintItem = ({ complaint, onUpdate, getStyles }) => {
    return (
        <div className="glass-card rounded-3xl overflow-hidden border border-white/5 group hover:border-emerald-500/20 transition-all">
            <div className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900/80 rounded-2xl flex items-center justify-center text-2xl border border-white/5">
                            <CategoryIcon category={complaint.category} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">{complaint.category}</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ID: #CP-{complaint.id.toString().padStart(4, '0')}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStyles(complaint.status)}`}>
                            {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${complaint.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            complaint.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                'bg-slate-900/50 text-slate-500 border-white/5'
                            }`}>
                            {complaint.priority}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {complaint.imageUrl && (
                        <div className="w-full md:w-48 h-32 rounded-2xl border border-white/5 overflow-hidden shadow-lg">
                            <img src={complaint.imageUrl} className="w-full h-full object-cover" alt="Report" />
                        </div>
                    )}
                    <div className="flex-1 bg-slate-900/40 p-5 rounded-2xl border border-white/5 italic">
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">"{complaint.description}"</p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5">📅 {new Date(complaint.createdAt).toLocaleDateString()}</span>
                        {complaint.latitude && <span className="flex items-center gap-1.5">📍 Geo-located</span>}
                    </div>
                    <Timeline complaintId={complaint.id} />
                </div>
            </div>
        </div>
    );
};

const Timeline = ({ complaintId }) => {
    const [logs, setLogs] = useState([]);
    const [expanded, setExpanded] = useState(false);

    const toggle = async () => {
        if (!expanded && logs.length === 0) {
            const res = await api.get(`/complaints/${complaintId}/logs`);
            setLogs(res.data);
        }
        setExpanded(!expanded);
    };

    return (
        <div className="w-full mt-2">
            <button onClick={toggle} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
                {expanded ? 'Close History ▲' : 'Service History ▼'}
            </button>
            {expanded && (
                <div className="mt-4 space-y-4 pl-4 border-l border-white/10 animate-in slide-in-from-top-2 duration-300">
                    {logs.map(log => (
                        <div key={log.id} className="relative">
                            <span className="block text-[8px] font-black text-slate-500 uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                            <span className="block text-xs font-bold text-slate-200 mt-0.5">{log.action}</span>
                            <p className="text-[10px] text-slate-500 mt-1">{log.notes}</p>
                        </div>
                    ))}
                    {logs.length === 0 && <p className="text-[10px] text-slate-600">Loading...</p>}
                </div>
            )}
        </div>
    );
};

export default CitizenReports;
