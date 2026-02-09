import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    Building2,
    Plus,
    Edit2,
    Trash2,
    ArrowLeft,
    Search,
    Save,
    X,
    RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminDepartments() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [newDeptName, setNewDeptName] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState(null);
    const [deleteAllModalOpen, setDeleteAllModalOpen] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setDepartments(response.data.departments);
            }
        } catch (error) {
            toast.error('Error al cargar la lista de áreas');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newDeptName.trim()) return;
        try {
            const response = await axios.post(`${API_URL}/departments`, { name: newDeptName.trim() }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Área creada correctamente');
                setNewDeptName('');
                setIsAdding(false);
                fetchDepartments();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al crear el área');
        }
    };

    const handleUpdate = async () => {
        if (!editingDept || !editingDept.name.trim()) return;
        try {
            const response = await axios.put(`${API_URL}/departments/${editingDept.id}`, { name: editingDept.name.trim() }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Área actualizada correctamente');
                setEditingDept(null);
                fetchDepartments();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al actualizar el área');
        }
    };

    const handleDeleteClick = (dept) => {
        setDeptToDelete(dept);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deptToDelete) return;
        try {
            const response = await axios.delete(`${API_URL}/departments/${deptToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Área eliminada');
                fetchDepartments();
            }
        } catch (error) {
            toast.error('Error al eliminar el área');
        }
    };

    const handleSync = async () => {
        try {
            setIsSyncing(true);
            const response = await axios.post(`${API_URL}/departments/sync`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                fetchDepartments();
            }
        } catch (error) {
            toast.error('Error al sincronizar con el directorio maestro');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteAll = async () => {
        try {
            const response = await axios.post(`${API_URL}/departments/delete-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Todas las áreas han sido eliminadas');
                fetchDepartments();
                setDeleteAllModalOpen(false);
            }
        } catch (error) {
            toast.error('Error al eliminar todas las áreas');
        }
    };

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Cargando catálogo de áreas...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest mb-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel Admin
                    </button>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Gestión de Áreas / Unidades</h1>
                    <p className="text-gray-400 text-xs font-medium">Define las unidades administrativas para clasificar a los funcionarios.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className={`px-4 py-2.5 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-lg flex items-center gap-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Sincronizar
                    </button>

                    <button
                        onClick={() => setDeleteAllModalOpen(true)}
                        disabled={departments.length === 0}
                        className="px-4 py-2.5 bg-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar Todo
                    </button>

                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-400 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nueva Área
                    </button>
                </div>
            </div>

            {/* Search and List */}
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar área por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                    />
                </div>

                <div className="card overflow-hidden !p-0 border-white/5">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 border-b border-white/5">
                            <tr>
                                <th className="px-6 py-3 text-[9px] font-black text-white uppercase tracking-widest pl-10 w-16 text-center">ID</th>
                                <th className="px-6 py-3 text-[9px] font-black text-white uppercase tracking-widest">Área / Unidad</th>
                                <th className="px-6 py-3 text-[9px] font-black text-white uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {/* Add Form Row */}
                            {isAdding && (
                                <tr className="bg-primary-500/5 animate-in slide-in-from-top-2">
                                    <td className="px-6 py-2.5 pl-10 text-center">
                                        <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 mx-auto">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-2.5">
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newDeptName}
                                            onChange={(e) => setNewDeptName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                            placeholder="Nombre de la nueva unidad..."
                                            className="w-full bg-slate-900 border border-primary-500/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 ring-primary-500/20"
                                        />
                                    </td>
                                    <td className="px-6 py-2.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => setIsAdding(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleAdd} className="px-4 py-2 bg-primary-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-primary-400">
                                                Guardar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {filteredDepts.length > 0 ? (
                                filteredDepts.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-3 pl-10 text-center">
                                            <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                                                {dept.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-primary-400 transition-colors">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                {editingDept?.id === dept.id ? (
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={editingDept.name}
                                                        onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                                        className="flex-1 min-w-[300px] bg-slate-900 border border-primary-500/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 ring-primary-500/20"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-black text-white">{dept.name}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingDept?.id === dept.id ? (
                                                    <>
                                                        <button
                                                            onClick={handleUpdate}
                                                            className="p-2.5 bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all shadow-lg"
                                                            title="Guardar"
                                                        >
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingDept(null)}
                                                            className="p-2.5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                                                            title="Cancelar"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setEditingDept({ ...dept })}
                                                            className="p-2.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/20"
                                                            title="Editar Área"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(dept)}
                                                            className="p-2.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-lg hover:shadow-red-500/20"
                                                            title="Eliminar Área"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="py-20 text-center">
                                        <Building2 className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-10" />
                                        <h4 className="text-white font-bold opacity-30">No se encontraron áreas</h4>
                                        <p className="text-gray-600 text-[11px] font-medium uppercase tracking-widest mt-1">Intenta con otro término de búsqueda</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Área"
                message={`¿Estás seguro de que deseas eliminar el área "${deptToDelete?.name}"? Esto no afectará a los usuarios que ya la tienen asignada, pero dejará de aparecer en la lista de selección.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                isDestructive={true}
            />

            {/* Confirm Delete All Modal */}
            <ConfirmModal
                isOpen={deleteAllModalOpen}
                onClose={() => setDeleteAllModalOpen(false)}
                onConfirm={handleDeleteAll}
                title="¿Eliminar TODAS las áreas?"
                message="Esta acción eliminará por completo el catálogo de áreas. Esto no afectará a los usuarios que ya tienen un área asignada, pero el catálogo quedará vacío. ¿Estás seguro?"
                confirmText="Sí, eliminar todo"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </div >
    );
}
