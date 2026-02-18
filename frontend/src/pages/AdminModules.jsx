import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModuleStore } from '../store/moduleStore';
import { useAuthStore } from '../store/authStore';
import {
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    Clock,
    BookOpen,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Trophy,
    Award,
    Download,
    ExternalLink,
    FileText,
    Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminModules() {
    const navigate = useNavigate();
    const { modules, loading, fetchAdminModules, createModule, updateModule, deleteModule } = useModuleStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState(null);
    const [formData, setFormData] = useState({
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

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [moduleToDelete, setModuleToDelete] = useState(null);
    const [expandedModule, setExpandedModule] = useState(null);
    const [moduleLessons, setModuleLessons] = useState([]);
    const [lessonsLoading, setLessonsLoading] = useState(false);

    // Lesson Creation State
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [lessonFormData, setLessonFormData] = useState({
        module_id: null,
        title: '',
        lesson_type: 'reading',
        duration_minutes: 15,
        is_published: false,
        is_optional: false,
        order_index: 0
    });
    // Editing lesson state
    const [editingLesson, setEditingLesson] = useState(null);

    // Resource Management State
    const [moduleResources, setModuleResources] = useState([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);
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

    useEffect(() => {
        fetchAdminModules();
    }, [fetchAdminModules]);

    const handleOpenModal = (module = null) => {
        if (module) {
            setEditingModule(module);
            setFormData({
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
            setFormData({
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
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = editingModule
            ? await updateModule(editingModule.id, formData)
            : await createModule(formData);

        if (res.success) {
            toast.success(editingModule ? 'Módulo actualizado' : 'Módulo creado');
            setIsModalOpen(false);
        } else {
            toast.error(res.error || 'Ocurrió un error');
        }
    };

    const handleDeleteClick = (module) => {
        setModuleToDelete(module);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!moduleToDelete) return;

        const res = await deleteModule(moduleToDelete.id);
        if (res.success) {
            toast.success('Módulo eliminado');
        } else {
            toast.error(res.error || 'Error al eliminar');
        }
    };



    const fetchModuleLessons = async (moduleId) => {
        setLessonsLoading(true);
        // Limpiamos los estados para asegurar que la UI se resetee antes de mostrar nuevos datos
        setModuleLessons([]);
        setModuleResources([]);
        try {
            const token = useAuthStore.getState().token;
            // Usamos axios para consistencia y añadimos cache-control
            const response = await axios.get(`${API_URL}/modules/${moduleId}`, {
                params: { _t: Date.now() },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setModuleLessons(response.data.module.lessons || []);
                setModuleResources(response.data.module.resources || []);
            }
        } catch (error) {
            console.error('Error fetching module content:', error);
            toast.error('Error al cargar contenido');
        } finally {
            setLessonsLoading(false);
        }
    };

    const toggleModuleLessons = async (moduleId) => {
        if (expandedModule === moduleId) {
            setExpandedModule(null);
            return;
        }
        setExpandedModule(moduleId);
        fetchModuleLessons(moduleId);
    };

    // RESOURCE HANDLERS
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
            const token = useAuthStore.getState().token;
            const formData = new FormData();
            formData.append('module_id', resourceFormData.module_id);
            formData.append('title', resourceFormData.title);
            formData.append('description', resourceFormData.description);
            formData.append('resource_type', resourceFormData.resource_type);
            formData.append('url', resourceFormData.url);
            if (resourceFormData.file) {
                formData.append('file', resourceFormData.file);
            }

            let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resources`;
            let method = 'POST';

            if (editingResource) {
                url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resources/${editingResource.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                toast.success(editingResource ? 'Recurso actualizado' : 'Recurso creado');
                setIsResourceModalOpen(false);
                fetchModuleLessons(resourceFormData.module_id);
            } else {
                toast.error(data.error || 'Error al guardar recurso');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const handleDeleteResource = async (resourceId, moduleId) => {
        if (!window.confirm("¿Seguro que deseas eliminar este recurso?")) return;
        try {
            const token = localStorage.getItem('cgr-lms-auth') ? JSON.parse(localStorage.getItem('cgr-lms-auth')).state.token : null;
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resources/${resourceId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success("Recurso eliminado");
                fetchModuleLessons(moduleId);
            } else {
                toast.error("Error al eliminar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const toggleLessonOptional = async (lessonId) => {
        const lesson = moduleLessons.find(l => l.id === lessonId);
        if (!lesson) return;

        try {
            const token = localStorage.getItem('cgr-lms-auth') ? JSON.parse(localStorage.getItem('cgr-lms-auth')).state.token : null;
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/lessons/${lessonId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...lesson,
                    is_optional: !lesson.is_optional
                })
            });
            const data = await response.json();
            if (data.success) {
                setModuleLessons(prev => prev.map(l => l.id === lessonId ? { ...l, is_optional: !l.is_optional } : l));
                toast.success('Estado de lección actualizado');
            }
        } catch (error) {
            toast.error('Error al actualizar lección');
        }
    };



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
            const token = localStorage.getItem('cgr-lms-auth') ? JSON.parse(localStorage.getItem('cgr-lms-auth')).state.token : null;
            let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/lessons`;
            let method = 'POST';

            if (editingLesson) {
                url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/lessons/${editingLesson.id}`;
                method = 'PUT';
            }

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(lessonFormData)
            });
            const data = await response.json();
            if (data.success) {
                toast.success(editingLesson ? 'Lección actualizada' : 'Lección creada correctamente');
                setIsLessonModalOpen(false);
                // Refresh lessons without toggling
                if (lessonFormData.module_id) {
                    fetchModuleLessons(lessonFormData.module_id);
                }
            } else {
                toast.error(data.error || 'Error al guardar lección');
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const handleDeleteLesson = async (lessonId, moduleId) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta lección? Se perderá todo su contenido.")) return;

        try {
            const token = localStorage.getItem('cgr-lms-auth') ? JSON.parse(localStorage.getItem('cgr-lms-auth')).state.token : null;
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/lessons/${lessonId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Lección eliminada");
                fetchModuleLessons(moduleId);
            } else {
                toast.error("Error al eliminar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        }
    };

    const filteredModules = modules.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Módulos</h1>
                    <p className="text-gray-400 mt-1">Administra el contenido educativo de CGR Segur@</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center gap-2 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Módulo
                </button>
            </div>

            {/* Stats Overview (Subtle Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card bg-primary-500/10 border-primary-500/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Total Módulos</p>
                            <p className="text-xl font-bold text-white">{modules.length}</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-green-500/10 border-green-500/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Publicados</p>
                            <p className="text-xl font-bold text-white">{modules.filter(m => m.is_published).length}</p>
                        </div>
                    </div>
                </div>
                <div className="card bg-secondary-500/10 border-secondary-500/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary-500/20 rounded-lg text-secondary-400">
                            <EyeOff className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-semibold">Borradores</p>
                            <p className="text-xl font-bold text-white">{modules.filter(m => !m.is_published).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="card p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por título o descripción..."
                        className="input-field pl-10 h-11"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-300 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtros
                    </button>
                </div>
            </div>

            {/* Modules Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredModules.map((module) => (
                        <div key={module.id} className="card group hover:border-primary-500/50 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-xl font-bold text-primary-400 border border-white/5 overflow-hidden flex-shrink-0">
                                        {(() => {
                                            const num = module.module_number ?? 0;
                                            const paddedNum = num.toString().padStart(2, '0');
                                            const cardSrc = new URL(`../assets/card-banner/Tar-Sec-${paddedNum}.svg`, import.meta.url).href;
                                            return (
                                                <>
                                                    <img
                                                        src={cardSrc}
                                                        alt=""
                                                        className="w-full h-full object-cover opacity-40"
                                                        onError={(e) => {
                                                            if (module.image_url) e.target.src = module.image_url;
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center text-white font-black drop-shadow-lg">
                                                        {module.module_number}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                                            {module.title}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {module.release_date ? new Date(module.release_date).toLocaleDateString() : module.month}
                                            </span>
                                            {module.is_published ? (
                                                <span className="badge badge-success py-0 px-2 text-[10px] uppercase">Publicado</span>
                                            ) : (
                                                <span className="badge bg-slate-800 text-gray-400 border border-slate-700 py-0 px-2 text-[10px] uppercase">Borrador</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(module)}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(module)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-400 text-sm line-clamp-2 mb-6 h-10">
                                {module.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Lecciones</p>
                                        <p className="text-white font-medium">{module.total_lessons || 0}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Duración</p>
                                        <p className="text-white font-medium">{module.total_duration || 0} min</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Puntos</p>
                                        <p className="text-primary-400 font-bold">{module.points_to_earn || 0}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleModuleLessons(module.id)}
                                    className="text-primary-400 hover:text-primary-300 text-sm font-bold flex items-center gap-1 transition-colors"
                                >
                                    {expandedModule === module.id ? 'Cerrar contenido' : 'Gestionar contenido'}
                                    {expandedModule === module.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Expanded Lessons Table */}
                            {expandedModule === module.id && (
                                <div className="mt-6 pt-6 border-t border-white/5 animate-fade-in">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Lecciones del Módulo</h4>
                                        <button
                                            onClick={() => handleOpenLessonModal(module.id)}
                                            className="text-xs font-bold text-primary-400 hover:text-white flex items-center gap-1 bg-primary-500/10 hover:bg-primary-500 py-1.5 px-3 rounded-lg transition-colors border border-primary-500/20"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Nueva Lección
                                        </button>
                                    </div>

                                    {lessonsLoading ? (
                                        <div className="flex justify-center py-4">
                                            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {moduleLessons.length > 0 ? (
                                                moduleLessons.map((lesson) => (
                                                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 border border-slate-700">
                                                                {lesson.order_index}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-white">{lesson.title}</p>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="text-[10px] text-gray-500 uppercase font-black">{lesson.lesson_type}</p>
                                                                    <span className="text-[10px] font-black text-primary-400 flex items-center gap-0.5">
                                                                        <Award className="w-2.5 h-2.5" /> {lesson.total_points || 0} PTS
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Opcional</span>
                                                                <button
                                                                    onClick={() => toggleLessonOptional(lesson.id)}
                                                                    className={`w-10 h-5 rounded-full relative transition-colors ${lesson.is_optional ? 'bg-secondary-500' : 'bg-slate-700'}`}
                                                                >
                                                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${lesson.is_optional ? 'left-6' : 'left-1'}`}></div>
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleOpenLessonModal(module.id, lesson)}
                                                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                                                    title="Editar detalles"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteLesson(lesson.id, module.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                                    title="Eliminar lección"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                                <div className="w-px h-4 bg-white/10 mx-1"></div>
                                                                <button
                                                                    onClick={() => navigate(`/admin/lessons/${lesson.id}/editor`)}
                                                                    className="px-3 py-1.5 bg-primary-500/20 text-primary-400 hover:bg-primary-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                                                                >
                                                                    <Edit2 className="w-3 h-3" />
                                                                    Contenido
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center py-4 text-gray-500 text-sm">Este módulo no tiene lecciones.</p>
                                            )}
                                        </div>
                                    )}
                                    {/* RESOURCES SECTION */}
                                    <div className="mt-8 pt-8 border-t border-white/5 animate-fade-in">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Download className="w-4 h-4 text-secondary-400" />
                                                <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Recursos del Módulo</h4>
                                            </div>
                                            <button
                                                onClick={() => handleOpenResourceModal(module.id)}
                                                className="text-xs font-bold text-secondary-400 hover:text-white flex items-center gap-1 bg-secondary-500/10 hover:bg-secondary-500 py-1.5 px-3 rounded-lg transition-colors border border-secondary-500/20"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Nuevo Recurso
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            {moduleResources.length > 0 ? (
                                                moduleResources.map((res) => (
                                                    <div key={res.id} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-white/5 hover:border-white/10 transition-all group/res">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm transition-all 
                                                                ${res.resource_type === 'drive'
                                                                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                                    : 'bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]'}`}>
                                                                {res.resource_type === 'drive' ? (
                                                                    <div className="flex items-center justify-center">
                                                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M7.71 3.502L1.15 14.782L4.44 20.492L11 9.212L7.71 3.502ZM9.73 14.782L6.44 20.492H19.56L22.85 14.782H9.73ZM12.91 9.212L16.2 3.502H9.71L6.42 9.212H12.91Z" />
                                                                        </svg>
                                                                    </div>
                                                                ) : (
                                                                    <FileText className="w-5 h-5" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className={`text-sm font-bold transition-colors ${res.resource_type === 'drive' ? 'text-white group-hover/res:text-blue-400' : 'text-white group-hover/res:text-secondary-400'}`}>{res.title}</p>
                                                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-tight line-clamp-1">{res.description || 'Sin descripción'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleOpenResourceModal(module.id, res)}
                                                                className="p-1.5 text-gray-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteResource(res.id, module.id)}
                                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <div className="w-px h-4 bg-white/10 mx-1"></div>
                                                            <a
                                                                href={res.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 text-secondary-400 hover:bg-secondary-500 hover:text-white rounded transition-all"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-4 text-center bg-slate-800/20 rounded-xl border border-dashed border-white/5">
                                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Sin recursos adicionales</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )
            }

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="card w-full max-w-2xl bg-[#1b2341] border-slate-700 p-0 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 bg-slate-900/50">
                                <h2 className="text-xl font-bold text-white">
                                    {editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Número de Módulo</label>
                                        <input
                                            type="number"
                                            required
                                            className="input-field"
                                            value={formData.module_number}
                                            onChange={(e) => setFormData({ ...formData, module_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Orden / Posición</label>
                                        <input
                                            type="number"
                                            required
                                            className="input-field"
                                            value={formData.order_index}
                                            onChange={(e) => setFormData({ ...formData, order_index: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Título</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Descripción</label>
                                    <textarea
                                        rows="3"
                                        className="input-field resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Fecha de Lanzamiento</label>
                                    <input
                                        type="date"
                                        required
                                        className="input-field"
                                        value={formData.release_date}
                                        onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">URL del Banner (Imagen)</label>
                                    <input
                                        type="text"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                        className="input-field"
                                        value={formData.image_url}
                                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                    />
                                    <p className="text-[10px] text-gray-500 italic">Recomendado: 600x200 para tarjetas, 1200x300 para Banner Principal.</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 pt-2">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_published"
                                            className="w-5 h-5 rounded border-white/10 bg-black/20 text-primary-500 focus:ring-primary-500"
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        />
                                        <label htmlFor="is_published" className="text-sm font-medium text-gray-300">
                                            Publicar módulo
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="generates_certificate"
                                            className="w-5 h-5 rounded border-white/10 bg-black/20 text-secondary-500 focus:ring-secondary-500"
                                            checked={formData.generates_certificate}
                                            onChange={(e) => setFormData({ ...formData, generates_certificate: e.target.checked })}
                                        />
                                        <label htmlFor="generates_certificate" className="text-sm font-medium text-gray-300">
                                            Genera Certificado
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="requires_previous"
                                            className="w-5 h-5 rounded border-white/10 bg-black/20 text-orange-500 focus:ring-orange-500"
                                            checked={formData.requires_previous}
                                            onChange={(e) => setFormData({ ...formData, requires_previous: e.target.checked })}
                                        />
                                        <label htmlFor="requires_previous" className="text-sm font-medium text-gray-300">
                                            Requiere Completar Anterior
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                    >
                                        {editingModule ? 'Guardar Cambios' : 'Crear Módulo'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Lesson Modal */}
            {
                isLessonModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                        <div className="card w-full max-w-lg bg-[#1b2341] border-slate-700 p-0 overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 bg-slate-900/50">
                                <h2 className="text-xl font-bold text-white">
                                    {editingLesson ? 'Editar Lección' : 'Nueva Lección'}
                                </h2>
                            </div>
                            <form onSubmit={handleSaveLesson} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400">Título de la Lección</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field"
                                        value={lessonFormData.title}
                                        onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Tipo (Referencia)</label>
                                        <select
                                            className="input-field"
                                            value={lessonFormData.lesson_type}
                                            onChange={(e) => setLessonFormData({ ...lessonFormData, lesson_type: e.target.value })}
                                        >
                                            <option value="reading" className="bg-slate-900 text-gray-300">Lectura</option>
                                            <option value="video" className="bg-slate-900 text-gray-300">Video</option>
                                            <option value="interactive" className="bg-slate-900 text-gray-300">Interactivo</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400">Duración (min)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={lessonFormData.duration_minutes}
                                            onChange={(e) => setLessonFormData({ ...lessonFormData, duration_minutes: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-white/10 bg-black/20 text-primary-500"
                                            checked={lessonFormData.is_published}
                                            onChange={(e) => setLessonFormData({ ...lessonFormData, is_published: e.target.checked })}
                                        />
                                        <span className="text-sm text-gray-400">Publicado</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-white/10 bg-black/20 text-secondary-500"
                                            checked={lessonFormData.is_optional}
                                            onChange={(e) => setLessonFormData({ ...lessonFormData, is_optional: e.target.checked })}
                                        />
                                        <span className="text-sm text-gray-400">Opcional</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setIsLessonModalOpen(false)}
                                        className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                    >
                                        {editingLesson ? 'Guardar Cambios' : 'Crear Lección'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* RESOURCE MODAL */}
            {isResourceModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="card w-full max-w-lg bg-[#1b2341] border-slate-700 p-0 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-slate-900/50 flex items-center gap-3">
                            <Download className="w-5 h-5 text-secondary-500" />
                            <h2 className="text-xl font-bold text-white">
                                {editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}
                            </h2>
                        </div>
                        <form onSubmit={handleSaveResource} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-widest text-[10px] font-black">Título del Recurso</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    placeholder="Ej: Guía de Navegación Segura"
                                    value={resourceFormData.title}
                                    onChange={(e) => setResourceFormData({ ...resourceFormData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-widest text-[10px] font-black">Descripción (Opcional)</label>
                                <textarea
                                    rows="2"
                                    className="input-field resize-none"
                                    placeholder="Breve descripción del contenido..."
                                    value={resourceFormData.description}
                                    onChange={(e) => setResourceFormData({ ...resourceFormData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 uppercase tracking-widest text-[10px] font-black">Tipo de Recurso</label>
                                    <select
                                        className="input-field"
                                        value={resourceFormData.resource_type}
                                        onChange={(e) => setResourceFormData({ ...resourceFormData, resource_type: e.target.value })}
                                    >
                                        <option value="pdf" className="bg-slate-900 text-gray-300">PDF</option>
                                        <option value="drive" className="bg-slate-900 text-gray-300">Google Drive</option>
                                        <option value="video" className="bg-slate-900 text-gray-300">Video</option>
                                        <option value="link" className="bg-slate-900 text-gray-300">Enlace Externo</option>
                                        <option value="document" className="bg-slate-900 text-gray-300">Documento</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 uppercase tracking-widest text-[10px] font-black">Archivo (Subir)</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="resource-file"
                                            onChange={(e) => setResourceFormData({ ...resourceFormData, file: e.target.files[0] })}
                                        />
                                        <label
                                            htmlFor="resource-file"
                                            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 border border-white/10 text-xs font-bold text-gray-300 hover:border-secondary-500/50 hover:bg-slate-700 transition-all cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            {resourceFormData.file ? 'Archivo listo' : 'Seleccionar'}
                                        </label>
                                        {resourceFormData.file && (
                                            <p className="text-[9px] text-secondary-400 mt-1 truncate max-w-full">{resourceFormData.file.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400 uppercase tracking-widest text-[10px] font-black">O URL Directa</label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        className="input-field pl-10"
                                        placeholder="https://..."
                                        disabled={!!resourceFormData.file}
                                        value={resourceFormData.url}
                                        onChange={(e) => setResourceFormData({ ...resourceFormData, url: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsResourceModalOpen(false)}
                                    className="px-6 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all font-bold"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-8 py-2.5 bg-secondary-600 hover:bg-secondary-500 text-white rounded-lg font-bold shadow-lg shadow-secondary-900/20 transition-all"
                                >
                                    {editingResource ? 'Actualizar' : 'Crear Recurso'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )
            }

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Módulo"
                message={`¿Estás seguro de que deseas eliminar el módulo "${moduleToDelete?.title}"? Esta acción no se puede deshacer y borrará todas las lecciones y progreso asociado.`}
                confirmText="Eliminar"
                isDestructive={true}
            />
        </div >
    );
}
