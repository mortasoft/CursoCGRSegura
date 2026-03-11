import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Plus,
    Trash2,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    Save,
    Layout,
    HelpCircle,
    Target,
    MessageSquare,
    Image as ImageIcon,
    Shuffle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

export default function QuizEditorModal({ isOpen, onClose, quizId, moduleId, lessonId, title: initialTitle }) {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuizId, setCurrentQuizId] = useState(quizId);

    // Sync status and fetch data when opening/changing quiz id
    useEffect(() => {
        if (!isOpen) return;

        // Reset or use passed id
        setCurrentQuizId(quizId);

        if (quizId) {
            fetchQuizData(quizId);
        } else {
            // New quiz initialization
            setQuiz({
                title: initialTitle || 'Nuevo Quiz',
                description: '',
                passing_score: 80,
                max_attempts: 3,
                time_limit_minutes: 30,
                randomize_options: false
            });
            setQuestions([]);
        }
    }, [isOpen, quizId]);

    const fetchQuizData = async (idToFetch) => {
        const id = idToFetch || currentQuizId;
        if (!id) return;

        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/quizzes/${id}/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setQuiz(res.data.quiz);
                setQuestions(res.data.questions || []);
            }
        } catch (error) {
            toast.error('Error al cargar datos del quiz');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuiz = async () => {
        try {
            const res = await axios.post(`${API_URL}/quizzes`, {
                module_id: moduleId,
                lesson_id: lessonId,
                title: quiz.title,
                description: quiz.description,
                passing_score: quiz.passing_score,
                max_attempts: quiz.max_attempts,
                time_limit_minutes: quiz.time_limit_minutes,
                randomize_options: quiz.randomize_options
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                setCurrentQuizId(res.data.quizId);
                return res.data.quizId;
            }
        } catch (error) {
            toast.error('Error al crear el quiz base');
            return null;
        }
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            id: 'temp-' + Date.now(),
            question_text: '',
            question_type: 'multiple_choice',
            image_url: '',
            points: 1,
            explanation: '',
            options: [
                { id: 'opt-1', option_text: '', is_correct: true, order_index: 0 },
                { id: 'opt-2', option_text: '', is_correct: false, order_index: 1 }
            ],
            isNew: true
        };
        setQuestions([...questions, newQuestion]);
    };

    const handleRemoveQuestion = async (qId) => {
        if (typeof qId === 'string' && qId.startsWith('temp-')) {
            setQuestions(questions.filter(q => q.id !== qId));
            return;
        }

        if (!window.confirm('¿Seguro que deseas eliminar esta pregunta?')) return;

        try {
            const res = await axios.delete(`${API_URL}/quizzes/questions/${qId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setQuestions(questions.filter(q => q.id !== qId));
                toast.success('Pregunta eliminada');
            }
        } catch (error) {
            toast.error('Error al eliminar pregunta');
        }
    };

    const handleUpdateQuestion = (qId, field, value) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, [field]: value, isDirty: true } : q));
    };

    const handleUpdateOption = (qId, oId, field, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = q.options.map(o => {
                    if (o.id === oId) return { ...o, [field]: value };
                    if (field === 'is_correct' && value === true) return { ...o, is_correct: false };
                    return o;
                });
                return { ...q, options: newOptions, isDirty: true };
            }
            return q;
        }));
    };

    const handleAddOption = (qId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    options: [...q.options, { id: 'opt-' + Date.now(), option_text: '', is_correct: false, order_index: q.options.length }],
                    isDirty: true
                };
            }
            return q;
        }));
    };

    const handleRemoveOption = (qId, oId) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: q.options.filter(o => o.id !== oId), isDirty: true };
            }
            return q;
        }));
    };

    const handleSaveAll = async () => {
        let qId = currentQuizId;
        if (!qId) {
            qId = await handleCreateQuiz();
            if (!qId) return;
        }

        try {
            setLoading(true);
            // Update quiz basic info
            await axios.put(`${API_URL}/quizzes/${qId}`, quiz, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Save dirty or new questions
            for (let q of questions) {
                if (q.isNew) {
                    await axios.post(`${API_URL}/quizzes/${qId}/questions`, q, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else if (q.isDirty) {
                    await axios.put(`${API_URL}/quizzes/questions/${q.id}`, q, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }

            toast.success('Quiz guardado correctamente', { id: 'admin-quiz-save' });
            onClose(qId);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar algunos cambios');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden">
            <div className="card w-full max-w-5xl bg-[#0f172a] border-slate-700 p-0 flex flex-col max-h-[90vh] shadow-2xl animate-fade-in-up">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center bg-gradient-to-r from-slate-900 to-[#1e293b]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <HelpCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Editor de Cuestionario</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configura preguntas y respuestas</p>
                        </div>
                    </div>
                    <button onClick={() => onClose()} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-900/30 rounded-2xl border border-white/5 border-dashed">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Título del Quiz</label>
                            <input
                                type="text"
                                className="input-field bg-slate-950/50 border-white/10"
                                value={quiz?.title || ''}
                                onChange={e => setQuiz({ ...quiz, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nota Mínima (%)</label>
                            <input
                                type="number"
                                className="input-field bg-slate-950/50 border-white/10"
                                value={quiz?.passing_score || 0}
                                onChange={e => setQuiz({ ...quiz, passing_score: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Instrucciones / Descripción</label>
                            <textarea
                                rows="3"
                                className="input-field bg-slate-950/50 border-white/10 text-sm italic"
                                placeholder="Ej: Responda todas las preguntas con atención para aprobar..."
                                value={quiz?.description || ''}
                                onChange={e => setQuiz({ ...quiz, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Intentos Máximos</label>
                            <input
                                type="number"
                                className="input-field bg-slate-950/50 border-white/10"
                                value={quiz?.max_attempts || 0}
                                onChange={e => setQuiz({ ...quiz, max_attempts: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Orden de Respuestas</label>
                            <button
                                onClick={() => setQuiz({ ...quiz, randomize_options: !quiz.randomize_options })}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${quiz?.randomize_options ? 'bg-primary-500/10 border-primary-500/30 text-primary-400' : 'bg-slate-950/50 border-white/10 text-gray-500'}`}
                            >
                                <span className="text-xs font-bold">{quiz?.randomize_options ? 'Aleatorio' : 'Fijo (por orden)'}</span>
                                <Shuffle className={`w-4 h-4 ${quiz?.randomize_options ? 'animate-pulse' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <Layout className="w-5 h-5 text-primary-400" /> Preguntas ({questions.length})
                            </h3>
                            <button
                                onClick={handleAddQuestion}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-400 border border-primary-500/30 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-lg"
                            >
                                <Plus className="w-4 h-4" /> Agregar Pregunta
                            </button>
                        </div>

                        <div className="space-y-8">
                            {questions.length === 0 ? (
                                <div className="text-center py-16 bg-slate-900/20 rounded-3xl border border-white/5 border-dashed">
                                    <HelpCircle className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No hay preguntas agregadas</p>
                                </div>
                            ) : (
                                questions.map((q, qIdx) => (
                                    <div key={q.id} className="card p-8 bg-slate-900/40 border-white/5 relative group hover:border-primary-500/20 transition-all">
                                        <div className="absolute -left-3 top-8 w-8 h-8 bg-slate-900 rounded-lg border border-white/10 flex items-center justify-center font-black text-xs text-primary-400 shadow-xl">
                                            {qIdx + 1}
                                        </div>

                                        <div className="space-y-6">
                                            {/* Question Text */}
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Target className="w-3 h-3" /> Texto de la Pregunta
                                                    </label>
                                                    <textarea
                                                        className="input-field bg-slate-950/50 border-white/10 font-bold text-white h-20"
                                                        placeholder="¿Cuál es el protocolo de seguridad...?"
                                                        value={q.question_text}
                                                        onChange={e => handleUpdateQuestion(q.id, 'question_text', e.target.value)}
                                                    />
                                                </div>
                                                <div className="w-64 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                                        <ImageIcon className="w-3 h-3 text-secondary-500" /> Imagen (URL)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="input-field bg-slate-950/50 border-white/10 text-[10px]"
                                                        placeholder="https://ejemplo.com/imagen.jpg"
                                                        value={q.image_url || ''}
                                                        onChange={e => handleUpdateQuestion(q.id, 'image_url', e.target.value)}
                                                    />
                                                    {q.image_url && (
                                                        <div className="mt-2 relative group-img h-12 w-full overflow-hidden rounded-lg border border-white/5">
                                                            <img src={q.image_url} alt="Vista previa" className="w-full h-full object-cover opacity-50 group-hover-img:opacity-100 transition-all" />
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-white font-black uppercase">Vista Previa</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="w-24 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Puntos</label>
                                                    <input
                                                        type="number"
                                                        className="input-field bg-slate-950/50 border-white/10"
                                                        value={q.points}
                                                        onChange={e => handleUpdateQuestion(q.id, 'points', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveQuestion(q.id)}
                                                    className="mt-6 p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all self-start border border-red-500/20"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Options Grid */}
                                            <div className="space-y-4 pt-4 border-t border-white/5">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opciones de Respuesta</label>
                                                    <button
                                                        onClick={() => handleAddOption(q.id)}
                                                        className="text-[9px] font-black text-primary-400 hover:text-white uppercase tracking-widest bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20"
                                                    >
                                                        + Añadir Opción
                                                    </button>
                                                </div>
                                                <div className="grid gap-3">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={opt.id} className="flex items-center gap-3 group/opt">
                                                            <button
                                                                onClick={() => handleUpdateOption(q.id, opt.id, 'is_correct', !opt.is_correct)}
                                                                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${opt.is_correct ? 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-slate-950/50 border-white/5 text-gray-600 hover:border-white/20'}`}
                                                                title={opt.is_correct ? 'Respuesta Correcta' : 'Marcar como correcta'}
                                                            >
                                                                {opt.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                            </button>
                                                            <input
                                                                type="text"
                                                                className={`flex-1 input-field bg-slate-950/50 border-white/10 text-sm ${opt.is_correct ? 'border-green-500/30' : ''}`}
                                                                placeholder={`Opción ${oIdx + 1}`}
                                                                value={opt.option_text}
                                                                onChange={e => handleUpdateOption(q.id, opt.id, 'option_text', e.target.value)}
                                                            />
                                                            <button
                                                                onClick={() => handleRemoveOption(q.id, opt.id)}
                                                                className="opacity-0 group-hover/opt:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Explanation */}
                                            <div className="pt-4 border-t border-white/5 space-y-2">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                                    <MessageSquare className="w-3 h-3 text-primary-400" /> Explicación de la Respuesta Correcta
                                                </label>
                                                <textarea
                                                    className="input-field bg-slate-950/50 border-white/10 text-xs italic"
                                                    placeholder="Esta respuesta es correcta porque..."
                                                    value={q.explanation}
                                                    onChange={e => handleUpdateQuestion(q.id, 'explanation', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-slate-950 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={() => onClose()}
                        className="px-8 py-3 rounded-xl text-gray-400 font-black uppercase tracking-widest text-[10px] hover:text-white hover:bg-white/5 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSaveAll}
                        disabled={loading}
                        className="px-10 py-3 bg-secondary-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}
