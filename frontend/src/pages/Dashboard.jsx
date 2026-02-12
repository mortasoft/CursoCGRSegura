import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
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
    const { user, updateUser } = useAuthStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [modules, setModules] = useState([]);
    const [filterCompleted, setFilterCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(`${API_URL}/dashboard`);
            const dashboardStats = response.data.stats || null;
            setStats(dashboardStats);
            setModules(response.data.modules || []);

            // Sincronizar stats globales con el store de autenticación
            if (dashboardStats) {
                updateUser({
                    points: dashboardStats.points,
                    level: dashboardStats.level
                });
            }
        } catch (error) {
            console.warn('Usando datos de ejemplo (Backend no listo):', error.message);
            setStats({
                completedModules: 2,
                totalModules: 8,
                points: 350,
                level: 'Defensor',
                rank: 45,
                totalUsers: 700,
                completionPercentage: 25
            });
            setModules([
                { id: 1, title: 'Fundamentos de Seguridad', progress: 100, status: 'completed' },
                { id: 2, title: 'Protección de Datos', progress: 60, status: 'in_progress', next_lesson_id: 10 },
                { id: 3, title: 'IA y Ciberseguridad', progress: 0, status: 'not_started', next_lesson_id: 15 },
                { id: 4, title: 'Malware y Amenazas', progress: 0, status: 'not_started', next_lesson_id: 20 }
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
        <div className="space-y-2 md:space-y-3 animate-fade-in">
            {/* Banner Principal del Curso */}
            <div className="relative w-full h-24 md:h-36 rounded-[1.5rem] overflow-hidden bg-slate-800/20 border border-white/5 shadow-2xl">
                <img
                    src="/images/banner-principal-curso.png"
                    alt="Banner Principal del Curso"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback por si la imagen aún no existe en la carpeta public
                        e.target.src = 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1600&q=80';
                    }}
                />
                {/* Overlay sutil para mantener el estilo glassmorphism en los bordes */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2.5rem]"></div>
            </div>

            {/* Master Welcome Banner */}
            <div className="relative rounded-[1.5rem] overflow-hidden bg-slate-800/20 border border-white/5 shadow-2xl">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80"
                        alt="Dashboard Hero"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d1127] via-[#0d1127]/60 to-transparent"></div>
                </div>

                <div className="relative z-10 p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-2 text-center md:text-left">

                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">
                            ¡Hola de nuevo, <span className="text-primary-400">{user?.firstName}</span>!
                        </h1>


                    </div>

                    {/* Quick Stats Floating in Banner */}
                    <div className="hidden lg:flex gap-6">
                        <div className="glass-card p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center min-w-[120px]">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Puntos</p>
                            <p className="text-3xl font-black text-white">{stats?.points || 0}</p>
                        </div>
                        <div className="glass-card p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl text-center min-w-[120px]">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Nivel</p>
                            <p className="text-3xl font-black text-secondary-500">{user?.level || '1'}</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Left Column: Progress and Modules */}
                <div className="lg:col-span-3 space-y-3 md:space-y-4">
                    <div className="card bg-slate-800/30 p-4 md:p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-xl font-black text-white tracking-tight uppercase">Mi Ruta de Aprendizaje</h2>
                            </div>
                            <button
                                onClick={() => setFilterCompleted(!filterCompleted)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filterCompleted
                                    ? 'bg-green-500/20 border-green-500 text-green-500'
                                    : 'bg-slate-800 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                            >
                                {filterCompleted ? 'Ocultar' : 'Ver Completados'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(filterCompleted ? modules.filter(m => m.status === 'completed') : modules).length > 0 ? (
                                (filterCompleted ? modules.filter(m => m.status === 'completed') : modules).map((module) => (
                                    <div
                                        key={module.id}
                                        onClick={() => navigate(`/modules/${module.id}`)}
                                        className="group relative flex flex-col p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-primary-500/30 hover:bg-slate-900 transition-all duration-300 cursor-pointer"
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
                                        <div className="mt-auto space-y-4">
                                            <div className="space-y-2">
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

                                            {/* Action Button Integrated */}
                                            {module.status !== 'completed' && module.next_lesson_id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/lessons/${module.next_lesson_id}`);
                                                    }}
                                                    className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group/btn"
                                                >
                                                    Continuar <TrendingUp className="w-3.5 h-3.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                </button>
                                            )}
                                            {module.status === 'completed' && (
                                                <div className="w-full py-2.5 rounded-xl bg-slate-800/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] text-center border border-white/5">
                                                    Módulo Completado
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-slate-900/30 rounded-2xl border border-dashed border-white/10">
                                    <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-20" />
                                    <p className="text-gray-500 font-medium">
                                        {filterCompleted ? 'Aún no has completado ningún módulo.' : 'No hay módulos publicados disponibles.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Leaderboard Snippet and Rank */}
                <div className="space-y-8">
                    <div className="card bg-slate-800/50 p-6 flex flex-col items-center text-center relative overflow-hidden">
                        {/* Decorative background for the card */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="mb-6 relative">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-700 p-1 relative z-10">
                                <img
                                    src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=384A99&color=fff`}
                                    alt="Avatar"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-2 right-0 bg-secondary-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black border-4 border-slate-800 shadow-xl z-20">
                                #{stats?.rank}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Posición Global</h3>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">De {stats?.totalUsers} Funcionarios</p>
                        </div>

                        {/* Ranking Details */}
                        <div className="w-full mt-8 grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Institucional</p>
                                <p className="text-xl font-black text-secondary-500">#{stats?.rank}</p>
                                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">
                                    Top {Math.max(1, Math.round((stats?.rank / stats?.totalUsers) * 100))}%
                                </p>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">En su Área</p>
                                <p className="text-xl font-black text-primary-400">#{stats?.departmentRank || '-'}</p>
                                <p className="text-[8px] font-bold text-gray-600 uppercase mt-1">
                                    {stats?.totalInDepartment > 0 ? `De ${stats.totalInDepartment} pers.` : 'No asignado'}
                                </p>
                            </div>
                        </div>

                        <Link to="/leaderboard" className="mt-8 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                            Ver Tabla Completa <TrendingUp className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
