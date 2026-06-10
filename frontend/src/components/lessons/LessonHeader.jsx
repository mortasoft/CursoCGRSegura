import { useState } from 'react';
import { Clock, Award, BookOpen, HelpCircle } from 'lucide-react';

export default function LessonHeader({ lesson, contentsCount }) {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <>
            {/* Compact Breadcrumbs / Header Mobile Only */}
            <div className="flex lg:hidden flex-col gap-4 mb-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                        {contentsCount} Items
                    </span>
                    <div className="flex gap-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {lesson.duration_minutes}m
                        </span>
                        <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest bg-secondary-900/20 px-3 py-1 rounded-full border border-secondary-500/20 flex items-center gap-1.5 font-black">
                            <Award className="w-3 h-3" /> {lesson.total_points || 0} PTS
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Header (Desktop Info) */}
            <div className="hidden lg:flex items-center justify-between py-2 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                        <BookOpen className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                        <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Lección Actual</h4>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase">{lesson.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Contenido</p>
                        <p className="text-sm font-bold text-white">{contentsCount} elementos</p>
                    </div>
                    <div className="w-px h-8 bg-white/10 mx-2"></div>
                    <div className="text-right relative">
                        <button
                            onClick={() => setShowTooltip(!showTooltip)}
                            className="flex items-center justify-end gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-300 transition-colors focus:outline-none w-full select-none"
                            title="Ver información de recompensa"
                        >
                            <span>Recompensa Máxima</span>
                            <HelpCircle className="w-3.5 h-3.5 text-gray-500 hover:text-gray-300" />
                        </button>
                        <p className="text-sm font-bold text-secondary-400 mt-0.5">{lesson.total_points || 0} PTS</p>
                        {showTooltip && (
                            <>
                                {/* Click outside handler */}
                                <div
                                    className="fixed inset-0 z-40 cursor-default"
                                    onClick={() => setShowTooltip(false)}
                                />
                                {/* Tooltip Popover */}
                                <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-slate-900/95 border border-white/10 rounded-xl shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-1 duration-200">
                                    <div className="flex items-start gap-2 mb-2">
                                        <HelpCircle className="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
                                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">Información de Recompensa</h5>
                                    </div>
                                    <p className="text-xs text-gray-300 font-medium leading-relaxed">
                                        Representa los puntos máximos que puedes ganar en esta lección. El puntaje obtenido dependerá de las acciones y el desempeño que realices durante su desarrollo. Tome en cuenta que tambien pueden existir condiciones que hagan ganar puntos adicionales a lo indicado acá
                                    </p>
                                    <div className="absolute bottom-full right-4 border-8 border-transparent border-b-slate-900/95"></div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Title Header (Mobile/Legacy) */}
            <div className="lg:hidden pb-6 border-b border-white/5">
                <h1 className="text-3xl font-black text-white tracking-tighter leading-tight mb-2 uppercase">
                    {lesson.title}
                </h1>
                <p className="text-sm text-gray-400 font-medium">
                    Sigue el contenido en orden. Algunos elementos pueden ser obligatorios.
                </p>
            </div>
        </>
    );
}
