import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const StaffLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginRole, setLoginRole] = useState('WORKER'); // UI Toggle State
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const result = await login(email, password);
        if (result.success) {
            // Backend dictates actual role, but we route appropriately
            if (result.role === 'ADMIN') navigate('/admin');
            else if (result.role === 'WORKER') navigate('/worker');
            else navigate('/citizen'); // Should not happen for staff, but safe fallback
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            {/* True Top-Left Home Button */}
            <Link to="/" className="absolute top-8 left-8 z-50 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition flex items-center gap-2">
                <span className="text-sm">←</span> Back to Home
            </Link>

            <div className="z-10 w-full max-w-md relative">
                <div className="text-center mb-10 animate-float">
                    <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-[10px] font-black tracking-[0.2em] uppercase mb-4">
                        Authorized Personnel Only
                    </div>
                    <h2 className="text-5xl font-black tracking-tight mb-2">
                        Staff <span className="text-indigo-400">Portal</span>
                    </h2>
                    <p className="text-slate-400 font-medium">Please sign in with your credentials</p>
                </div>

                <div className="glass-card p-10 rounded-[2.5rem] border border-white/5">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs mb-8 text-center font-black uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Role Selector Toggle */}
                        <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5 mb-8">
                            <button
                                type="button"
                                onClick={() => setLoginRole('WORKER')}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginRole === 'WORKER'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner shadow-amber-500/10'
                                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                                    }`}
                            >
                                Worker
                            </button>
                            <button
                                type="button"
                                onClick={() => setLoginRole('ADMIN')}
                                className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${loginRole === 'ADMIN'
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner shadow-indigo-500/10'
                                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                                    }`}
                            >
                                Admin
                            </button>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3 ml-1">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium placeholder:text-slate-700"
                                placeholder="name@civicpulse.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-2xl pl-6 pr-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium placeholder:text-slate-700"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition"
                                >
                                    {showPassword ? "👁️‍🗨️" : "👁️"}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`w-full py-5 text-white font-black rounded-[1.25rem] transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-widest ${loginRole === 'ADMIN' ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/20' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/20'
                                }`}
                        >
                            Log In as {loginRole}
                        </button>
                    </form>
                    {/* No registration link on Staff portal */}
                </div>
            </div>
        </div>
    );
};

export default StaffLogin;
