import { BookOpen, TrendingUp, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CyberCat from '../CyberCat';

export default function ModuleGrid({ modules }) {
    const navigate = useNavigate();

    return (
        <div 
            className="px-8 py-5 rounded-3xl border border-[rgba(0,0,0,0.04)] shadow-[4px_4px_10px_rgba(168,145,116,0.3),-4px_-4px_10px_rgba(255,255,255,0.4)] bg-cover bg-center bg-no-repeat transition-all duration-300"
            style={{ backgroundImage: "url('/images/Inicio-opcion-1.jpg')" }}
        >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-left">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#8f032a]/10 rounded-xl flex items-center justify-center border border-[#8f032a]/20 text-[#8f032a]">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-[#582c19] tracking-wider uppercase">
                        MI RUTA DE APRENDIZAJE
                    </h2>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {modules.length > 0 ? (
                    modules.map((module) => (
                        <ModuleCard key={module.id} module={module} navigate={navigate} />
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white/40 backdrop-blur-sm rounded-[2rem] border border-dashed border-[var(--card-border)]">
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs opacity-60">
                            No hay módulos disponibles en este momento.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ModuleCard({ module, navigate }) {
    const isLocked = module.is_locked;
    const isUpcoming = module.is_upcoming;
    const isCompleted = module.status === 'completed' || module.progress >= 100;

    const handleNavigation = () => {
        if (isLocked) {
            toast.error(module.lock_reason || 'Requisito de precedencia no cumplido.', { id: 'module-locked-warning' });
            return;
        }
        navigate(`/modules/${module.id}`);
    };

    const handleCardClick = (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        handleNavigation();
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group relative flex flex-col p-6 rounded-[2rem] border border-transparent transition-all cursor-pointer overflow-hidden ${
                isCompleted
                    ? 'bg-[var(--success-card-bg)] hover:border-emerald-500/40 shadow-[6px_6px_16px_rgba(168,145,116,0.25),-2px_-2px_8px_rgba(255,255,255,0.4)]'
                    : isUpcoming
                        ? 'bg-[var(--card-bg)]/40 opacity-80 hover:opacity-100 shadow-[inset_4px_4px_10px_rgba(168,145,116,0.2)]'
                        : 'bg-[var(--card-bg)] shadow-[6px_6px_16px_rgba(168,145,116,0.25),-2px_-2px_8px_rgba(255,255,255,0.4)] hover:shadow-[8px_8px_20px_rgba(168,145,116,0.3),-4px_-4px_12px_rgba(255,255,255,0.5)] hover:-translate-y-1'
            }`}
        >
            {/* Completion Badge Overlay */}
            {isCompleted && (
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 blur-2xl rounded-full"></div>
            )}

            <div className="flex justify-between items-start mb-6 relative z-10 min-h-[48px] text-left">
                <h3 className={`text-base font-bold leading-tight line-clamp-3 transition-colors ${
                    isUpcoming ? 'text-gray-400' : 'text-[#582c19]'
                }`}>
                    {module.title}
                </h3>
                {isCompleted && <CheckCircle2 className="w-5 h-5 text-[#47754e] shrink-0 mt-1 drop-shadow-[0_0_8px_rgba(71,117,78,0.2)]" />}
            </div>

            <div className="mt-auto space-y-5 relative z-10">
                {isLocked ? (
                    <>
                        <motion.div
                            initial={{ opacity: 0.8 }}
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className={`w-full py-5 flex flex-col items-center justify-center gap-2 rounded-2xl border px-4 ${
                                isUpcoming ? 'bg-[var(--bg-color)]/60 border-[var(--card-border)] text-gray-600' : 'bg-orange-500/5 border-orange-500/10 text-orange-400/60'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em]">
                                {isUpcoming ? <CyberCat className="w-6 h-6 opacity-30" variant="static" color="#64748B" /> : <Lock className="w-3.5 h-3.5" />}
                                {isUpcoming ? 'Próximamente' : 'Bloqueado'}
                            </div>
                            {!isUpcoming && module.lock_reason && (
                                <p className="text-[10px] text-gray-600 font-medium leading-tight text-center max-w-[150px]">
                                    {module.lock_reason}
                                </p>
                            )}
                        </motion.div>

                        {isUpcoming && (
                            <div className="w-full py-3 rounded-xl bg-[var(--card-bg)]/40 text-gray-600 text-[9px] font-bold uppercase tracking-[0.2em] border border-[var(--card-border)] flex items-center justify-center gap-2 cursor-not-allowed">
                                PRÓXIMAMENTE
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-end text-[9px] font-bold uppercase tracking-widest text-[#582c19]">
                                <span>PROGRESO</span>
                                <span>{module.progress || 0}%</span>
                            </div>
                            <div className={`h-1.5 rounded-full overflow-hidden ${isCompleted ? 'bg-[#47754e]/10' : 'bg-gray-200 dark:bg-black/20'}`}>
                                <div
                                    className={`h-full transition-all duration-1000 shadow-sm ${isCompleted ? 'bg-[#47754e]' : 'bg-[#8f032a]'}`}
                                    style={{ width: `${module.progress || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNavigation();
                            }}
                            className={`w-full py-3 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn shadow-xl border ${
                                isCompleted
                                    ? 'bg-[#47754e]/10 text-[#47754e] border-[#47754e]/30 hover:bg-[#47754e] hover:text-white'
                                    : 'bg-[#47754e] hover:bg-[#3e6744] text-white border-transparent shadow-[#47754e]/20'
                            }`}
                        >
                            {isCompleted ? (
                                <>FINALIZADO <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /></>
                            ) : (
                                <>EMPEZAR <TrendingUp className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /></>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
