import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    User as UserCircleIcon,
    LogOut,
    Shield,
    Menu,
    X,
    CheckCircle2,
    ArrowRight,
    Info,
    AlertTriangle,
    Check
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNotificationStore } from '../store/notificationStore';
import LevelUpModal from './LevelUpModal';
import ModuleCompletionModal from './ModuleCompletionModal';

export default function Layout() {
    const { user, logout, viewAsStudent, setViewAsStudent } = useAuthStore();
    const { pendingLevelUp, clearLevelUp, pendingModuleCompletion, clearModuleCompletion } = useNotificationStore();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



    const handleLogout = async () => {
        await logout();
        toast.success('Sesión cerrada correctamente');
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/modules', icon: BookOpen, label: 'Módulos' },
        { to: '/leaderboard', icon: Trophy, label: 'Ranking' },
        { to: '/profile', icon: UserCircleIcon, label: 'Perfil' },
    ];

    if (user?.role === 'admin' && !viewAsStudent) {
        navItems.push({ to: '/admin', icon: Shield, label: 'Admin' });
    }

    return (
        <div className="min-h-screen bg-[#0d1127]">
            {/* Admin Student View Banner */}
            {user?.role === 'admin' && viewAsStudent && (
                <div className="bg-secondary-600 text-white text-[10px] font-black uppercase py-1 text-center tracking-[0.3em] sticky top-0 z-[60] animate-pulse">
                    Modo Estudiante Activo - Vista Restringida
                </div>
            )}
            {/* Navbar */}
            <nav className="bg-[#0d1127]/90 backdrop-blur-md border-b border-primary-500/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                            <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                                <img
                                    src="/images/Logotipo-CGR-blanco-transp.png"
                                    alt="CGR Logo"
                                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-[15px] font-black bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent tracking-tighter leading-none">
                                    CGR <span className="text-secondary-500 font-black">SEGUR@</span>
                                </h1>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 bg-slate-900/40 p-1 rounded-xl border border-white/5">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group ${isActive
                                            ? 'bg-primary-500/20 text-white border border-primary-500/20 shadow-[0_0_15px_rgba(56,74,153,0.2)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <item.icon className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110 ${item.label === 'Admin' ? 'text-secondary-500' : ''}`} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        {/* User Actions Section */}
                        <div className="flex items-center gap-3">
                            {/* Admin View Mode Toggle - Better Integrated */}
                            {user?.role === 'admin' && (
                                <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-full border border-white/5 shadow-lg">
                                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${!viewAsStudent ? 'text-secondary-500' : 'text-gray-500'}`}>
                                        {!viewAsStudent ? 'Modo Admin' : 'Modo Est'}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newVal = !viewAsStudent;
                                            setViewAsStudent(newVal);
                                            toast.success(newVal ? 'Vista de estudiante activada' : 'Vista de administrador activada');
                                            setTimeout(() => window.location.reload(), 300);
                                        }}
                                        className={`relative w-8 h-4 rounded-full transition-colors duration-300 focus:outline-none ${!viewAsStudent ? 'bg-secondary-600' : 'bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-300 ${!viewAsStudent ? 'translate-x-4.5' : 'translate-x-0.5'}`}></div>
                                    </button>
                                </div>
                            )}

                            {/* User Profile */}
                            <div className="hidden sm:flex items-center gap-3 px-3 py-1 bg-transparent rounded-2xl border border-transparent hover:bg-white/5 transition-all duration-300 cursor-pointer" onClick={() => navigate('/profile')}>
                                <div className="relative">
                                    <div className="p-0.5 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-full">
                                        <img
                                            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=384A99&color=fff`}
                                            alt={user?.firstName}
                                            className="w-8 h-8 rounded-full border-2 border-[#0d1127] object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                    {user?.role === 'admin' && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full border-2 border-[#0d1127] shadow-sm"></div>
                                    )}
                                </div>
                                <div className="hidden lg:flex flex-col">
                                    <p className="text-[10px] font-black text-white uppercase tracking-tight whitespace-nowrap">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Shield className="w-2.5 h-2.5 text-secondary-500" />
                                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{user?.level || 'Novato'}</p>
                                        </div>
                                        <div className="w-px h-2 bg-white/10"></div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-2.5 h-2.5 text-primary-400" />
                                            <p className="text-[8px] text-white font-black uppercase tracking-widest">
                                                {user?.points ?? 0} <span className="text-gray-600 text-[7px]">PTS</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center justify-center p-2 text-red-400 bg-red-500/10 rounded-xl transition-all duration-200"
                                title="Cerrar Sesión"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-primary-500/10 bg-[#0d1127]/95 backdrop-blur-md">
                        <div className="px-4 py-4 space-y-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                                            : 'text-gray-400 hover:text-white hover:bg-slate-800'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Cerrar Sesión</span>
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-primary-500/10 bg-[#0d1127]/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4 opacity-70">
                            <img src="/images/Logotipo-CGR-blanco-transp.png" alt="CGR Logo" className="h-8 object-contain" />
                            <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                            <p className="text-[10px] font-bold text-gray-400 leading-tight uppercase tracking-wider">
                                Contraloría General de la República | Costa Rica
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                Version 1.0.0
                            </p>

                        </div>
                    </div>
                </div>
            </footer>

            {/* Gamification Modals */}
            <LevelUpModal
                isOpen={!!pendingLevelUp}
                onClose={clearLevelUp}
                levelData={pendingLevelUp}
            />
            <ModuleCompletionModal
                isOpen={!!pendingModuleCompletion}
                onClose={clearModuleCompletion}
                data={pendingModuleCompletion}
            />
        </div>
    );
}
