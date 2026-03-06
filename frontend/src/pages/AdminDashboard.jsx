import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement);

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('ALL');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/admin/analytics');
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        }
    };

    if (!stats) return <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Syncing command center...</p>
    </div>;

    const resolutionData = {
        labels: ['Open', 'Processing', 'Resolved'],
        datasets: [{
            data: [stats.open, stats.in_progress, stats.resolved],
            backgroundColor: ['#f43f5e', '#f59e0b', '#10b981'],
            borderColor: 'transparent',
            hoverOffset: 20
        }]
    };

    const categoryCounts = stats.complaints.reduce((acc, current) => {
        acc[current.category] = (acc[current.category] || 0) + 1;
        return acc;
    }, {});

    const categoryData = {
        labels: Object.keys(categoryCounts),
        datasets: [{
            label: 'Reports',
            data: Object.values(categoryCounts),
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: '#6366f1',
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    const filteredComplaints = stats.complaints.filter(c => {
        const matchesSearch = c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'ALL' || c.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">System <span className="text-indigo-400">Intelligence</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Real-time municipal health and infrastructure metrics.</p>
                </div>
                <button onClick={fetchAnalytics} className="px-6 py-3 glass-dark hover:bg-white/5 text-indigo-400 text-xs font-black rounded-xl transition border border-indigo-500/20 uppercase tracking-widest">
                    Refresh Streams
                </button>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <MetricCard label="Total Reports" value={stats.total} color="slate" />
                <MetricCard label="Resolved" value={stats.resolved} color="emerald" icon="✓" />
                <MetricCard label="Urgent" value={stats.critical_issues} color="rose" icon="⚠️" />
                <MetricCard label="Rating" value={stats.average_rating.toFixed(1)} color="amber" subtitle="Stars" />
                <MetricCard label="Feedback" value={stats.total_feedback} color="indigo" />
            </div>

            {/* Heatmap & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="glass-card p-8 rounded-3xl border border-white/5">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-white">Issue <span className="text-emerald-400">Concentration</span></h3>
                                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Heatmap visualization of reported hazards</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Resolved</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Active</span>
                                </div>
                            </div>
                        </div>
                        <Heatmap complaints={stats.complaints} />
                    </div>

                    <div className="glass-card p-8 rounded-3xl border border-white/5">
                        <h3 className="text-xl font-black text-white mb-8">Reports by <span className="text-indigo-400">Category</span></h3>
                        <div className="h-[300px]">
                            <Bar
                                data={categoryData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } },
                                        x: { grid: { display: false }, ticks: { color: '#64748b' } }
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card p-8 rounded-3xl border border-white/5 flex flex-col h-full">
                        <h3 className="text-xl font-black text-white mb-8">Resolution <span className="text-amber-400">Flow</span></h3>
                        <div className="flex-1 flex flex-col justify-center items-center">
                            <div className="w-full max-w-[240px]">
                                <Pie
                                    data={resolutionData}
                                    options={{
                                        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { weight: 'bold', size: 10 } } } }
                                    }}
                                />
                            </div>
                            <div className="mt-8 space-y-4 w-full">
                                <div className="flex justify-between items-center p-3 bg-slate-900/40 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Escalation Rate</span>
                                    <span className="text-xs font-black text-rose-400">{(stats.critical_issues / stats.total * 100).toFixed(0)}%</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-slate-900/40 rounded-xl border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">Citizen NPS</span>
                                    <span className="text-xs font-black text-emerald-400">{(stats.average_rating * 20).toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reports Explorer */}
            <div className="glass-card p-8 rounded-3xl border border-white/5">
                <div className="flex flex-wrap justify-between items-center gap-6 mb-10 pb-6 border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white">Records <span className="text-indigo-400">Explorer</span></h2>
                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Audit trail for all municipal reports</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative w-64">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                            <input
                                type="text"
                                placeholder="Search all records..."
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setFilterPriority(p)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${filterPriority === p ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'
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
                                <th className="pb-4 pl-4">ID</th>
                                <th className="pb-4">Category</th>
                                <th className="pb-4">Department</th>
                                <th className="pb-4">Priority</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4">Filed On</th>
                                <th className="pb-4 pr-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs font-bold text-slate-400">
                            {filteredComplaints.slice(0, 10).map(c => (
                                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="py-4 pl-4 font-mono text-[10px] text-slate-600">#{c.id}</td>
                                    <td className="py-4 text-white uppercase tracking-tight">{c.category}</td>
                                    <td className="py-4">{c.department?.name || 'Unassigned'}</td>
                                    <td className="py-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-tighter ${c.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                                            c.priority === 'HIGH' ? 'bg-amber-400/20 text-amber-500' : 'bg-slate-800 text-slate-400'
                                            }`}>{c.priority}</span>
                                    </td>
                                    <td className="py-4">{c.status.replace('_', ' ')}</td>
                                    <td className="py-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td className="py-4 pr-4 text-right">
                                        <button className="text-indigo-400 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredComplaints.length === 0 && (
                        <div className="py-12 text-center text-slate-500 uppercase text-[10px] font-black tracking-widest">No matching records</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, color, icon, subtitle }) => {
    const colors = {
        slate: 'text-slate-400',
        emerald: 'text-emerald-400',
        rose: 'text-rose-400',
        amber: 'text-amber-400',
        indigo: 'text-indigo-400'
    };

    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</span>
            <div className="flex items-center gap-2">
                {icon && <span className={`text-xl ${colors[color]}`}>{icon}</span>}
                <span className={`text-3xl font-black ${colors[color]}`}>{value}</span>
            </div>
            {subtitle && <span className="text-[10px] font-bold text-slate-600 uppercase mt-1 tracking-tighter">{subtitle}</span>}
        </div>
    );
};

const Heatmap = ({ complaints }) => {
    // Generate a mock city grid with concentration points
    return (
        <div className="relative h-[400px] w-full bg-slate-950/50 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')]">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="w-full h-full border-[0.5px] border-white/10" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, grey 1px, transparent 1px), linear-gradient(to bottom, grey 1px, transparent 1px)' }}></div>
            </div>

            {/* Render random "heat" blobs based on complaint locations */}
            <div className="relative w-full h-full">
                {complaints.map((c, i) => {
                    // Map lat/lng to simplified percentage for visualization
                    // We'll use a deterministic random if real data is outside a range for this demo
                    const x = ((c.longitude || 0) * 1000 % 80) + 10;
                    const y = ((c.latitude || 0) * 1000 % 80) + 10;

                    return (
                        <div
                            key={c.id}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl ${c.status === 'RESOLVED' ? 'bg-emerald-500/20' : 'bg-rose-500/40'
                                }`}
                            style={{
                                left: `${x}%`,
                                top: `${y}%`,
                                width: c.priority === 'CRITICAL' ? '60px' : '30px',
                                height: c.priority === 'CRITICAL' ? '60px' : '30px'
                            }}
                        ></div>
                    );
                })}

                {/* Markers */}
                {complaints.map((c, i) => {
                    const x = ((c.longitude || 0) * 1000 % 80) + 10;
                    const y = ((c.latitude || 0) * 1000 % 80) + 10;
                    return (
                        <div
                            key={`m-${c.id}`}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white/20 ${c.status === 'RESOLVED' ? 'bg-emerald-400' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                                }`}
                            style={{ left: `${x}%`, top: `${y}%` }}
                        ></div>
                    );
                })}
            </div>

            <div className="absolute bottom-4 left-4 glass-dark px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none">
                <span className="text-[8px] font-black text-white uppercase tracking-widest">District Alpha - Live Ops</span>
            </div>
        </div>
    );
};

export default AdminDashboard;
