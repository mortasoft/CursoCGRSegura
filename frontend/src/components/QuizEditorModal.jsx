import { HelpCircle, Save, Layout, Plus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '../store/authStore';
import { useQuizEditor } from '../hooks/useQuizEditor';
import QuizBasicSettings from './admin/quiz-editor/QuizBasicSettings';
import QuestionItem from './admin/quiz-editor/QuestionItem';

export default function QuizEditorModal({ isOpen, onClose, onQuizCreated, quizId, moduleId, lessonId, title: initialTitle }) {
    const { token } = useAuthStore();
    const {
        loading,
        quiz,
        setQuiz,
        questions,
        handleAddQuestion,
        handleRemoveQuestion,
        handleUpdateQuestion,
        handleUpdateOption,
        handleAddOption,
        handleRemoveOption,
        handleSaveAll
    } = useQuizEditor({ 
        isOpen, 
        quizId, 
        moduleId, 
        lessonId, 
        initialTitle, 
        token, 
        onClose,
        onQuizCreated
    });

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden">
            <div className="card w-full max-w-5xl bg-[#0f172a] border-slate-700 p-0 flex flex-col max-h-[90vh] shadow-2xl animate-fade-in-up">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center bg-gradient-to-r from-slate-900 to-[#1e293b]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <HelpCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Editor de Cuestionario</h2>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configura preguntas y respuestas</p>
                        </div>
                    </div>
                    <button onClick={() => onClose()} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all">✕</button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                    {/* Basic Settings */}
                    <QuizBasicSettings quiz={quiz} onUpdate={setQuiz} />

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
                                    <QuestionItem 
                                        key={q.id}
                                        question={q}
                                        index={qIdx}
                                        onUpdateQuestion={handleUpdateQuestion}
                                        onRemoveQuestion={handleRemoveQuestion}
                                        onUpdateOption={handleUpdateOption}
                                        onAddOption={handleAddOption}
                                        onRemoveOption={handleRemoveOption}
                                    />
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
        </div>,
        document.body
    );
}
