import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    PlayCircle,
    FileText,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Clock,
    ArrowLeft,
    Shield,
    Maximize,
    Volume2,
    Settings,
    Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LessonView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [lesson, setLesson] = useState(null);
    const [progress, setProgress] = useState(null);
    const [navigation, setNavigation] = useState({ prev: null, next: null });
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);

    useEffect(() => {
        fetchLessonData();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchLessonData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/lessons/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setLesson(response.data.lesson);
                setProgress(response.data.progress);
                setNavigation(response.data.navigation);
            }
        } catch (error) {
            toast.error('Error al cargar la lección');
            navigate('/modules');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        try {
            setCompleting(true);
            const response = await axios.post(`${API_URL}/lessons/${id}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success(`¡Lección completada! +${response.data.pointsAwarded} puntos`);
                fetchLessonData();
            }
        } catch (error) {
            toast.error('Error al marcar como completada');
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Preparando material educativo...</p>
            </div>
        );
    }

    if (!lesson) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Link
                    to={`/modules/${lesson.module_id}`}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group w-fit"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {lesson.module_title}
                </Link>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                        {lesson.lesson_type === 'video' ? 'Video-Lección' : 'Lectura Técnica'}
                    </span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {lesson.duration_minutes} min
                    </span>
                </div>
            </div>

            {/* Title */}
            <div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                    {lesson.title}
                </h1>
            </div>

            {/* Content Area */}
            <div className="space-y-8">
                {/* Media Player / Container */}
                {lesson.lesson_type === 'video' ? (
                    <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5 group">
                        {lesson.video_url ? (
                            <iframe
                                src={lesson.video_url.replace('watch?v=', 'embed/')}
                                className="w-full h-full"
                                allowFullScreen
                                title={lesson.title}
                            ></iframe>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-900">
                                <PlayCircle className="w-20 h-20 text-gray-700" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Video no disponible en este momento</p>
                            </div>
                        )}

                        {/* Custom Player HUD (Simulated for aesthetics) */}
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <PlayCircle className="w-6 h-6 text-white" />
                                    <div className="w-48 h-1 bg-white/20 rounded-full relative overflow-hidden">
                                        <div className="absolute top-0 left-0 h-full w-1/3 bg-secondary-500"></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-white uppercase">12:45 / 35:00</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Volume2 className="w-5 h-5 text-white" />
                                    <Settings className="w-5 h-5 text-white" />
                                    <Maximize className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card p-8 md:p-12 prose prose-invert prose-slate max-w-none bg-slate-800/20 border-white/5">
                        <div dangerouslySetInnerHTML={{ __html: lesson.content }}></div>

                        {/* Case Study / Note box if text */}
                        <div className="mt-12 p-6 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex gap-6 items-start">
                            <Shield className="w-8 h-8 text-primary-400 flex-shrink-0" />
                            <div className="space-y-2">
                                <h4 className="text-primary-400 font-black uppercase tracking-tight text-sm">Nota de Seguridad Institucional</h4>
                                <p className="text-gray-300 text-sm leading-relaxed font-medium">
                                    Recuerde que esta información es de carácter sensible. La aplicación de estos protocolos es de cumplimiento obligatorio según la normativa R-DC-00069-2025.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completion & Feedback Section */}
                <div className="flex flex-col items-center gap-6 py-6">
                    {progress?.status === 'completed' ? (
                        <div className="flex flex-col items-center gap-4 animate-scale-in">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Lección Completada</h3>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Has ganado 10 puntos de experiencia</p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleComplete}
                            disabled={completing}
                            className="group relative px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {completing ? (
                                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>Marcar como finalizada <Award className="w-5 h-5" /></>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        </button>
                    )}
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <button
                    disabled={!navigation.prev}
                    onClick={() => navigate(`/lessons/${navigation.prev}`)}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-800/40 text-gray-500 hover:text-white hover:bg-slate-800 transition-all border border-white/5 disabled:opacity-20 disabled:pointer-events-none group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <div className="text-left">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Anterior</p>
                        <p className="text-xs font-bold">Lección Previa</p>
                    </div>
                </button>

                <button
                    disabled={!navigation.next}
                    onClick={() => navigate(`/lessons/${navigation.next}`)}
                    className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-800/40 text-gray-500 hover:text-white hover:bg-slate-800 transition-all border border-white/5 disabled:opacity-20 disabled:pointer-events-none group"
                >
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Siguiente</p>
                        <p className="text-xs font-bold">Próximo Contenido</p>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-secondary-500" />
                </button>
            </div>
        </div>
    );
}
