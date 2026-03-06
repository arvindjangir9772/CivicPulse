import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import StaffLogin from './pages/StaffLogin';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import CitizenReports from './pages/CitizenReports';
import CityMap from './pages/CityMap';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerSchedule from './pages/WorkerSchedule';
import AdminDashboard from './pages/AdminDashboard';
import AdminReports from './pages/AdminReports';
import UserManagement from './pages/UserManagement';
import DashboardLayout from './components/DashboardLayout';

function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <main className="z-10 max-w-5xl w-full text-center space-y-16">
        <header className="space-y-6 animate-float">
          <div className="inline-block px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black tracking-[0.25em] uppercase mb-4">
            Civic Complaint System
          </div>
          <h1 className="text-8xl font-black tracking-tighter leading-none">
            Civic<span className="text-emerald-400">Pulse</span>
          </h1>
          <p className="text-2xl text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Report local issues and track resolutions in <span className="text-white">real-time</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-12">
          <div className="glass-card p-10 rounded-[2.5rem] text-left border border-white/5 group relative overflow-hidden">
            <h3 className="text-3xl font-black mb-4 group-hover:text-emerald-400 transition-colors">Citizen</h3>
            <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">Report road issues, garbage, or outages and track the status of your complaints.</p>
            <Link to="/login" className="inline-flex items-center justify-center w-full py-5 bg-slate-100 hover:bg-white text-slate-900 font-black rounded-2xl transition shadow-xl shadow-black/20 text-sm uppercase tracking-widest hover:-translate-y-1 active:scale-95">
              Citizen Login
            </Link>
          </div>

          <div className="glass-card p-10 rounded-[2.5rem] text-left border border-white/5 group relative overflow-hidden">
            <h3 className="text-3xl font-black mb-4 group-hover:text-indigo-400 transition-colors">Staff / Worker</h3>
            <p className="text-slate-400 mb-10 text-lg font-medium leading-relaxed">Access for municipal workers and administrators to manage city-wide reports.</p>
            <Link to="/staff-login" className="inline-flex items-center justify-center w-full py-5 bg-slate-100 hover:bg-white text-slate-900 font-black rounded-2xl transition shadow-xl shadow-black/20 text-sm uppercase tracking-widest hover:-translate-y-1 active:scale-95">
              Staff & Worker Login
            </Link>
          </div>
        </div>

        <footer className="pt-20 flex flex-wrap justify-center gap-12 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            Active in 12 Districts
          </div>
          <div>99% Success Rate</div>
          <div>Public Dashboard</div>
        </footer>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/staff-login" element={<StaffLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen Routes */}
          <Route path="/citizen" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <DashboardLayout role="USER">
                <CitizenDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/citizen/reports" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <DashboardLayout role="USER">
                <CitizenReports />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/citizen/map" element={
            <ProtectedRoute allowedRoles={['USER']}>
              <DashboardLayout role="USER">
                <CityMap />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Worker Routes */}
          <Route path="/worker" element={
            <ProtectedRoute allowedRoles={['WORKER']}>
              <DashboardLayout role="WORKER">
                <WorkerDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/worker/schedule" element={
            <ProtectedRoute allowedRoles={['WORKER']}>
              <DashboardLayout role="WORKER">
                <WorkerSchedule />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout role="ADMIN">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout role="ADMIN">
                <AdminReports />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout role="ADMIN">
                <UserManagement />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
