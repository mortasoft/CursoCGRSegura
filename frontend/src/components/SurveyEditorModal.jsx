import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Plus,
    Trash2,
    Save,
    Layout,
    ClipboardList,
    Target,
    MessageSquare,
    Image as ImageIcon,
    Star,
    Type
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL;

export default function SurveyEditorModal({ isOpen, onClose, surveyId, moduleId, lessonId, title: initialTitle }) {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [survey, setSurvey] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentSurveyId, setCurrentSurveyId] = useState(surveyId);

    useEffect(() => {
        if (!isOpen) return;
        setCurrentSurveyId(surveyId);

        if (surveyId) {
            fetchSurveyData(surveyId);
        } else {
            setSurvey({
                title: initialTitle || 'Nueva Encuesta',
                description: '',
                points: 0
            });
            setQuestions([]);
        }
    }, [isOpen, surveyId]);

    const fetchSurveyData = async (idToFetch) => {
        const id = idToFetch || currentSurveyId;
        if (!id) return;

        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/surveys/${id}/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setSurvey(res.data.survey);
                setQuestions(res.data.questions || []);
            }
        } catch (error) {
            toast.error('Error al cargar datos de la encuesta');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSurvey = async () => {
        try {
            const res = await axios.post(`${API_URL}/surveys`, {
                module_id: moduleId,
                lesson_id: lessonId,
                title: survey.title,
                description: survey.description,
                points: survey.points
            }, { headers: { Authorization: `Bearer ${token}` } });

            if (res.data.success) {
                setCurrentSurveyId(res.data.surveyId);
                return res.data.surveyId;
            }
        } catch (error) {
            toast.error('Error al crear la encuesta base');
            return null;
        }
    };

    const handleAddQuestion = (type = 'multiple_choice') => {
        const newQuestion = {
            id: 'temp-' + Date.now(),
            question_text: '',
            question_type: type,
            is_required: true,
            order_index: questions.length,
            options: type === 'multiple_choice' ? [
                { id: 'opt-1', option_text: 'Opción 1', order_index: 0 },
                { id: 'opt-2', option_text: 'Opción 2', order_index: 1 }
            ] : [],
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
            const res = await axios.delete(`${API_URL}/surveys/questions/${qId}`, {
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

    const handleUpdateOption = (qId, oId, value) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = q.options.map(o => o.id === oId ? { ...o, option_text: value } : o);
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
                    options: [...q.options, { id: 'opt-' + Date.now(), option_text: '', order_index: q.options.length }],
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
        let sid = currentSurveyId;
        if (!sid) {
            sid = await handleCreateSurvey();
            if (!sid) return;
        }

        try {
            setLoading(true);
            await axios.put(`${API_URL}/surveys/${sid}`, survey, {
                headers: { Authorization: `Bearer ${token}` }
            });

            for (let q of questions) {
                if (q.isNew) {
                    await axios.post(`${API_URL}/surveys/${sid}/questions`, q, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } else if (q.isDirty) {
                    await axios.put(`${API_URL}/surveys/questions/${q.id}`, q, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }

            toast.success('Encuesta guardada correctamente', { id: 'admin-survey-save' });
            onClose(sid);
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar cambios');
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
                        <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                            <ClipboardList className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Editor de Encuesta</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recopila feedback de los estudiantes</p>
                        </div>
                    </div>
                    <button onClick={() => onClose()} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                    {/* Basic Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-900/30 rounded-2xl border border-white/5 border-dashed">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Título de la Encuesta</label>
                            <input
                                type="text"
                                className="input-field bg-slate-950/50 border-white/10"
                                value={survey?.title || ''}
                                onChange={e => setSurvey({ ...survey, title: e.target.value })}
                            />
                        </div>
                        {/* El campo de puntos se oculta ya que se configura directamente en la lección */}
                        <div className="space-y-2 hidden">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Puntos al Completar</label>
                            <input
                                type="number"
                                className="input-field bg-slate-950/50 border-white/10"
                                value={survey?.points || 0}
                                onChange={e => setSurvey({ ...survey, points: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Instrucciones / Descripción</label>
                            <textarea
                                rows="3"
                                className="input-field bg-slate-950/50 border-white/10 text-sm italic"
                                placeholder="Comparte tus impresiones sobre este módulo..."
                                value={survey?.description || ''}
                                onChange={e => setSurvey({ ...survey, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <Layout className="w-5 h-5 text-primary-400" /> Preguntas ({questions.length})
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleAddQuestion('multiple_choice')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 text-primary-400 border border-primary-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all"
                                >
                                    <ClipboardList className="w-4 h-4" /> Opción Múltiple
                                </button>
                                <button
                                    onClick={() => handleAddQuestion('rating')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition-all"
                                >
                                    <Star className="w-4 h-4" /> Calificación
                                </button>
                                <button
                                    onClick={() => handleAddQuestion('text')}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all"
                                >
                                    <Type className="w-4 h-4" /> Texto Libre
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {questions.length === 0 ? (
                                <div className="text-center py-16 bg-slate-900/20 rounded-3xl border border-white/5 border-dashed">
                                    <ClipboardList className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                    <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No hay preguntas agregadas</p>
                                </div>
                            ) : (
                                questions.map((q, qIdx) => (
                                    <div key={q.id} className="card p-8 bg-slate-900/40 border-white/5 relative group hover:border-yellow-500/20 transition-all">
                                        <div className="absolute -left-3 top-8 w-8 h-8 bg-slate-900 rounded-lg border border-white/10 flex items-center justify-center font-black text-xs text-yellow-500 shadow-xl">
                                            {qIdx + 1}
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Target className="w-3 h-3" /> Texto de la Pregunta
                                                    </label>
                                                    <textarea
                                                        className="input-field bg-slate-950/50 border-white/10 font-bold text-white h-20"
                                                        value={q.question_text}
                                                        onChange={e => handleUpdateQuestion(q.id, 'question_text', e.target.value)}
                                                    />
                                                </div>
                                                <div className="w-40 space-y-2">
                                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tipo</label>
                                                    <div className="px-3 py-2 bg-slate-950/50 rounded-lg border border-white/10 text-xs text-gray-400 font-bold uppercase">
                                                        {q.question_type === 'multiple_choice' ? 'Opción Múltiple' :
                                                            q.question_type === 'rating' ? 'Calificación' : 'Texto Libre'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveQuestion(q.id)}
                                                    className="mt-6 p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all self-start border border-red-500/20"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>

                                            {/* Logic for Multiple Choice Options */}
                                            {q.question_type === 'multiple_choice' && (
                                                <div className="space-y-4 pt-4 border-t border-white/5">
                                                    <div className="flex justify-between items-center">
                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opciones</label>
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
                                                                <input
                                                                    type="text"
                                                                    className="flex-1 input-field bg-slate-950/50 border-white/10 text-sm"
                                                                    placeholder={`Opción ${oIdx + 1}`}
                                                                    value={opt.option_text}
                                                                    onChange={e => handleUpdateOption(q.id, opt.id, e.target.value)}
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
                                            )}

                                            {/* Logic for Rating Preview */}
                                            {q.question_type === 'rating' && (
                                                <div className="pt-4 border-t border-white/5">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Vista previa de escala (1-5)</p>
                                                    <div className="flex gap-4">
                                                        {[1, 2, 3, 4, 5].map(n => (
                                                            <div key={n} className="w-10 h-10 rounded-lg bg-slate-950/50 border border-white/10 flex items-center justify-center text-gray-500 font-bold">
                                                                {n}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
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
                        className="px-10 py-3 bg-yellow-500 text-black rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                        Guardar Encuesta
                    </button>
                </div>
            </div>
        </div>
    );
}
