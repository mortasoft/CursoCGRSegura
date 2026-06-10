import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export function useQuizEditor({ isOpen, quizId, moduleId, lessonId, initialTitle, token, onClose, onQuizCreated }) {
    const [loading, setLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuizId, setCurrentQuizId] = useState(quizId);

    useEffect(() => {
        if (!isOpen) return;

        setCurrentQuizId(quizId);

        if (quizId) {
            fetchQuizData(quizId);
        } else {
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
                const parsedQuestions = (res.data.questions || []).map(q => ({
                    ...q,
                    data: typeof q.data === 'string' ? JSON.parse(q.data) : (q.data || {})
                }));
                setQuestions(parsedQuestions);
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
            data: {},
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
            if (onQuizCreated) {
                await onQuizCreated(qId);
            }
        }

        try {
            setLoading(true);
            await axios.put(`${API_URL}/quizzes/${qId}`, quiz, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedQuestions = [...questions];
            try {
                for (let i = 0; i < updatedQuestions.length; i++) {
                    const q = updatedQuestions[i];
                    if (q.isNew) {
                        const res = await axios.post(`${API_URL}/quizzes/${qId}/questions`, q, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.data.success) {
                            updatedQuestions[i] = {
                                ...q,
                                id: res.data.questionId,
                                isNew: false,
                                isDirty: false
                            };
                        }
                    } else if (q.isDirty) {
                        const res = await axios.put(`${API_URL}/quizzes/questions/${q.id}`, q, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (res.data.success) {
                            updatedQuestions[i] = {
                                ...q,
                                isDirty: false
                            };
                        }
                    }
                }
            } finally {
                setQuestions(updatedQuestions);
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

    return {
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
    };
}
