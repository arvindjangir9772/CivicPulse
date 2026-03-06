import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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

const CitizenDashboard = () => {
    const { user } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Pothole');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [departmentId, setDepartmentId] = useState(1);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
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

    const handleLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => alert('Error fetching location: ' + error.message)
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/complaints/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setImageUrl(res.data.message);
        } catch (error) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const submitComplaint = async (e) => {
        e.preventDefault();
        try {
            await api.post('/complaints', {
                description,
                category,
                latitude: parseFloat(latitude) || null,
                longitude: parseFloat(longitude) || null,
                departmentId: parseInt(departmentId),
                imageUrl: imageUrl
            });
            setDescription('');
            setCategory('Pothole');
            setLatitude('');
            setLongitude('');
            setImageUrl('');
            alert('Complaint submitted successfully!');
            fetchComplaints();
        } catch (error) {
            alert('Failed to submit complaint: ' + (error.response?.data?.message || error.message));
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
                    <h1 className="text-4xl font-black text-white">Citizen <span className="text-emerald-400">Hub</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Submit city issues and track their resolution.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="glass-dark px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">System Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 rounded-3xl border border-white/5">
                        <h2 className="text-xl font-black text-white mb-6">New Report</h2>
                        <form onSubmit={submitComplaint} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Category</label>
                                <select
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-medium appearance-none"
                                    value={category} onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="Pothole">Pothole / Road damage</option>
                                    <option value="Garbage">Garbage / Sanitation</option>
                                    <option value="Water">Water Leakage</option>
                                    <option value="Electricity">Electricity / Lighting</option>
                                    <option value="Accident">Accident / Hazard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Department</label>
                                <select
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-medium appearance-none"
                                    value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                                >
                                    <option value="1">Roads & Highways</option>
                                    <option value="2">Sanitation & Waste</option>
                                    <option value="3">Water & Electricity</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Description</label>
                                <textarea
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-medium min-h-[100px]"
                                    required
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Pinpoint the exact issue..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Attach Photo</label>
                                <div className="flex items-center gap-3">
                                    <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                    <label htmlFor="file-upload" className="flex-1 cursor-pointer bg-slate-900/50 border border-white/10 border-dashed rounded-xl p-4 text-center hover:bg-slate-900/80 transition group">
                                        {uploading ? (
                                            <span className="text-xs font-bold text-emerald-400">Uploading...</span>
                                        ) : imageUrl ? (
                                            <span className="text-xs font-bold text-emerald-400">Image Attached ✓</span>
                                        ) : (
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300">Choose File</span>
                                        )}
                                    </label>
                                    {imageUrl && (
                                        <div className="w-14 h-14 rounded-lg border border-white/10 overflow-hidden relative group">
                                            <img src={imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                            <button onClick={() => setImageUrl('')} className="absolute inset-0 bg-rose-500/80 items-center justify-center hidden group-hover:flex text-white font-black text-xs">✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Location Data</label>
                                <div className="flex gap-2 mb-3">
                                    <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-500 truncate">{latitude || '0.000'}</div>
                                    <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-500 truncate">{longitude || '0.000'}</div>
                                </div>
                                <button type="button" onClick={handleLocation} className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition border border-indigo-500/20">
                                    Refresh Location
                                </button>
                            </div>

                            <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition shadow-xl shadow-emerald-950/20 hover:-translate-y-0.5 active:scale-95 text-xs uppercase tracking-widest mt-4">
                                Submit Report
                            </button>
                        </form>
                    </div>
                </div>

                {/* Stats & Activity Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">My Reports</p>
                            <p className="text-3xl font-black text-white">{complaints.length}</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Resolved</p>
                            <p className="text-3xl font-black text-emerald-400">{complaints.filter(c => c.status === 'RESOLVED').length}</p>
                        </div>
                        <div className="glass-card p-6 rounded-3xl border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => window.location.href = '/citizen/map'}>
                            <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">City Health</p>
                            <p className="text-xs font-black text-indigo-400">View Live Map 🗺️</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Recent Activity</h3>
                        <Link to="/citizen/reports" className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline">View All</Link>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {complaints.length === 0 ? (
                            <div className="glass-card p-12 text-center rounded-3xl border-dashed border-white/10 opacity-50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">No recent activity</p>
                            </div>
                        ) : (
                            complaints.slice(0, 3).map(c => (
                                <div key={c.id} className="glass-dark p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xl border border-white/5">
                                            <CategoryIcon category={c.category} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{c.category}</p>
                                            <p className="text-[9px] font-bold text-slate-600 uppercase">#{c.id} • {new Date(c.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusStyles(c.status)}`}>
                                        {c.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
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
                            {complaint.worker && (
                                <p className="text-[9px] font-black text-indigo-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                                    👷 Assigned: {complaint.worker.name}
                                </p>
                            )}
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

                {complaint.status === 'RESOLVED' && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <FeedbackCard complaintId={complaint.id} onSubmitted={onUpdate} />
                    </div>
                )}
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

const FeedbackCard = ({ complaintId, onSubmitted }) => {
    const [rating, setRating] = useState(5);
    const [comments, setComments] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        api.get(`/feedback/${complaintId}`).then(res => res.data && setSubmitted(true)).catch(() => { });
    }, [complaintId]);

    const submit = async () => {
        try {
            await api.post(`/feedback/${complaintId}`, { rating, comments });
            setSubmitted(true);
            onSubmitted();
        } catch (e) { alert("Failed to save feedback"); }
    };

    if (submitted) return <p className="text-xs font-bold text-emerald-400 flex items-center gap-2">✨ Thank you for the feedback!</p>;

    return (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Rate Resolution</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => (
                        <button key={v} onClick={() => setRating(v)} className={`text-lg transition-transform ${rating >= v ? 'scale-110' : 'opacity-20 grayscale'}`}>⭐</button>
                    ))}
                </div>
            </div>
            <textarea
                className="w-full bg-slate-950/50 border border-white/5 rounded-xl p-3 text-xs text-slate-300 focus:outline-none min-h-[60px]"
                placeholder="Any comments on the service?"
                value={comments} onChange={(e) => setComments(e.target.value)}
            />
            <button onClick={submit} className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition">Submit Feedback</button>
        </div>
    );
};

export default CitizenDashboard;
