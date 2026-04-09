import React from 'react';
import { ArrowLeft, Clock, FileText, Trophy } from 'lucide-react';

export default function ModuleHero({ module, onBack, onStart, onCelebrate }) {
    const totalDuration = module.lessons
        .filter(l => !l.is_optional)
        .reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

    const bannerSrc = new URL(`../../assets/section-banner/Ban-Sec-${(module.module_number ?? 0).toString().padStart(2, '0')}.svg`, import.meta.url).href;

    return (
        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-800/40 border border-white/5 shadow-2xl">
            {/* Background Banner */}
            <div className="absolute inset-0 z-0">
                <img
                    src={bannerSrc}
                    alt=""
                    className="w-full h-full object-cover opacity-20"
                    onError={(e) => {
                        if (module.image_url) e.target.src = module.image_url;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0d1127] via-[#0d1127]/60 to-transparent"></div>
            </div>

            <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-primary-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al catálogo
                    </button>

                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-500 text-[10px] font-black uppercase tracking-widest">
                            Módulo {module.module_number} • {module.month}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                            {module.title}
                        </h1>
                        <div className="flex items-center gap-2 text-primary-400 font-black uppercase tracking-widest text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            {totalDuration} min
                        </div>
                        <p className="text-gray-400 text-base leading-relaxed max-w-2xl font-medium">
                            {module.description}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-8 pt-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-primary-400 border border-white/5">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Contenido</p>
                                <p className="text-white font-bold">{module.lessons.length} Lecciones</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-secondary-500 border border-white/5">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Recompensa</p>
                                <p className="text-white font-bold">{module.points_to_earn || 0} Puntos</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/3 flex flex-col items-center">
                    <div className="relative w-48 h-48 mb-6">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-slate-900"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 88}
                                strokeDashoffset={2 * Math.PI * 88 * (1 - (module.completionPercentage || 0) / 100)}
                                className="text-secondary-500 transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white">{module.completionPercentage || 0}%</span>
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Progreso</span>
                        </div>
                    </div>
                    <button
                        onClick={onStart}
                        className="btn-secondary w-full py-4 text-sm font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(229,123,60,0.3)] mb-3"
                    >
                        {module.completionPercentage === 100 ? 'Repasar Módulo' : module.completionPercentage > 0 ? 'Continuar Módulo' : 'Empezar Módulo'}
                    </button>

                </div>
            </div>
        </div>
    );
}
