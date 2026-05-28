import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

export function useLessonEditor(lessonId) {
    const [lesson, setLesson] = useState(null);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Modal Form State
    const [viewingAssignment, setViewingAssignment] = useState(null);
    const [assignmentSubmissions, setAssignmentSubmissions] = useState([]);

    // Quiz Editor State
    const [isQuizEditorOpen, setIsQuizEditorOpen] = useState(false);
    const [activeQuizItem, setActiveQuizItem] = useState(null);

    // Survey Editor State
    const [isSurveyEditorOpen, setIsSurveyEditorOpen] = useState(false);
    const [activeSurveyItem, setActiveSurveyItem] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content_type: 'text',
        data: '',
        file: null,
        video_source: 'file',
        is_required: false,
        points: 0,
        bulletItems: [{ title: '', text: '' }],
        option1: '',
        option2: '',
        correctOption: 1,
        validation_type: 'free',
        correct_answer: '',
        regex_pattern: '',
        placeholder: 'Escribe tu respuesta aquí...',
        categories: [],
        items: [],
        feedbackSuccess: '',
        feedbackError: '',
        postPoints: 0,
        replyPoints: 0,
        maxAwardedPosts: 0,
        maxAwardedReplies: 0,
        alt_text: '',
        input_size: 'single'
    });

    const fetchLessonAndContents = useCallback(async () => {
        if (!lessonId) return;
        try {
            setLoading(true);
            const [lessonRes, contentRes] = await Promise.all([
                axios.get(`${API_URL}/lessons/${lessonId}`),
                axios.get(`${API_URL}/content/lesson/${lessonId}`)
            ]);

            if (lessonRes.data.success) setLesson(lessonRes.data.lesson);
            if (contentRes.data.success) setContents(contentRes.data.contents);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la lección');
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        fetchLessonAndContents();
    }, [fetchLessonAndContents]);

    const fetchSubmissions = async (contentId, title) => {
        try {
            const res = await axios.get(`${API_URL}/content/assignment/${contentId}/submissions`);
            if (res.data.success) {
                setAssignmentSubmissions(res.data.submissions);
                setViewingAssignment({ id: contentId, title });
            }
        } catch (error) {
            toast.error('Error al cargar entregas');
        }
    };

    const handleGradeSubmission = async (submissionId, status, grade, feedback) => {
        try {
            const res = await axios.put(`${API_URL}/content/assignment/submission/${submissionId}`, {
                status,
                grade,
                feedback
            });
            if (res.data.success) {
                toast.success('Evaluación guardada');
                setAssignmentSubmissions(prev => prev.map(sub =>
                    sub.id === submissionId ? { ...sub, status, grade, feedback } : sub
                ));
            }
        } catch (error) {
            toast.error('Error evaluando entrega');
        }
    };

    const handleOpenModal = (type, item = null) => {
        if (item) {
            setEditingItem(item);
            let dataVal = item.data;
            if (typeof item.data === 'object' && item.data !== null) {
                dataVal = item.data.description || item.data.text || item.data.url || '';
            }

            setFormData({
                title: item.title,
                content_type: item.content_type,
                data: dataVal,
                bulletItems: item.content_type === 'bullets' ? (item.data?.items || [{ title: '', text: '' }]) : [{ title: '', text: '' }],
                file: null,
                video_source: item.data?.url ? 'url' : 'file',
                is_required: ['heading', 'text'].includes(item.content_type) ? false : !!item.is_required,
                points: item.points || 0,
                option1: item.content_type === 'confirmation' ? (item.data?.option1 || '') : '',
                option2: item.content_type === 'confirmation' ? (item.data?.option2 || '') : '',
                correctOption: item.content_type === 'confirmation' ? (item.data?.correctOption || 1) : 1,
                validation_type: item.content_type === 'interactive_input' ? (item.data?.validation_type || 'free') : 'free',
                correct_answer: item.content_type === 'interactive_input' ? (item.data?.correct_answer || '') : '',
                regex_pattern: item.content_type === 'interactive_input' ? (item.data?.regex_pattern || '') : '',
                placeholder: item.content_type === 'interactive_input' ? (item.data?.placeholder || 'Escribe tu respuesta aquí...') : 'Escribe tu respuesta aquí...',
                options: item.content_type === 'multiple_choice' ? (item.data?.options || []) : [],
                categories: item.content_type === 'categorization' ? (item.data?.categories || []) : [],
                items: item.content_type === 'categorization' ? (item.data?.items || []) : [],
                feedbackSuccess: item.content_type === 'categorization' ? (item.data?.feedbackSuccess || '') : '',
                feedbackError: item.content_type === 'categorization' ? (item.data?.feedbackError || '') : '',
                postPoints: item.content_type === 'forum' ? (item.data?.postPoints || 0) : 0,
                replyPoints: item.content_type === 'forum' ? (item.data?.replyPoints || 0) : 0,
                maxAwardedPosts: item.content_type === 'forum' ? (item.data?.maxAwardedPosts || 0) : 0,
                maxAwardedReplies: item.content_type === 'forum' ? (item.data?.maxAwardedReplies || 0) : 0,
                description: item.data?.description || item.data?.text || '',
                alt_text: item.content_type === 'image' ? (item.data?.alt_text || '') : '',
                input_size: item.content_type === 'interactive_input' ? (item.data?.input_size || 'single') : 'single'
            });
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                content_type: type,
                data: '',
                bulletItems: [{ title: '', text: '' }],
                file: null,
                video_source: 'file',
                is_required: ['video', 'link', 'quiz', 'survey', 'assignment', 'confirmation', 'interactive_input', 'multiple_choice'].includes(type),
                points: 0,
                option1: '',
                option2: '',
                correctOption: 1,
                validation_type: 'free',
                correct_answer: '',
                regex_pattern: '',
                placeholder: 'Escribe tu respuesta aquí...',
                options: [],
                categories: [],
                items: [],
                feedbackSuccess: '',
                feedbackError: '',
                postPoints: type === 'forum' ? 10 : 0,
                replyPoints: type === 'forum' ? 5 : 0,
                maxAwardedPosts: type === 'forum' ? 3 : 0,
                maxAwardedReplies: type === 'forum' ? 5 : 0,
                alt_text: '',
                input_size: 'single'
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveContent = async (e) => {
        if (e) e.preventDefault();

        try {
            const dataToSubmit = new FormData();
            dataToSubmit.append('lesson_id', lessonId);
            const isHeading = formData.content_type === 'heading';
            const isText = formData.content_type === 'text';
            let titleVal = formData.title;
            if (isHeading) {
                titleVal = formData.data;
            } else if (isText) {
                const cleanText = (formData.data || '').replace(/<\/?[^>]+(>|$)/g, "").trim();
                titleVal = cleanText.length > 50 ? cleanText.substring(0, 47) + '...' : (cleanText || 'Contenido de Texto');
            }
            dataToSubmit.append('title', titleVal);
            dataToSubmit.append('content_type', formData.content_type);
            dataToSubmit.append('is_required', (isHeading || isText) ? false : formData.is_required);
            dataToSubmit.append('points', formData.points);

            let finalData = {};
            if (formData.content_type === 'text') {
                finalData = { text: formData.data };
            } else if (formData.content_type === 'link') {
                finalData = { url: formData.data };
            } else if (formData.content_type === 'video') {
                if (formData.video_source === 'url') {
                    finalData = { url: formData.data };
                } else {
                    finalData = { file_url: editingItem?.data?.file_url };
                }
            } else if (formData.content_type === 'bullets') {
                finalData = { items: formData.bulletItems.filter(b => b.title || b.text) };
            } else if (formData.content_type === 'confirmation') {
                finalData = {
                    description: formData.data,
                    option1: formData.option1,
                    option2: formData.option2,
                    correctOption: formData.correctOption
                };
            } else if (formData.content_type === 'interactive_input') {
                finalData = {
                    description: formData.data,
                    validation_type: formData.validation_type,
                    correct_answer: formData.correct_answer,
                    regex_pattern: formData.regex_pattern,
                    placeholder: formData.placeholder,
                    input_size: formData.input_size || 'single'
                };
            } else if (formData.content_type === 'multiple_choice') {
                finalData = {
                    description: formData.data,
                    options: formData.options || []
                };
            } else if (['note', 'heading', 'password_tester', 'terms_trap'].includes(formData.content_type)) {
                finalData = { text: formData.data };
            } else if (formData.content_type === 'categorization') {
                finalData = {
                    description: formData.data,
                    categories: formData.categories || [],
                    items: formData.items || [],
                    feedbackSuccess: formData.feedbackSuccess,
                    feedbackError: formData.feedbackError
                };
            } else if (formData.content_type === 'mfa_defender') {
                finalData = typeof formData.data === 'string' ? { description: formData.data } : formData.data;
            } else if (formData.content_type === 'forum') {
                finalData = {
                    description: formData.data,
                    postPoints: formData.postPoints || 0,
                    replyPoints: formData.replyPoints || 0,
                    maxAwardedPosts: formData.maxAwardedPosts || 0,
                    maxAwardedReplies: formData.maxAwardedReplies || 0
                };
            } else {
                const currentData = typeof editingItem?.data === 'string' ? JSON.parse(editingItem.data) : (editingItem?.data || {});
                finalData = { ...currentData, description: formData.data };
                if (formData.content_type === 'image') {
                    finalData.alt_text = formData.alt_text;
                }
            }

            dataToSubmit.append('data', JSON.stringify(finalData));
            if (formData.file) dataToSubmit.append('file', formData.file);

            if (!editingItem) {
                const maxOrder = contents.length > 0 ? Math.max(...contents.map(c => c.order_index)) : 0;
                dataToSubmit.append('order_index', maxOrder + 1);
            }

            let response;
            if (editingItem) {
                response = await axios.put(`${API_URL}/content/${editingItem.id}`, dataToSubmit);
            } else {
                response = await axios.post(`${API_URL}/content`, dataToSubmit);
            }

            if (response.data.success) {
                toast.success(editingItem ? 'Contenido actualizado' : 'Contenido agregado');
                fetchLessonAndContents();
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar contenido');
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await axios.delete(`${API_URL}/content/${itemToDelete}`);
            toast.success('Contenido eliminado');
            setContents(prev => prev.filter(c => c.id !== itemToDelete));
        } catch (error) {
            toast.error('Error al eliminar');
        } finally {
            setItemToDelete(null);
        }
    };

    const handleLinkResource = async (resourceId, type, shouldClose = true) => {
        const item = type === 'quiz' ? activeQuizItem : activeSurveyItem;
        if (!item) return;

        try {
            const currentData = typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});
            const newData = { ...currentData, [`${type}_id`]: resourceId };

            const dataToSubmit = new FormData();
            dataToSubmit.append('lesson_id', lessonId);
            dataToSubmit.append('title', item.title);
            dataToSubmit.append('content_type', item.content_type);
            dataToSubmit.append('is_required', item.is_required);
            dataToSubmit.append('points', item.points);
            dataToSubmit.append('data', JSON.stringify(newData));

            const res = await axios.put(`${API_URL}/content/${item.id}`, dataToSubmit);

            if (res.data.success) {
                if (shouldClose) {
                    toast.success(`Contenido vinculado al ${type}`);
                }
                fetchLessonAndContents();
            }
        } catch (error) {
            toast.error(`Error vinculando ${type} al contenido`);
        } finally {
            if (shouldClose) {
                if (type === 'quiz') {
                    setIsQuizEditorOpen(false);
                    setActiveQuizItem(null);
                } else {
                    setIsSurveyEditorOpen(false);
                    setActiveSurveyItem(null);
                }
            }
        }
    };

    const moveItem = async (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === contents.length - 1) return;

        const newContents = [...contents];
        const targetIdx = index + (direction === 'up' ? -1 : 1);
        const temp = newContents[index];
        newContents[index] = newContents[targetIdx];
        newContents[targetIdx] = temp;

        const updatedContents = newContents.map((item, idx) => ({
            ...item,
            order_index: idx + 1
        }));

        setContents(updatedContents);

        try {
            const reorderData = updatedContents.map((item) => ({
                id: item.id,
                order_index: item.order_index
            }));
            await axios.post(`${API_URL}/content/reorder`, { items: reorderData });
        } catch (error) {
            toast.error('Error al reordenar');
            fetchLessonAndContents();
        }
    };

    return {
        lesson,
        contents,
        loading,
        isModalOpen,
        setIsModalOpen,
        formData,
        setFormData,
        editingItem,
        itemToDelete,
        setItemToDelete,
        viewingAssignment,
        setViewingAssignment,
        assignmentSubmissions,
        isQuizEditorOpen,
        setIsQuizEditorOpen,
        activeQuizItem,
        setActiveQuizItem,
        isSurveyEditorOpen,
        setIsSurveyEditorOpen,
        activeSurveyItem,
        setActiveSurveyItem,
        handleOpenModal,
        handleSaveContent,
        confirmDelete,
        handleLinkResource,
        moveItem,
        fetchSubmissions,
        handleGradeSubmission
    };
}
