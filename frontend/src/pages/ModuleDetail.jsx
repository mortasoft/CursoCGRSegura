import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useModuleStore } from '../store/moduleStore';
import { useAuthStore } from '../store/authStore';
import {
    PlayCircle,
    FileText,
    HelpCircle,
    CheckCircle,
    Clock,
    ChevronRight,
    ArrowLeft,
    Download,
    Lock,
    ExternalLink,
    Trophy
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ModuleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchModule } = useModuleStore();
    const { user } = useAuthStore();
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadModule = async () => {
            const data = await fetchModule(id);
            if (data.success) {
                const releaseDate = data.module.release_date ? new Date(data.module.release_date) : null;
                const isAdmin = user?.role === 'admin';
                const isLocked = releaseDate && releaseDate > new Date() && !isAdmin;

                if (isLocked) {
                    const formattedDate = releaseDate.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
                    toast.error(`Este módulo estará disponible el ${formattedDate}`, {
                        id: `locked-${id}`,
                        icon: '🔒'
                    });
                    navigate('/modules');
                    return;
                }
                setModule(data.module);
            }
            setLoading(false);
        };
        loadModule();
    }, [id, fetchModule, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Cargando detalles del módulo...</p>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-4">Módulo no encontrado</h2>
                <button onClick={() => navigate('/modules')} className="btn-primary">
                    Volver al catálogo
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header / Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-800/40 border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/10 to-transparent"></div>

                <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                        <button
                            onClick={() => navigate('/modules')}
                            className="flex items-center gap-2 text-primary-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al catálogo
                        </button>

                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-500 text-[10px] font-black uppercase tracking-widest">
                                Módulo {module.module_number} • {module.month}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                                {module.title}
                            </h1>
                            <p className="text-gray-400 text-lg leading-relaxed max-w-2xl font-medium">
                                {module.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-primary-400 border border-white/5">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Duración</p>
                                    <p className="text-white font-bold">{module.duration_minutes || module.lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0)} min</p>
                                </div>
                            </div>
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
                            onClick={() => {
                                const nextLesson = module.lessons.find(l => l.status !== 'completed') || module.lessons[0];
                                if (nextLesson) navigate(`/lessons/${nextLesson.id}`);
                            }}
                            className="btn-secondary w-full py-4 text-sm font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(229,123,60,0.3)]"
                        >
                            {module.completionPercentage === 100 ? 'Repasar Módulo' : module.completionPercentage > 0 ? 'Continuar Módulo' : 'Empezar Módulo'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Lessons List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                        Contenido del Módulo
                    </h2>

                    <div className="space-y-4">
                        {module.lessons.map((lesson, index) => {
                            // Check if this lesson is locked
                            // A lesson is locked if any previous mandatory lesson is not completed
                            const previousMandatoryLessons = module.lessons.slice(0, index).filter(l => !l.is_optional);
                            const isLocked = previousMandatoryLessons.some(l => l.status !== 'completed') && user?.role !== 'admin';

                            return (
                                <div
                                    key={lesson.id}
                                    className={`group relative p-6 rounded-2xl border transition-all duration-300 ${isLocked
                                        ? 'bg-slate-900/40 border-white/5 opacity-60 cursor-not-allowed'
                                        : lesson.status === 'completed'
                                            ? 'border-green-500/20 bg-green-500/5 cursor-pointer'
                                            : 'bg-slate-800/20 border-white/5 hover:border-primary-500/40 hover:bg-slate-800/40 cursor-pointer'
                                        }`}
                                    onClick={() => !isLocked && navigate(`/lessons/${lesson.id}`)}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isLocked
                                            ? 'bg-slate-900 text-gray-700'
                                            : lesson.status === 'completed'
                                                ? 'bg-green-500/20 text-green-500'
                                                : 'bg-slate-900 text-gray-500 group-hover:text-primary-400'
                                            }`}>
                                            {isLocked ? <Lock className="w-6 h-6" /> : (lesson.lesson_type === 'video' ? <PlayCircle className="w-6 h-6" /> : <FileText className="w-6 h-6" />)}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                                    Lección {index + 1} {lesson.is_optional && <span className="text-secondary-500 ml-1">• Opcional</span>}
                                                </span>
                                                {lesson.status === 'completed' && (
                                                    <span className="flex items-center gap-1 text-green-500 text-[9px] font-black uppercase tracking-tighter bg-green-500/10 px-2 py-0.5 rounded-full">
                                                        <CheckCircle className="w-3 h-3" /> Completada
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`font-bold transition-colors ${isLocked ? 'text-gray-600' : 'text-white group-hover:text-primary-400'}`}>
                                                {lesson.title}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-4 text-gray-500">
                                            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                                                <Clock className="w-4 h-4" /> {lesson.duration_minutes} min
                                            </span>
                                            {!isLocked && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Quizzes */}
                        {module.quizzes && module.quizzes.map((quiz) => {
                            const mandatoryLessonsIncomplete = module.lessons.some(l => !l.is_optional && l.status !== 'completed');
                            const isQuizLocked = mandatoryLessonsIncomplete && user?.role !== 'admin';

                            return (
                                <div
                                    key={quiz.id}
                                    className={`group relative p-6 rounded-2xl border transition-all duration-300 ${isQuizLocked
                                        ? 'bg-slate-900/40 border-white/5 opacity-60 cursor-not-allowed'
                                        : 'bg-secondary-500/5 border-secondary-500/20 hover:border-secondary-500/40 hover:bg-secondary-500/10 cursor-pointer'
                                        }`}
                                    onClick={() => {
                                        if (isQuizLocked) {
                                            toast.error('Debes completar todas las lecciones obligatorias para realizar el examen final.');
                                            return;
                                        }
                                        navigate(`/quizzes/${quiz.id}`);
                                    }}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isQuizLocked ? 'bg-slate-900 text-gray-700' : 'bg-secondary-900/30 text-secondary-500'
                                            }`}>
                                            {isQuizLocked ? <Lock className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isQuizLocked ? 'text-gray-600' : 'text-secondary-500'}`}>Evaluación Final</span>
                                                {quiz.best_score >= (quiz.passing_score || 70) && (
                                                    <span className="flex items-center gap-1 text-green-500 text-[9px] font-black uppercase tracking-tighter bg-green-500/10 px-2 py-0.5 rounded-full">
                                                        <CheckCircle className="w-3 h-3" /> Aprobado
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className={`font-bold ${isQuizLocked ? 'text-gray-600' : 'text-white'}`}>
                                                {quiz.title}
                                            </h3>
                                        </div>
                                        {!isQuizLocked && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-secondary-500" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar: Resources and Info */}
            <div className="space-y-8">
                {/* Resources Card */}
                <div className="card bg-slate-800/40 p-8 space-y-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Download className="w-5 h-5 text-primary-400" />
                        Recursos
                    </h3>
                    {module.resources && module.resources.length > 0 ? (
                        <div className="space-y-3">
                            {module.resources.map((resource) => (
                                <a
                                    key={resource.id}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-primary-500/30 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{resource.type || 'PDF'}</div>
                                        <div className="text-sm font-medium text-white group-hover:text-primary-400">{resource.title}</div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-primary-400" />
                                </a>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm font-medium italic">No hay recursos adicionales para este módulo.</p>
                    )}
                </div>

                {/* Support Card */}
                <div className="card bg-gradient-to-br from-primary-600/10 to-transparent p-8 border-primary-500/20">
                    <Lock className="w-10 h-10 text-primary-500 mb-4" />
                    <h4 className="text-white font-black uppercase tracking-tight mb-2">Canales de Soporte</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
                        Si tienes dudas sobre el contenido técnico, contacta al equipo de Ciberseguridad Institucional.
                    </p>
                    <button className="w-full py-3 rounded-xl border border-primary-500/30 text-primary-400 text-xs font-black uppercase tracking-widest hover:bg-primary-500/10 transition-all">
                        Enviar Consulta
                    </button>
                </div>
            </div>
        </div>
    );
}
