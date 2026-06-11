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

    const moduleNumber = module.module_number ?? 1;
    const publicJpg = `/images/modules/Banner-moodulo-${moduleNumber - 1}.jpg`;
    const fallbackX = '/images/modules/Banner-moodulo-X.jpg';
    const svgFallback = new URL(`../../assets/card-banner/Tar-Sec-${(moduleNumber).toString().padStart(2, '0')}.svg`, import.meta.url).href;

    const [imgSrc, setImgSrc] = React.useState(publicJpg);

    React.useEffect(() => {
        setImgSrc(publicJpg);
    }, [publicJpg]);

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
                className={`group relative flex flex-col h-full border rounded-[2rem] overflow-hidden transition-all duration-500 ${isLocked
                    ? 'bg-[var(--card-bg)]/25 border-[var(--card-border)] opacity-50 grayscale-[0.6] cursor-not-allowed shadow-[inset_4px_4px_10px_rgba(168,145,116,0.15)] pointer-events-none'
                    : module.completionPercentage === 100
                        ? 'bg-[var(--success-card-bg)] border-[var(--success-card-border)] hover:border-[var(--success)]/60 shadow-[6px_6px_16px_rgba(168,145,116,0.25),-2px_-2px_8px_rgba(255,255,255,0.4)] hover:shadow-[8px_8px_20px_rgba(168,145,116,0.3),-4px_-4px_12px_rgba(255,255,255,0.5)] hover:-translate-y-2'
                        : 'bg-[var(--card-bg)] border-t-[rgba(255,255,255,0.3)] border-l-[rgba(255,255,255,0.3)] border-b-[rgba(0,0,0,0.03)] border-r-[rgba(0,0,0,0.03)] shadow-[6px_6px_16px_rgba(168,145,116,0.25),-2px_-2px_8px_rgba(255,255,255,0.4)] hover:shadow-[8px_8px_20px_rgba(168,145,116,0.3),-4px_-4px_12px_rgba(255,255,255,0.5)] hover:-translate-y-2 cursor-pointer'
                    }`}
            >
                {/* Banner Image */}
                <div className="h-36 w-full relative overflow-hidden">
                    <img
                        src={imgSrc}
                        alt={module.title}
                        className={`w-full h-full object-cover transition-transform duration-700 ${
                            isLocked ? 'grayscale opacity-40' : 'group-hover:scale-110'
                        } ${
                            imgSrc === publicJpg || imgSrc === fallbackX ? 'object-left' : 'object-center'
                        }`}
                        onError={(e) => {
                            if (imgSrc === publicJpg) {
                                setImgSrc(fallbackX);
                            } else if (imgSrc === fallbackX) {
                                setImgSrc(svgFallback);
                            } else if (imgSrc === svgFallback && module.image_url) {
                                setImgSrc(module.image_url);
                            } else {
                                e.target.style.display = 'none';
                            }
                        }}
                    />

                </div>



                <div className="flex-1 flex flex-col p-5 md:p-6">
                    {/* Badge and Number */}
                    <div className="flex justify-between items-center mb-5">
                        <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl font-black transition-all shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),2px_2px_8px_rgba(168,145,116,0.15)] shrink-0 ${
                                module.completionPercentage === 100
                                    ? 'border-[var(--success-card-border)] bg-[var(--success-card-bg)] text-[var(--success)]'
                                    : 'bg-[#582c19]/10 border-[#582c19]/30 text-[#582c19] group-hover:bg-primary-500 group-hover:text-white group-hover:border-transparent'
                                }`}>
                                {(module.module_number ?? 0) < 10 ? `0${module.module_number}` : module.module_number}
                            </div>
                            <span className={`${
                                isLocked 
                                    ? 'bg-slate-700/50 text-gray-400 border border-gray-600' 
                                    : 'bg-[var(--text-color)]/5 border border-[#582c19]/30 text-[var(--text-color)]/70 group-hover:bg-primary-500/10 group-hover:border-primary-500/20 group-hover:text-primary-500'
                            } py-1.5 px-4 rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 min-w-[120px] justify-center shadow-sm transition-all duration-300`}>
                                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                                {formattedDate}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                        <div className="flex justify-between items-start gap-4 mb-2">
                            <h3 className={`text-xl font-bold transition-colors leading-tight min-h-[3rem] ${
                                module.completionPercentage === 100 ? 'text-[var(--success)]' : 'text-[var(--text-color)] group-hover:text-primary-500'
                            }`}>
                                {module.title}
                            </h3>
                            {module.completionPercentage === 100 && (
                                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                            )}
                        </div>
                        <p className="text-[#582c19] text-sm line-clamp-3 leading-relaxed font-medium">
                            {module.description}
                        </p>
                    </div>

                    {/* Stats Footer */}
                    <div className="pt-5 mt-auto border-t border-gray-200 dark:border-white/5 space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-[#582c19]">
                                <BookOpen className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{module.total_lessons || 0} Lecciones</span>
                            </div>
                            <div className="flex items-center gap-2 text-[#582c19]">
                                <Clock className="w-4 h-4" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">{module.total_duration || 0} min</span>
                            </div>
                        </div>

                        {/* Progress and Link */}
                        <div className="flex flex-col gap-4">
                            {isLocked ? (
                                <motion.div
                                    initial={{ opacity: 0.8 }}
                                    animate={{ opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-full py-4 flex flex-col items-center justify-center gap-2 bg-orange-500/10 rounded-xl border border-orange-500/30 text-orange-200 px-4 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
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
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end text-[9px] font-bold uppercase tracking-widest text-[#582c19]">
                                            <span>PROGRESO</span>
                                            <span>{module.completionPercentage || 0}%</span>
                                        </div>
                                        <div className={`h-1.5 rounded-full overflow-hidden ${module.completionPercentage === 100 ? 'bg-emerald-500/10' : 'bg-gray-200 dark:bg-black/20'}`}>
                                            <div
                                                className={`h-full transition-all duration-1000 shadow-sm ${
                                                    module.completionPercentage === 100 
                                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500' 
                                                    : 'bg-gradient-to-r from-[#EF8843] to-[#E56B24]'
                                                }`}
                                                style={{ width: `${module.completionPercentage || 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    
                                    <div className={`w-full py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border ${
                                        module.completionPercentage === 100
                                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white'
                                        : 'bg-[var(--text-color)]/5 text-[var(--text-color)] border-[#582c19]/30 group-hover:bg-primary-500 group-hover:text-white group-hover:border-transparent'
                                    }`}>
                                        {module.completionPercentage === 100 ? (
                                            <>FINALIZADO <CheckCircle className="w-4 h-4" /></>
                                        ) : (
                                            <>CONTINUAR <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                                        )}
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
