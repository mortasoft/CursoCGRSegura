import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSoundStore } from '../store/soundStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useLessonView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, user, updateUser, viewAsStudent } = useAuthStore();
    const { playSound } = useSoundStore();
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
    const [uploadingAssignment, setUploadingAssignment] = useState(null);
    const [completionError, setCompletionError] = useState(null);

    const playAlert = () => {
        playSound('/sounds/alert.mp3');
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

                if (lessonRes.data.badgeAwarded) {
                    useNotificationStore.getState().setPendingBadge(lessonRes.data.badgeAwarded);
                }
            }
            if (contentRes.data.success) {
                const fetchedContents = contentRes.data.contents;
                setContents(fetchedContents);

                // Sincronizar estados locales de visualización
                const watched = new Set();
                const visited = new Set();
                fetchedContents.forEach(item => {
                    if (item.isCompleted) {
                        if (item.content_type === 'video') watched.add(item.id);
                        if (item.content_type === 'link') visited.add(item.id);
                    }
                });
                setWatchedVideos(watched);
                setVisitedLinks(visited);
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
        const toastId = 'lesson-completion-toast';
        try {
            setCompleting(true);
            setCompletionError(null);
            toast.loading('Finalizando lección...', { id: toastId });

            const response = await axios.post(`${API_URL}/lessons/${id}/complete`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                playAlert();
                toast.success(`LECCIÓN COMPLETADA! +${response.data.pointsAwarded || 0} PUNTOS`, { id: toastId });

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

                if (response.data.badgeAwarded) {
                    useNotificationStore.getState().setPendingBadge(response.data.badgeAwarded);
                }

                await fetchLessonData(true);
            }
        } catch (error) {
            console.error('Completion error:', error);
            playAlert();
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Error al completar lección';
            setCompletionError(errorMsg);
            toast.error(errorMsg, { id: toastId });
        } finally {
            setCompleting(false);
        }
    };

    const markVideoAsWatched = async (videoId) => {
        if (watchedVideos.has(videoId)) return;
        
        try {
            await axios.post(`${API_URL}/content/${videoId}/trace`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setWatchedVideos(prev => {
                const next = new Set(prev);
                next.add(videoId);
                return next;
            });
            playAlert();
            toast.success("¡Video completado!");
        } catch (error) {
            console.error('Error marking video as watched:', error);
        }
    };

    const markLinkAsVisited = async (linkId) => {
        if (visitedLinks.has(linkId)) return;

        try {
            await axios.post(`${API_URL}/content/${linkId}/trace`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setVisitedLinks(prev => {
                const next = new Set(prev);
                next.add(linkId);
                return next;
            });
        } catch (error) {
            console.error('Error marking link as visited:', error);
        }
    };

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

    const handleAssignmentUpload = async (contentId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingAssignment(contentId);
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${API_URL}/content/assignment/${contentId}/submit`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success('Tarea enviada exitosamente');
                fetchLessonData(true);
            }
        } catch (error) {
            console.error('Error uploading assignment:', error);
            toast.error(error.response?.data?.error || 'Error al enviar tarea');
        } finally {
            setUploadingAssignment(null);
            e.target.value = null;
        }
    };

    useEffect(() => {
        setWatchedVideos(new Set());
        setVisitedLinks(new Set());
        fetchLessonData();
        window.scrollTo(0, 0);

        if (!window.YT) {
            window.onYouTubeIframeAPIReady = () => setYtApiLoaded(true);
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.getElementsByTagName('script')[0].parentNode.insertBefore(tag, document.getElementsByTagName('script')[0]);
        } else {
            setYtApiLoaded(true);
        }
    }, [id]);

    return {
        id,
        lesson,
        contents,
        progress,
        moduleLessons,
        navigation,
        loading,
        completing,
        watchedVideos,
        visitedLinks,
        ytApiLoaded,
        uploadingAssignment,
        completionError,
        user,
        viewAsStudent,
        navigate,
        handleComplete,
        markVideoAsWatched,
        markLinkAsVisited,
        handleResourceDownload,
        handleAssignmentUpload
    };
}
