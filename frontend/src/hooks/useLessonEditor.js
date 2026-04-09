import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        bulletItems: [{ title: '', text: '' }]
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
                is_required: !!item.is_required,
                points: item.points || 0
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
                is_required: ['video', 'link', 'quiz', 'survey', 'assignment'].includes(type),
                points: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveContent = async (e) => {
        if (e) e.preventDefault();

        try {
            const dataToSubmit = new FormData();
            dataToSubmit.append('lesson_id', lessonId);
            dataToSubmit.append('title', formData.title);
            dataToSubmit.append('content_type', formData.content_type);
            dataToSubmit.append('is_required', formData.is_required);
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
            } else if (['quiz', 'survey', 'assignment', 'note', 'heading', 'bullets'].includes(formData.content_type)) {
                if (['note', 'heading'].includes(formData.content_type)) {
                    finalData = { text: formData.data };
                } else if (formData.content_type === 'bullets') {
                    finalData = { items: formData.bulletItems.filter(b => b.title || b.text) };
                } else {
                    const currentData = typeof editingItem?.data === 'string' ? JSON.parse(editingItem.data) : (editingItem?.data || {});
                    finalData = { ...currentData, description: formData.data };
                }
            }

            dataToSubmit.append('data', JSON.stringify(finalData));
            if (formData.file) dataToSubmit.append('file', formData.file);

            if (!editingItem) {
                const maxOrder = contents.length > 0 ? Math.max(...contents.map(c => c.order_index)) : 0;
                dataToSubmit.append('order_index', maxOrder + 1);
            } else {
                dataToSubmit.append('order_index', editingItem.order_index);
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

    const handleLinkResource = async (resourceId, type) => {
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
            dataToSubmit.append('order_index', item.order_index);

            const res = await axios.put(`${API_URL}/content/${item.id}`, dataToSubmit);

            if (res.data.success) {
                toast.success(`Contenido vinculado al ${type}`);
                fetchLessonAndContents();
            }
        } catch (error) {
            toast.error(`Error vinculando ${type} al contenido`);
        } finally {
            if (type === 'quiz') {
                setIsQuizEditorOpen(false);
                setActiveQuizItem(null);
            } else {
                setIsSurveyEditorOpen(false);
                setActiveSurveyItem(null);
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

        setContents(newContents);

        try {
            const reorderData = newContents.map((item, idx) => ({
                id: item.id,
                order_index: idx + 1
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
