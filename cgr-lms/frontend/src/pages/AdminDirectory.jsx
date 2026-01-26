import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    FileUp,
    Users,
    Search,
    CheckCircle,
    Clock,
    Trash2,
    ArrowLeft,
    AlertCircle,
    Building2,
    Mail,
    Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDirectory() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [directory, setDirectory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);

    useEffect(() => {
        fetchDirectory();
    }, []);

    const fetchDirectory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/directory`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setDirectory(response.data.directory);
            }
        } catch (error) {
            toast.error('Error al cargar el directorio maestro');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('csv', file);

        try {
            setUploading(true);
            const response = await axios.post(`${API_URL}/directory/upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchDirectory();
            }
        } catch (error) {
            toast.error('Error al subir el archivo');
        } finally {
            setUploading(false);
            event.target.value = null;
        }
    };

    const handleDeleteClick = (email) => {
        setRecordToDelete(email);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!recordToDelete) return;

        try {
            await axios.delete(`${API_URL}/directory/${recordToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Registro eliminado');
            fetchDirectory();
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const filteredDirectory = directory.filter(person =>
        person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.department && person.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const stats = {
        total: directory.length,
        registered: directory.filter(p => p.is_registered).length,
        pending: directory.filter(p => !p.is_registered).length
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Sincronizando directorio institucional...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Panel Admin
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Directorio Maestro</h1>
                    <p className="text-gray-400 text-sm font-medium">Lista oficial de funcionarios para pre-asignación y control de acceso.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <label className={`flex-1 md:flex-none px-6 py-4 bg-primary-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl cursor-pointer hover:bg-primary-400 transition-all flex items-center justify-center gap-3 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <FileUp className="w-5 h-5" />
                        {uploading ? 'Sincronizando...' : 'Subir CSV'}
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button className="p-4 bg-slate-800 text-white rounded-2xl border border-white/5 hover:bg-slate-700 transition-colors" title="Descargar Plantilla">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-8 flex items-center gap-6 bg-slate-800/20 border-white/5">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Users className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-white">{stats.total}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Funcionarios Totales</p>
                    </div>
                </div>
                <div className="card p-8 flex items-center gap-6 bg-green-500/5 border-green-500/10">
                    <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-green-500">{stats.registered}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Iniciaron Sesión</p>
                    </div>
                </div>
                <div className="card p-8 flex items-center gap-6 bg-orange-500/5 border-orange-500/10">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <AlertCircle className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-3xl font-black text-orange-500">{stats.pending}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pendientes de Acceso</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Filtrar por nombre, email o departamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-6 bg-slate-900/50 border border-white/5 rounded-3xl text-white font-medium focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                />
            </div>

            {/* Legend / Info */}
            <div className="bg-slate-900/30 rounded-2xl p-4 border border-dashed border-white/5 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] flex flex-wrap gap-6 justify-center">
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Registrado</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-700 rounded-full"></div> Pendiente</span>
                <span className="flex items-center gap-2">• El CSV debe tener el formato: correo, nombre_completo, departamento</span>
            </div>

            {/* List */}
            <div className="card overflow-hidden !p-0 border-white/5">
                <div className="max-h-[800px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 border-b border-white/5 sticky top-0 z-10">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Funcionario</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Departamento</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Estado</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredDirectory.map((person) => (
                                <tr key={person.email} className={`hover:bg-white/[0.02] transition-colors ${!person.is_registered ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${person.is_registered ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-800 text-gray-600 border-white/5'}`}>
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white">{person.full_name}</p>
                                                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {person.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-tight">
                                            <Building2 className="w-4 h-4 text-gray-600" />
                                            {person.department || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        {person.is_registered ? (
                                            <div className="inline-flex flex-col items-center">
                                                <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter bg-green-500/10 px-3 py-1 rounded-full mb-1">Activo</span>
                                                <p className="text-[8px] text-gray-600 font-bold uppercase flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {new Date(person.last_login).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ) : (
                                            <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter bg-white/5 px-3 py-1 rounded-full border border-white/5">No registrado</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        {!person.is_registered && (
                                            <button
                                                onClick={() => handleDeleteClick(person.email)}
                                                className="p-3 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                title="Quitar del Directorio"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Registro"
                message={`¿Seguro que deseas eliminar a ${recordToDelete || 'este usuario'} del directorio maestro?`}
                confirmText="Eliminar"
                isDestructive={true}
            />
        </div>
    );
}
