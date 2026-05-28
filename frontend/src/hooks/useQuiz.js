import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useSoundStore } from '../store/soundStore';
import { useNotificationStore } from '../store/notificationStore';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export function useQuiz() {
    const { id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isReviewMode = queryParams.get('review') === 'true';

    const navigate = useNavigate();
    const { token, updateUser } = useAuthStore();
    const { playSound } = useSoundStore();

    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [isReplaySession, setIsReplaySession] = useState(false);
    const [sessionSeed, setSessionSeed] = useState(() => Math.floor(Math.random() * 1000));
    const [startTime, setStartTime] = useState(null);

    // Limpiar estado previo del localStorage al montar en modo normal (reintento)
    useEffect(() => {
        if (!isReviewMode) {
            localStorage.removeItem(`quiz_answers_${id}`);
            localStorage.removeItem(`quiz_index_${id}`);
            localStorage.removeItem(`quiz_start_${id}`);
            localStorage.removeItem(`quiz_seed_${id}`);
            localStorage.removeItem(`quiz_intro_${id}`);
        }
    }, [id, isReviewMode]);


    useEffect(() => {
        localStorage.setItem(`quiz_answers_${id}`, JSON.stringify(answers));
    }, [answers, id]);

    useEffect(() => {
        localStorage.setItem(`quiz_index_${id}`, currentQuestionIndex.toString());
    }, [currentQuestionIndex, id]);

    useEffect(() => {
        localStorage.setItem(`quiz_seed_${id}`, sessionSeed.toString());
    }, [sessionSeed, id]);

    useEffect(() => {
        if (quizData && quizData.questions) {
            let hasChanged = false;
            setAnswers(prev => {
                const newAnswers = { ...prev };
                quizData.questions.forEach(q => {
                    if (q.question_type === 'video' && !newAnswers[q.id]) {
                        newAnswers[q.id] = true;
                        hasChanged = true;
                    }
                });
                return hasChanged ? newAnswers : prev;
            });
        }
    }, [quizData, currentQuestionIndex]);

    useEffect(() => {
        fetchQuiz();
    }, [id]);

    const fetchQuiz = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/quizzes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                let data = response.data;
                if (data.quiz.randomize_options) {
                    data.questions = data.questions.map(q => ({
                        ...q,
                        options: [...q.options].sort(() => Math.random() - 0.5)
                    }));
                }
                setQuizData(data);

                if (isReviewMode) {
                    await fetchLastAttempt();
                }
            }
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al cargar la evaluación';
            toast.error(msg);
            if (error.response?.status === 403) {
                await fetchLastAttempt();
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchLastAttempt = async () => {
        try {
            const lastAttemptRes = await axios.get(`${API_URL}/quizzes/${id}/last-attempt`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (lastAttemptRes.data.success) {
                setResults(lastAttemptRes.data.results);
                setAnswers(lastAttemptRes.data.results.answers || {});
            }
        } catch (err) {
            if (!isReviewMode) navigate(-1);
        }
    };

    const handleStart = () => {
        const now = Date.now();
        const newSeed = Math.floor(Math.random() * 1000);
        setStartTime(now);
        setSessionSeed(newSeed);
        setShowIntro(false);
        localStorage.setItem(`quiz_start_${id}`, now.toString());
        localStorage.setItem(`quiz_seed_${id}`, newSeed.toString());
        localStorage.setItem(`quiz_intro_${id}`, 'false');
    };

    const handleReplay = () => {
        const newSeed = Math.floor(Math.random() * 1000);
        setResults(null);
        
        // Pre-populate video questions in the new empty answers object
        const initialAnswers = {};
        if (quizData && quizData.questions) {
            quizData.questions.forEach(q => {
                if (q.question_type === 'video') {
                    initialAnswers[q.id] = true;
                }
            });
        }
        setAnswers(initialAnswers);
        
        setCurrentQuestionIndex(0);
        setShowIntro(false);
        setIsReplaySession(true);
        setSessionSeed(newSeed);
        setStartTime(Date.now());
        localStorage.setItem(`quiz_seed_${id}`, newSeed.toString());
        window.scrollTo(0, 0);
    };

    const handleRetry = () => {
        setResults(null);
        
        // Pre-populate video questions in the new empty answers object
        const initialAnswers = {};
        if (quizData && quizData.questions) {
            quizData.questions.forEach(q => {
                if (q.question_type === 'video') {
                    initialAnswers[q.id] = true;
                }
            });
        }
        setAnswers(initialAnswers);
        
        setCurrentQuestionIndex(0);
        setShowIntro(true);
        setIsReplaySession(false); // New official attempt
        
        localStorage.removeItem(`quiz_answers_${id}`);
        localStorage.removeItem(`quiz_index_${id}`);
        localStorage.removeItem(`quiz_start_${id}`);
        
        navigate(`/quizzes/${id}`, { replace: true });
    };

    const handleOptionSelect = (questionId, optionId) => {
        if (results) return;
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const nextQuestion = () => {
        const currentQuestion = quizData.questions[currentQuestionIndex];
        if (!answers[currentQuestion.id]) {
            toast.error('Selecciona una opción antes de continuar', { id: 'quiz-answer-required' });
            return;
        }
        playSound('/sounds/next.mp3');
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const prevQuestion = () => {
        setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < quizData.questions.length) {
            toast.error('Por favor responda todas las preguntas antes de enviar.', { id: 'quiz-submit-incomplete' });
            return;
        }

        try {
            setSubmitting(true);
            const timeSpent = Math.round((Date.now() - (startTime || Date.now())) / 60000);
            const response = await axios.post(`${API_URL}/quizzes/${id}/submit`, {
                answers,
                timeSpent,
                is_replay: isReplaySession
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                if (response.data.earnedPoints === undefined && response.data.passed && !isReplaySession) {
                    await fetchLastAttempt();
                } else {
                    setResults(response.data);
                }

                if (!isReplaySession) {
                    localStorage.removeItem(`quiz_answers_${id}`);
                    localStorage.removeItem(`quiz_index_${id}`);
                    localStorage.removeItem(`quiz_start_${id}`);
                    localStorage.removeItem(`quiz_seed_${id}`);
                }

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

                if (response.data.passed) {
                    playSound('/sounds/winner.mp3');
                    if (isReplaySession) {
                        toast.success('¡Muy bien! Has completado el repaso.', { id: 'quiz-result' });
                    } else {
                        toast.success('¡Felicidades! Has aprobado.', { id: 'quiz-result' });
                    }
                } else {
                    toast.error('No has alcanzado la nota mínima.', { id: 'quiz-result' });
                    if (!isReplaySession) {
                        localStorage.removeItem(`quiz_intro_${id}`);
                    }
                }

                window.scrollTo(0, 0);
            }
        } catch (error) {
            toast.error('Error al enviar la evaluación');
        } finally {
            setSubmitting(false);
        }
    };

    return {
        quizData,
        loading,
        currentQuestionIndex,
        answers,
        results,
        submitting,
        showIntro,
        sessionSeed,
        handleStart,
        handleReplay,
        handleRetry,
        handleOptionSelect,
        nextQuestion,
        prevQuestion,
        handleSubmit,
        id,
        navigate
    };
}
