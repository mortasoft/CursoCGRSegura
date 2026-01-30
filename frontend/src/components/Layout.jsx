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
    Bell,
    CheckCircle2,
    ArrowRight,
    Info,
    AlertTriangle,
    Check
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import toast from 'react-hot-toast';

export default function Layout() {
    const { user, logout } = useAuthStore();
    const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } = useNotificationStore();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const notificationRef = useRef(null);

    // Polling de notificaciones (Simulando Real-Time) cada 30 segundos
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                            {/* Notifications */}
                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => {
                                        setIsNotificationsOpen(!isNotificationsOpen);
                                        if (!isNotificationsOpen) fetchNotifications();
                                    }}
                                    className={`relative p-2.5 rounded-xl transition-all border border-transparent group ${isNotificationsOpen ? 'text-white bg-white/10 border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'}`}
                                >
                                    <Bell className={`w-5 h-5 transition-transform ${unreadCount > 0 ? 'animate-wiggle' : 'group-hover:rotate-12'}`} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-2 right-2 w-4 h-4 bg-secondary-500 text-[10px] font-black text-white rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Dropdown de Notificaciones */}
                                {isNotificationsOpen && (
                                    <div className="absolute right-0 mt-4 w-80 md:w-96 bg-slate-900 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-slide-up">
                                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Notificaciones</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-[10px] font-bold text-primary-400 hover:text-primary-300 uppercase tracking-tighter"
                                                >
                                                    Marcar todo como leído
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {notifications.length > 0 ? (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => {
                                                            if (!n.is_read) markAsRead(n.id);
                                                            if (n.link_url) {
                                                                navigate(n.link_url);
                                                                setIsNotificationsOpen(false);
                                                            }
                                                        }}
                                                        className={`p-4 border-b border-white/5 flex gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer relative group ${!n.is_read ? 'bg-primary-500/[0.03]' : 'opacity-60'}`}
                                                    >
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${n.notification_type === 'success' ? 'bg-green-500/10 text-green-500' :
                                                            n.notification_type === 'warning' ? 'bg-orange-500/10 text-orange-500' :
                                                                n.notification_type === 'danger' ? 'bg-red-500/10 text-red-500' :
                                                                    'bg-blue-500/10 text-blue-500'
                                                            }`}>
                                                            {n.notification_type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                                                n.notification_type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                                                                    n.notification_type === 'danger' ? <Shield className="w-5 h-5" /> :
                                                                        <Info className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <p className={`text-xs font-bold leading-tight ${!n.is_read ? 'text-white' : 'text-gray-400'}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className="text-[11px] text-gray-500 line-clamp-2">
                                                                {n.message}
                                                            </p>
                                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter pt-1">
                                                                {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        {!n.is_read && (
                                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-500 rounded-full"></div>
                                                        )}
                                                        <div className="absolute inset-y-0 right-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center space-y-4">
                                                    <Bell className="w-12 h-12 text-gray-700 mx-auto opacity-20" />
                                                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Sin notificaciones nuevas</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 bg-primary-500/5 text-center border-t border-white/5">
                                            <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors">
                                                Ver todo el historial <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

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
