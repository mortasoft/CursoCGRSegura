import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useModuleStore } from '../store/moduleStore';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import {
    BookOpen,
    Clock,
    ChevronRight,
    CheckCircle,
    Lock,
    Search,
    Calendar,
    BarChart3,
    Shield
} from 'lucide-react';
import { useState } from 'react';
import CyberCat from '../components/CyberCat';

export default function Modules() {
    const { modules, loading, fetchModules } = useModuleStore();
    const { user, viewAsStudent } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const filteredModules = modules.filter(module =>
        module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && modules.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium font-sans">Cargando catálogo de módulos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Master Hero Banner */}
            <div className="relative rounded-[2rem] overflow-hidden bg-slate-800/20 border border-white/5 shadow-2xl">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d1127] via-[#0d1127]/80 to-transparent"></div>
                </div>

                <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="space-y-4 max-w-2xl text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                            <Shield className="w-3.5 h-3.5" /> Programa de Capacitación 2026
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                            Ruta de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-500">Aprendizaje</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium leading-relaxed">
                            Domina la ciberseguridad y protege la información institucional a través de módulos interactivos diseñados para tu crecimiento profesional.
                        </p>
                    </div>

                </div>
            </div>

            {/* Módulos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredModules.length > 0 ?
                    filteredModules.map((module, index) => {
                        const releaseDate = module.release_date ? new Date(module.release_date) : null;
                        const isAdminView = user?.role === 'admin' && !viewAsStudent;
                        const isDateLocked = releaseDate && releaseDate > new Date() && !isAdminView;
                        const isPrerequisiteLocked = !!module.is_locked && !isAdminView;
                        const isLocked = isDateLocked || isPrerequisiteLocked;
                        const isPrerequisite = isPrerequisiteLocked;

                        const formattedDate = releaseDate
                            ? releaseDate.toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })
                            : module.month;

                        return (
                            <div key={module.id} className="relative">
                                <Link
                                    to={isLocked ? '#' : `/modules/${module.id}`}
                                    onClick={(e) => isLocked && e.preventDefault()}
                                    className={`group relative flex flex-col bg-slate-800/20 border border-white/5 rounded-[1.5rem] overflow-hidden transition-all duration-500 ${isLocked || isPrerequisite
                                        ? 'grayscale-[0.5] opacity-80'
                                        : module.completionPercentage === 100
                                            ? 'bg-green-500/[0.03] border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.08)] hover:border-green-500/50'
                                            : 'hover:bg-slate-800/40 hover:border-primary-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2'
                                        } ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {/* Imagen del Banner */}
                                    <div className="h-32 w-full relative overflow-hidden">
                                        {module.image_url ? (
                                            <img
                                                src={module.image_url}
                                                alt={module.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-slate-800/40 to-slate-900/40 flex items-center justify-center">
                                                <BookOpen className="w-12 h-12 text-slate-700/50" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                                    </div>

                                    {/* Accent line top */}
                                    <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isLocked ? 'from-gray-600 to-gray-400' : 'from-primary-500 to-secondary-500'} opacity-60 z-20`}></div>

                                    <div className="p-6 space-y-4">
                                        {/* Badge and Number */}
                                        <div className="flex justify-between items-start">
                                            <div className={`w-14 h-14 bg-slate-900 rounded-2xl border flex items-center justify-center text-2xl font-black transition-all shadow-2xl ${module.completionPercentage === 100
                                                ? 'border-green-500/30 text-green-500 shadow-green-500/10'
                                                : 'border-white/10 text-white group-hover:text-secondary-500'
                                                }`}>
                                                {module.module_number < 10 ? `0${module.module_number}` : module.module_number}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`badge ${isLocked ? 'bg-slate-700 text-gray-400 border-gray-600' : 'badge-primary bg-primary-500/10 border-primary-500/20 text-primary-400'} py-1 px-3 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5`}>
                                                    {isLocked ? <Lock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                                    {formattedDate}
                                                </span>
                                                {module.completionPercentage === 100 && (
                                                    <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-lg text-green-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Completado
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-3">
                                            <h3 className={`text-xl font-bold text-white ${!isLocked && 'group-hover:text-primary-400'} transition-colors leading-tight min-h-[3rem]`}>
                                                {module.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed font-medium">
                                                {module.description}
                                            </p>
                                        </div>

                                        {/* Stats Footer */}
                                        <div className="pt-6 border-t border-white/5 space-y-4">
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
                                                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden mr-6">
                                                            <div
                                                                className={`h-full transition-all duration-700 ${module.completionPercentage === 100
                                                                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]'
                                                                    : 'bg-gradient-to-r from-primary-500 to-secondary-500'
                                                                    }`}
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
                    })
                    : (
                        <div className="col-span-full py-24 text-center">
                            <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-white/10">
                                <Search className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No se encontraron resultados</h3>
                            <p className="text-gray-500">Intenta ajustar los términos de búsqueda.</p>
                        </div>
                    )}
            </div>

            {/* Banner de Certificación (Empty state o CTA) */}

        </div>
    );
}
