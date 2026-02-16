import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    User as UserIcon,
    Mail,
    Briefcase,
    Building2,
    Trophy,
    Award,
    Calendar,
    ChevronRight,
    Settings,
    Shield,
    History as HistoryIcon,
    FileText,
    Star,
    Percent,
    Lock,
    PlayCircle,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { token, user: authUser } = useAuthStore();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const activitiesPerPage = 10;

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            // Protección Frontend: solo admin puede ver perfiles de otros
            if (userId && authUser?.role !== 'admin') {
                toast.error('No tienes permisos para ver el historial de otros usuarios');
                navigate('/profile');
                return;
            }

            setLoading(true);
            const endpoint = userId ? `${API_URL}/users/${userId}/full-profile` : `${API_URL}/users/profile`;
            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProfileData(response.data);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Error al cargar el perfil';
            toast.error(errorMsg);
            if (error.response?.status === 403 || error.response?.status === 404) {
                navigate('/dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Sincronizando identidad digital...</p>
            </div>
        );
    }

    if (!profileData) return null;

    const { user, stats, progress, activities, certificates } = profileData;
    let badges = [];
    try {
        badges = typeof stats.badges === 'string' ? JSON.parse(stats.badges || '[]') : (stats.badges || []);
    } catch (e) {
        badges = [];
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Admin Back Button */}
            {userId && (
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver a Gestión de Usuarios
                </button>
            )}

            {/* Upper Section: Profile Hero */}
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-800/40 border border-white/5 shadow-2xl">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-secondary-500/10 to-transparent"></div>
                <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-primary-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                    {/* Portrait */}
                    <div className="relative">
                        <div className="w-40 h-40 rounded-[2.5rem] p-1 bg-gradient-to-tr from-primary-500 via-secondary-500 to-accent-500 shadow-2xl overflow-hidden animate-pulse-slow">
                            <div className="w-full h-full bg-slate-900 rounded-[2.3rem] flex items-center justify-center overflow-hidden">
                                <img
                                    src={user.profile_picture || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=384A99&color=fff&size=200`}
                                    alt={user.first_name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-secondary-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl border-4 border-slate-900">
                            <Shield className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                                {user.first_name} {user.last_name}
                            </h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400 text-sm font-medium">
                                <span className="flex items-center gap-1.5" title="Correo Institucional"><Mail className="w-4 h-4 text-primary-400" /> {user.email}</span>
                                <span className="mx-1 text-gray-700 hidden md:block">•</span>
                                <span className="flex items-center gap-1.5" title="Unidad Administrativa">
                                    <Building2 className="w-4 h-4 text-primary-400" />
                                    <span className="text-gray-500 mr-1">Área:</span> {user.department || 'Sin asignar'}
                                </span>
                                <span className="mx-1 text-gray-700 hidden md:block">•</span>
                                <span className="flex items-center gap-1.5" title="Cargo Institucional">
                                    <Briefcase className="w-4 h-4 text-primary-400" />
                                    <span className="text-gray-500 mr-1">Puesto:</span> {user.position || 'Sin asignar'}
                                </span>
                            </div>
                        </div>

                        {/* Level & Points Bar - Refactored to match reference */}
                        <div className="space-y-4 pt-4 w-full">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Rango Actual</span>
                                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
                                        {stats.level}
                                    </h2>
                                </div>
                                <div className="flex flex-col items-end gap-1 pb-1">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Siguiente Rango</span>
                                    <span className="text-2xl font-black text-secondary-500 uppercase italic leading-none">
                                        {stats.next_level_name}
                                    </span>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="h-2.5 bg-slate-900/80 rounded-full border border-white/5 overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-secondary-600 via-secondary-400 to-secondary-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(229,123,60,0.4)]"
                                        style={{ width: `${stats.level_progress_percentage || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center px-1">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <span className="text-white text-sm">{stats.points}</span> PUNTOS TOTALES
                                    </span>
                                </div>

                                {stats.next_level_min_points ? (
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            PRÓXIMO NIVEL: <span className="text-secondary-400 text-sm">{stats.next_level_min_points}</span> PUNTOS
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest animate-pulse">
                                            LEYENDA MÁXIMA ALCANZADA
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                        <Percent className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white leading-none">{progress.percentage}%</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Avance Global</p>
                    </div>
                </div>
                <div className="card p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white leading-none">#{stats.rank || '--'}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Ranking Institucional</p>
                        <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">De {stats.totalUsers || '--'} funcionarios</p>
                    </div>
                </div>
                <div className="card p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary-500/10 border border-secondary-500/20 flex items-center justify-center text-secondary-500">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white leading-none">#{stats.departmentRank || '--'}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Ranking en su Área</p>
                        <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">{user.department || 'Área no asignada'}</p>
                    </div>
                </div>
                <div className="card p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white leading-none">{stats.badges?.length || 0}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Insignias</p>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Activities and More */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Activities */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <HistoryIcon className="w-6 h-6 text-primary-400" />
                        Historial de Actividad
                    </h2>

                    <div className="space-y-2">
                        {activities.length > 0 ? (
                            <>
                                {activities.slice((currentPage - 1) * activitiesPerPage, currentPage * activitiesPerPage).map((activity, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            const refId = activity.reference_id;
                                            if (!refId) return;
                                            if (activity.type === 'lesson_completed') navigate(`/lessons/${refId}`);
                                            if (activity.type === 'quiz_passed') navigate(`/quizzes/${refId}`);
                                            if (activity.type === 'module_completed') navigate(`/modules/${refId}`);
                                        }}
                                        className={`group p-3 rounded-[1.2rem] transition-all flex items-center gap-4 
                                            ${activity.type === 'module_completed'
                                                ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                                : 'bg-slate-800/20 border-white/5'} 
                                            border ${activity.reference_id ? 'cursor-pointer hover:bg-slate-800/40 hover:border-primary-500/30' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${activity.type === 'lesson_completed' ? 'bg-blue-500/10 text-blue-400' :
                                            activity.type === 'quiz_passed' ? 'bg-orange-500/10 text-orange-400' :
                                                activity.type === 'phishing_reported' ? 'bg-green-500/10 text-green-400' :
                                                    activity.type === 'module_completed' ? 'bg-amber-500/20 text-amber-500' :
                                                        'bg-purple-500/10 text-purple-400'
                                            }`}>
                                            {activity.type === 'lesson_completed' ? <PlayCircle className="w-5 h-5" /> :
                                                activity.type === 'quiz_passed' ? <Trophy className="w-5 h-5" /> :
                                                    activity.type === 'phishing_reported' ? <Shield className="w-5 h-5" /> :
                                                        <Star className="w-5 h-5" />}
                                        </div>

                                        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 px-1.5 py-0.5 bg-white/5 rounded-md border border-white/5">
                                                        {activity.type === 'lesson_completed' ? 'LECCIÓN' :
                                                            activity.type === 'quiz_passed' ? 'EXAMEN' :
                                                                activity.type === 'module_completed' ? 'MÓDULO' :
                                                                    activity.type === 'phishing_reported' ? 'PHISHING' :
                                                                        'ACTIVIDAD'}
                                                    </span>
                                                    {activity.module_id && (
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-primary-500/70">
                                                            Módulo {activity.module_id}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-white font-bold text-sm tracking-tight truncate max-w-[250px] md:max-w-md">
                                                    {activity.type === 'module_completed' ? `¡Completaste el módulo: ${activity.reference_title}!` :
                                                        activity.type === 'lesson_completed' ? `¡Completaste la lección: ${activity.reference_title}!` :
                                                            activity.type === 'quiz_passed' ? `¡Aprobaste la evaluación: ${activity.reference_title}!` :
                                                                activity.reference_title}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="text-right flex flex-col items-end">
                                                    <span className={`text-[10px] font-black italic tracking-tighter ${activity.type === 'module_completed' ? 'text-amber-500' : 'text-primary-400'}`}>
                                                        +{activity.points_earned || 0} Puntos
                                                    </span>
                                                    <p className="text-[9px] text-gray-500 font-bold flex items-center gap-1.5 mt-0.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(activity.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">
                                                        {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-800 group-hover:text-primary-400 transition-colors hidden md:block" />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination Controls */}
                                {activities.length > activitiesPerPage && (
                                    <div className="flex items-center justify-center gap-2 pt-4">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-xl bg-slate-800/40 text-gray-400 text-xs font-black uppercase tracking-widest disabled:opacity-20 hover:bg-slate-800 transition-colors border border-white/5"
                                        >
                                            Anterior
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {[...Array(Math.ceil(activities.length / activitiesPerPage))].map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all border ${currentPage === i + 1
                                                        ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                                        : 'bg-slate-800/40 border-white/5 text-gray-500 hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(activities.length / activitiesPerPage)))}
                                            disabled={currentPage === Math.ceil(activities.length / activitiesPerPage)}
                                            className="px-4 py-2 rounded-xl bg-slate-800/40 text-gray-400 text-xs font-black uppercase tracking-widest disabled:opacity-20 hover:bg-slate-800 transition-colors border border-white/5"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-20 text-center bg-slate-800/10 rounded-3xl border border-dashed border-white/5">
                                <HistoryIcon className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-10" />
                                <h4 className="text-white font-bold opacity-30">Tu historial está vacío</h4>
                                <p className="text-gray-600 text-[11px] font-medium uppercase tracking-widest mt-1">Comienza tu capacitación para ganar puntos</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Certificates / Achievements Sidebar */}
                <div className="space-y-10">
                    {/* Certificates */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Certificaciones</h3>
                        {certificates.length > 0 ? (
                            <div className="space-y-3">
                                {certificates.map((cert) => (
                                    <div
                                        key={cert.id}
                                        className="p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-secondary-500/30 transition-all cursor-pointer group"
                                        onClick={() => navigate(`/certificates/module/${cert.module_id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-secondary-500/20 rounded-lg text-secondary-500">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-xs uppercase tracking-tight">{cert.module_title}</p>
                                                <p className="text-[10px] text-gray-500 font-medium">{new Date(cert.issued_at).toLocaleDateString()}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-secondary-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 rounded-3xl bg-slate-800/10 border border-dashed border-white/5 text-center">
                                <Award className="w-10 h-10 text-gray-700 mx-auto mb-3 opacity-20" />
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Completa módulos para obtener títulos oficiales</p>
                            </div>
                        )}
                    </div>

                    {/* Insignias / Badges */}
                    <div className="space-y-6 pt-4">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Insignias Obtenidas</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Tu colección de logros y reconocimientos</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-1 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[9px] font-black text-primary-400 uppercase tracking-widest">
                                    {stats.badges?.length || 0} / 24
                                </span>

                            </div>
                        </div>

                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                            {Array.isArray(stats.badges) && stats.badges.map((badge, i) => (
                                <div key={badge.id || i} className="group relative flex flex-col gap-3">
                                    <div className="aspect-square rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center relative cursor-help shadow-xl transition-all duration-500 hover:border-primary-500/40 hover:shadow-primary-500/10 hover:-translate-y-1">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <img
                                            src={`/images/badges/${badge.image_url || 'bienvenida-seguridad.svg'}`}
                                            alt={badge.name}
                                            className="w-full h-full object-contain p-3 transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_0_15px_rgba(56,74,153,0.3)]"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/shield.svg';
                                            }}
                                        />
                                    </div>

                                    {/* Tooltip moved outside overflow-hidden container */}
                                    <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 mb-3 px-4 py-3 bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 w-56 z-50 pointer-events-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-90 group-hover:scale-100 origin-bottom">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                                <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse"></div>
                                                <p className="text-[10px] font-black text-secondary-500 uppercase tracking-[0.2em]">{badge.name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">¿Por qué la ganaste?</p>
                                                <p className="text-[10px] text-gray-300 font-medium leading-relaxed italic">"{badge.description}"</p>
                                            </div>
                                        </div>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
                                    </div>

                                    <div className="text-center space-y-1">
                                        <p className="text-[10px] font-black text-white uppercase leading-[1.1] px-1 group-hover:text-primary-400 transition-colors">
                                            {badge.name}
                                        </p>
                                        <p className="text-[8px] text-primary-500/60 font-black uppercase tracking-tighter">
                                            {new Date(badge.earned_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {/* Placeholder for locked badges */}
                            {[...Array(Math.max(0, 8 - (stats.badges?.length || 0)))].map((_, i) => (
                                <div key={`locked-${i}`} className="flex flex-col gap-3 opacity-20 grayscale transition-opacity hover:opacity-30">
                                    <div className="aspect-square rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-center relative">
                                        <Shield className="w-8 h-8 text-slate-800" />
                                        <Lock className="w-4 h-4 absolute top-2 right-2 text-slate-800" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Bloqueada</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
