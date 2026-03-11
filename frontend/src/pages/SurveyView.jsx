import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useSoundStore } from '../store/soundStore';
import {
    ClipboardList,
    Star,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    ArrowLeft,
    MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotificationStore } from '../store/notificationStore';
import { QuizSkeleton } from '../components/skeletons/QuizSkeleton';
import CyberCat from '../components/CyberCat';

const PointsCounter = ({ target }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (target <= 0) return;
        let start = 0;
        const duration = 1000;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(timer);
    }, [target]);

    return <span>{count}</span>;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SurveyView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, updateUser } = useAuthStore();

    const [surveyData, setSurveyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
        const saved = localStorage.getItem(`survey_index_${id}`);
        return saved ? parseInt(saved) : 0;
    });
    const [answers, setAnswers] = useState(() => {
        const saved = localStorage.getItem(`survey_answers_${id}`);
        return saved ? JSON.parse(saved) : {};
    }); // { questionId: { text: '', optionId: null } }
    const [submitting, setSubmitting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [pointsEarned, setPointsEarned] = useState(0);
    const [showIntro, setShowIntro] = useState(() => {
        const saved = localStorage.getItem(`survey_intro_${id}`);
        return saved === 'false' ? false : true;
    });

    const handleStart = () => {
        setShowIntro(false);
        localStorage.setItem(`survey_intro_${id}`, 'false');
    };

    useEffect(() => {
        localStorage.setItem(`survey_answers_${id}`, JSON.stringify(answers));
    }, [answers, id]);

    useEffect(() => {
        localStorage.setItem(`survey_index_${id}`, currentQuestionIndex.toString());
    }, [currentQuestionIndex, id]);

    useEffect(() => {
        fetchSurvey();
    }, [id]);

    const { playSound } = useSoundStore();

    const playNextSound = () => {
        playSound('/sounds/next.mp3');
    };

    const fetchSurvey = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/surveys/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSurveyData(response.data);
                if (response.data.isCompleted) {
                    setCompleted(true);
                    setPointsEarned(response.data.survey.points || 0);
                }
            }
        } catch (error) {
            toast.error('Error al cargar la encuesta');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value, type) => {
        if (completed) return;

        let answerObj = { ...answers[questionId] };

        if (type === 'multiple_choice') {
            answerObj = { optionId: value };
        } else if (type === 'rating') {
            answerObj = { text: value.toString() }; // We store rating as text or we could add a numeric field, but text is fine.
        } else if (type === 'text') {
            answerObj = { text: value };
        }

        setAnswers(prev => ({ ...prev, [questionId]: answerObj }));
    };

    const handleSubmit = async () => {
        // Validation: Required questions
        const unansweredRequired = surveyData.questions.filter(q => q.is_required && !answers[q.id]);
        if (unansweredRequired.length > 0) {
            toast.error('Por favor responde las preguntas obligatorias.');
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.post(`${API_URL}/surveys/${id}/submit`, {
                answers
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setCompleted(true);
                setPointsEarned(response.data.pointsAwarded || 0);

                // Clear persistence
                localStorage.removeItem(`survey_answers_${id}`);
                localStorage.removeItem(`survey_index_${id}`);

                // Actualizar store global
                const currentUser = useAuthStore.getState().user;
                updateUser({
                    points: (currentUser?.points || 0) + (response.data.pointsAwarded || 0),
                    level: response.data.newLevel || currentUser?.level
                });

                toast.success('¡Gracias por tu retroalimentación!');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al enviar la encuesta');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <QuizSkeleton />;
    }

    if (!surveyData) return null;

    const { survey, questions } = surveyData;
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    if (completed) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
                <div className="card overflow-hidden border-t-8 border-yellow-500 bg-yellow-500/5">
                    <div className="p-6 md:p-8 text-center space-y-4">
                        <div className="flex justify-center -mt-2">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-yellow-500/10 flex items-center justify-center ring-[8px] ring-yellow-500/5 mb-4 backdrop-blur-md relative shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                                <CyberCat
                                    className="w-24 h-24 md:w-28 md:h-28 animate-float-subtle"
                                    variant="success"
                                    color="#eab308"
                                />
                                <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-500/5 blur-xl"></div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">¡Encuesta Completada!</h1>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs md:text-sm">
                                Tu retroalimentación es fundamental para mejorar la plataforma.
                            </p>
                        </div>

                        {pointsEarned > 0 && (
                            <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-500 font-black text-[11px] animate-bounce">
                                <Star className="w-3.5 h-3.5 fill-secondary-500" /> +<PointsCounter target={pointsEarned} /> Puntos
                            </div>
                        )}

                        <div className="pt-4 flex flex-col items-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-10 py-3.5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl"
                            >
                                Volver a la Lección
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showIntro) {
        return (
            <div className="w-full px-4 sm:px-6 lg:px-12 space-y-8 animate-fade-in py-10">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4" /> Cancelar y Volver
                        </button>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tight leading-none">
                            {survey.title}
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full"></div>
                    </div>

                    <div className="card p-10 space-y-8 border-yellow-500/20 shadow-2xl shadow-yellow-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-bl-full blur-3xl"></div>

                        <div className="relative z-10 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                                <ClipboardList className="w-4 h-4 text-yellow-500" />
                                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Instrucciones de la Encuesta</span>
                            </div>

                            <p className="text-gray-300 text-lg md:text-xl font-medium leading-relaxed italic border-l-4 border-yellow-500/40 pl-8 py-2">
                                {survey.description || 'Tu opinión es muy valiosa para nosotros. Por favor, tómate un momento para responder estas preguntas.'}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                <div className="flex items-center gap-4 text-gray-400">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                        <MessageSquare className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Puntos por Completar</p>
                                        <p className="text-lg font-bold text-white">{survey.points || 0} PTS</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-400">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                        <Star className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total de Preguntas</p>
                                        <p className="text-lg font-bold text-white">{questions.length} Ítems</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-4">
                        <button
                            onClick={handleStart}
                            className="px-12 py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-yellow-500/40 group flex items-center gap-3"
                        >
                            Iniciar Encuesta <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 sm:px-6 lg:px-12 space-y-4 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest mb-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Salir de la encuesta
                    </button>
                    <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{survey.title}</h1>
                </div>
                <div className="text-left md:text-right">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Pregunta</p>
                    <p className="text-lg md:text-xl font-black text-white">{currentQuestionIndex + 1} <span className="text-gray-600">/ {questions.length}</span></p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Question Card */}
            <div className="card px-4 md:px-8 py-3 md:py-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full blur-2xl"></div>

                <div className="space-y-3 relative z-10">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-yellow-500/10 rounded-full border border-yellow-500/20 self-start">
                            <ClipboardList className="w-3 h-3 text-yellow-500" />
                            <span className="text-[8px] font-black text-yellow-400 uppercase tracking-widest">Formulario de retroalimentación</span>
                        </div>
                    </div>

                    <h2 className="text-sm md:text-base font-bold text-white leading-relaxed tracking-tight">
                        {currentQuestion.question_text}
                        {currentQuestion.is_required && <span className="text-red-500 ml-1">*</span>}
                    </h2>
                </div>

                {/* Question Inputs */}
                <div className="mt-2 relative z-10">
                    {currentQuestion.question_type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {currentQuestion.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => handleAnswerChange(currentQuestion.id, option.id, 'multiple_choice')}
                                    className={`w-full p-4 md:p-6 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between ${answers[currentQuestion.id]?.optionId === option.id
                                        ? 'bg-yellow-500/10 border-yellow-500 text-white shadow-[0_0_30px_rgba(234,179,8,0.15)]'
                                        : 'bg-slate-900/50 border-white/5 text-gray-400 hover:border-white/10 hover:bg-slate-900'
                                        }`}
                                >
                                    <span className="text-sm md:text-base font-bold">{option.option_text}</span>
                                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentQuestion.id]?.optionId === option.id
                                        ? 'border-yellow-400 bg-yellow-400'
                                        : 'border-gray-700'
                                        }`}>
                                        {answers[currentQuestion.id]?.optionId === option.id && <div className="w-2 h-2 bg-black rounded-full"></div>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {currentQuestion.question_type === 'rating' && (
                        <div className="flex flex-col items-center gap-8 py-10">
                            <div className="flex gap-4">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => handleAnswerChange(currentQuestion.id, n, 'rating')}
                                        className={`w-14 h-14 md:w-20 md:h-20 rounded-2xl border-2 font-black text-xl md:text-3xl transition-all shadow-xl ${answers[currentQuestion.id]?.text === n.toString()
                                            ? 'bg-yellow-500 text-black border-yellow-400 scale-110'
                                            : 'bg-slate-900/50 border-white/5 text-gray-500 hover:border-yellow-500/50 hover:text-yellow-500'
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between w-full max-w-sm text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <span>Muy Insatisfecho</span>
                                <span>Muy Satisfecho</span>
                            </div>
                        </div>
                    )}

                    {currentQuestion.question_type === 'text' && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" /> Tu Comentario
                            </label>
                            <textarea
                                rows="6"
                                className="w-full bg-slate-900/50 border-2 border-white/5 rounded-2xl p-6 text-white placeholder:text-gray-700 focus:border-yellow-500/50 transition-all outline-none"
                                placeholder="Escribe aquí tu respuesta..."
                                value={answers[currentQuestion.id]?.text || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'text')}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Buttons - Normal Flow */}
            <div className="flex items-center justify-between py-6 mt-4 border-t border-white/5">
                <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-slate-700 hover:border-yellow-500/50 transition-all disabled:opacity-0"
                >
                    <ChevronLeft className="w-5 h-5" /> Anterior
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-10 py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/20 disabled:opacity-50"
                    >
                        {submitting ? 'Enviando...' : 'Finalizar Encuesta'}
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            if (currentQuestion.is_required && !answers[currentQuestion.id]) {
                                toast.error('Responde esta pregunta antes de continuar', { id: 'survey-answer-required' });
                                return;
                            }
                            playNextSound();
                            setCurrentQuestionIndex(prev => prev + 1);
                        }}
                        className="flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-yellow-500/20 group"
                    >
                        Siguiente <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
}
