import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminReports = () => {
    const [complaints, setComplaints] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('ALL');
    const [loading, setLoading] = useState(true);

    const [workers, setWorkers] = useState([]);

    useEffect(() => {
        fetchComplaints();
        fetchWorkers();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints');
            setComplaints(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkers = async () => {
        try {
            const res = await api.get('/admin/users');
            // Assuming we only want WORKER roles
            setWorkers(res.data.filter(u => u.role === 'WORKER'));
        } catch (error) {
            console.error('Failed to fetch workers', error);
        }
    };

    const handleAssign = async (complaintId, workerId) => {
        if (!workerId) return;
        try {
            await api.put(`/complaints/${complaintId}/assign/${workerId}`);
            alert('Worker assigned successfully!');
            fetchComplaints(); // refresh data
        } catch (error) {
            alert('Failed to assign worker: ' + (error.response?.data?.message || error.message));
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });

    if (loading) return <div className="p-8 text-center text-slate-500 uppercase text-[10px] font-black tracking-widest">Loading Master Records...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">Records <span className="text-indigo-400">Explorer</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Complete audit trail and report management interface.</p>
                </div>
                <div className="glass-dark px-6 py-3 rounded-2xl border border-white/5 text-xs font-black uppercase tracking-widest text-slate-400">
                    {filteredComplaints.length} Records Found
                </div>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-white/5">
                <div className="flex flex-wrap justify-between items-center gap-6 mb-10 pb-6 border-b border-white/5">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                            <input
                                type="text"
                                placeholder="Search by ID, Category, or Description..."
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPriority(p)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filterPriority === p ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'
                                        }`}
                                >{p}</button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                <th className="pb-6 pl-4">Reference</th>
                                <th className="pb-6">Issue Details</th>
                                <th className="pb-6">Department</th>
                                <th className="pb-6">Priority</th>
                                <th className="pb-6">Status</th>
                                <th className="pb-6">Timeline</th>
                                <th className="pb-6 pr-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold text-slate-400">
                            {filteredComplaints.map(c => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-6 pl-4">
                                        <p className="font-mono text-[10px] text-slate-500">#CP-{c.id.toString().padStart(4, '0')}</p>
                                    </td>
                                    <td className="py-6">
                                        <p className="text-white uppercase tracking-tight text-xs font-black">{c.category}</p>
                                        <p className="text-[10px] text-slate-600 font-medium truncate max-w-[200px] mt-1">{c.description}</p>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                                            <span className="text-[10px] uppercase font-black">{c.department?.name || 'Unassigned'}</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[9px] uppercase font-bold text-slate-500">Worker:</span>
                                            {c.worker ? (
                                                <span className="text-[10px] uppercase font-black text-indigo-400">{c.worker.name}</span>
                                            ) : (
                                                <select
                                                    className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-[9px] text-white focus:outline-none focus:border-indigo-500 uppercase font-bold"
                                                    onChange={(e) => handleAssign(c.id, e.target.value)}
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Assign...</option>
                                                    {workers.map(w => (
                                                        <option key={w.id} value={w.id}>{w.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter ${c.priority === 'CRITICAL' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' :
                                            c.priority === 'HIGH' ? 'bg-amber-400/20 text-amber-500' : 'bg-slate-800 text-slate-400'
                                            }`}>{c.priority}</span>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'RESOLVED' ? 'bg-emerald-500' : c.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                                            <span className="text-[10px] uppercase font-black">{c.status.replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <p className="text-[10px] text-slate-500 font-black">{new Date(c.createdAt).toLocaleDateString()}</p>
                                        <p className="text-[8px] text-slate-700 uppercase mt-0.5">Filed by {c.user?.name}</p>
                                    </td>
                                    <td className="py-6 pr-4 text-right">
                                        <button className="px-4 py-2 glass-dark hover:bg-indigo-500/10 hover:text-indigo-400 border border-white/5 text-slate-500 text-[10px] font-black rounded-lg transition uppercase tracking-widest">
                                            Audit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredComplaints.length === 0 && (
                        <div className="py-20 text-center text-slate-600 uppercase text-[10px] font-black tracking-widest">No matching records found in the system shadow</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;
