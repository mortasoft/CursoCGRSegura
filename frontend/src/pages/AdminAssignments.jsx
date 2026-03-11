import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import {
    ClipboardList,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Filter,
    FileText,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminAssignments() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
    const [moduleFilter, setModuleFilter] = useState('all');
    const [lessonFilter, setLessonFilter] = useState('all');

    // Grading states
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: 0, feedback: '' });

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/content/assignments/all-submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setSubmissions(response.data.submissions);
            }
        } catch (error) {
            console.error('Error fetching submissions:', error);
            toast.error('Error al cargar entregas');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenGradeModal = (sub) => {
        setGradingSubmission(sub);
        setGradeData({
            grade: sub.grade || 100,
            feedback: sub.feedback || ''
        });
    };

    const handleGradeSubmit = async (status) => {
        try {
            const gradePoints = status === 'approved' ? gradeData.grade : 0;
            const res = await axios.put(`${API_URL}/content/assignment/submission/${gradingSubmission.id}`,
                { status, grade: gradePoints, feedback: gradeData.feedback },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success(`Entrega ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
                setSubmissions(prev => prev.map(s =>
                    s.id === gradingSubmission.id ? { ...s, status, grade: gradePoints, feedback: gradeData.feedback } : s
                ));
                setGradingSubmission(null);
            }
        } catch (error) {
            toast.error('Error al evaluar la entrega');
        }
    };

    const filteredSubmissions = submissions.filter(sub => {
        const matchesSearch =
            `${sub.first_name} ${sub.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sub.module_title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
        const matchesModule = moduleFilter === 'all' || sub.module_id.toString() === moduleFilter;
        const matchesLesson = lessonFilter === 'all' || sub.lesson_id.toString() === lessonFilter;
        return matchesSearch && matchesStatus && matchesModule && matchesLesson;
    });

    const uniqueModules = Array.from(new Set(submissions.map(s => s.module_id))).map(id => {
        return submissions.find(s => s.module_id === id);
    });

    const uniqueLessons = Array.from(new Set(submissions.filter(s => moduleFilter === 'all' || s.module_id.toString() === moduleFilter).map(s => s.lesson_id))).map(id => {
        return submissions.find(s => s.lesson_id === id);
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors w-max"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Panel
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <ClipboardList className="w-8 h-8 text-pink-400" />
                            Revisión de Tareas
                        </h1>
                        <p className="text-gray-400 mt-2">Gestiona y evalúa todas las entregas de los estudiantes.</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                        <div className="flex flex-col text-center px-4">
                            <span className="text-yellow-400 font-bold text-xl">{submissions.filter(s => s.status === 'pending').length}</span>
                            <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Pendientes</span>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="flex flex-col text-center px-4">
                            <span className="text-white font-bold text-xl">{submissions.length}</span>
                            <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider">Totales</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar usuario o email..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:border-primary-500 appearance-none outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Cualquier Estado</option>
                        <option value="pending">Pendientes de revisión</option>
                        <option value="approved">Aprobados</option>
                        <option value="rejected">Rechazados</option>
                    </select>
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:border-primary-500 appearance-none outline-none cursor-pointer"
                        value={moduleFilter}
                        onChange={(e) => { setModuleFilter(e.target.value); setLessonFilter('all'); }}
                    >
                        <option value="all">Todos los Módulos</option>
                        {uniqueModules.map(m => (
                            <option key={`mod-${m.module_id}`} value={m.module_id}>{m.module_title}</option>
                        ))}
                    </select>
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Filter className="w-4 h-4 text-gray-400" />
                    </div>
                    <select
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:border-primary-500 appearance-none outline-none cursor-pointer"
                        value={lessonFilter}
                        onChange={(e) => setLessonFilter(e.target.value)}
                    >
                        <option value="all">Todas las Lecciones</option>
                        {uniqueLessons.map(l => (
                            <option key={`les-${l.lesson_id}`} value={l.lesson_id}>{l.lesson_title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Submissions List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredSubmissions.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-white/5 border-dashed">
                        <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-400">No se encontraron entregas</h3>
                        <p className="text-sm text-gray-500">Prueba ajustando los filtros de búsqueda.</p>
                    </div>
                ) : (
                    filteredSubmissions.map((sub) => (
                        <div key={sub.id} className="p-6 bg-slate-800/40 border border-white/5 rounded-2xl hover:bg-slate-800/60 hover:border-white/10 transition-all flex flex-col lg:flex-row gap-6 items-start lg:items-center">

                            {/* User Info */}
                            <div className="flex-shrink-0 w-full lg:w-64">
                                <h3 className="text-white font-bold">{sub.first_name} {sub.last_name}</h3>
                                <p className="text-sm text-gray-400">{sub.email}</p>
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    {new Date(sub.submitted_at).toLocaleString()}
                                </div>
                            </div>

                            {/* Assignment Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1 mb-2">
                                    <span className="text-[12px] bg-slate-900 text-primary-400 px-3 py-1 rounded-lg uppercase font-black truncate border border-primary-500/10 inline-block w-fit">
                                        Módulo: {sub.module_title}
                                    </span>
                                    <span className="text-[11px] text-gray-400 font-bold truncate">
                                        Lección: {sub.lesson_title}
                                    </span>
                                </div>
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-pink-400" />
                                    {sub.assignment_title}
                                </h4>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t border-white/5 lg:border-t-0">
                                <div className={`px-4 py-1.5 rounded-full border text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 justify-center w-full lg:w-auto ${sub.status === 'approved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    sub.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {sub.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                                    {sub.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                    {sub.status === 'pending' && <Clock className="w-3 h-3" />}
                                    {sub.status === 'approved' ? 'Aprobado' : sub.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                                </div>

                                <button
                                    onClick={() => handleOpenGradeModal(sub)}
                                    className="btn-secondary whitespace-nowrap w-full lg:w-auto justify-center"
                                >
                                    Evaluar Entrega
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Evaluation Modal */}
            {gradingSubmission && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="card w-full max-w-2xl bg-[#1b2341] border-slate-700 p-0 overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-pink-400" />
                                Revisar Tarea
                            </h2>
                            <button onClick={() => setGradingSubmission(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Student Info */}
                            <div className="flex gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5">
                                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-xl uppercase shrink-0">
                                    {gradingSubmission.first_name[0]}{gradingSubmission.last_name[0]}
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg leading-tight">{gradingSubmission.first_name} {gradingSubmission.last_name}</p>
                                    <p className="text-gray-400 text-sm">{gradingSubmission.email}</p>
                                    <div className="flex text-[10px] text-gray-500 uppercase font-black mt-1 gap-2">
                                        <span>Módulo: {gradingSubmission.module_title}</span>
                                        <span>•</span>
                                        <span>Lección: {gradingSubmission.lesson_title}</span>
                                    </div>
                                </div>
                            </div>

                            {/* File Review */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Archivo Enviado</label>
                                <a
                                    href={`${API_URL.replace('/api', '')}${gradingSubmission.file_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/10 hover:border-primary-500/30 hover:bg-slate-800 transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold group-hover:text-primary-400 transition-colors">Ver Documento</p>
                                            <p className="text-xs text-gray-400">Enviado el {new Date(gradingSubmission.submitted_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold bg-white/5 px-3 py-1 rounded-full text-gray-300">Abrir en otra pestaña</span>
                                </a>
                            </div>

                            {/* Feedback & Grading */}
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Comentario de Retroalimentación</label>
                                    <textarea
                                        className="input-field bg-slate-900/50 border-white/10"
                                        rows="3"
                                        placeholder="Escribe un comentario o justificación para el estudiante..."
                                        value={gradeData.feedback}
                                        onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                    />
                                </div>

                                {gradingSubmission.status !== 'pending' && (
                                    <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                        <p className="text-sm text-gray-400">
                                            Estado actual: <span className="font-bold text-white capitalize">{gradingSubmission.status === 'approved' ? 'Aprobado' : 'Rechazado'}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="p-6 bg-slate-900/50 border-t border-white/5 flex gap-4">
                            <button
                                onClick={() => handleGradeSubmit('rejected')}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                                <XCircle className="w-5 h-5" /> Rechazar Entrega
                            </button>
                            <button
                                onClick={() => handleGradeSubmit('approved')}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-green-400 bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all shadow-sm shadow-green-500/10"
                            >
                                <CheckCircle className="w-5 h-5" /> Aprobar Tarea
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
