import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Clock, ShieldCheck, Activity, XCircle, History, Edit2, RefreshCcw, Trash2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Ahora mismo';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} d`;

    return date.toLocaleDateString();
};

export default function UserTable({ users, currentUserId, onEdit, onReset, onDelete, viewProfile }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isPerPageOpen, setIsPerPageOpen] = useState(false);

    // Reset pagination when users list changes completely
    useEffect(() => {
        setCurrentPage(1);
    }, [users.length]);

    const totalPages = Math.ceil(users.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-slate-900 border border-white/5 rounded-3xl shadow-2xl overflow-hidden relative group text-left flex flex-col">
            <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

            <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                            <th className="pl-4 md:pl-5 py-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-left">Funcionario</th>
                            <th className="px-3 py-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-left">Unidad / Cargo</th>
                            <th className="hidden md:table-cell px-3 py-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">Protocolo de Acceso</th>
                            <th className="px-3 py-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">Nivel Académico</th>
                            <th className="hidden lg:table-cell px-3 py-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">Disponibilidad</th>
                            <th className="pr-4 md:pr-5 py-4 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {paginatedUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-white/[0.015] transition-all duration-300 group/row">
                                <td className="pl-4 md:pl-5 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative group/avatar flex-shrink-0">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-gray-600 transition-all group-hover/row:scale-110 group-hover/row:border-primary-500/30 group-hover/row:rotate-3 shadow-xl overflow-hidden">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} alt={u.first_name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-500 group-hover/row:text-primary-400 transition-colors" />
                                                )}
                                            </div>
                                            {u.role === 'admin' && (
                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-secondary-500 rounded-lg flex items-center justify-center border-2 border-slate-900 shadow-lg">
                                                    <ShieldCheck className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-black text-white uppercase tracking-tight group-hover/row:text-primary-400 transition-colors leading-tight">{u.first_name} {u.last_name}</p>
                                            <p className="text-[10px] text-white/60 font-bold lowercase flex items-center gap-1.5 mt-0.5">
                                                <Mail className="w-3 h-3 opacity-50" /> {u.email}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-4">
                                    <div className="space-y-1 text-left max-w-[200px]">
                                        <p className="text-[11px] font-black text-white uppercase leading-tight">{u.department || 'SIN UNIDAD'}</p>
                                        <p className="text-[9px] text-white/60 font-black uppercase tracking-tighter flex items-center gap-1.5 leading-tight">
                                            <Briefcase className="w-3 h-3 opacity-60 flex-shrink-0" /> <span className="truncate">{u.position || 'SIN CARGO ASIGNADO'}</span>
                                        </p>
                                    </div>
                                </td>
                                <td className="hidden md:table-cell px-3 py-4">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className="flex items-center gap-3">
                                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${u.role === 'admin' ? 'bg-secondary-500/10 text-secondary-500 border-secondary-500/20 shadow-lg shadow-secondary-500/10' : 'bg-primary-500/10 text-primary-400 border-primary-500/20'}`}>
                                                {u.role === 'admin' ? 'ADMINISTRADOR' : 'ESTUDIANTE'}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center text-[9px] font-bold text-white/50 uppercase tracking-tighter w-full max-w-[120px]">
                                            <div className="flex justify-between items-center w-full">
                                                <span className="flex items-center gap-1 opacity-100 text-white"><XCircle className="w-3 h-3" /> REGISTRO:</span>
                                                <span className="text-white/80">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center w-full mt-1">
                                                <span className="flex items-center gap-1 opacity-100 text-white"><Clock className="w-3 h-3" /> ÚLTIMA VEZ:</span>
                                                <span className={u.last_login ? 'text-white' : 'text-white/30 italic'}>{formatRelativeTime(u.last_login)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-4">
                                    <div className="flex flex-col items-center">
                                        <div className="text-center group-hover/row:scale-105 transition-transform">
                                            <p className="text-sm font-black text-white">{u.points || 0} PTS</p>
                                            <div className="flex items-center gap-1 mx-auto justify-center">
                                                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{u.level || 'NOVATO'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="hidden lg:table-cell px-3 py-4">
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all shadow-lg ${u.is_active ? 'text-emerald-500 border-transparent' : 'text-red-500 border-transparent'}`}>
                                            {u.is_active ? (
                                                <>
                                                    <Activity className="w-3 h-3 mr-1" /> ACTIVO
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 mr-1" /> INACTIVO
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="pr-4 md:pr-5 py-4">
                                    <div className="grid grid-cols-2 gap-1.5 w-fit ml-auto">
                                        <button
                                            onClick={() => viewProfile(u.id)}
                                            className="w-8 h-8 flex items-center justify-center text-blue-400 bg-blue-500/5 hover:bg-blue-500/20 border border-blue-500/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                                            title="VER PERFIL"
                                        >
                                            <History className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(u)}
                                            className="w-8 h-8 flex items-center justify-center text-primary-400 bg-primary-500/5 hover:bg-primary-500/20 border border-primary-500/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                                            title="EDITAR CREDENCIALES"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onReset(u)}
                                            className="w-8 h-8 flex items-center justify-center text-orange-500 bg-orange-500/5 hover:bg-orange-500/20 border border-orange-500/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                                            title="REINICIAR PROGRESO"
                                        >
                                            <RefreshCcw className="w-4 h-4" />
                                        </button>
                                        <div className="w-8 h-8">
                                            {u.id !== currentUserId && (
                                                <button
                                                    onClick={() => onDelete(u)}
                                                    className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-500/5 hover:bg-red-500/20 border border-red-500/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                                                    title="ELIMINAR"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(totalPages > 1 || users.length > 10) && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-900/40 border-t border-white/5 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mostrar</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsPerPageOpen(!isPerPageOpen)}
                                className="flex items-center gap-2 bg-slate-800/80 border border-white/10 hover:border-white/20 text-white text-xs font-black rounded-lg px-3 py-1.5 transition-all outline-none"
                            >
                                <span>{itemsPerPage}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isPerPageOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isPerPageOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsPerPageOpen(false)}></div>
                                    <div className="absolute bottom-full left-0 mb-2 w-full min-w-[70px] z-50 bg-slate-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
                                        {[10, 20, 50, 100].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    setItemsPerPage(val);
                                                    setCurrentPage(1);
                                                    setIsPerPageOpen(false);
                                                }}
                                                className={`w-full text-center px-2 py-2.5 text-[11px] font-black transition-colors ${itemsPerPage === val ? 'bg-primary-500 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">por pág</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl text-gray-500 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Ant</span>
                        </button>

                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span className="text-primary-400 mx-1">{currentPage}</span> / <span className="text-white mx-1">{totalPages || 1}</span>
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                            className="p-2 rounded-xl text-gray-500 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                        >
                            <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Sig</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
