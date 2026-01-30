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
    X
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
    const [editingDept, setEditingDept] = useState(null);
    const [newDeptName, setNewDeptName] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState(null);

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
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Panel Admin
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Gestión de Áreas / Unidades</h1>
                    <p className="text-gray-400 text-sm font-medium">Define las unidades administrativas para clasificar a los funcionarios.</p>
                </div>

                <button
                    onClick={() => setIsAdding(true)}
                    className="px-6 py-3 bg-primary-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-400 transition-all shadow-lg flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Nueva Área
                </button>
            </div>

            {/* Search and List */}
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar área por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-800/20 border border-white/5 rounded-2xl text-white font-medium focus:outline-none focus:border-primary-500/50"
                    />
                </div>

                <div className="grid gap-4">
                    {/* Add Form */}
                    {isAdding && (
                        <div className="card bg-primary-500/5 border-primary-500/30 flex items-center gap-4 animate-in slide-in-from-top-2">
                            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                                <Plus className="w-5 h-5" />
                            </div>
                            <input
                                autoFocus
                                type="text"
                                value={newDeptName}
                                onChange={(e) => setNewDeptName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                placeholder="Nombre de la nueva unidad..."
                                className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500"
                            />
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsAdding(false)} className="p-3 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                                <button onClick={handleAdd} className="px-6 py-3 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">Guardar</button>
                            </div>
                        </div>
                    )}

                    {filteredDepts.length > 0 ? (
                        filteredDepts.map((dept) => (
                            <div key={dept.id} className="card flex items-center gap-4 hover:border-white/10 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-gray-500">
                                    <Building2 className="w-5 h-5" />
                                </div>

                                {editingDept?.id === dept.id ? (
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editingDept.name}
                                        onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                        className="flex-1 bg-slate-900 border border-primary-500/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
                                    />
                                ) : (
                                    <div className="flex-1">
                                        <p className="text-white font-bold">{dept.name}</p>
                                        <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">ID: AREA-{dept.id}</p>
                                    </div>
                                )}

                                <div className="flex items-center gap-1">
                                    {editingDept?.id === dept.id ? (
                                        <>
                                            <button onClick={() => setEditingDept(null)} className="p-2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                                            <button onClick={handleUpdate} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"><Save className="w-4 h-4" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setEditingDept({ ...dept })}
                                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(dept)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-slate-800/10 rounded-3xl border border-dashed border-white/5">
                            <Building2 className="w-16 h-16 text-gray-700 mx-auto mb-4 opacity-10" />
                            <h4 className="text-white font-bold opacity-30">No se encontraron áreas</h4>
                            <p className="text-gray-600 text-[11px] font-medium uppercase tracking-widest mt-1">Intenta con otro término de búsqueda</p>
                        </div>
                    )}
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
        </div>
    );
}
