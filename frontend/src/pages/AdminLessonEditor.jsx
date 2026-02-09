import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Plus,
    FileText,
    Video,
    Image as ImageIcon,
    Link as LinkIcon,
    HelpCircle,
    ClipboardList,
    Upload,
    Trash2,
    MoveUp,
    MoveDown,
    Save,
    Pencil,
    File,
    Award
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminLessonEditor() {
    const { id: lessonId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuthStore();

    // States
    const [lesson, setLesson] = useState(null);
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Modal Form State
    const [formData, setFormData] = useState({
        title: '',
        content_type: 'text', // text, video, image, file, link, quiz, survey, assignment
        data: '', // text content, url, or json string
        file: null,
        video_source: 'file', // 'file' or 'url'
        is_required: false,
        points: 0
    });

    useEffect(() => {
        fetchLessonAndContents();
    }, [lessonId]);

    const fetchLessonAndContents = async () => {
        try {
            setLoading(true);
            // Fetch basic lesson info (assuming this endpoint exists, or we get it from modules)
            // Ideally we need a GET /lessons/:id endpoint. Assuming it exists or I might fail.
            // Actually AdminModules uses fetching module lessons, so maybe /lessons/:id exits. 
            // Checking server.js... YES, lessonRoutes exists.

            const lessonRes = await axios.get(`${API_URL}/lessons/${lessonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (lessonRes.data.success) {
                setLesson(lessonRes.data.lesson);
            }

            // Fetch contents
            const contentRes = await axios.get(`${API_URL}/content/lesson/${lessonId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (contentRes.data.success) {
                setContents(contentRes.data.contents);
            }

        } catch (error) {
            console.error(error);
            toast.error('Error al cargar la lección');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type, item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title,
                content_type: item.content_type,
                data: typeof item.data === 'object' ? JSON.stringify(item.data) : item.data,
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
                file: null,
                video_source: 'file',
                is_required: false,
                points: 0
            });
        }
        setIsModalOpen(true);
    };

    const handleSaveContent = async (e) => {
        e.preventDefault();

        try {
            const dataToSubmit = new FormData();
            dataToSubmit.append('lesson_id', lessonId);
            dataToSubmit.append('title', formData.title);
            dataToSubmit.append('content_type', formData.content_type);
            dataToSubmit.append('is_required', formData.is_required);
            dataToSubmit.append('points', formData.points);

            // Handle specific data structures based on type
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
            } else if (['quiz', 'survey', 'assignment'].includes(formData.content_type)) {
                // For simplified version, data might be description or instructions
                finalData = { description: formData.data };
            }
            // For files/images, data is handled by backend largely, but we can pass metadata

            dataToSubmit.append('data', JSON.stringify(finalData));

            if (formData.file) {
                dataToSubmit.append('file', formData.file);
            }

            // Calculate next order index if new
            if (!editingItem) {
                const maxOrder = contents.length > 0 ? Math.max(...contents.map(c => c.order_index)) : 0;
                dataToSubmit.append('order_index', maxOrder + 1);
            } else {
                dataToSubmit.append('order_index', editingItem.order_index);
            }

            let response;
            if (editingItem) {
                response = await axios.put(`${API_URL}/content/${editingItem.id}`, dataToSubmit, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                response = await axios.post(`${API_URL}/content`, dataToSubmit, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.success) {
                toast.success(editingItem ? 'Contenido actualizado' : 'Contenido agregado');
                fetchLessonAndContents(); // Refresh
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar contenido');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este contenido?')) return;
        try {
            await axios.delete(`${API_URL}/content/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Contenido eliminado');
            setContents(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const moveItem = async (index, direction) => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === contents.length - 1) return;

        const newContents = [...contents];
        const temp = newContents[index];
        newContents[index] = newContents[index + (direction === 'up' ? -1 : 1)];
        newContents[index + (direction === 'up' ? -1 : 1)] = temp;

        setContents(newContents);

        // Sync order with backend
        try {
            const reorderData = newContents.map((item, idx) => ({
                id: item.id,
                order_index: idx + 1
            }));
            await axios.post(`${API_URL}/content/reorder`, { items: reorderData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            toast.error('Error al reordenar');
            fetchLessonAndContents(); // Revert on error
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'text': return <FileText className="w-5 h-5 text-gray-400" />;
            case 'video': return <Video className="w-5 h-5 text-blue-400" />;
            case 'image': return <ImageIcon className="w-5 h-5 text-purple-400" />;
            case 'file': return <File className="w-5 h-5 text-orange-400" />;
            case 'link': return <LinkIcon className="w-5 h-5 text-green-400" />;
            case 'quiz': return <HelpCircle className="w-5 h-5 text-red-400" />;
            case 'survey': return <ClipboardList className="w-5 h-5 text-yellow-400" />;
            case 'assignment': return <Upload className="w-5 h-5 text-pink-400" />;
            default: return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            text: 'Texto',
            video: 'Video',
            image: 'Imagen',
            file: 'Archivo',
            link: 'Enlace',
            quiz: 'Cuestionario',
            survey: 'Encuesta',
            assignment: 'Tarea'
        };
        return labels[type] || type;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <button
                        onClick={() => navigate('/admin/modules')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver a Módulos
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Editor de Lección
                            </h1>
                            <p className="text-gray-400 text-lg">
                                {lesson?.title || 'Cargando...'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-primary-500/10 rounded-2xl border border-primary-500/20">
                            <Award className="w-5 h-5 text-primary-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-0.5">Total Puntos</span>
                                <span className="text-xl font-bold text-primary-400 leading-none">
                                    {contents.reduce((sum, item) => sum + (Number(item.points) || 0), 0)} PTS
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions (Add Content) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                    { type: 'text', label: 'Texto', icon: FileText, color: 'text-gray-300' },
                    { type: 'file', label: 'Archivo', icon: File, color: 'text-orange-400' },
                    { type: 'image', label: 'Imagen', icon: ImageIcon, color: 'text-purple-400' },
                    { type: 'video', label: 'Video', icon: Video, color: 'text-blue-400' },
                    { type: 'link', label: 'Enlace', icon: LinkIcon, color: 'text-green-400' },
                    { type: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-red-400' },
                    { type: 'survey', label: 'Encuesta', icon: ClipboardList, color: 'text-yellow-400' },
                    { type: 'assignment', label: 'Tarea', icon: Upload, color: 'text-pink-400' },
                ].map((action) => (
                    <button
                        key={action.type}
                        onClick={() => handleOpenModal(action.type)}
                        className="flex items-center justify-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-primary-500/30 rounded-xl transition-all group"
                    >
                        <action.icon className={`w-6 h-6 ${action.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-white">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary-400" />
                    Contenido de la Lección
                </h2>

                {contents.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/30 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-gray-500">No hay contenido agregado aún.</p>
                        <p className="text-sm text-gray-600">Selecciona una opción arriba para comenzar.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {contents.map((item, index) => (
                            <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-900 border border-white/5 rounded-xl hover:border-white/10 transition-all group">
                                <div className="flex flex-col gap-1 text-gray-600">
                                    <button
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <MoveUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === contents.length - 1}
                                        className="hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <MoveDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-3 bg-slate-800 rounded-lg">
                                    {getIcon(item.content_type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-white">{item.title}</h3>
                                        {item.is_required && <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase font-black tracking-wider">Obligatorio</span>}
                                        {item.points > 0 && <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded uppercase font-black tracking-wider">{item.points} PTS</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold mt-0.5">{item.content_type}</p>
                                    {/* Preview logic */}
                                    {item.data?.text && (
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{item.data.text}</p>
                                    )}
                                    {item.data?.url && (
                                        <a href={item.data.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-400 hover:underline mt-1 block truncate max-w-md">{item.data.url}</a>
                                    )}
                                    {item.data?.file_url && (
                                        <p className="text-xs text-gray-500 mt-1 font-mono">{item.data.original_name}</p>
                                    )}
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(null, item)}
                                        className="p-2 bg-slate-800 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 bg-slate-800 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit/Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="card w-full max-w-2xl bg-[#1b2341] border-slate-700 p-0 overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {editingItem ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {editingItem ? 'Editar Contenido' : `Agregar ${getTypeLabel(formData.content_type)}`}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <form onSubmit={handleSaveContent} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Título</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field bg-slate-950/50 border-white/10 focus:border-primary-500"
                                    placeholder="Ej: Material de lectura, Quiz final..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            {/* Dynamic Fields based on Type */}
                            {formData.content_type === 'text' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Contenido (Texto)</label>
                                    <textarea
                                        required
                                        rows="6"
                                        className="input-field bg-slate-950/50 border-white/10 focus:border-primary-500 font-mono text-sm"
                                        placeholder="Escribe el contenido aquí..."
                                        value={formData.data}
                                        onChange={e => setFormData({ ...formData, data: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500">Se muestra tal cual al estudiante.</p>
                                </div>
                            )}

                            {formData.content_type === 'link' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">URL del Enlace</label>
                                    <input
                                        type="url"
                                        required
                                        className="input-field bg-slate-950/50 border-white/10 focus:border-primary-500"
                                        placeholder="https://..."
                                        value={formData.data}
                                        onChange={e => setFormData({ ...formData, data: e.target.value })}
                                    />
                                </div>
                            )}

                            {formData.content_type === 'video' && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, video_source: 'file' })}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${formData.video_source === 'file' ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-900 border-white/5 text-gray-500'}`}
                                        >
                                            Subir Archivo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, video_source: 'url' })}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border transition-all ${formData.video_source === 'url' ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-slate-900 border-white/5 text-gray-500'}`}
                                        >
                                            Enlace (YouTube)
                                        </button>
                                    </div>

                                    {formData.video_source === 'file' ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">Archivo de Video</label>
                                            <input
                                                type="file"
                                                required={!editingItem && !editingItem?.data?.file_url}
                                                className="block w-full text-sm text-gray-400
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-xs file:font-semibold
                                                    file:bg-primary-500/20 file:text-primary-400
                                                    hover:file:bg-primary-500/30
                                                    cursor-pointer"
                                                onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                                                accept="video/*"
                                            />
                                            {editingItem?.data?.file_url && <p className="text-xs text-green-400">Archivo actual: {editingItem.data.original_name || 'Video subido'}</p>}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300">URL de YouTube</label>
                                            <input
                                                type="url"
                                                required
                                                className="input-field bg-slate-950/50 border-white/10 focus:border-primary-500"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                value={formData.data}
                                                onChange={e => setFormData({ ...formData, data: e.target.value })}
                                            />
                                            <p className="text-xs text-gray-500">Pega el enlace directo del video de YouTube.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {['file', 'image'].includes(formData.content_type) && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Archivo</label>
                                    <input
                                        type="file"
                                        required={!editingItem} // Not required on edit
                                        className="block w-full text-sm text-gray-400
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-xs file:font-semibold
                                            file:bg-primary-500/20 file:text-primary-400
                                            hover:file:bg-primary-500/30
                                            cursor-pointer"
                                        onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                                        accept={formData.content_type === 'image' ? 'image/*' : '*/*'}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Máx 50MB. Para imágenes usa JPG, PNG o GIF.
                                    </p>
                                    {editingItem?.data?.original_name && (
                                        <p className="text-xs text-green-400 mt-1">Archivo actual: {editingItem.data.original_name}</p>
                                    )}
                                </div>
                            )}

                            {['quiz', 'survey', 'assignment'].includes(formData.content_type) && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Instrucciones / Descripción</label>
                                    <textarea
                                        rows="4"
                                        className="input-field bg-slate-950/50 border-white/10 focus:border-primary-500"
                                        placeholder="Instrucciones para la actividad..."
                                        value={formData.data}
                                        onChange={e => setFormData({ ...formData, data: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Points Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Puntos al Completar</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="input-field bg-slate-950/50 border-white/10 focus:border-primary-500"
                                    value={formData.points}
                                    onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                                />
                                <p className="text-xs text-gray-500">Puntos que obtiene el estudiante al ver este contenido o aprobarlo.</p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="reqCheck"
                                    className="w-4 h-4 rounded bg-slate-900 border-white/20 text-primary-500 focus:ring-primary-500"
                                    checked={formData.is_required}
                                    onChange={e => setFormData({ ...formData, is_required: e.target.checked })}
                                />
                                <label htmlFor="reqCheck" className="text-sm text-gray-300 select-none cursor-pointer">
                                    Marcar como obligatorio para completar la lección
                                </label>
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
                                    className="btn-primary flex items-center justify-center"
                                >
                                    {editingItem ? <Save className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    {editingItem ? 'Guardar Cambios' : 'Agregar Contenido'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
