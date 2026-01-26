import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    Trophy,
    Medal,
    Crown,
    Users,
    Building2,
    TrendingUp,
    Search,
    ChevronRight,
    Star,
    ShieldCheck,
    Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Leaderboard() {
    const { token, user: loggedUser } = useAuthStore();
    const [leaderboard, setLeaderboard] = useState([]);
    const [deptRanking, setDeptRanking] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('global'); // 'global' or 'department'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/gamification/leaderboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setLeaderboard(response.data.leaderboard);
                setDeptRanking(response.data.departmentRanking);
                setCurrentUser(response.data.currentUser);
            }
        } catch (error) {
            toast.error('Error al cargar el ranking');
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = leaderboard.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Calculando posiciones institucionales...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header / Hero Section */}
            <div className="relative rounded-[3rem] overflow-hidden bg-slate-800/40 border border-white/5 shadow-2xl p-10 md:p-16">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-500/10 to-transparent"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-500 text-[10px] font-black uppercase tracking-widest">
                            Temporada 2026 • Auditoría Digital
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                            Cuadro de <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent italic">Honor</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl">
                            Reconocimiento institucional a la excelencia en ciberseguridad. Los mejores defensores de la integridad digital de la República.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 bg-slate-900 rounded-[2rem] border-4 border-white/5 flex flex-col items-center justify-center shadow-2xl relative">
                            <Crown className="w-8 h-8 text-secondary-500 absolute -top-4 -rotate-12 drop-shadow-[0_0_10px_rgba(229,123,60,0.5)]" />
                            <span className="text-4xl font-black text-white">#{currentUser?.rank_position || '--'}</span>
                            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Tu Rango</span>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black text-primary-400 uppercase tracking-tight">{currentUser?.points || 0} pts</p>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">Nivel {currentUser?.level}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls & Search */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setView('global')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'global' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => setView('department')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === 'department' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        Departamentos
                    </button>
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar funcionario o unidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-800/20 border border-white/5 rounded-2xl text-white font-medium placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Ranking Content */}
            {view === 'global' ? (
                <div className="space-y-4">
                    {/* Top 3 Special View (Visible only if not searching) */}
                    {!searchTerm && filteredParticipants.length >= 3 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {/* 2nd Place */}
                            <div className="order-2 md:order-1 flex flex-col items-center justify-end h-full">
                                <div className="card w-full p-8 bg-slate-800/30 border-blue-500/20 hover:border-blue-500/40 relative flex flex-col items-center text-center transition-all group">
                                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 overflow-hidden mb-4 group-hover:scale-105 transition-transform">
                                        <img src={filteredParticipants[1].profile_picture || `https://ui-avatars.com/api/?name=${filteredParticipants[1].first_name}+${filteredParticipants[1].last_name}&background=3b82f6&color=fff`} className="w-full h-full object-cover" />
                                    </div>
                                    <Medal className="w-8 h-8 text-slate-400 absolute -top-4" />
                                    <h3 className="font-black text-white uppercase text-sm">{filteredParticipants[1].first_name} {filteredParticipants[1].last_name}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{filteredParticipants[1].department}</p>
                                    <div className="mt-4 px-4 py-1 bg-blue-500/20 rounded-full text-blue-400 text-xs font-black">{filteredParticipants[1].points} PTS</div>
                                </div>
                            </div>
                            {/* 1st Place */}
                            <div className="order-1 md:order-2 flex flex-col items-center">
                                <div className="card w-full p-10 bg-slate-800/40 border-secondary-500/30 hover:border-secondary-500/50 relative flex flex-col items-center text-center transition-all shadow-2xl group scale-110">
                                    <div className="w-24 h-24 rounded-[2rem] bg-secondary-500/10 border-4 border-secondary-500/30 overflow-hidden mb-4 group-hover:scale-110 transition-transform">
                                        <img src={filteredParticipants[0].profile_picture || `https://ui-avatars.com/api/?name=${filteredParticipants[0].first_name}+${filteredParticipants[0].last_name}&background=e11d48&color=fff`} className="w-full h-full object-cover" />
                                    </div>
                                    <Crown className="w-12 h-12 text-secondary-500 absolute -top-8 rotate-12 drop-shadow-[0_0_15px_rgba(229,123,60,0.6)]" />
                                    <h3 className="font-black text-white uppercase text-lg">{filteredParticipants[0].first_name} {filteredParticipants[0].last_name}</h3>
                                    <p className="text-[12px] text-gray-500 font-bold uppercase">{filteredParticipants[0].department}</p>
                                    <div className="mt-6 px-6 py-2 bg-secondary-500/20 rounded-full text-secondary-500 text-sm font-black ring-2 ring-secondary-500/20">{filteredParticipants[0].points} PTS</div>
                                </div>
                            </div>
                            {/* 3rd Place */}
                            <div className="order-3 md:order-3 flex flex-col items-center justify-end h-full">
                                <div className="card w-full p-8 bg-slate-800/30 border-orange-700/20 hover:border-orange-700/40 relative flex flex-col items-center text-center transition-all group">
                                    <div className="w-20 h-20 rounded-3xl bg-orange-700/10 border-2 border-orange-700/30 overflow-hidden mb-4 group-hover:scale-105 transition-transform">
                                        <img src={filteredParticipants[2].profile_picture || `https://ui-avatars.com/api/?name=${filteredParticipants[2].first_name}+${filteredParticipants[2].last_name}&background=c2410c&color=fff`} className="w-full h-full object-cover" />
                                    </div>
                                    <Medal className="w-8 h-8 text-orange-700 absolute -top-4" />
                                    <h3 className="font-black text-white uppercase text-sm">{filteredParticipants[2].first_name} {filteredParticipants[2].last_name}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{filteredParticipants[2].department}</p>
                                    <div className="mt-4 px-4 py-1 bg-orange-700/20 rounded-full text-orange-700 text-xs font-black">{filteredParticipants[2].points} PTS</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Classic List View */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                            <div className="col-span-1 text-center">Pos</div>
                            <div className="col-span-6 md:col-span-5">Funcionario</div>
                            <div className="hidden md:block col-span-3">Departamento</div>
                            <div className="col-span-5 md:col-span-3 text-right">Puntaje</div>
                        </div>
                        {filteredParticipants.map((p, index) => {
                            const isMe = p.id === loggedUser?.id;
                            const pos = searchTerm ? index + 1 : index + 1;
                            if (!searchTerm && index < 3) return null; // Skip top 3 in the main list if not searching

                            return (
                                <div key={p.id} className={`grid grid-cols-12 items-center px-8 py-5 rounded-3xl border transition-all ${isMe ? 'bg-primary-500/10 border-primary-500/30 shadow-[0_5px_20px_rgba(56,74,153,0.1)]' : 'bg-slate-800/20 border-white/5 hover:border-white/10 hover:bg-slate-800/30'
                                    }`}>
                                    <div className="col-span-1 text-center font-black text-lg text-gray-500">
                                        {pos}
                                    </div>
                                    <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/5 flex-shrink-0">
                                            <img src={p.profile_picture || `https://ui-avatars.com/api/?name=${p.first_name}+${p.last_name}&background=384A99&color=fff`} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase text-sm leading-none ${isMe ? 'text-primary-400' : 'text-white'}`}>
                                                {p.first_name} {p.last_name}
                                                {isMe && <span className="ml-2 text-[8px] bg-primary-500 text-white px-1.5 py-0.5 rounded">TÚ</span>}
                                            </p>
                                            <p className="text-[10px] text-gray-500 font-bold md:hidden mt-1">{p.department}</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block col-span-3 text-xs font-bold text-gray-400 uppercase">
                                        {p.department}
                                    </div>
                                    <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-3">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-white">{p.points}</p>
                                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{p.level}</p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMe ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-gray-700'}`}>
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deptRanking.map((dept, index) => (
                        <div key={index} className="card p-8 group hover:border-primary-500/30 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-primary-500/10 rounded-2xl text-primary-400 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-white tracking-tight">{dept.total_points}</p>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Puntos Totales</p>
                                </div>
                            </div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 line-clamp-1">{dept.department}</h3>
                            <div className="flex items-center gap-2 mt-auto">
                                <Users className="w-4 h-4 text-gray-600" />
                                <p className="text-xs font-bold text-gray-500">{dept.staff_count} Funcionarios</p>
                            </div>
                            {/* Small progress bar for visual weight */}
                            <div className="mt-6 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                    style={{ width: `${(dept.total_points / deptRanking[0].total_points) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Motivation Banner */}
            <div className="card bg-gradient-to-br from-primary-600 to-secondary-600 p-12 text-center text-white space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <Award className="w-16 h-16 mx-auto opacity-20 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 space-y-2">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">¿Listo para ascender?</h2>
                    <p className="max-w-xl mx-auto font-medium opacity-80">
                        Cada lección terminada y cada evaluación aprobada te acerca más a la cima del ranking institucional.
                    </p>
                </div>
                <button
                    onClick={() => setView('global')}
                    className="relative z-10 px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl"
                >
                    Continuar Capacitación
                </button>
            </div>
        </div>
    );
}
