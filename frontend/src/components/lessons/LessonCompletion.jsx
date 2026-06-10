import { Award, CheckCircle, Clock } from 'lucide-react';
import PointsCounter from './PointsCounter';
import { TRACEABLE_CONTENT_TYPES } from '../../constants/contentTypes';

export default function LessonCompletion({ 
    progress, 
    lesson, 
    contents, 
    watchedVideos, 
    visitedLinks, 
    completing, 
    handleComplete,
    completionError
}) {
    const isCompleted = progress?.status === 'completed';
    const pendingRequired = contents.filter(c => {
        if (!c.is_required) return false;
        if (c.isCompleted) return false;

        // Check local state for traceable items not yet synced by a re-fetch
        if (c.content_type === 'video' && watchedVideos.has(c.id)) return false;
        if (TRACEABLE_CONTENT_TYPES.includes(c.content_type) && visitedLinks.has(c.id)) return false;

        return true;
    }).length > 0;

    return (
        <div className="flex flex-col items-center gap-6 py-8 border-y border-white/5 my-6 bg-slate-900/20 rounded-3xl p-8">
            {isCompleted ? (
                <div className="flex flex-col items-center gap-4 animate-scale-in">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-green-500/10 blur-[40px] rounded-full scale-110"></div>
                        <svg viewBox="0 0 200 200" className="w-24 h-24 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-float">
                            <path d="M50 60 L30 10 L80 40 Z" fill="#ffffff" />
                            <path d="M150 60 L170 10 L120 40 Z" fill="#ffffff" />
                            <path d="M55 55 L40 25 L75 42 Z" fill="#ffccd5" />
                            <path d="M145 55 L160 25 L125 42 Z" fill="#ffccd5" />
                            <circle cx="100" cy="100" r="70" fill="#ffffff" />
                            <rect x="40" y="80" width="120" height="35" rx="10" fill="#1a2245" />
                            <rect x="45" y="85" width="50" height="25" rx="5" fill="#22c55e" opacity="0.8">
                                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
                            </rect>
                            <rect x="105" y="85" width="50" height="25" rx="5" fill="#22c55e" opacity="0.8">
                                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.5s" />
                            </rect>
                            <path d="M40 97.5 Q20 97.5 30 97.5" stroke="#1a2245" strokeWidth="10" />
                            <path d="M160 97.5 Q180 97.5 170 97.5" stroke="#1a2245" strokeWidth="10" />
                            <path d="M90 125 Q100 135 110 125" stroke="#ffccd5" strokeWidth="3" fill="none" />
                            <path d="M100 120 L100 115" stroke="#ffccd5" strokeWidth="2" />
                            <circle cx="100" cy="118" r="4" fill="#ffccd5" />
                            <line x1="30" y1="120" x2="60" y2="115" stroke="#f0f0f0" strokeWidth="1" />
                            <line x1="30" y1="130" x2="60" y2="125" stroke="#f0f0f0" strokeWidth="1" />
                            <line x1="170" y1="120" x2="140" y2="115" stroke="#f0f0f0" strokeWidth="1" />
                            <line x1="170" y1="130" x2="140" y2="125" stroke="#f0f0f0" strokeWidth="1" />
                            <path d="M40 155 Q100 140 160 155 L160 200 L40 200 Z" fill="#1a2245" />
                            <path d="M100 150 L80 180 L120 180 Z" fill="#22c55e" opacity="0.2" />
                        </svg>
                    </div>
                    <div className="text-center space-y-4">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Lección Completada</h3>
                            <div className="inline-flex items-center gap-2 px-6 py-2 bg-green-500/10 rounded-full border border-green-500/20 mt-2">
                                <Award className="w-5 h-5 text-green-500" />
                                <span className="text-green-400 text-xs font-black uppercase tracking-widest">
                                    TOTAL GANADO EN LECCIÓN: +
                                    <PointsCounter target={progress?.points_earned ?? (lesson.total_points || 0)} />
                                    {" "}PTS
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md text-center space-y-6">
                    {completionError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-shake text-left">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 text-red-400 rotate-45" />
                            </div>
                            <div>
                                <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">No se puede finalizar</p>
                                <p className="text-gray-300 text-xs font-bold leading-relaxed">
                                    {completionError}
                                </p>
                            </div>
                        </div>
                    )}
                    {pendingRequired ? (
                        <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5 text-orange-400" />
                            </div>
                            <p className="text-orange-400 text-xs font-bold text-left">
                                Debes revisar todo el contenido obligatorio (videos, enlaces y archivos) antes de poder finalizar esta lección.
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-sm font-medium">
                            ¿Has revisado todo el material? Marca la lección como terminada para continuar a la siguiente lección.
                        </p>
                    )}
                    <button
                        onClick={handleComplete}
                        disabled={completing || pendingRequired}
                        className="w-full group relative px-12 py-5 bg-secondary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_rgba(249,115,22,0.4)]"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                            {completing ? (
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>Finalizar Lección <CheckCircle className="w-5 h-5" /></>
                            )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </div>
            )}
        </div>
    );
}
