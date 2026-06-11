import { ChevronLeft, ChevronRight, ChevronDown, Trophy, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProfilePictureUrl } from '../../utils/imageUtils';

export default function ParticipantListView({
    view,
    participants,
    loggedUser,
    currentUser,
    setView
}) {

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isPerPageOpen, setIsPerPageOpen] = useState(false);

    // Reset page to 1 when filters, view, search terms, or items per page change
    useEffect(() => {
        setCurrentPage(1);
    }, [participants, view, itemsPerPage]);


    const totalPages = Math.ceil(participants.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedParticipants = participants.slice(startIndex, startIndex + itemsPerPage);

    const renderPosition = (rank, isMe) => {
        if (isMe && rank > 3) {
            return <span className="text-2xl font-black italic text-primary-500">{rank}</span>;
        }
        if (rank === 1) return <span className="text-3xl drop-shadow-[0_2px_6px_rgba(245,158,11,0.5)]">🥇</span>;
        if (rank === 2) return <span className="text-3xl drop-shadow-[0_2px_6px_rgba(148,163,184,0.5)]">🥈</span>;
        if (rank === 3) return <span className="text-3xl drop-shadow-[0_2px_6px_rgba(234,88,12,0.4)]">🥉</span>;
        return <span className={`text-2xl font-black italic ${isMe ? 'text-primary-500' : 'text-[var(--text-muted)]'}`}>{rank}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="grid grid-cols-12 px-8 py-2 text-[10px] font-black text-[#582c19] uppercase tracking-widest">
                    <div className="col-span-2 md:col-span-1 text-center">Posición</div>
                    <div className="col-span-4 md:col-span-5 px-6">Funcionario</div>
                    <div className="hidden md:block col-span-3 text-center">Área / Unidad</div>
                    <div className="col-span-6 md:col-span-3 text-right">Puntaje</div>
                </div>

                {paginatedParticipants.map((p) => {
                    const isMe = p.email === loggedUser?.email?.toLowerCase();
                    return (
                        <div key={p.id} className={`grid grid-cols-12 items-center px-8 py-5 rounded-3xl border transition-all duration-200 ${isMe ? 'bg-primary-500/10 border-primary-500/30 ring-1 ring-primary-500/20 shadow-md' : 'bg-slate-900/60 border-white/5 hover:border-white/10 hover:shadow-[0_4px_20px_-4px_rgba(56,74,153,0.12)] hover:-translate-y-px'}`}>
                            <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center font-black">
                                {renderPosition(p.rank_position, isMe)}
                                {view !== 'global' && p.institutional_rank && (
                                    <div className={`flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg border shadow-sm transition-all ${isMe ? 'bg-primary-500/15 border-primary-500/30 text-primary-600' : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-muted)]'}`}>
                                        <Trophy className="w-3 h-3 text-amber-500 drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]" />
                                        <span className="text-[10px] font-black uppercase tracking-tight">#{p.institutional_rank}</span>
                                    </div>
                                )}
                            </div>
                            <div className="col-span-4 md:col-span-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)]">
                                    <img 
                                        src={getProfilePictureUrl(isMe ? loggedUser?.profilePicture : p.profile_picture, `${p.first_name} ${p.last_name}`)} 
                                        className="w-full h-full object-cover" 
                                        referrerPolicy="no-referrer" 
                                    />
                                </div>
                                <div className="px-2">
                                    <p className={`font-black uppercase text-sm ${isMe ? 'text-primary-600' : 'text-[var(--text-color)]'}`}>
                                        {p.first_name} {p.last_name}
                                        {isMe && <span className="ml-2 text-[8px] bg-primary-500 text-white px-1.5 py-0.5 rounded">TÚ</span>}
                                    </p>
                                    <p className={`text-[10px] ${isMe ? 'text-primary-500/70' : 'text-[var(--text-muted)]'} font-bold uppercase md:hidden italic`}>{p.department}</p>
                                    {p.badges && p.badges.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {p.badges.map((badge, idx) => (
                                                <img 
                                                    key={idx}
                                                    src={`/images/badges/${badge.image_url}`}
                                                    alt={badge.name}
                                                    title={badge.name}
                                                    className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] hover:scale-110 transition-transform"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`hidden md:block col-span-3 text-center text-[10px] font-bold ${isMe ? 'text-primary-500/70' : 'text-[var(--text-muted)]'} uppercase italic leading-tight`}>{p.department}</div>
                            <div className="col-span-6 md:col-span-3 text-right">
                                <p className="text-xl font-black text-primary-400 italic leading-none">{p.points} PTS</p>
                                <p className="text-[10px] text-secondary-500 font-black uppercase tracking-widest mt-1">{p.level}</p>
                            </div>
                        </div>
                    );
                })}

                {participants.length === 0 && (
                    <div className="py-12 text-center text-[#582c19] text-sm font-bold uppercase tracking-widest">
                        No se encontraron funcionarios
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {(totalPages > 1 || participants.length > 10) && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] gap-4 shadow-sm">

                    {/* Rows per page selector */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Mostrar</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsPerPageOpen(!isPerPageOpen)}
                                className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-primary-500/40 text-[var(--text-color)] text-xs font-black rounded-lg px-3 py-1.5 transition-all outline-none min-w-[65px] justify-between uppercase"
                            >
                                <span>{itemsPerPage > 500 ? 'TODOS' : itemsPerPage}</span>
                                <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${isPerPageOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isPerPageOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsPerPageOpen(false)}></div>
                                    <div className="absolute bottom-full left-0 mb-2 w-full min-w-[80px] z-50 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
                                        {[10, 20, 50, 100, 9999].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => {
                                                    setItemsPerPage(val);
                                                    setIsPerPageOpen(false);
                                                }}
                                                className={`w-full text-center px-2 py-2.5 text-[10px] font-black uppercase transition-colors ${itemsPerPage === val ? 'bg-primary-500 text-white' : 'text-[var(--text-muted)] hover:bg-primary-500/8 hover:text-[var(--text-color)]'}`}
                                            >
                                                {val > 500 ? 'TODOS' : val}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">por pág</span>
                    </div>

                    <div className="flex items-center gap-3 md:gap-6">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-primary-500/8 hover:text-primary-600 transition-colors disabled:opacity-20 disabled:pointer-events-none flex items-center gap-2"
                            title="Primera Página"
                        >
                            <ChevronsLeft className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-primary-500/8 hover:text-primary-600 transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden lg:inline text-xs font-black uppercase tracking-widest">Ant</span>
                        </button>

                        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest min-w-[60px] text-center">
                            <span className="text-primary-500 mx-1">{currentPage}</span> / <span className="text-[var(--text-color)] mx-1">{totalPages || 1}</span>
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-primary-500/8 hover:text-primary-600 transition-colors disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
                        >
                            <span className="hidden lg:inline text-xs font-black uppercase tracking-widest">Sig</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-xl text-[var(--text-muted)] hover:bg-primary-500/8 hover:text-primary-600 transition-colors disabled:opacity-20 disabled:pointer-events-none flex items-center gap-2"
                            title="Última Página"
                        >
                            <ChevronsRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
