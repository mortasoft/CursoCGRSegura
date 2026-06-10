import { useState, useEffect, useCallback } from 'react';
import { useModuleStore } from '../store/moduleStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export function useAdminModules() {
    const {
        modules,
        loading: modulesLoading,
        fetchAdminModules,
        createModule,
        updateModule,
        deleteModule
    } = useModuleStore();

    const [searchTerm, setSearchTerm] = useState('');

    // Module Modal State
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [moduleFormData, setModuleFormData] = useState({
        module_number: '',
        title: '',
        description: '',
        is_published: false,
        release_date: new Date().toISOString().split('T')[0],
        order_index: '',
        month: '',
        image_url: '',
        generates_certificate: true,
        requires_previous: false
    });

    // Content (Lessons/Resources) State
    const [expandedModule, setExpandedModule] = useState(() => {
        const saved = localStorage.getItem('cgr_admin_expanded_module');
        return saved ? parseInt(saved) : null;
    });
    const [moduleLessons, setModuleLessons] = useState([]);
    const [moduleResources, setModuleResources] = useState([]);
    const [moduleQuizzes, setModuleQuizzes] = useState([]);
    const [moduleSurveys, setModuleSurveys] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);

    // Delete State
    const [itemToDelete, setItemToDelete] = useState(null);

    // Lesson Modal State
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [lessonFormData, setLessonFormData] = useState({
        module_id: null,
        title: '',
        lesson_type: 'reading',
        duration_minutes: 15,
        is_published: false,
        is_optional: false,
        order_index: 0
    });

    // Resource Modal State
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [resourceFormData, setResourceFormData] = useState({
        module_id: null,
        title: '',
        description: '',
        resource_type: 'pdf',
        url: '',
        file: null
    });

    const fetchModuleDetails = useCallback(async (moduleId) => {
        setContentLoading(true);
        try {
            const response = await axios.get(`${API_URL}/modules/${moduleId}`, {
                params: { _t: Date.now() }
            });

            if (response.data.success) {
                setModuleLessons(response.data.module.lessons || []);
                setModuleResources(response.data.module.resources || []);
                setModuleQuizzes(response.data.module.quizzes || []);
                setModuleSurveys(response.data.module.surveys || []);
            }
        } catch (error) {
            console.error('Error fetching module content:', error);
            toast.error('Error al cargar contenido');
        } finally {
            setContentLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminModules();
    }, [fetchAdminModules]);

    // Persist expansion state and fetch details automatically
    useEffect(() => {
        if (expandedModule) {
            localStorage.setItem('cgr_admin_expanded_module', expandedModule);
            fetchModuleDetails(expandedModule);
        } else {
            localStorage.removeItem('cgr_admin_expanded_module');
        }
    }, [expandedModule, fetchModuleDetails]);

    const toggleModuleExpansion = (moduleId) => {
        if (expandedModule === moduleId) {
            setExpandedModule(null);
        } else {
            setExpandedModule(moduleId);
            // El useEffect se encarga de llamar a fetchModuleDetails
        }
    };

    // --- Module Operations ---
    const handleOpenModuleModal = (module = null) => {
        if (module) {
            setEditingModule(module);
            setModuleFormData({
                module_number: module.module_number,
                title: module.title,
                description: module.description,
                is_published: !!module.is_published,
                release_date: module.release_date ? module.release_date.split('T')[0] : '',
                order_index: module.order_index,
                month: module.month || '',
                image_url: module.image_url || '',
                generates_certificate: module.generates_certificate !== undefined ? !!module.generates_certificate : true,
                requires_previous: !!module.requires_previous
            });
        } else {
            setEditingModule(null);
            setModuleFormData({
                module_number: modules.length + 1,
                title: '',
                description: '',
                is_published: false,
                release_date: new Date().toISOString().split('T')[0],
                order_index: modules.length + 1,
                month: new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date()),
                image_url: '',
                generates_certificate: true,
                requires_previous: false
            });
        }
        setIsModuleModalOpen(true);
    };

    const handleSaveModule = async (e) => {
        e.preventDefault();
        const res = editingModule
            ? await updateModule(editingModule.id, moduleFormData)
            : await createModule(moduleFormData);

        if (res.success) {
            toast.success(editingModule ? 'Módulo actualizado' : 'Módulo creado');
            setIsModuleModalOpen(false);
        } else {
            toast.error(res.error || 'Ocurrió un error');
        }
    };

    const handleTogglePublish = async (module) => {
        const res = await updateModule(module.id, {
            ...module,
            is_published: !module.is_published
        });

        if (res.success) {
            toast.success(module.is_published ? 'Módulo movido a borradores' : 'Módulo publicado correctamente');
        } else {
            toast.error(res.error || 'Error al actualizar el estado');
        }
    };

    const confirmDeleteModule = async (id) => {
        const res = await deleteModule(id);
        if (res.success) {
            toast.success('Módulo eliminado');
            if (expandedModule === id) setExpandedModule(null);
        } else {
            toast.error(res.error || 'Error al eliminar');
        }
    };

    // --- Lesson Operations ---
    const handleOpenLessonModal = (moduleId, lesson = null) => {
        if (lesson) {
            setEditingLesson(lesson);
            setLessonFormData({
                module_id: moduleId,
                title: lesson.title,
                lesson_type: lesson.lesson_type,
                duration_minutes: lesson.duration_minutes,
                is_published: !!lesson.is_published,
                is_optional: !!lesson.is_optional,
                order_index: lesson.order_index
            });
        } else {
            setEditingLesson(null);
            setLessonFormData({
                module_id: moduleId,
                title: '',
                lesson_type: 'reading',
                duration_minutes: 15,
                is_published: false,
                is_optional: false,
                order_index: moduleLessons.length + 1
            });
        }
        setIsLessonModalOpen(true);
    };

    const handleSaveLesson = async (e) => {
        e.preventDefault();
        try {
            let url = `${API_URL}/lessons`;
            let method = 'POST';

            if (editingLesson) {
                url = `${API_URL}/lessons/${editingLesson.id}`;
                method = 'PUT';
            }

            const response = await axios({
                method,
                url,
                data: lessonFormData
            });

            if (response.data.success) {
                toast.success(editingLesson ? 'Lección actualizada' : 'Lección creada');
                setIsLessonModalOpen(false);
                fetchModuleDetails(lessonFormData.module_id);
                fetchAdminModules();
            } else {
                toast.error(response.data.error || 'Error al guardar lección');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const confirmDeleteLesson = async (lessonId, moduleId) => {
        try {
            const response = await axios.delete(`${API_URL}/lessons/${lessonId}`);
            if (response.data.success) {
                toast.success("Lección eliminada");
                fetchModuleDetails(moduleId);
                fetchAdminModules();
            } else {
                toast.error("Error al eliminar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const toggleLessonPublish = async (lesson) => {
        try {
            const response = await axios.put(`${API_URL}/lessons/${lesson.id}`, {
                ...lesson,
                is_published: !lesson.is_published
            });

            if (response.data.success) {
                setModuleLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, is_published: !l.is_published } : l));
                toast.success(lesson.is_published ? 'Lección movida a borradores' : 'Lección publicada correctamente');
                fetchAdminModules();
            }
        } catch (error) {
            toast.error('Error al actualizar el estado de publicación');
        }
    };

    // --- Resource Operations ---
    const handleOpenResourceModal = (moduleId, resource = null) => {
        if (resource) {
            setEditingResource(resource);
            setResourceFormData({
                module_id: moduleId,
                title: resource.title,
                description: resource.description || '',
                resource_type: resource.resource_type,
                url: resource.url || '',
                file: null
            });
        } else {
            setEditingResource(null);
            setResourceFormData({
                module_id: moduleId,
                title: '',
                description: '',
                resource_type: 'pdf',
                url: '',
                file: null
            });
        }
        setIsResourceModalOpen(true);
    };

    const handleSaveResource = async (e) => {
        e.preventDefault();
        try {
            let data;
            let headers = {};

            // Si hay un archivo, usamos FormData (Multipart)
            if (resourceFormData.file) {
                const formData = new FormData();
                formData.append('module_id', resourceFormData.module_id);
                formData.append('title', resourceFormData.title);
                formData.append('description', resourceFormData.description);
                formData.append('resource_type', resourceFormData.resource_type);
                formData.append('url', resourceFormData.url);
                formData.append('file', resourceFormData.file);
                data = formData;
                // No configuramos headers, Axios lo hace solo para FormData
            } else {
                // Si es solo un link o referencia, usamos JSON (Mucho más estable en producción)
                data = {
                    module_id: resourceFormData.module_id,
                    title: resourceFormData.title,
                    description: resourceFormData.description,
                    resource_type: resourceFormData.resource_type,
                    url: resourceFormData.url
                };
            }

            let url = `${API_URL}/resources`;
            let method = editingResource ? 'PUT' : 'POST';

            if (editingResource) {
                url = `${API_URL}/resources/${editingResource.id}`;
            }

            const response = await axios({
                method,
                url,
                data,
                headers
            });

            if (response.data.success) {
                toast.success(editingResource ? 'Recurso actualizado' : 'Recurso creado');
                setIsResourceModalOpen(false);
                fetchModuleDetails(resourceFormData.module_id);
            } else {
                toast.error(response.data.error || 'Error al guardar recurso');
            }
        } catch (error) {
            console.error('Error en recurso:', error);
            toast.error('Error de conexión');
        }
    };

    const confirmDeleteResource = async (resourceId, moduleId) => {
        try {
            const response = await axios.delete(`${API_URL}/resources/${resourceId}`);
            if (response.data.success) {
                toast.success("Recurso eliminado");
                fetchModuleDetails(moduleId);
            } else {
                toast.error("Error al eliminar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const handleReorderLessons = async (moduleId, orderedIds) => {
        try {
            const response = await axios.post(`${API_URL}/lessons/reorder`, {
                moduleId,
                orderedIds
            });

            if (response.data.success) {
                toast.success('Orden de lecciones actualizado');
                fetchModuleDetails(moduleId);
                fetchAdminModules();
                return true;
            }
        } catch (error) {
            console.error('Error reordering lessons:', error);
            toast.error('Error al reordenar lecciones');
        }
        return false;
    };

    const handleExportLesson = async (lessonId, lessonTitle) => {
        try {
            const response = await axios.get(`${API_URL}/lessons/${lessonId}/export`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const safeTitle = lessonTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_');
            link.setAttribute('download', `lesson_${safeTitle}_export.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Lección exportada con éxito');
        } catch (error) {
            console.error('Error exporting lesson:', error);
            toast.error('Error al exportar lección');
        }
    };

    const handleImportLesson = async (moduleId, file) => {
        if (!file) return false;
        const formData = new FormData();
        formData.append('module_id', moduleId);
        formData.append('file', file);

        const toastId = toast.loading('Importando lección...');
        try {
            const response = await axios.post(`${API_URL}/lessons/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success('Lección importada con éxito', { id: toastId });
                fetchModuleDetails(moduleId);
                fetchAdminModules();
                return true;
            } else {
                toast.error(response.data.error || 'Error al importar lección', { id: toastId });
            }
        } catch (error) {
            console.error('Error importing lesson:', error);
            const errorMsg = error.response?.data?.error || 'Error de conexión al importar';
            toast.error(errorMsg, { id: toastId });
        }
        return false;
    };

    const filteredModules = modules.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
        modules: filteredModules,
        fullModules: modules,
        loading: modulesLoading,
        searchTerm,
        setSearchTerm,

        // Module UI
        isModuleModalOpen,
        setIsModuleModalOpen,
        editingModule,
        moduleFormData,
        setModuleFormData,
        handleOpenModuleModal,
        handleSaveModule,
        handleTogglePublish,
        confirmDeleteModule,

        // Content UI
        expandedModule,
        toggleModuleExpansion,
        moduleLessons,
        moduleResources,
        moduleQuizzes,
        moduleSurveys,
        contentLoading,

        // Selection for delete
        itemToDelete,
        setItemToDelete,

        // Lesson UI
        isLessonModalOpen,
        setIsLessonModalOpen,
        editingLesson,
        lessonFormData,
        setLessonFormData,
        handleOpenLessonModal,
        handleSaveLesson,
        confirmDeleteLesson,
        toggleLessonPublish,

        // Resource UI
        isResourceModalOpen,
        setIsResourceModalOpen,
        editingResource,
        resourceFormData,
        setResourceFormData,
        handleOpenResourceModal,
        handleSaveResource,
        confirmDeleteResource,

        // Reorder
        handleReorderLessons,

        // Import/Export
        handleExportLesson,
        handleImportLesson
    };
}
