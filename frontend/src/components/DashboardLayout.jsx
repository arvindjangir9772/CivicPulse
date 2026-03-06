import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const SidebarLink = ({ to, icon, label, active }) => (
    <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black'
        : 'text-slate-400 hover:bg-white/5 hover:text-white font-bold'
        }`}>
        <span className="text-xl">{icon}</span>
        <span className="text-sm tracking-tight">{label}</span>
    </Link>
);

const DashboardLayout = ({ children, role }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const [listRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count')
            ]);
            setNotifications(listRes.data);
            setUnreadCount(countRes.data);
        } catch (e) {
            console.error("Notif fetch failed", e);
        }
    };

    const markAsRead = async (id) => {
        await api.put(`/notifications/${id}/read`);
        fetchNotifications();
    };

    const menuItems = {
        USER: [
            { to: '/citizen', icon: '📊', label: 'Dashboard' },
            { to: '/citizen/reports', icon: '📝', label: 'My Reports' },
            { to: '/citizen/map', icon: '🗺️', label: 'City Map' },
        ],
        WORKER: [
            { to: '/worker', icon: '🛠️', label: 'Task List' },
            { to: '/worker/schedule', icon: '📅', label: 'Schedule' },
        ],
        ADMIN: [
            { to: '/admin', icon: '📈', label: 'Analytics' },
            { to: '/admin/reports', icon: '📋', label: 'All Reports' },
            { to: '/admin/users', icon: '👥', label: 'User Mgmt' },
        ]
    };

    const currentMenu = menuItems[role] || [];

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-white/5 bg-slate-950/20 backdrop-blur-xl sticky top-0 h-screen flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-emerald-500/20 animate-float">P</div>
                    <h1 className="text-2xl font-black tracking-tight text-white">Civic<span className="text-emerald-400">Pulse</span></h1>
                </div>

                <nav className="flex-1 space-y-2">
                    {currentMenu.map(item => (
                        <SidebarLink
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="pt-6 border-t border-white/5">
                    <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-black text-emerald-400">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-black text-white truncate">{user?.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{role}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full py-3 glass-dark hover:bg-rose-500/10 hover:text-rose-400 border border-white/5 text-slate-400 text-xs font-black rounded-xl transition uppercase tracking-[0.2em]">
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative">
                {/* Header/Topnav */}
                <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
                            {location.pathname.split('/').pop() || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6 relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 text-slate-400 hover:text-white transition"
                        >
                            <span className="text-xl">🔔</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-[#0f172a] text-[10px] flex items-center justify-center font-black text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 glass-card rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Alerts</h3>
                                    <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">✕</button>
                                </div>
                                <div className="max-h-[320px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-[10px] font-black uppercase text-slate-600">No new alerts</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div
                                                key={n.id}
                                                onClick={() => markAsRead(n.id)}
                                                className={`p-4 border-b border-white/5 cursor-pointer transition-colors ${n.read ? 'opacity-40 hover:opacity-100' : 'bg-indigo-500/5 hover:bg-indigo-500/10'}`}
                                            >
                                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mb-1">{n.type.replace('_', ' ')}</p>
                                                <h4 className="text-xs font-bold text-slate-200 mb-1">{n.title}</h4>
                                                <p className="text-[10px] text-slate-500 leading-tight">{n.message}</p>
                                                <p className="text-[9px] text-slate-600 mt-2 font-mono">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 text-center bg-slate-950/20">
                                    <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition">View All Activity</button>
                                </div>
                            </div>
                        )}
                        <div className="h-6 w-[1px] bg-white/5"></div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
