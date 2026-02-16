import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useModuleStore } from '../store/moduleStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
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
    Trophy,
    Zap,
    Award,
    AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import CyberCat from '../components/CyberCat';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ModuleDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { fetchModule } = useModuleStore();
    const { user, viewAsStudent, token } = useAuthStore();
    const { setPendingModuleCompletion, setPendingBadge } = useNotificationStore();
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(location.state?.error || null);

    const handleResourceDownload = async (resource) => {
        try {
            const response = await axios.post(`${API_URL}/resources/${resource.id}/track-download`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                if (response.data.badgeAwarded) {
                    setPendingBadge(response.data.badgeAwarded);
                } else {
                    // Feedback sutil de que la descarga fue registrada
                    toast.success('Descarga registrada en tu progreso', {
                        duration: 2000,
                        icon: '✅',
                        style: {
                            fontSize: '12px',
                            padding: '8px 16px'
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error tracking download:', error);
        }
    };

    useEffect(() => {
        const loadModule = async () => {
            const data = await fetchModule(id);
            if (data.success) {
                const releaseDate = data.module.release_date ? new Date(data.module.release_date) : null;
                const isAdminView = user?.role === 'admin' && !viewAsStudent;
                const isDateLocked = releaseDate && releaseDate > new Date() && !isAdminView;

                if (isDateLocked) {
                    const formattedDate = releaseDate.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
                    toast.error(`Este módulo estará disponible el ${formattedDate}`, {
                        id: `locked-${id}`,
                        icon: '🔒'
                    });
                    navigate('/modules');
                    return;
                }
                setModule(data.module);
            } else {
                setError(data.error || 'Módulo no encontrado');
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

    const isPrerequisiteLocked = !!module?.is_locked && user?.role !== 'admin' && !viewAsStudent;

    if (error === 'Módulo bloqueado' || (isPrerequisiteLocked && error === 'Módulo bloqueado')) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-6">
                    <CyberCat className="w-full h-full" variant="panic" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{error}</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {module?.lock_message || 'Debes completar el módulo anterior antes de poder acceder a este contenido.'}
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setError(null)} className="btn-secondary">
                        Ver previsualización
                    </button>
                    <button onClick={() => navigate('/modules')} className="btn-primary">
                        Volver al catálogo
                    </button>
                </div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="text-center py-20 animate-fade-in">
                <div className="w-24 h-24 mx-auto mb-6">
                    <CyberCat className="w-full h-full" variant="normal" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{error || 'Módulo no encontrado'}</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    El contenido solicitado no está disponible en este momento.
                </p>
                <button onClick={() => navigate('/modules')} className="btn-primary">
                    Volver al catálogo
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header / Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-800/40 border border-white/5 shadow-2xl">
                {/* Imagen de Fondo (Banner) */}
                {module.image_url ? (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={module.image_url}
                            alt=""
                            className="w-full h-full object-cover opacity-20"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0d1127] via-[#0d1127]/60 to-transparent"></div>
                    </div>
                ) : (
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-500/10 to-transparent"></div>
                )}

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
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
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                                {module.title}
                            </h1>
                            <div className="flex items-center gap-2 text-primary-400 font-black uppercase tracking-widest text-xs">
                                <Clock className="w-3.5 h-3.5" />
                                {module.lessons.filter(l => !l.is_optional).reduce((acc, l) => acc + (l.duration_minutes || 0), 0)} min
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
                            onClick={() => {
                                if (isPrerequisiteLocked) {
                                    setError('Módulo bloqueado');
                                    return;
                                }
                                const nextLesson = module.lessons.find(l => l.status !== 'completed') || module.lessons[0];
                                if (nextLesson) navigate(`/lessons/${nextLesson.id}`);
                            }}
                            className="btn-secondary w-full py-4 text-sm font-black uppercase tracking-widest shadow-[0_10px_30px_rgba(229,123,60,0.3)] mb-3"
                        >
                            {module.completionPercentage === 100 ? 'Repasar Módulo' : module.completionPercentage > 0 ? 'Continuar Módulo' : 'Empezar Módulo'}
                        </button>

                        {/* Celebration Button for Completed Modules */}
                        {module.completionPercentage === 100 && (
                            <button
                                onClick={() => {
                                    useNotificationStore.getState().setPendingModuleCompletion({
                                        moduleId: module.id,
                                        bonusPoints: module.points_to_earn || 0,
                                        generatesCertificate: !!module.generates_certificate
                                    });
                                }}
                                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-green-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                            >
                                <Trophy className="w-4 h-4 text-yellow-300 group-hover:scale-110 transition-transform" />
                                ¡Ver Celebración!
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Lessons List */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                        Contenido del Módulo
                    </h2>

                    {module.lessons.some(l => l.is_optional) && (
                        <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 items-center">
                            <AlertTriangle className="w-5 h-5 text-indigo-400 opacity-60 flex-shrink-0" />
                            <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Las <span className="text-indigo-400">actividades opcionales</span> brindan puntos extra y conocimiento complementario, pero no bloquean el progreso del curso.
                            </p>
                        </div>
                    )}

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
                                        : !!lesson.is_optional
                                            ? 'bg-indigo-500/5 border-dashed border-indigo-500/30 hover:border-indigo-500/50'
                                            : lesson.status === 'completed'
                                                ? 'border-green-500/20 bg-green-500/5 cursor-pointer'
                                                : 'bg-slate-800/20 border-white/5 hover:border-primary-500/40 hover:bg-slate-800/40 cursor-pointer'
                                        }`}
                                    onClick={() => {
                                        if (isLocked) return;
                                        if (isPrerequisiteLocked) {
                                            setError('Módulo bloqueado');
                                            return;
                                        }
                                        navigate(`/lessons/${lesson.id}`);
                                    }}
                                >
                                    {!!lesson.is_optional && (
                                        <div className="absolute top-0 right-10 mt-[-12px]">
                                            <span className="bg-gradient-to-r from-indigo-600 to-primary-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_5px_15px_rgba(79,70,229,0.4)] flex items-center gap-2 border border-white/10">
                                                <Zap className="w-3 h-3 fill-white" /> Actividad Opcional
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isLocked
                                            ? 'bg-slate-900 text-gray-700'
                                            : lesson.status === 'completed'
                                                ? 'bg-green-500/20 text-green-500'
                                                : 'bg-slate-900 text-gray-500 group-hover:text-primary-400'
                                            }`}>
                                            {isLocked ? (
                                                <Lock className="w-6 h-6" />
                                            ) : (
                                                lesson.lesson_type === 'video' ? <PlayCircle className="w-6 h-6 text-blue-500" /> :
                                                    (lesson.lesson_type === 'interactive' || lesson.lesson_type === 'h5p') ? <Zap className="w-6 h-6 text-yellow-500" /> :
                                                        <FileText className="w-6 h-6 text-indigo-400" />
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                                    Lección {index + 1}
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

                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-1.5 text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">{lesson.duration_minutes} min</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-secondary-500">
                                                    <Award className="w-3 h-3" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">+{lesson.total_points || 0} Puntos</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-gray-500">
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
                                        onClick={() => handleResourceDownload(resource)}
                                        className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-primary-500/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all 
                                                ${resource.resource_type === 'drive'
                                                    ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                                    : 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
                                                {resource.resource_type === 'drive' ? (
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M7.71 3.502L1.15 14.782L4.44 20.492L11 9.212L7.71 3.502ZM9.73 14.782L6.44 20.492H19.56L22.85 14.782H9.73ZM12.91 9.212L16.2 3.502H9.71L6.42 9.212H12.91Z" />
                                                    </svg>
                                                ) : (
                                                    <FileText className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div className={`text-sm font-bold transition-colors uppercase tracking-tight 
                                                ${resource.resource_type === 'drive' ? 'text-white group-hover:text-blue-400' : 'text-white group-hover:text-red-400'}`}>
                                                {resource.title}
                                            </div>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-primary-400" />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm font-medium italic">No hay recursos adicionales para este módulo.</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
