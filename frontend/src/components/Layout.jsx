import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { hasAdminPanelAccess } from '../utils/authUtils';
import {
    LayoutDashboard,
    BookOpen,
    Trophy,
    User as UserCircleIcon,
    LogOut,
    Shield,
    Menu,
    X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNotificationStore } from '../store/notificationStore';
import LevelUpModal from './LevelUpModal';
import ModuleCompletionModal from './ModuleCompletionModal';
import BadgeAwardModal from './BadgeAwardModal';
import SoundControl from './SoundControl';
import ScrollToTop from './ScrollToTop';
import AnnouncementModal from './AnnouncementModal';
import NotificationBell from './NotificationBell';
import axios from 'axios';
import BadgesModal from './dashboard/BadgesModal';
import { getProfilePictureUrl } from '../utils/imageUtils';

const API_URL = import.meta.env.VITE_API_URL;

const NAV_ITEMS = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/modules', icon: BookOpen, label: 'Módulos' },
    { to: '/leaderboard', icon: Trophy, label: 'Ranking' },
    { to: '/profile', icon: UserCircleIcon, label: 'Perfil' },
];

export default function Layout() {
    const { user, logout, viewAsStudent, setViewAsStudent, verifyToken } = useAuthStore();
    const {
        pendingLevelUp, clearLevelUp,
        pendingModuleCompletion, clearModuleCompletion,
        pendingBadge, clearBadge,
        isBadgesModalOpen, setIsBadgesModalOpen,
        fetchNotifications
    } = useNotificationStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeAnnouncement, setActiveAnnouncement] = useState(null);

    const hasAdminAccess = hasAdminPanelAccess(user) && !viewAsStudent;

    // 1. Sincronización Global: Verificar sesión en cada cambio de ruta
    useEffect(() => {
        setIsMobileMenuOpen(false);
        verifyToken();
    }, [location.pathname, verifyToken]);

    // 2. Cargar notificaciones cuando el usuario está disponible y en cada cambio de ruta
    useEffect(() => {
        if (user?.id) {
            fetchNotifications();
        }
    }, [location.pathname, user?.id, fetchNotifications]);

    // 3. Sistema de Polling: Verificar notificaciones cada 60 segundos si la pestaña está activa
    useEffect(() => {
        if (!user?.id) return;

        const checkNewNotifications = () => {
            if (document.visibilityState === 'visible') {
                fetchNotifications();
            }
        };

        const intervalId = setInterval(checkNewNotifications, 60000);
        return () => clearInterval(intervalId);
    }, [user?.id, fetchNotifications]);

    // Buscar anuncios activos al cargar la plataforma
    useEffect(() => {
        const checkAnnouncements = async () => {
            if (user && !hasAdminAccess) { // Solo para estudiantes (o admin en modo estudiante)
                try {
                    const response = await axios.get(`${API_URL}/announcements/active`);
                    if (response.data.success && response.data.announcement) {
                        setActiveAnnouncement(response.data.announcement);
                    }
                } catch (error) {
                    console.error('Error checking announcements:', error);
                }
            }
        };

        checkAnnouncements();
    }, [user, hasAdminAccess]);

    const handleLogout = async () => {
        await logout();
        toast.success('Sesión cerrada correctamente');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] flex flex-col transition-colors duration-300">
            <ScrollToTop />

            {/* Admin Student View Banner */}
            {user?.role === 'admin' && viewAsStudent && (
                <div className="bg-secondary-600 text-white text-[10px] font-black uppercase py-1 text-center tracking-[0.3em] sticky top-0 z-[60] animate-pulse">
                    Modo Estudiante Activo - Vista Restringida
                </div>
            )}

            {/* Navbar */}
            <nav className="bg-[#582c19]/95 backdrop-blur-md border-b border-primary-500/10 sticky top-0 z-50 transition-colors duration-300">
                <div className="w-full px-4 sm:px-6 xl:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                                <img
                                    src="/images/logo-cgr-blanco.webp"
                                    alt="CGR Logo"
                                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] transition-all duration-300"
                                />
                            </div>
                            <div className="hidden lg:block">
                                <h1 className="text-[13px] xl:text-[15px] font-black bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent tracking-tighter leading-none">
                                    M <span className="text-secondary-500 font-black">IA</span>
                                </h1>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center lg:gap-1 bg-[#582c19] p-1 rounded-xl border border-white/5 shadow-2xl">
                            {NAV_ITEMS.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 xl:gap-2 px-2 xl:px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-[#e8dbbe] !text-[#582c19] font-bold shadow-[0_0_15px_rgba(232,219,190,0.3)]'
                                            : '!text-white/70 hover:!text-white hover:bg-white/5 border border-transparent'
                                        }`
                                    }
                                >
                                    <item.icon className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110`} />
                                    <span className="text-[10px] xl:text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                                </NavLink>
                            ))}
                            {hasAdminAccess && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        `flex items-center gap-1.5 xl:gap-2 px-2 xl:px-3 py-2 rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-secondary-500/20 !text-secondary-500 border border-secondary-500/20 shadow-[0_0_15px_rgba(229,123,60,0.1)]'
                                            : '!text-secondary-500 hover:!text-secondary-500 hover:bg-white/5 border border-transparent'
                                        }`
                                    }
                                >
                                    <Shield className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110`} />
                                    <span className="text-[10px] xl:text-[11px] font-black uppercase tracking-widest">Admin</span>
                                </NavLink>
                            )}
                        </div>

                        {/* User Actions Section */}
                        <div className="flex items-center gap-2 xl:gap-3">
                            {/* User Profile */}
                            <div className="hidden sm:flex items-center gap-2 xl:gap-3 px-2 xl:px-3 py-1 bg-transparent rounded-2xl border border-transparent transition-all duration-300">
                                <div className="relative flex-shrink-0">
                                    <div className="p-0.5 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-full">
                                        <img
                                            src={getProfilePictureUrl(user?.profilePicture, `${user?.firstName} ${user?.lastName}`)}
                                            alt={user?.firstName}
                                            className="w-7 h-7 xl:w-8 xl:h-8 rounded-full border-2 border-[#161b33] object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>

                                </div>
                                <div className="hidden lg:flex flex-col overflow-hidden min-w-0 flex-1 max-w-[15vw] xl:max-w-[20vw]">
                                    <p className="text-[10px] font-black !text-white uppercase tracking-tight truncate">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Shield className="w-2.5 h-2.5 text-secondary-500" />
                                            <p className="text-[8px] !text-white font-bold uppercase tracking-widest">{user?.level || 'Novato'}</p>
                                        </div>
                                        <div className="w-px h-2 bg-white/10"></div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="w-2.5 h-2.5 text-primary-400" />
                                            <p className="text-[8px] !text-white font-black uppercase tracking-widest">
                                                {user?.points ?? 0} <span className="text-white text-[7px]">PTS</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <NotificationBell />
                            <SoundControl />

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
                                className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-white/5 bg-[#582c19]/95 backdrop-blur-md">
                        <div className="px-4 py-4 space-y-2">
                            {NAV_ITEMS.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-[#e8dbbe] text-[#582c19] font-bold'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`
                                    }
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            ))}
                            {hasAdminAccess && (
                                <NavLink
                                    to="/admin"
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-secondary-500/20 text-secondary-500 border border-secondary-500/30'
                                            : 'text-white/70 hover:text-secondary-500 hover:bg-white/10'
                                        }`
                                    }
                                >
                                    <Shield className="w-5 h-5 text-secondary-500" />
                                    <span className="font-medium text-secondary-500">Administración</span>
                                </NavLink>
                            )}
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
            <main className="w-full px-1 sm:px-2 lg:px-6 py-2 md:py-6 flex-grow relative">
                <Outlet />
            </main>

            {/* Footer - Hidden in Quiz/Survey views to avoid overlap */}
            {!location.pathname.includes('/quiz/') && !location.pathname.includes('/survey/') && (
                <footer className="mt-auto border-t border-[#d6997a]/20 bg-[var(--bg-color)]/50 backdrop-blur-sm relative z-0">
                    <div className="w-full px-4 sm:px-6 lg:px-12 py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-4 opacity-95">
                                <img src="/images/logo-cgr-blanco.webp" alt="CGR Logo" className="h-8 object-contain" />
                                <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
                                <p className="text-[10px] font-bold text-[#d6997a] leading-tight uppercase tracking-wider">
                                    Contraloría General de la República | Costa Rica
                                </p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                                <p className="text-[10px] text-[#d6997a] font-bold uppercase tracking-widest">
                                    Version {import.meta.env.VITE_APP_VERSION}
                                </p>
                                {hasAdminPanelAccess(user) && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-[#582c19] rounded-full border border-white/5 shadow-lg mt-1">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">
                                            {!viewAsStudent ? 'Panel Administrador' : 'Vista Estudiante'}
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
                            </div>
                        </div>
                    </div>
                </footer>
            )}

            {/* Gamification Modals - Ordered by priority: Badge > Module > LevelUp */}
            <LevelUpModal
                isOpen={!!pendingLevelUp && !pendingModuleCompletion && !pendingBadge}
                onClose={clearLevelUp}
                levelData={pendingLevelUp}
            />
            <ModuleCompletionModal
                isOpen={!!pendingModuleCompletion && !pendingBadge}
                onClose={clearModuleCompletion}
                data={pendingModuleCompletion}
            />
            <BadgeAwardModal
                key={pendingBadge?.id || 'no-badge'}
                isOpen={!!pendingBadge}
                onClose={clearBadge}
                badge={pendingBadge}
            />
            <BadgesModal
                isOpen={isBadgesModalOpen}
                onClose={() => setIsBadgesModalOpen(false)}
                badges={user?.earnedBadges || []}
            />

            {/* System Announcement Modal */}
            {activeAnnouncement && (
                <AnnouncementModal
                    announcement={activeAnnouncement}
                    onClose={() => setActiveAnnouncement(null)}
                />
            )}
        </div>
    );
}
