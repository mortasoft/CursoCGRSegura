import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    PlayCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Profile() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setProfileData(response.data);
            }
        } catch (error) {
            toast.error('Error al cargar el perfil');
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
    const badges = JSON.parse(stats.badges || '[]');

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
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
                                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-primary-400" /> {user.email}</span>
                                <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-primary-400" /> {user.department || 'CGR'}</span>
                                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-primary-400" /> {user.position || 'Funcionario'}</span>
                            </div>
                        </div>

                        {/* Level & Points Bar */}
                        <div className="max-w-md space-y-3 pt-4">
                            <div className="flex justify-between items-end px-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Rango Actual</p>
                                    <p className="text-xl font-black text-secondary-500 uppercase">{stats.level}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Puntos Totales</p>
                                    <p className="text-xl font-black text-white">{stats.points} <span className="text-[10px] text-gray-500 uppercase">pts</span></p>
                                </div>
                            </div>
                            <div className="h-4 bg-slate-900 rounded-full border border-white/5 overflow-hidden p-1 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest">Faltan 150 pts para el siguiente nivel</p>
                        </div>
                    </div>

                    {/* Settings Button */}
                    <button className="p-3 bg-white/5 border border-white/5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all self-start hidden md:block">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Middle Section: Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <div className="w-12 h-12 rounded-xl bg-secondary-500/10 border border-secondary-500/20 flex items-center justify-center text-secondary-500">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white leading-none">#{stats.rank_position || '---'}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Ranking</p>
                    </div>
                </div>
                <div className="card p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                        <Award className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white leading-none">{badges.length}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Insignias</p>
                    </div>
                </div>
                <div className="card p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-500">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white leading-none">2026</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Año de Gestión</p>
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

                    <div className="space-y-4">
                        {activities.length > 0 ? (
                            activities.map((activity, index) => (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (activity.type === 'lesson_completed') navigate(`/lessons/${activity.reference_id}`);
                                        if (activity.type === 'quiz_passed') navigate(`/quizzes/${activity.reference_id}`);
                                        if (activity.type === 'module_completed') navigate(`/modules/${activity.reference_id}`);
                                    }}
                                    className={`group p-5 rounded-2xl bg-slate-800/20 border border-white/5 hover:border-primary-500/30 transition-all flex items-center gap-5 ${activity.reference_id ? 'cursor-pointer hover:bg-slate-800/40' : ''}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${activity.type === 'lesson_completed' ? 'bg-blue-500/10 text-blue-400' :
                                        activity.type === 'quiz_passed' ? 'bg-orange-500/10 text-orange-400' :
                                            activity.type === 'phishing_reported' ? 'bg-green-500/10 text-green-400' :
                                                'bg-purple-500/10 text-purple-400'
                                        }`}>
                                        {activity.type === 'lesson_completed' ? <PlayCircle className="w-6 h-6" /> :
                                            activity.type === 'quiz_passed' ? <Trophy className="w-6 h-6" /> :
                                                activity.type === 'phishing_reported' ? <Shield className="w-6 h-6" /> :
                                                    <Star className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 px-2 py-0.5 bg-white/5 rounded-md">
                                                {activity.type.replace('_', ' ')}
                                            </span>
                                            {activity.module_id && (
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-500/70">
                                                    Módulo {activity.module_id}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-white font-bold text-sm tracking-tight leading-tight">
                                            {activity.type === 'lesson_completed' ? 'Finalizaste la lección:' :
                                                activity.type === 'quiz_passed' ? 'Aprobaste la evaluación:' :
                                                    activity.type === 'phishing_reported' ? 'Reportaste una simulación:' :
                                                        'Completaste:'} {activity.reference_title}
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-bold mt-1.5 flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(activity.created_at).toLocaleDateString()} • {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 justify-end">
                                            <span className="text-lg font-black text-secondary-500">+{activity.points}</span>
                                            <Star className="w-3 h-3 text-secondary-500 fill-secondary-500" />
                                        </div>
                                        <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Experiencia</p>
                                    </div>
                                </div>
                            ))
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
                                    <div key={cert.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 hover:border-secondary-500/30 transition-all cursor-pointer group">
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
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Insignias Obtenidas</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {/* Simulating some locked badges if empty */}
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                                const isUnlocked = i <= badges.length;
                                return (
                                    <div key={i} className="aspect-square rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center group relative cursor-help">
                                        <Shield className={`w-6 h-6 ${isUnlocked ? 'text-secondary-500' : 'text-gray-800'}`} />
                                        {!isUnlocked && <Lock className="w-3 h-3 absolute top-1 right-1 text-gray-800" />}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-[8px] text-white font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                            {isUnlocked ? `Medalla #${i}` : 'Bloqueado'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
