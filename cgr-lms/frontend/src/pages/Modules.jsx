import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useModuleStore } from '../store/moduleStore';
import { useAuthStore } from '../store/authStore';
import {
    BookOpen,
    Clock,
    ChevronRight,
    CheckCircle,
    Lock,
    Search,
    Calendar,
    BarChart3
} from 'lucide-react';
import { useState } from 'react';

export default function Modules() {
    const { modules, loading, fetchModules } = useModuleStore();
    const { user } = useAuthStore();
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
        <div className="space-y-10 animate-fade-in">
            {/* Header section con buscador integrado */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Ruta de Aprendizaje</h1>

                </div>

                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-secondary-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar módulo..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-800/40 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 focus:border-secondary-500/50 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Módulos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredModules.length > 0 ?
                    filteredModules.map((module, index) => {
                        const releaseDate = module.release_date ? new Date(module.release_date) : null;
                        const isAdmin = user?.role === 'admin';
                        const isLocked = releaseDate && releaseDate > new Date() && !isAdmin;
                        const formattedDate = releaseDate
                            ? releaseDate.toLocaleDateString('es-CR', { day: 'numeric', month: 'long' })
                            : module.month;

                        return (
                            <div key={module.id} className="relative">
                                <Link
                                    to={isLocked ? '#' : `/modules/${module.id}`}
                                    onClick={(e) => isLocked && e.preventDefault()}
                                    className={`group relative flex flex-col bg-slate-800/20 border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-500 ${isLocked
                                        ? 'cursor-not-allowed grayscale-[0.5] opacity-80'
                                        : 'hover:bg-slate-800/40 hover:border-primary-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2'
                                        }`}
                                >
                                    {/* Accent line top */}
                                    <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${isLocked ? 'from-gray-600 to-gray-400' : 'from-primary-500 to-secondary-500'} opacity-60`}></div>

                                    <div className="p-8 space-y-6">
                                        {/* Badge and Number */}
                                        <div className="flex justify-between items-start">
                                            <div className={`w-14 h-14 bg-slate-900 rounded-2xl border border-white/10 flex items-center justify-center text-2xl font-black text-white ${!isLocked && 'group-hover:text-secondary-500'} transition-colors shadow-2xl`}>
                                                {module.module_number < 10 ? `0${module.module_number}` : module.module_number}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`badge ${isLocked ? 'bg-slate-700 text-gray-400 border-gray-600' : 'badge-primary bg-primary-500/10 border-primary-500/20 text-primary-400'} py-1 px-3 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5`}>
                                                    {isLocked ? <Lock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                                                    {formattedDate}
                                                </span>
                                                {module.completionPercentage === 100 && (
                                                    <div className="flex items-center gap-1 text-green-500 text-[10px] font-black uppercase tracking-tighter">
                                                        <CheckCircle className="w-3 h-3" /> Completado
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
                                                    <div className="w-full py-2 flex items-center justify-center gap-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                                                        Disponible próximamente
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden mr-6">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-700"
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
            <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-primary-900/40 via-slate-900 to-secondary-900/10 border border-white/5 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <BarChart3 className="w-48 h-48 text-white" />
                </div>
                <div className="relative z-10 max-w-2xl space-y-4">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter">¿Listo para el examen final?</h4>
                    <p className="text-gray-400 font-medium leading-relaxed">
                        Completa todos los módulos mensuales para desbloquear tu certificado institucional de Ciberseguridad CGR 2026.
                    </p>
                    <div className="pt-4 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                    <img src={`https://ui-avatars.com/api/?name=User+${i}&background=384A99&color=fff`} alt="user" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">+120 funcionarios certificados hoy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
