import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CityMap = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            // Citizens can see all public reports on the map
            const res = await api.get('/complaints/my'); // For now, showing own. If backend has public list, use that.
            setComplaints(res.data);

            const resolved = res.data.filter(c => c.status === 'RESOLVED').length;
            setStats({
                total: res.data.length,
                active: res.data.length - resolved,
                resolved: resolved
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">City <span className="text-indigo-400">Map</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Spatial visualization of infrastructure health in your area.</p>
                </div>
                <div className="flex gap-4">
                    <div className="glass-dark px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Live Reports</p>
                        <p className="text-xl font-black text-white">{stats.total}</p>
                    </div>
                    <div className="glass-dark px-4 py-2 rounded-xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Resolved</p>
                        <p className="text-xl font-black text-emerald-400">{stats.resolved}</p>
                    </div>
                </div>
            </div>

            <div className="glass-card p-4 rounded-[2.5rem] border border-white/5 h-[65vh] relative overflow-hidden">
                <Heatmap complaints={complaints} />

                {/* Map Overlay info */}
                <div className="absolute top-8 left-8 p-6 glass-dark rounded-3xl border border-white/10 max-w-xs shadow-2xl pointer-events-none">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Legend</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-4 h-4 rounded-full bg-rose-500 blur-sm"></span>
                            <span className="text-[10px] font-bold text-slate-400">Unresolved Hazard</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-4 h-4 rounded-full bg-emerald-500 blur-sm"></span>
                            <span className="text-[10px] font-bold text-slate-400">Resolved Point</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-4 h-4 rounded-full bg-indigo-500/20 border border-indigo-400/50"></span>
                            <span className="text-[10px] font-bold text-slate-400">District Boundary</span>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                    <button className="w-10 h-10 glass-dark rounded-lg flex items-center justify-center text-white font-black hover:bg-white/5 transition border border-white/10">+</button>
                    <button className="w-10 h-10 glass-dark rounded-lg flex items-center justify-center text-white font-black hover:bg-white/5 transition border border-white/10">-</button>
                    <button onClick={fetchComplaints} className="w-10 h-10 glass-dark rounded-lg flex items-center justify-center text-indigo-400 font-black hover:bg-white/5 transition border border-indigo-500/20 mt-2">🔄</button>
                </div>
            </div>
        </div>
    );
};

const Heatmap = ({ complaints }) => {
    return (
        <div className="relative w-full h-full bg-slate-950/50 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')]">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundSize: '60px 60px', backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)' }}></div>

            <div className="relative w-full h-full">
                {complaints.map((c) => {
                    const x = ((c.longitude || 0) * 1000 % 80) + 10;
                    const y = ((c.latitude || 0) * 1000 % 80) + 10;
                    return (
                        <div
                            key={c.id}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl ${c.status === 'RESOLVED' ? 'bg-emerald-500/20' : 'bg-rose-500/30'
                                }`}
                            style={{ left: `${x}%`, top: `${y}%`, width: '80px', height: '80px' }}
                        ></div>
                    );
                })}

                {complaints.map((c) => {
                    const x = ((c.longitude || 0) * 1000 % 80) + 10;
                    const y = ((c.latitude || 0) * 1000 % 80) + 10;
                    return (
                        <div
                            key={`m-${c.id}`}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#0f172a] shadow-lg group cursor-pointer transition-transform hover:scale-150 ${c.status === 'RESOLVED' ? 'bg-emerald-400' : 'bg-rose-500'
                                }`}
                            style={{ left: `${x}%`, top: `${y}%` }}
                        >
                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-[10px] font-black text-white px-2 py-1 rounded border border-white/10 whitespace-nowrap pointer-events-none transition-opacity">
                                {c.category} - {c.status}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-dark px-4 py-2 rounded-full border border-white/10">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    Live District Feed Active
                </p>
            </div>
        </div>
    );
};

export default CityMap;
