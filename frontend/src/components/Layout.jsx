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

export default function Layout() {
    const { user, logout } = useAuthStore();
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

    if (user?.role === 'admin') {
        navItems.push({ to: '/admin', icon: Shield, label: 'Admin' });
    }

    return (
        <div className="min-h-screen bg-[#0d1127]">
            {/* Navbar */}
            <nav className="bg-[#0d1127]/90 backdrop-blur-md border-b border-primary-500/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
                            <div className="w-12 h-12 flex items-center justify-center p-0.5">
                                <img src="/images/Logotipo-CGR-blanco-transp.png" alt="CGR Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tighter">
                                    CGR <span className="text-secondary-500 font-extrabold">SEGUR@</span>
                                </h1>

                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1 bg-slate-800/20 p-1 rounded-xl border border-white/5">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-300 group ${isActive
                                            ? 'bg-primary-500/20 text-white border border-primary-500/30 shadow-[0_0_15px_rgba(56,74,153,0.3)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <item.icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${item.label === 'Admin' ? 'text-secondary-500' : ''}`} />
                                    <span className="text-sm font-bold tracking-wide">{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">

                            {/* User Profile */}
                            <div className="hidden sm:flex items-center gap-3 pl-1 pr-4 py-1 bg-slate-800/40 rounded-2xl border border-white/5 shadow-inner group hover:border-primary-500/30 transition-colors cursor-pointer overflow-hidden max-w-[200px]" onClick={() => navigate('/profile')}>
                                <div className="p-0.5 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-full">
                                    <img
                                        src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=384A99&color=fff`}
                                        alt={user?.firstName}
                                        className="w-8 h-8 rounded-full border-2 border-[#0d1127]"
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                                <div className="hidden lg:block max-w-[120px]">
                                    <p className="text-[10px] font-black text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight truncate">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <Trophy className="w-3 h-3 text-secondary-500" />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{user?.stats?.level || 'Novato'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 border border-transparent hover:border-red-500/30"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Salir</span>
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-primary-500/10 bg-[#0d1127]/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </div>
    );
}
