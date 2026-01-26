import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Trophy,
    Target,
    TrendingUp,
    Clock,
    Award,
    CheckCircle,
    AlertCircle,
    Shield
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Dashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [recentModules, setRecentModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // TODO: Implementar endpoint /api/dashboard
            const response = await axios.get(`${API_URL}/dashboard`);
            if (!response.data.stats) {
                throw new Error('Datos de dashboard no disponibles');
            }
            setStats(response.data.stats || null);
            setRecentModules(response.data.recentModules || []);
        } catch (error) {
            console.warn('Usando datos de ejemplo (Backend no listo):', error.message);
            // Datos de ejemplo mientras se implementa el backend
            setStats({
                completedModules: 2,
                totalModules: 8,
                points: 350,
                level: 'Defensor',
                rank: 45,
                totalUsers: 700,
                completionPercentage: 25
            });
            setRecentModules([
                { id: 1, title: 'Fundamentos de Seguridad', progress: 100, status: 'completed' },
                { id: 2, title: 'Protección de Datos', progress: 60, status: 'in_progress' },
                { id: 3, title: 'IA y Ciberseguridad', progress: 0, status: 'not_started' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Cargando dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header section with Stats Integrated */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-800/40 border border-white/5 p-8 md:p-12 shadow-2xl">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-500/10 rounded-full blur-[60px] -ml-24 -mb-24"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left space-y-4">

                        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tighter">
                            ¡Hola, <span className="text-secondary-500">{user?.firstName}</span>!
                        </h1>
                        <p className="text-gray-400 max-w-md text-lg font-medium leading-relaxed">
                            Has completado el <span className="text-white font-bold">{stats?.completionPercentage}%</span> de tu formación obligatoria para 2026.
                        </p>
                    </div>

                    <div className="flex gap-6">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-xl group hover:border-secondary-500/50 transition-colors">
                                <Award className="w-10 h-10 text-secondary-500 transition-transform group-hover:scale-110" />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nivel {stats?.level}</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-xl group hover:border-primary-500/50 transition-colors">
                                <Trophy className="w-10 h-10 text-primary-400 transition-transform group-hover:scale-110" />
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{stats?.points} Puntos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Progress and Modules */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card bg-slate-800/30 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Módulos Sugeridos</h2>
                            </div>
                            <Link to="/modules" className="text-xs font-black text-primary-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2 group">
                                Ver Catálogo <TrendingUp className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recentModules.length > 0 ? (
                                recentModules.map((module) => (
                                    <Link
                                        key={module.id}
                                        to={`/modules/${module.id}`}
                                        className="group relative flex flex-col p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-primary-500/30 hover:bg-slate-900 transition-all duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors leading-tight">
                                                {module.title}
                                            </h3>
                                            {module.status === 'completed' ? (
                                                <div className="p-1.5 bg-green-500/20 rounded-full text-green-500">
                                                    <CheckCircle className="w-4 h-4" />
                                                </div>
                                            ) : (
                                                <div className="p-1.5 bg-secondary-500/20 rounded-full text-secondary-500 animate-pulse">
                                                    <AlertCircle className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-auto space-y-3">
                                            <div className="flex justify-between items-end text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                                <span>Progreso</span>
                                                <span className="text-white">{module.progress}%</span>
                                            </div>
                                            <div className="progress-bar h-1.5">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${module.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-slate-900/30 rounded-2xl border border-dashed border-white/10">
                                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-500 font-medium">No hay módulos publicados disponibles en este momento.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weekly Goal or Community Card */}
                    <div className="card bg-gradient-to-r from-secondary-600/20 to-primary-600/20 border-white/10 p-8 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 flex-shrink-0 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-2xl relative">
                            <Target className="w-12 h-12 text-secondary-500" />
                            <div className="absolute inset-0 rounded-full border-2 border-secondary-500 border-t-transparent animate-spin-slow"></div>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h4 className="text-xl font-black text-white tracking-tight uppercase">Meta Semanal</h4>
                            <p className="text-gray-400 font-medium">Completa el Módulo 2 para mantenerte en el Top 50 de la institución.</p>
                        </div>
                        <button className="btn-secondary px-8 py-3 w-full md:w-auto">
                            Completar Ahora
                        </button>
                    </div>
                </div>

                {/* Right Column: Leaderboard Snippet and Rank */}
                <div className="space-y-8">
                    <div className="card bg-slate-800/50 p-6 flex flex-col items-center text-center">
                        <div className="mb-6 relative">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-700 p-1">
                                <img
                                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=384A99&color=fff`}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 right-0 bg-secondary-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-slate-800 shadow-xl">
                                #{stats?.rank}
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Posición Global</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">de {stats?.totalUsers} Funcionarios</p>

                        <div className="w-full mt-8 space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1 px-1">
                                <span>Ranking Institucional</span>
                                <span className="text-secondary-500">Top 10%</span>
                            </div>
                            <div className="progress-bar h-2">
                                <div className="progress-fill bg-secondary-500" style={{ width: '90%' }}></div>
                            </div>
                        </div>

                        <Link to="/leaderboard" className="mt-8 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-widest transition-all">
                            Ver Tabla Completa
                        </Link>
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/profile" className="card bg-slate-800/30 p-6 flex flex-col items-center gap-3 group hover:border-primary-500/40 transition-all">
                            <Award className="w-8 h-8 text-secondary-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Insignias</span>
                        </Link>
                        <Link to="/certificates" className="card bg-slate-800/30 p-6 flex flex-col items-center gap-3 group hover:border-primary-500/40 transition-all">
                            <CheckCircle className="w-8 h-8 text-primary-400 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Diplomas</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
