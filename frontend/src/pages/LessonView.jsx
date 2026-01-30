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
    Image as ImageIcon,
    Download,
    Link as LinkIcon,
    HelpCircle,
    ClipboardList,
    Upload,
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
    const [contents, setContents] = useState([]);
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
            const [lessonRes, contentRes] = await Promise.all([
                axios.get(`${API_URL}/lessons/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/content/lesson/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (lessonRes.data.success) {
                setLesson(lessonRes.data.lesson);
                setProgress(lessonRes.data.progress);
                setNavigation(lessonRes.data.navigation);
            }
            if (contentRes.data.success) {
                setContents(contentRes.data.contents);
            }

        } catch (error) {
            const errorData = error.response?.data;
            if (error.response?.status === 403) {
                toast.error(errorData.message || 'Esta lección está bloqueada');
                navigate(`/modules/${errorData.moduleId || ''}`);
            } else {
                toast.error('Error al cargar la lección');
                navigate('/modules');
            }
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
                toast.success(`¡Lección completada! +${response.data.pointsAwarded || 0} puntos`);
                fetchLessonData(); // Refresh to show completion status
            }
        } catch (error) {
            toast.error('Error al marcar como completada');
        } finally {
            setCompleting(false);
        }
    };

    const renderContentItem = (item) => {
        let data = item.data || {};

        // Safety check: if data is a string, try to parse it (sometimes happens with double serialization)
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error("Error parsing content data:", e);
            }
        }

        // Deep safety check: if data.text is also stringified JSON
        if (data.text && typeof data.text === 'string' && data.text.startsWith('{"')) {
            try {
                const inner = JSON.parse(data.text);
                if (inner.text) data.text = inner.text;
            } catch (e) { }
        }

        switch (item.content_type) {
            case 'text':
                return (
                    <div className="card p-8 md:p-10 prose prose-invert prose-slate max-w-none bg-slate-800/30 border-white/5 shadow-inner">
                        <div dangerouslySetInnerHTML={{ __html: data.text }} />

                        {/* Static Tip for aesthetics if text is long */}
                        {data.text && data.text.length > 500 && (
                            <div className="mt-8 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 flex gap-4 items-start not-prose">
                                <Shield className="w-6 h-6 text-primary-400 flex-shrink-0" />
                                <div>
                                    <h5 className="text-primary-400 font-bold text-xs uppercase tracking-wider mb-1">Nota de Aprendizaje</h5>
                                    <p className="text-gray-400 text-sm">Recuerda tomar apuntes de los conceptos clave de esta sección.</p>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'video':
                const videoSrc = data.file_url
                    ? `${API_URL.replace('/api', '')}${data.file_url}`
                    : (data.url?.replace('watch?v=', 'embed/') || '');

                return (
                    <div className="space-y-4">
                        <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl border border-white/5 ring-1 ring-white/10 group">
                            {videoSrc ? (
                                <iframe
                                    src={videoSrc}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title={item.title}
                                ></iframe>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-900">
                                    <PlayCircle className="w-20 h-20 text-gray-700" />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Video no disponible</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <PlayCircle className="w-5 h-5 text-blue-400" />
                                {item.title}
                            </h3>
                            {item.points > 0 && <span className="text-xs font-black text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">+{item.points} PTS</span>}
                        </div>
                    </div>
                );

            case 'image':
                const imgSrc = data.file_url
                    ? `${API_URL.replace('/api', '')}${data.file_url}`
                    : data.url;

                return (
                    <div className="space-y-4">
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                            <img src={imgSrc} alt={item.title} className="w-full h-auto max-h-[600px] object-contain mx-auto" />
                        </div>
                        <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 flex gap-4 items-center">
                            <ImageIcon className="w-6 h-6 text-purple-400" />
                            <div>
                                <h4 className="text-white font-bold text-sm">{item.title}</h4>
                                <p className="text-gray-500 text-xs">Imagen de referencia</p>
                            </div>
                        </div>
                    </div>
                );

            case 'file':
                const fileLink = data.file_url ? `${API_URL.replace('/api', '')}${data.file_url}` : '#';
                return (
                    <a href={fileLink} target="_blank" rel="noopener noreferrer" className="block group">
                        <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800 hover:border-primary-500/40 transition-all">
                            <div className="w-14 h-14 rounded-xl bg-slate-900 flex items-center justify-center text-orange-400 shadow-inner group-hover:scale-110 transition-transform">
                                <FileText className="w-7 h-7" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{item.title}</h4>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    {data.original_name || 'Documento adjunto'}
                                    {data.size && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{(data.size / 1024 / 1024).toFixed(2)} MB</span>}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                <Download className="w-5 h-5" />
                            </div>
                        </div>
                    </a>
                );

            case 'link':
                return (
                    <a href={data.url} target="_blank" rel="noopener noreferrer" className="block group">
                        <div className="flex items-center gap-4 p-5 rounded-2xl bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-all">
                            <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                                <LinkIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold">{item.title}</h4>
                                <p className="text-sm text-green-400/70 truncate">{data.url}</p>
                            </div>
                            <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider group-hover:bg-green-500 group-hover:text-white transition-colors">
                                Visitar
                            </div>
                        </div>
                    </a>
                );

            case 'quiz':
            case 'survey':
            case 'assignment':
                const iconMap = {
                    quiz: <HelpCircle className="w-8 h-8 text-red-400" />,
                    survey: <ClipboardList className="w-8 h-8 text-yellow-400" />,
                    assignment: <Upload className="w-8 h-8 text-pink-400" />
                };
                const colorMap = {
                    quiz: 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10',
                    survey: 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10',
                    assignment: 'border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10'
                };

                return (
                    <div className={`p-8 rounded-2xl border ${colorMap[item.content_type]} transition-all flex flex-col md:flex-row items-center gap-6 text-center md:text-left`}>
                        <div className="p-4 bg-slate-900/50 rounded-2xl shadow-lg">
                            {iconMap[item.content_type]}
                        </div>
                        <div className="flex-1 space-y-2">
                            <h3 className="text-xl font-bold text-white">{item.title}</h3>
                            <p className="text-gray-400">{data.description || 'Completa esta actividad para continuar.'}</p>
                            {item.points > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-lg text-xs font-bold text-gray-300 border border-white/10">
                                    <Award className="w-3 h-3 text-yellow-500" />
                                    <span>Vale <span className="text-white">{item.points} puntos</span></span>
                                </div>
                            )}
                        </div>
                        <button className="btn-secondary px-8">
                            Iniciar Actividad
                        </button>
                    </div>
                );

            default:
                return null;
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
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
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
                        {contents.length} Items de Contenido
                    </span>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> {lesson.duration_minutes} min
                    </span>
                </div>
            </div>

            {/* Title Header */}
            <div className="pb-6 border-b border-white/5">
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
                    {lesson.title}
                </h1>
                <p className="text-lg text-gray-400 font-medium max-w-2xl">
                    Sigue el contenido en orden. Algunos elementos pueden ser obligatorios para completar la lección.
                </p>
            </div>

            {/* Dynamic Content List */}
            <div className="space-y-12">
                {contents.length > 0 ? (
                    contents.map((item, index) => (
                        <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                            {/* Optional: Show label for each section */}
                            {contents.length > 1 && (
                                <div className="mb-4 flex items-center gap-2 opacity-50">
                                    <span className="text-[10px] uppercase font-black tracking-widest text-primary-400">Parte {index + 1}</span>
                                    <div className="h-px bg-white/20 flex-1"></div>
                                </div>
                            )}
                            {renderContentItem(item)}
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-slate-800/30 rounded-3xl border border-white/5 border-dashed">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">Sin contenido aún</h3>
                        <p className="text-gray-500 text-sm max-w-md mx-auto">Esta lección no tiene material agregado. Por favor contacta al administrador o verifica más tarde.</p>
                    </div>
                )}
            </div>

            {/* Legacy Content (Fallback if no dynamic content but legacy fields exist) */}
            {contents.length === 0 && (
                <div className="card p-8 md:p-12 prose prose-invert prose-slate max-w-none bg-slate-800/20 border-white/5">
                    {lesson.video_url && (
                        <div className="mb-8 aspect-video rounded-xl overflow-hidden">
                            <iframe src={lesson.video_url.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen></iframe>
                        </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
            )}

            {/* Completion Section */}
            <div className="flex flex-col items-center gap-8 py-10 border-t border-white/5 mt-10">
                {progress?.status === 'completed' ? (
                    <div className="flex flex-col items-center gap-4 animate-scale-in">
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border-4 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <div className="text-center space-y-4">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Lección Completada</h3>
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 rounded-full border border-green-500/20 mt-2">
                                    <Award className="w-4 h-4 text-green-500" />
                                    <span className="text-green-400 text-xs font-black uppercase tracking-widest">
                                        Recompensa obtenida: {progress?.points_earned || 0} PTS
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/modules/${lesson.module_id}`)}
                                className="px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all border border-white/10 hover:border-white/20 flex items-center gap-2 mx-auto"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver al Módulo
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-md text-center space-y-6">
                        <p className="text-gray-400 text-sm">
                            ¿Has revisado todo el material? Marca la lección como terminada para continuar.
                        </p>
                        <button
                            onClick={handleComplete}
                            disabled={completing}
                            className="w-full group relative px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {completing ? (
                                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>Marcar como finalizada <CheckCircle className="w-5 h-5" /></>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-secondary-500 to-primary-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                        </button>
                    </div>
                )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-6">
                <button
                    disabled={!navigation.prev}
                    onClick={() => navigate(`/lessons/${navigation.prev}`)}
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-primary-500/10 text-primary-400 border-primary-500/30 transition-all disabled:opacity-20 disabled:pointer-events-none group w-full md:w-auto"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <div className="text-left hidden md:block">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Anterior</p>
                        <p className="text-sm font-bold">Lección Previa</p>
                    </div>
                </button>

                <button
                    disabled={!navigation.next}
                    onClick={() => navigate(`/lessons/${navigation.next}`)}
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-primary-500/10 text-primary-400 border-primary-500/30 transition-all disabled:opacity-20 disabled:pointer-events-none group w-full md:w-auto"
                >
                    <div className="text-right hidden md:block">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Siguiente</p>
                        <p className="text-sm font-bold">Próximo Contenido</p>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
