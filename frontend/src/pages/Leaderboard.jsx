import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    Trophy,
    Medal,
    Crown,
    Users,
    Building2,
    Search,
    ChevronRight,
    Lock,
    ShieldCheck,
    Star
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Leaderboard() {
    const { token, user: loggedUser } = useAuthStore();
    const [institutionalLeaderboard, setInstitutionalLeaderboard] = useState([]);
    const [departmentLeaderboard, setDepartmentLeaderboard] = useState([]);
    const [deptRanking, setDeptRanking] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('global'); // 'global', 'area', or 'strategic'
    const [searchTerm, setSearchTerm] = useState('');
    const [scope, setScope] = useState('department');

    const isAdmin = loggedUser?.role === 'admin';

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
                setInstitutionalLeaderboard(response.data.institutionalLeaderboard);
                setDepartmentLeaderboard(response.data.departmentLeaderboard);
                setDeptRanking(response.data.departmentRanking);
                setCurrentUser(response.data.currentUser);
                setScope(response.data.scope);
            }
        } catch (error) {
            toast.error('Error al cargar el ranking');
        } finally {
            setLoading(false);
        }
    };

    const filteredParticipants = (view === 'global' ? institutionalLeaderboard : departmentLeaderboard).filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDepts = deptRanking.filter(dept =>
        dept.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.top_performer?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                            <span className="bg-gradient-to-r from-primary-400 to-secondary-500 bg-clip-text text-transparent italic">Ranking</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl">
                            {isAdmin
                                ? "Panel de control de excelencia institucional. Supervise el desempeño por áreas y funcionarios."
                                : `Progreso de ciberseguridad para ${currentUser?.department || 'su unidad'}.`}
                        </p>
                    </div>

                    <div className="flex gap-6">
                        {/* Institutional Rank (Fixed info card) */}
                        <div className="w-32 h-32 bg-slate-900/60 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center shadow-xl relative group">
                            <Trophy className="w-6 h-6 text-primary-400 absolute -top-3 opacity-50" />
                            <span className="text-4xl font-black text-white">#{currentUser?.globalRank || '--'}</span>
                            <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase text-center px-4">Rango CGR</span>
                        </div>

                        {/* Dept Rank (Focus of the list) */}
                        <div className="w-32 h-32 bg-slate-900 rounded-[2rem] border-4 border-secondary-500/30 flex flex-col items-center justify-center shadow-2xl relative">
                            <Crown className="w-8 h-8 text-secondary-500 absolute -top-4 -rotate-12 drop-shadow-[0_0_10px_rgba(229,123,60,0.5)]" />
                            <span className="text-4xl font-black text-white">#{currentUser?.deptRank || '--'}</span>
                            <span className="text-[9px] font-bold text-secondary-500 tracking-widest uppercase text-center px-4">Rango Área</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Control */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setView('global')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'global' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Ranking Institucional
                    </button>
                    <button
                        onClick={() => setView('area')}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'area' ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        Ranking de mi Área
                    </button>
                    {isAdmin && (
                        <button
                            onClick={() => setView('strategic')}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === 'strategic' ? 'bg-secondary-500 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                        >
                            Comparativa por Áreas
                        </button>
                    )}
                </div>

                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                    <input
                        type="text"
                        placeholder={view === 'area' && isAdmin ? "Buscar área o líder..." : "Buscar funcionario..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-800/20 border border-white/5 rounded-2xl text-white font-medium placeholder:text-gray-600 focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                    />
                </div>
            </div>

            {/* Main Content Area */}
            {view === 'strategic' && isAdmin ? (
                /* ADMIN STRATEGIC VIEW: Comparison by Department */
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <div className="col-span-1 text-center">Pos</div>
                            <div className="col-span-4 italic">Mejor Funcionario (Líder)</div>
                            <div className="col-span-4">Área / Unidad</div>
                            <div className="col-span-3 text-right">Puntaje Total</div>
                        </div>
                        {filteredDepts.map((dept, index) => (
                            <div key={index} className="grid grid-cols-12 items-center px-8 py-6 rounded-3xl border bg-slate-800/20 border-white/5 hover:border-primary-500/30 transition-all group cursor-default">
                                <div className="col-span-1 text-center font-black text-lg text-gray-500">{index + 1}</div>
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-secondary-500/10 flex items-center justify-center text-secondary-500">
                                        <Star className="w-4 h-4 fill-secondary-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-secondary-500 transition-colors uppercase tracking-tight">{dept.top_performer}</p>
                                        <p className="text-[9px] text-gray-600 font-bold uppercase">Mejor Puntuación: {dept.top_points} pts</p>
                                    </div>
                                </div>
                                <div className="col-span-4 text-sm font-black text-gray-300 uppercase tracking-tighter">
                                    <Building2 className="w-4 h-4 inline mr-2 text-gray-600" />
                                    {dept.department}
                                </div>
                                <div className="col-span-3 text-right">
                                    <p className="text-xl font-black text-white">{dept.total_points.toLocaleString()}</p>
                                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{dept.staff_count} Funcionarios</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : view === 'area' ? (
                /* AREA VIEW: List of participants in the user's department */
                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <div className="col-span-1 text-center">Pos</div>
                            <div className="col-span-6 md:col-span-5">Funcionario</div>
                            <div className="hidden md:block col-span-3 text-center">Área / Unidad</div>
                            <div className="col-span-5 md:col-span-3 text-right">Puntaje</div>
                        </div>
                        {filteredParticipants.map((p) => {
                            const isMe = p.id === loggedUser?.id;
                            const isGlobalView = view === 'global';
                            return (
                                <div key={p.id} className={`grid grid-cols-12 items-center px-8 py-5 rounded-3xl border transition-all ${isMe ? 'bg-primary-500/10 border-primary-500/30 ring-1 ring-primary-500/20 shadow-xl' : 'bg-slate-800/20 border-white/5 hover:border-white/10 hover:bg-slate-800/30'}`}>
                                    <div className={`col-span-1 text-center font-black text-lg ${isMe ? 'text-primary-400' : 'text-gray-400'}`}>{p.rank_position}</div>
                                    <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/5">
                                            <img src={p.profile_picture || `https://ui-avatars.com/api/?name=${p.first_name}+${p.last_name}&background=384A99&color=fff`} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className={`font-black uppercase text-sm ${isMe ? 'text-primary-400' : 'text-white'}`}>
                                                {p.first_name} {p.last_name}
                                                {isMe && <span className="ml-2 text-[8px] bg-primary-500 text-white px-1.5 py-0.5 rounded">TÚ</span>}
                                            </p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase md:hidden">{p.department}</p>
                                        </div>
                                    </div>
                                    <div className="hidden md:block col-span-3 text-center text-[11px] font-bold text-gray-400 uppercase italic">{p.department}</div>
                                    <div className="col-span-5 md:col-span-3 text-right">
                                        <p className="text-lg font-black text-primary-400">{p.points} PTS</p>
                                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em]">{p.level}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* GLOBAL VIEW: Institutional Rank (Full list for admin, Lock message for users) */
                <div className="space-y-6">
                    {isAdmin ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <div className="col-span-1 text-center">Pos</div>
                                <div className="col-span-5">Funcionario</div>
                                <div className="col-span-3 text-center">Área/Unidad</div>
                                <div className="col-span-3 text-right">Puntaje</div>
                            </div>
                            {filteredParticipants.map((p) => (
                                <div key={p.id} className="grid grid-cols-12 items-center px-8 py-5 rounded-3xl border bg-slate-800/20 border-white/5 hover:border-white/10 transition-all">
                                    <div className="col-span-1 text-center font-black text-lg text-gray-400">{p.rank_position}</div>
                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-white/5">
                                            <img src={p.profile_picture || `https://ui-avatars.com/api/?name=${p.first_name}+${p.last_name}&background=384A99&color=fff`} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="font-black uppercase text-sm text-white">{p.first_name} {p.last_name}</p>
                                    </div>
                                    <div className="col-span-3 text-center text-xs font-bold text-gray-300 uppercase italic opacity-70">{p.department}</div>
                                    <div className="col-span-3 text-right text-lg font-black text-primary-400">{p.points} PTS</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* User sees lock message */
                        <div className="py-20 flex flex-col items-center text-center space-y-6 animate-pulse-slow">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-white/10 flex items-center justify-center text-gray-700 shadow-2xl relative">
                                <Lock className="w-10 h-10 opacity-20" />
                                <ShieldCheck className="w-6 h-6 text-primary-500 absolute -bottom-1 -right-1" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Privacidad Institucional</h3>
                                <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                    El detalle del ranking global solo es visible para administradores.
                                    Puedes ver tu posición oficial #<span className="text-primary-400 font-bold">{currentUser?.globalRank}</span> en la cabecera.
                                </p>
                                <div className="pt-6">
                                    <button
                                        onClick={() => setView('area')}
                                        className="px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:bg-white/10 rounded-xl transition-all"
                                    >
                                        Ver Ranking de mi Área
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
