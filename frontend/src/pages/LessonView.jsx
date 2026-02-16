import { useState, useEffect, useRef } from 'react';
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
    Award,
    BookOpen,
    Zap,
    Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotificationStore } from '../store/notificationStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LessonView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user, updateUser, viewAsStudent } = useAuthStore();
    const [lesson, setLesson] = useState(null);
    const [contents, setContents] = useState([]);
    const [progress, setProgress] = useState(null);
    const [moduleLessons, setModuleLessons] = useState([]);
    const [navigation, setNavigation] = useState({ prev: null, next: null });
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [watchedVideos, setWatchedVideos] = useState(new Set());
    const [visitedLinks, setVisitedLinks] = useState(new Set());
    const [ytApiLoaded, setYtApiLoaded] = useState(!!window.YT);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    const handleResourceDownload = async (resourceId, title) => {
        try {
            const response = await axios.post(`${API_URL}/resources/${resourceId}/track-download`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success && response.data.badgeAwarded) {
                const badge = response.data.badgeAwarded;
                toast.success(
                    <div className="flex flex-col gap-1">
                        <p className="font-black text-secondary-500 uppercase tracking-widest text-[10px]">¡Nueva Insignia Ganada!</p>
                        <p className="font-bold text-white tracking-tight">{badge.name}</p>
                    </div>,
                    {
                        duration: 6000,
                        icon: '🏆',
                        style: {
                            border: '1px solid rgba(229, 123, 60, 0.4)',
                            background: '#0d1127'
                        }
                    }
                );
            }
        } catch (error) {
            console.error('Error tracking download:', error);
        }
    };

    useEffect(() => {
        setWatchedVideos(new Set());
        setVisitedLinks(new Set());
        fetchLessonData();
        window.scrollTo(0, 0);

        if (!window.YT) {
            // Define global callback
            window.onYouTubeIframeAPIReady = () => {
                setYtApiLoaded(true);
            };

            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            setYtApiLoaded(true);
        }

        return () => {
            // Optional cleanup if needed
        };
    }, [id]);

    // YouTube Player Component
    const YouTubePlayer = ({ id, videoId, onEnded }) => {
        const playerRef = useRef(null);

        useEffect(() => {
            if (!ytApiLoaded || !videoId) return;

            let player;
            const initPlayer = () => {
                player = new window.YT.Player(`yt-player-${id}`, {
                    videoId: videoId,
                    width: '100%',
                    height: '100%',
                    playerVars: {
                        'rel': 0,
                        'modestbranding': 1
                    },
                    events: {
                        'onStateChange': (event) => {
                            if (event.data === window.YT.PlayerState.ENDED) {
                                onEnded();
                            }
                        }
                    }
                });
                playerRef.current = player;
            };

            // Small delay to ensure container is ready in DOM
            const timer = setTimeout(initPlayer, 100);
            return () => {
                clearTimeout(timer);
                if (player && player.destroy) player.destroy();
            };
        }, [videoId, ytApiLoaded]);

        return (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <div id={`yt-player-${id}`} className="w-full h-full"></div>
                {!ytApiLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-all animate-pulse">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Cargando YouTube...</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const playAlert = () => {
        const audio = new Audio('/alert.mp3');
        audio.play().catch(e => console.log('Audio play blocked:', e));
    };

    const markVideoAsWatched = (videoId) => {
        setWatchedVideos(prev => {
            const next = new Set(prev);
            next.add(videoId);
            return next;
        });
        playAlert();
        toast.success("¡Video completado!");
    };

    const markLinkAsVisited = (linkId) => {
        setVisitedLinks(prev => {
            const next = new Set(prev);
            next.add(linkId);
            return next;
        });
    };

    // Helper to init YouTube player for a specific element
    const initYTPlayer = (elementId, videoId, contentItemId) => {
        if (!window.YT || !window.YT.Player) return;

        new window.YT.Player(elementId, {
            videoId: videoId,
            events: {
                'onStateChange': (event) => {
                    if (event.data === window.YT.PlayerState.ENDED) {
                        markVideoAsWatched(contentItemId);
                    }
                }
            }
        });
    };

    const fetchLessonData = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const [lessonRes, contentRes] = await Promise.all([
                axios.get(`${API_URL}/lessons/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/content/lesson/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (lessonRes.data.success) {
                setLesson(lessonRes.data.lesson);
                setProgress(lessonRes.data.progress);
                setNavigation(lessonRes.data.navigation);
                setModuleLessons(lessonRes.data.moduleLessons || []);
            }
            if (contentRes.data.success) {
                setContents(contentRes.data.contents);
            }

        } catch (error) {
            const errorData = error.response?.data;
            if (error.response?.status === 403) {
                playAlert();
                navigate(`/modules/${errorData.moduleId || ''}`, { state: { error: 'Módulo bloqueado' } });
            } else {
                playAlert();
                toast.error('Error al cargar la lección');
                navigate('/modules');
            }
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleComplete = async () => {
        try {
            setCompleting(true);
            const response = await axios.post(`${API_URL}/lessons/${id}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                playAlert();
                toast.success(`Lección completada! +${response.data.pointsAwarded || 0} puntos`);

                // Actualizar stats globales en el store
                if (response.data.newBalance !== undefined) {
                    updateUser({
                        points: response.data.newBalance,
                        level: response.data.newLevel
                    });
                }

                if (response.data.levelUp) {
                    useNotificationStore.getState().setPendingLevelUp(response.data.levelData);
                }

                if (response.data.moduleCompleted) {
                    useNotificationStore.getState().setPendingModuleCompletion({
                        moduleId: response.data.moduleData.id,
                        bonusPoints: response.data.moduleData.bonusPoints,
                        generatesCertificate: response.data.moduleData.generatesCertificate
                    });
                }

                await fetchLessonData(true); // Silent refresh
            }
        } catch (error) {
            console.error('Completion error:', error);
            playAlert();
            toast.error(error.response?.data?.message || 'Error al marcar como completada');
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
                    <div className="card p-5 md:p-7 prose prose-invert prose-slate max-w-none bg-slate-800/30 border-white/5 shadow-inner">
                        <div dangerouslySetInnerHTML={{ __html: data.text }} />
                    </div>
                );

            case 'video':
                const isYT = !!data.url?.includes('youtube.com') || !!data.url?.includes('youtu.be');
                const ytId = isYT ? (data.url.split('v=')[1]?.split('&')[0] || data.url.split('/').pop()) : null;
                const videoSrc = data.file_url ? `${API_URL.replace('/api', '')}${data.file_url}` : null;
                const isWatched = watchedVideos.has(item.id);

                return (
                    <div className="space-y-4">
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5 ring-1 ring-white/10 group">
                            {isYT ? (
                                <YouTubePlayer
                                    id={item.id}
                                    videoId={ytId}
                                    onEnded={() => markVideoAsWatched(item.id)}
                                />
                            ) : videoSrc ? (
                                <video
                                    src={videoSrc}
                                    className="w-full h-full"
                                    controls
                                    onEnded={() => markVideoAsWatched(item.id)}
                                    controlsList="nodownload"
                                ></video>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-900">
                                    <PlayCircle className="w-20 h-20 text-gray-700" />
                                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Video no disponible</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center px-2">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <PlayCircle className={`w-5 h-5 ${isWatched ? 'text-green-500' : 'text-blue-400'}`} />
                                    {item.title}
                                </h3>
                                {item.is_required && !isWatched && (
                                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mt-1">
                                        Debes ver el video completo para finalizar
                                    </p>
                                )}
                                {isWatched && (
                                    <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Video visualizado
                                    </p>
                                )}
                            </div>
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
                    <a
                        href={fileLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                        onClick={() => handleResourceDownload(item.id, item.title)}
                    >
                        <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800 hover:border-red-500/40 transition-all">
                            <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)] group-hover:scale-110 transition-transform border border-red-500/20">
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
                const isVisited = visitedLinks.has(item.id);
                return (
                    <a
                        href={data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                        onClick={() => markLinkAsVisited(item.id)}
                    >
                        <div className={`flex items-center gap-4 p-5 rounded-2xl transition-all ${isVisited
                            ? 'bg-green-500/10 border-green-500/30 shadow-inner'
                            : 'bg-green-500/5 border-green-500/10'
                            } hover:bg-green-500/10 hover:border-green-500/30`}>
                            <div className={`p-3 rounded-lg transition-colors ${isVisited ? 'bg-green-500/30 text-green-400' : 'bg-green-500/20 text-green-400'}`}>
                                <LinkIcon className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold flex items-center gap-2 truncate">
                                    {item.title}
                                    {isVisited && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                                </h4>
                                <p className="text-sm text-green-400/70 truncate">{data.url}</p>
                                {item.is_required && !isVisited && (
                                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mt-1">
                                        Debes visitar este enlace para finalizar
                                    </p>
                                )}
                            </div>
                            <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isVisited
                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                                : 'bg-green-500/20 text-green-400 group-hover:bg-green-500 group-hover:text-white'
                                }`}>
                                {isVisited ? 'Visitado' : 'Visitar'}
                            </div>
                        </div>
                    </a>
                );

            case 'heading':
                return (
                    <div className="py-8 border-b border-white/5 mb-6">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-4">
                            <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
                            {data.text || 'Sin Título'}
                            <span className="flex-1 h-px bg-white/5"></span>
                        </h2>
                    </div>
                );

            case 'note':
                return (
                    <div className="p-6 rounded-2xl bg-primary-500/5 border border-primary-500/10 flex gap-5 items-start animate-fade-in shadow-[inset_0_0_20px_rgba(59,130,246,0.02)]">
                        <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400 flex-shrink-0 shadow-lg border border-primary-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-primary-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">{item.title || 'Nota de Aprendizaje'}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                {data.text || 'Recuerda tomar apuntes de los conceptos clave de esta sección.'}
                            </p>
                        </div>
                    </div>
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
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4 min-h-screen animate-fade-in pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
                {/* Sidebar Menu */}
                <aside className="lg:col-span-3 xl:col-span-3">
                    <div className="lg:sticky lg:top-20 space-y-4">
                        {/* Module Header / Back Link */}
                        <div className="card bg-slate-800/20 border-white/5 p-3 md:p-4 mb-3">
                            <Link
                                to={`/modules/${lesson.module_id}`}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group mb-2"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Módulo
                            </Link>

                            <h2 className="text-xl font-black text-white leading-tight mb-2 uppercase tracking-tighter">
                                {lesson.module_title}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                                    {moduleLessons.length} LECCIONES
                                </span>
                                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary-500 transition-all duration-500"
                                        style={{ width: `${moduleLessons.length > 0 ? Math.round((moduleLessons.filter(l => l.status === 'completed').length / moduleLessons.length) * 100) : 0}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-primary-400">
                                    {moduleLessons.length > 0 ? Math.round((moduleLessons.filter(l => l.status === 'completed').length / moduleLessons.length) * 100) : 0}%
                                </span>
                            </div>
                        </div>

                        {/* Lessons List Navigation */}
                        <nav className="card bg-slate-900/40 p-2 border-white/5 shadow-2xl border-dashed">
                            <div className="p-2 border-b border-white/5 mb-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Ruta de Aprendizaje</p>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                {moduleLessons.map((ml, index) => {
                                    const isCurrent = parseInt(ml.id) === parseInt(id);
                                    const isCompleted = ml.status === 'completed';
                                    const previousMandatoryLessons = moduleLessons.slice(0, index).filter(l => !l.is_optional);
                                    const isLocked = previousMandatoryLessons.some(l => l.status !== 'completed') && (user?.role !== 'admin' || viewAsStudent);

                                    return (
                                        <button
                                            key={ml.id}
                                            onClick={() => !isLocked && navigate(`/lessons/${ml.id}`)}
                                            disabled={isLocked}
                                            className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 group
                                                ${isCurrent
                                                    ? 'bg-primary-500/10 border border-primary-500/20 shadow-lg'
                                                    : isLocked
                                                        ? 'opacity-40 cursor-not-allowed border border-transparent'
                                                        : 'hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            <div className="relative mt-0.5 flex-shrink-0">
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border
                                                    ${isCompleted
                                                        ? 'bg-green-500/10 border-green-500/30 text-green-500 shadow-sm shadow-green-500/10'
                                                        : isCurrent
                                                            ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20'
                                                            : isLocked
                                                                ? 'bg-slate-900 border-white/5 text-gray-700'
                                                                : 'bg-slate-800 border-white/10 text-gray-400 group-hover:border-primary-500/30 group-hover:text-primary-400'
                                                    }`}
                                                >
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-4 h-4" />
                                                    ) : isLocked ? (
                                                        <Lock className="w-3.5 h-3.5" />
                                                    ) : (
                                                        ml.lesson_type === 'video' ? <PlayCircle className="w-4 h-4" /> :
                                                            (ml.lesson_type === 'interactive' || ml.lesson_type === 'h5p') ? <Zap className="w-4 h-4" /> :
                                                                <FileText className="w-4 h-4" />
                                                    )}
                                                </div>
                                                {!isCompleted && isCurrent && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-[#0f172a] animate-pulse"></div>
                                                )}
                                            </div>

                                            <div className="text-left flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-0">
                                                    <p className={`text-[9px] font-black uppercase tracking-widest
                                                        ${isCurrent ? 'text-primary-400' : 'text-gray-500'}`}>
                                                        L{index + 1}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {isCompleted && (
                                                            <span className="flex items-center gap-1 text-green-500 text-[8px] font-black uppercase tracking-tighter bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                                                Completada
                                                            </span>
                                                        )}
                                                        {!ml.is_published && user?.role === 'admin' && (
                                                            <span className="flex items-center gap-1 text-orange-500 text-[8px] font-black uppercase tracking-tighter bg-orange-500/10 px-1.5 py-0.5 rounded-full border border-orange-500/20">
                                                                <ImageIcon className="w-2.5 h-2.5" /> Borrador
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className={`text-xs font-bold leading-tight transition-colors line-clamp-2
                                                    ${isCurrent ? 'text-white' : isLocked ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'}
                                                     ${isCompleted ? 'text-gray-300' : ''}`}>
                                                    {ml.title}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                    {ml.is_optional ? (
                                                        <span className="text-[7px] font-black uppercase text-indigo-400 px-1.5 py-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-0.5">
                                                            Opcional
                                                        </span>
                                                    ) : (
                                                        <span className={`text-[7px] font-black uppercase px-1.5 py-0 rounded-full border flex items-center gap-0.5
                                                            ${isLocked ? 'bg-slate-900 border-white/5 text-gray-700' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                                            {isLocked && <Lock className="w-2 h-2" />} REQ
                                                        </span>
                                                    )}
                                                    <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                                        <Award className="w-2.5 h-2.5 text-secondary-500" /> {ml.total_points || 0}
                                                    </span>
                                                    {ml.duration_minutes > 0 && (
                                                        <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                                            <Clock className="w-2.5 h-2.5" /> {ml.duration_minutes}m
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-9 xl:col-span-9 space-y-6 animate-fade-in-up">
                    {/* Compact Breadcrumbs / Header Mobile Only */}
                    <div className="flex lg:hidden flex-col gap-4 mb-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5">
                                {contents.length} Items
                            </span>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> {lesson.duration_minutes}m
                                </span>
                                <span className="text-[10px] font-black text-secondary-500 uppercase tracking-widest bg-secondary-900/20 px-3 py-1 rounded-full border border-secondary-500/20 flex items-center gap-1.5 font-black">
                                    <Award className="w-3 h-3" /> {lesson.total_points || 0} PTS
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Header (Desktop Info) */}
                    <div className="hidden lg:flex items-center justify-between py-4 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                                <BookOpen className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <h4 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Lección Actual</h4>
                                <h1 className="text-2xl font-black text-white tracking-tight uppercase">{lesson.title}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Contenido</p>
                                <p className="text-sm font-bold text-white">{contents.length} elementos</p>
                            </div>
                            <div className="w-px h-8 bg-white/10 mx-2"></div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Recompensa</p>
                                <p className="text-sm font-bold text-secondary-400">{lesson.total_points || 0} PTS</p>
                            </div>
                        </div>
                    </div>

                    {/* Title Header (Mobile/Legacy) */}
                    <div className="lg:hidden pb-6 border-b border-white/5">
                        <h1 className="text-3xl font-black text-white tracking-tighter leading-tight mb-2 uppercase">
                            {lesson.title}
                        </h1>
                        <p className="text-sm text-gray-400 font-medium">
                            Sigue el contenido en orden. Algunos elementos pueden ser obligatorios.
                        </p>
                    </div>

                    {/* Dynamic Content List */}
                    {!!lesson.is_optional && (
                        <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4 items-center animate-fade-in mb-6 shadow-lg shadow-indigo-500/5">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0 border border-indigo-500/30">
                                <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
                            </div>
                            <div>
                                <h4 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-1">Lección Opcional</h4>
                                <p className="text-indigo-300/70 text-sm font-medium">
                                    Esta actividad es complementaria. Puedes completarla para ganar puntos extra, pero <span className="text-indigo-300 font-bold underline decoration-indigo-500/40">no es obligatoria</span> para finalizar el módulo o recibir tu certificado.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="space-y-4">
                        {contents.length > 0 ? (
                            contents.map((item, index) => (
                                <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    {renderContentItem(item)}
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-slate-800/30 rounded-3xl border border-white/5 border-dashed">
                                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <h3 className="text-white font-bold text-lg mb-2">Sin contenido aún</h3>
                                <p className="text-gray-500 text-sm max-w-md mx-auto">Esta lección no tiene material agregado aún.</p>
                            </div>
                        )}
                    </div>

                    {/* Completion Section */}
                    <div className="flex flex-col items-center gap-6 py-8 border-y border-white/5 my-6 bg-slate-900/20 rounded-3xl p-8">
                        {progress?.status === 'completed' ? (
                            <div className="flex flex-col items-center gap-4 animate-scale-in">
                                <div className="relative inline-block">
                                    <div className="absolute inset-0 bg-green-500/10 blur-[40px] rounded-full scale-110"></div>
                                    <svg viewBox="0 0 200 200" className="w-24 h-24 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-float">
                                        <path d="M50 60 L30 10 L80 40 Z" fill="#ffffff" />
                                        <path d="M150 60 L170 10 L120 40 Z" fill="#ffffff" />
                                        <path d="M55 55 L40 25 L75 42 Z" fill="#ffccd5" />
                                        <path d="M145 55 L160 25 L125 42 Z" fill="#ffccd5" />
                                        <circle cx="100" cy="100" r="70" fill="#ffffff" />
                                        <rect x="40" y="80" width="120" height="35" rx="10" fill="#1a2245" />
                                        <rect x="45" y="85" width="50" height="25" rx="5" fill="#22c55e" opacity="0.8">
                                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
                                        </rect>
                                        <rect x="105" y="85" width="50" height="25" rx="5" fill="#22c55e" opacity="0.8">
                                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.5s" />
                                        </rect>
                                        <path d="M40 97.5 Q20 97.5 30 97.5" stroke="#1a2245" strokeWidth="10" />
                                        <path d="M160 97.5 Q180 97.5 170 97.5" stroke="#1a2245" strokeWidth="10" />
                                        <path d="M90 125 Q100 135 110 125" stroke="#ffccd5" strokeWidth="3" fill="none" />
                                        <path d="M100 120 L100 115" stroke="#ffccd5" strokeWidth="2" />
                                        <circle cx="100" cy="118" r="4" fill="#ffccd5" />
                                        <line x1="30" y1="120" x2="60" y2="115" stroke="#f0f0f0" strokeWidth="1" />
                                        <line x1="30" y1="130" x2="60" y2="125" stroke="#f0f0f0" strokeWidth="1" />
                                        <line x1="170" y1="120" x2="140" y2="115" stroke="#f0f0f0" strokeWidth="1" />
                                        <line x1="170" y1="130" x2="140" y2="125" stroke="#f0f0f0" strokeWidth="1" />
                                        <path d="M40 155 Q100 140 160 155 L160 200 L40 200 Z" fill="#1a2245" />
                                        <path d="M100 150 L80 180 L120 180 Z" fill="#22c55e" opacity="0.2" />
                                    </svg>
                                </div>
                                <div className="text-center space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Lección Completada</h3>
                                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-green-500/10 rounded-full border border-green-500/20 mt-2">
                                            <Award className="w-5 h-5 text-green-500" />
                                            <span className="text-green-400 text-xs font-black uppercase tracking-widest">
                                                Recompensa obtenida: +{progress?.points_earned || 0} PTS
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full max-w-md text-center space-y-6">
                                {contents.filter(c =>
                                    (c.content_type === 'video' && c.is_required && !watchedVideos.has(c.id)) ||
                                    (c.content_type === 'link' && c.is_required && !visitedLinks.has(c.id))
                                ).length > 0 ? (
                                    <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4 animate-pulse">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                                            <Clock className="w-5 h-5 text-orange-400" />
                                        </div>
                                        <p className="text-orange-400 text-xs font-bold text-left">
                                            Debes revisar todo el contenido obligatorio (videos y enlaces) antes de poder finalizar esta lección.
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-400 text-sm font-medium">
                                        ¿Has revisado todo el material? Marca la lección como terminada para continuar con tu progreso.
                                    </p>
                                )}
                                <button
                                    onClick={handleComplete}
                                    disabled={completing || contents.filter(c =>
                                        (c.content_type === 'video' && c.is_required && !watchedVideos.has(c.id)) ||
                                        (c.content_type === 'link' && c.is_required && !visitedLinks.has(c.id))
                                    ).length > 0}
                                    className="w-full group relative px-12 py-5 bg-secondary-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 shadow-[0_15px_30px_rgba(249,115,22,0.3)] hover:shadow-[0_20px_40px_rgba(249,115,22,0.4)]"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        {completing ? (
                                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>Finalizar Lección <CheckCircle className="w-5 h-5" /></>
                                        )}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                        <button
                            disabled={!navigation.prev}
                            onClick={() => navigate(`/lessons/${navigation.prev}`)}
                            className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-slate-800/40 text-gray-400 border border-white/5 hover:border-white/10 hover:bg-slate-800 transition-all disabled:opacity-20 disabled:pointer-events-none group w-full sm:w-auto overflow-hidden relative"
                        >
                            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform relative z-10" />
                            <div className="text-left relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-50 leading-none mb-1">Anterior</p>
                                <p className="text-sm font-bold truncate max-w-[150px]">Lección Previa</p>
                            </div>
                        </button>

                        <button
                            disabled={!navigation.next}
                            onClick={() => navigate(`/lessons/${navigation.next}`)}
                            className="flex items-center gap-4 px-8 py-4 rounded-2xl bg-primary-500/10 text-primary-400 border border-primary-500/30 hover:bg-primary-500/20 transition-all disabled:opacity-20 disabled:pointer-events-none group w-full sm:w-auto relative"
                        >
                            <div className="text-right relative z-10">
                                <p className="text-[9px] font-black uppercase tracking-widest opacity-50 leading-none mb-1">Siguiente</p>
                                <p className="text-sm font-bold truncate max-w-[150px]">Próximo Contenido</p>
                            </div>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                        </button>
                    </div>
                </main>
            </div>
            {/* Custom Styles for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
