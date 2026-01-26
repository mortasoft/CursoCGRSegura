import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    CheckCircle2,
    XCircle,
    Clock,
    Award,
    ChevronRight,
    ChevronLeft,
    AlertTriangle,
    Shield,
    RotateCcw,
    ArrowLeft,
    FileText,
    Target
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function QuizView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: optionId }
    const [results, setResults] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [startTime] = useState(Date.now());

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
                setQuizData(response.data);
            }
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al cargar la evaluación';
            toast.error(msg);
            if (error.response?.status === 403) {
                // Navegar de vuelta si ya no tiene intentos
                navigate(-1);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (questionId, optionId) => {
        if (results) return; // Prevent change after submit
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = async () => {
        // Verificar que todas las preguntas tengan respuesta
        if (Object.keys(answers).length < quizData.questions.length) {
            toast.error('Por favor responda todas las preguntas antes de enviar.');
            return;
        }

        try {
            setSubmitting(true);
            const timeSpent = Math.round((Date.now() - startTime) / 60000);
            const response = await axios.post(`${API_URL}/quizzes/${id}/submit`, {
                answers,
                timeSpent
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setResults(response.data);
                toast.success(response.data.passed ? '¡Felicidades! Has aprobado.' : 'No has alcanzado la nota mínima.');
                window.scrollTo(0, 0);
            }
        } catch (error) {
            toast.error('Error al enviar la evaluación');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Cargando evaluación institucional...</p>
            </div>
        );
    }

    if (!quizData) return null;

    const { quiz, questions } = quizData;
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    // View: Results
    if (results) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                <div className={`card overflow-hidden border-t-8 ${results.passed ? 'border-green-500 bg-green-500/5' : 'border-red-500 bg-red-500/5'}`}>
                    <div className="p-10 text-center space-y-6">
                        <div className="flex justify-center">
                            {results.passed ? (
                                <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 ring-8 ring-green-500/10">
                                    <Award className="w-12 h-12" />
                                </div>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 ring-8 ring-red-500/10">
                                    <XCircle className="w-12 h-12" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-white uppercase tracking-tight">
                                {results.passed ? 'Evaluación Aprobada' : 'Resultado Insuficiente'}
                            </h1>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                                Has obtenido un <span className={results.passed ? 'text-green-500' : 'text-red-500'}>{results.score.toFixed(1)}%</span>
                            </p>
                        </div>

                        {results.pointsAwarded > 0 && (
                            <div className="inline-flex items-center gap-2 px-6 py-2 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-500 font-black text-sm animate-bounce">
                                <Star className="w-4 h-4 fill-secondary-500" /> +{results.pointsAwarded} PUNTOS DE EXPERIENCIA
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                <p className="text-2xl font-black text-white">{results.earnedPoints}/{results.totalPoints}</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Puntos</p>
                            </div>
                            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                <p className="text-2xl font-black text-white">{quiz.passing_score}%</p>
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Requerido</p>
                            </div>
                        </div>

                        <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate(`/modules/${quiz.module_id}`)}
                                className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
                            >
                                Volver al Módulo
                            </button>
                            {!results.passed && (
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-10 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" /> Reintentar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Question Feedback */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary-400" /> Revisión de Respuestas
                    </h2>
                    {questions.map((q, idx) => {
                        const feedback = results.feedback.find(f => f.questionId === q.id);
                        return (
                            <div key={q.id} className={`card p-6 border-l-4 ${feedback.isCorrect ? 'border-green-500/50' : 'border-red-500/50'}`}>
                                <div className="flex gap-4">
                                    <span className="text-lg font-black text-gray-700">{(idx + 1).toString().padStart(2, '0')}</span>
                                    <div className="space-y-4 flex-1">
                                        <p className="text-white font-bold leading-tight">{q.question_text}</p>

                                        <div className="grid gap-2">
                                            {q.options.map(opt => {
                                                const isUserAnswer = answers[q.id] === opt.id;
                                                const isCorrect = opt.id === feedback.correctOptionId;

                                                let bgColor = 'bg-slate-900/30 text-gray-400 border-white/5';
                                                if (isCorrect) bgColor = 'bg-green-500/10 text-green-400 border-green-500/30';
                                                else if (isUserAnswer && !isCorrect) bgColor = 'bg-red-500/10 text-red-400 border-red-500/30';

                                                return (
                                                    <div key={opt.id} className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${bgColor}`}>
                                                        {opt.option_text}
                                                        {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                                                        {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4" />}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="p-4 bg-slate-900 rounded-xl border border-white/5 space-y-1">
                                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Explicación del CISO</p>
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">{feedback.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // View: Taking Quiz
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Salir de la evaluación
                    </button>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">{quiz.title}</h1>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pregunta</p>
                        <p className="text-xl font-black text-white">{currentQuestionIndex + 1} <span className="text-gray-600">/ {questions.length}</span></p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,74,153,0.5)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Question Card */}
            <div className="card p-8 md:p-12 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-full blur-2xl"></div>

                <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-secondary-500" />
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Cuestionamiento Institucional</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                        {currentQuestion.question_text}
                    </h2>
                </div>

                <div className="grid gap-4 mt-12 relative z-10">
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                            className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-200 group flex items-center justify-between ${answers[currentQuestion.id] === option.id
                                    ? 'bg-primary-500/10 border-primary-500 text-white shadow-[0_0_30px_rgba(56,74,153,0.2)]'
                                    : 'bg-slate-900/50 border-white/5 text-gray-400 hover:border-white/10 hover:bg-slate-900 group'
                                }`}
                        >
                            <span className="font-bold">{option.option_text}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentQuestion.id] === option.id
                                    ? 'border-primary-400 bg-primary-400'
                                    : 'border-gray-700'
                                }`}>
                                {answers[currentQuestion.id] === option.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-6 py-3 text-sm font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors disabled:opacity-0"
                >
                    <ChevronLeft className="w-5 h-5" /> Anterior
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                    >
                        {submitting ? 'Calificando...' : 'Finalizar Evaluación'}
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            if (!answers[currentQuestion.id]) {
                                toast.error('Selecciona una opción antes de continuar');
                                return;
                            }
                            setCurrentQuestionIndex(prev => prev + 1);
                        }}
                        className="flex items-center gap-2 px-10 py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 hover:bg-slate-700 transition-all group"
                    >
                        Siguiente <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            {/* Security Disclaimer */}
            <div className="flex items-center gap-4 p-6 bg-slate-900/30 rounded-3xl border border-dashed border-white/5 opacity-50">
                <Shield className="w-8 h-8 text-gray-700" />
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest leading-relaxed">
                    Esta evaluación es de cumplimiento obligatorio para la certificación anual. Sus respuestas son confidenciales y utilizadas únicamente con fines educativos y estadísticos para la mejora de la postura de seguridad institucional.
                </p>
            </div>
        </div>
    );
}
