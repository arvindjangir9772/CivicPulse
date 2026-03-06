import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const WorkerSchedule = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(new Date().getDay());

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/complaints/worker');
            setTasks(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const getTasksForDay = (dayIndex) => {
        // Mocking task assignment by day for visualization
        return tasks.filter((t, i) => (i % 7) === dayIndex);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">Service <span className="text-amber-400">Schedule</span></h1>
                    <p className="text-slate-500 font-medium mt-1">Maintenance roadmap for {user?.department?.name || 'Department'}</p>
                </div>
                <div className="glass-dark px-6 py-3 rounded-2xl border border-white/5 text-xs font-black uppercase tracking-widest text-slate-400">
                    Week of {currentWeekStart.toLocaleDateString()}
                </div>
            </div>

            {/* Calendar Strip */}
            <div className="grid grid-cols-7 gap-4">
                {days.map((day, idx) => {
                    const date = new Date(currentWeekStart);
                    date.setDate(date.getDate() + idx);
                    const isActive = selectedDay === idx;
                    const dayTasks = getTasksForDay(idx);

                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(idx)}
                            className={`glass-card p-6 rounded-3xl border border-white/5 transition-all text-center group ${isActive ? 'bg-amber-500 border-amber-400 -translate-y-2' : 'hover:bg-white/5'
                                }`}
                        >
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900/60' : 'text-slate-500 group-hover:text-slate-400'}`}>{day.slice(0, 3)}</p>
                            <p className={`text-2xl font-black mt-2 ${isActive ? 'text-slate-900' : 'text-white'}`}>{date.getDate()}</p>
                            {dayTasks.length > 0 && (
                                <div className="mt-3 flex justify-center gap-1">
                                    {dayTasks.map(t => (
                                        <span key={t.id} className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-slate-950/20' : 'bg-amber-500'}`}></span>
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Day Detail */}
            <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 min-h-[400px]">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{days[selectedDay]} Schedule</h3>
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Duty Window</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {getTasksForDay(selectedDay).length === 0 ? (
                        <div className="py-20 text-center opacity-30">
                            <p className="text-5xl mb-4">💤</p>
                            <p className="text-xs font-black uppercase tracking-widest">No site visits scheduled</p>
                        </div>
                    ) : (
                        getTasksForDay(selectedDay).map((task, i) => (
                            <div key={task.id} className="flex gap-6 group">
                                <div className="w-24 text-right pt-1">
                                    <p className="text-xs font-black text-white">0{9 + i}:00 AM</p>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase">Start Est.</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full bg-amber-500 shadow-lg border-2 border-[#0f172a]"></div>
                                    <div className="w-[1px] flex-1 bg-white/10 group-last:hidden"></div>
                                </div>
                                <div className="flex-1 pb-10">
                                    <div className="glass-dark hover:bg-white/5 p-6 rounded-2xl border border-white/5 transition group-hover:border-amber-500/30">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-black text-white">{task.category}</h4>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">TASK #CP-{task.id}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-[10px] font-black rounded-lg border uppercase tracking-widest ${task.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                                                    'bg-slate-900 text-slate-500 border-white/10'
                                                }`}>{task.priority}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-400 italic mb-4 line-clamp-2">"{task.description}"</p>
                                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <span>📍 {task.latitude ? 'GPS Verified' : 'Standard Address'}</span>
                                            <span>⏱️ Priority Execution</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkerSchedule;
