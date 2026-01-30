import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    Users,
    Search,
    Edit2,
    Trash2,
    CheckCircle,
    XCircle,
    ArrowLeft,
    User,
    Building2,
    Briefcase,
    Download,
    Clock,
    Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminUsers() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [departments, setDepartments] = useState([]);

    // Confirm Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axios.get(`${API_URL}/departments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setDepartments(response.data.departments);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            toast.error('Error al cargar la lista de usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUser({ ...user });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async () => {
        try {
            const response = await axios.put(`${API_URL}/users/${editingUser.id}`, editingUser, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Usuario actualizado correctamente');
                setIsEditModalOpen(false);
                fetchUsers();
            }
        } catch (error) {
            toast.error('Error al actualizar el usuario');
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;

        try {
            const response = await axios.delete(`${API_URL}/users/${userToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Usuario eliminado permanentemente');
                fetchUsers();
            }
        } catch (error) {
            const msg = error.response?.data?.error || 'Error al eliminar el usuario';
            toast.error(msg);
        }
    };

    const syncFromDirectory = async () => {
        if (!editingUser?.email) return;

        try {
            const response = await axios.get(`${API_URL}/directory`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const directoryEntry = response.data.directory.find(d => d.email.toLowerCase() === editingUser.email.toLowerCase());
                if (directoryEntry) {
                    setEditingUser({
                        ...editingUser,
                        department: directoryEntry.department,
                        position: directoryEntry.position || editingUser.position // Update position too if available
                    });
                    toast.success('Datos sincronizados del directorio maestro');
                } else {
                    toast.error('No se encontró al funcionario en el directorio maestro');
                }
            }
        } catch (error) {
            toast.error('Error al consultar el directorio maestro');
        }
    };

    const filteredUsers = users.filter(user =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Cargando directorio de funcionarios...</p>
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
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-gray-400 text-sm font-medium">Control de acceso y roles de funcionarios de la CGR.</p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o unidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-800/20 border border-white/5 rounded-2xl text-white font-medium focus:outline-none focus:border-primary-500/50"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden !p-0 border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-white/5 border-b border-white/5">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Funcionario</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Unidad / Cargo</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Rol</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Acceso</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Nivel / XP</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Estado</th>
                            <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-gray-500">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{u.first_name} {u.last_name}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-bold text-gray-300">{u.department || 'Sin asignar'}</p>
                                    <p className="text-[10px] text-gray-600 font-medium uppercase tracking-tighter">{u.position || 'Sin cargo'}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-secondary-500/10 text-secondary-500' : 'bg-primary-500/10 text-primary-400'
                                        }`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className="inline-flex flex-col items-start gap-1">
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                                            <Calendar className="w-3 h-3 text-gray-600" />
                                            <span>Reg: {new Date(u.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary-400">
                                            <Clock className="w-3 h-3 text-primary-600" />
                                            <span>Visto: {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Nunca'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <p className="text-xs font-black text-white">{u.points} PTS</p>
                                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{u.level}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    {u.is_active ? (
                                        <span className="flex items-center justify-center gap-1 text-green-500 text-[10px] font-black uppercase">
                                            <CheckCircle className="w-3 h-3" /> Activo
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1 text-red-500 text-[10px] font-black uppercase">
                                            <XCircle className="w-3 h-3" /> Inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEditUser(u)}
                                            className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                            title="Editar Usuario"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(u)}
                                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Eliminar Usuario"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="card w-full max-w-lg p-0 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-white/10">
                        <div className="p-8 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Editar Funcionario</h2>
                                <p className="text-gray-500 text-xs font-medium mt-1">{editingUser.first_name} {editingUser.last_name}</p>
                            </div>
                            <button
                                onClick={syncFromDirectory}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 text-primary-400 border border-primary-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-500/30 transition-all group"
                                title="Sincronizar datos oficiales"
                            >
                                <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                Sincronizar Directorio
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Rol en Sistema</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="user">Usuario (Funcionario)</option>
                                        <option value="admin">Administrador (TI/Seguridad)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Estado</label>
                                    <select
                                        value={editingUser.is_active}
                                        onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.value === 'true' || e.target.value === '1' })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500"
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Unidad Administrativa / Área</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <select
                                        value={editingUser.department || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 appearance-none"
                                    >
                                        <option value="">Seleccionar área...</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Cargo Institucional</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                    <input
                                        type="text"
                                        value={editingUser.position || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white/5 border-t border-white/5 flex gap-4">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                className="flex-1 py-4 bg-primary-500 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg hover:bg-primary-400 transition-all"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Usuario"
                message={`¿Estás seguro de que deseas eliminar permanentemente a ${userToDelete?.first_name} ${userToDelete?.last_name}? Esta acción no se puede deshacer y borrará todo su progreso en la plataforma.`}
                confirmText="Eliminar Definitivamente"
                cancelText="Cancelar"
                isDestructive={true}
            />
        </div>
    );
}
