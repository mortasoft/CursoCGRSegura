import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    BookOpen, 
    Clock, 
    ChevronRight, 
    CheckCircle, 
    Lock, 
    Calendar 
} from 'lucide-react';
import toast from 'react-hot-toast';
import CyberCat from '../CyberCat';

export default function ModuleCard({ module, user, viewAsStudent }) {
    const releaseDate = module.release_date ? new Date(module.release_date) : null;
    const isAdminView = user?.role === 'admin' && !viewAsStudent;
    const isDateLocked = releaseDate && releaseDate > new Date() && !isAdminView;
    const isPrerequisiteLocked = !!module.is_locked && !isAdminView;
    const isLocked = isDateLocked || isPrerequisiteLocked;

    const formattedDate = releaseDate
        ? releaseDate.toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })
        : module.month;

    const cardSrc = new URL(`../../assets/card-banner/Tar-Sec-${(module.module_number ?? 0).toString().padStart(2, '0')}.svg`, import.meta.url).href;

    return (
        <div className="relative h-full">
            <Link
                to={isLocked ? '#' : `/modules/${module.id}`}
                onClick={(e) => {
                    if (isLocked) {
                        e.preventDefault();
                        toast.error(module.lock_reason || 'Módulo Bloqueado', { id: 'module-locked-warning' });
                    }
                }}
                className={`group relative flex flex-col h-full bg-slate-800/20 border border-white/5 rounded-[1.5rem] overflow-hidden transition-all duration-500 ${isLocked
                    ? 'grayscale-[0.5] opacity-80 cursor-not-allowed'
                    : module.completionPercentage === 100
                        ? 'bg-green-500/[0.03] border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.08)] hover:border-green-500/50'
                        : 'hover:bg-slate-800/40 hover:border-primary-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 cursor-pointer'
                    }`}
            >
                {/* Banner Image */}
                <div className="h-32 w-full relative overflow-hidden">
                    <img
                        src={cardSrc}
                        alt={module.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                            if (module.image_url) e.target.src = module.image_url;
                            else e.target.style.display = 'none';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                </div>

                {/* Accent line top */}
                <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isLocked ? 'from-gray-600 to-gray-400' : 'from-primary-500 to-secondary-500'} opacity-60 z-20`}></div>

                <div className="flex-1 flex flex-col p-4 md:p-5">
                    {/* Badge and Number */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 bg-slate-900 rounded-2xl border flex items-center justify-center text-2xl font-black transition-all shadow-2xl shrink-0 ${module.completionPercentage === 100
                                ? 'border-green-500/30 text-green-500 shadow-green-500/10'
                                : 'border-white/10 text-white group-hover:text-secondary-500'
                                }`}>
                                {(module.module_number ?? 0) < 10 ? `0${module.module_number}` : module.module_number}
                            </div>
                            <span className={`${isLocked ? 'bg-slate-700/50 text-gray-400 border border-gray-600' : 'bg-primary-500/10 border border-primary-500/20 text-primary-400'} py-1.5 px-4 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 min-w-[120px] justify-center shadow-sm`}>
                                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                                {formattedDate}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                        <div className="flex justify-between items-start">
                            <h3 className={`text-xl font-bold text-white mb-2 ${!isLocked && 'group-hover:text-primary-400'} transition-colors leading-tight min-h-[3rem]`}>
                                {module.title}
                            </h3>
                            {module.completionPercentage === 100 && (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed font-medium">
                            {module.description}
                        </p>
                    </div>

                    {/* Stats Footer */}
                    <div className="pt-4 mt-auto border-t border-white/5 space-y-3">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-gray-500">
                                <BookOpen className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{module.total_lessons || 0} Lecciones</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{module.total_duration || 0} min</span>
                            </div>
                        </div>

                        {/* Link and Arrow */}
                        <div className="flex items-center justify-between group/btn">
                            {isLocked ? (
                                <motion.div
                                    initial={{ opacity: 0.8 }}
                                    animate={{ opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-full py-5 flex flex-col items-center justify-center gap-2 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-200 px-4 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                                >
                                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                                        <CyberCat className="w-6 h-6 opacity-80" variant="static" color="#f97316" />
                                        {isPrerequisiteLocked ? 'Módulo Bloqueado' : 'Próximamente'}
                                    </div>
                                    {isPrerequisiteLocked && module.lock_reason && (
                                        <p className="text-[11px] text-orange-100/90 font-bold leading-tight text-center">
                                            {module.lock_reason}
                                        </p>
                                    )}
                                </motion.div>
                            ) : (
                                <>
                                    <div className="progress-bar flex-1 mr-6">
                                        <div
                                            className={`progress-fill ${module.completionPercentage === 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : ''}`}
                                            style={{ width: `${module.completionPercentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex items-center gap-1 text-primary-400 font-black text-[11px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        Explorar <ChevronRight className="w-4 h-4" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
