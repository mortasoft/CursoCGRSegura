import { BookOpen, AlertCircle, TrendingUp, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import CyberCat from '../CyberCat';

export default function ModuleGrid({ modules, filterCompleted, onToggleFilter }) {
    const navigate = useNavigate();

    const filteredModules = modules.filter(m =>
        filterCompleted ? m.status === 'completed' : m.status !== 'completed'
    );

    return (
        <div className="bg-[#111627] p-8 rounded-3xl border border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#6D71F9]/10 rounded-xl flex items-center justify-center border border-[#6D71F9]/20 text-[#6D71F9]">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-wider uppercase">
                        MI RUTA DE APRENDIZAJE
                    </h2>
                </div>
                <button
                    onClick={onToggleFilter}
                    className="px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all bg-[#1F2937] text-gray-400 hover:text-white border border-transparent shadow-sm"
                >
                    {filterCompleted ? 'VER PENDIENTES' : 'VER COMPLETADOS'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                {filteredModules.length > 0 ? (
                    filteredModules.map((module) => (
                        <ModuleCard key={module.id} module={module} navigate={navigate} />
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-[#0B0F1C] rounded-[2rem] border border-dashed border-white/5">
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs opacity-60">
                            {filterCompleted ? 'Aún no has completado módulos.' : 'No se detectan módulos en esta región de datos.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function ModuleCard({ module, navigate }) {
    const isLocked = module.is_locked;
    const isCompleted = module.status === 'completed';

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
            className="group relative flex flex-col p-5 rounded-3xl border border-white/5 bg-[#151B2E] transition-all cursor-pointer overflow-hidden hover:border-white/10 shadow-lg"
        >
            <div className="flex justify-between items-start mb-6 relative z-10 min-h-[48px]">
                <h3 className="text-base font-bold leading-tight text-white line-clamp-3">
                    {module.title}
                </h3>
            </div>

            <div className="mt-auto space-y-4 relative z-10">
                {isLocked ? (
                    <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full py-4 flex flex-col items-center justify-center gap-2 bg-orange-500/10 rounded-2xl border border-orange-500/30 text-orange-200 px-4 shadow-[0_0_20px_rgba(249,115,22,0.1)]"
                    >
                        <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                            <Lock className="w-3 h-3" />
                            Módulo Bloqueado
                        </div>
                        {module.lock_reason && (
                            <p className="text-[10px] text-orange-100/90 font-bold leading-tight text-center">
                                {module.lock_reason}
                            </p>
                        )}
                    </motion.div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <div className="flex justify-between items-end text-[9px] font-bold uppercase text-gray-500 tracking-widest">
                                <span>PROGRESO</span>
                                <span className="text-white font-black">{module.progress || 0}%</span>
                            </div>
                            <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#EF8843] to-[#E56B24]"
                                    style={{ width: `${module.progress || 0}%` }}
                                ></div>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNavigation();
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#EF8843] to-[#E56B24] text-white text-[9px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group/btn shadow-[0_0_15px_rgba(239,136,67,0.15)]"
                        >
                            EMPEZAR <TrendingUp className="w-3.5 h-3.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
