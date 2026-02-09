import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    FileUp,
    Users,
    Search,
    CheckCircle,
    Clock,
    Plus,
    Edit2,
    Trash2,
    ArrowLeft,
    AlertCircle,
    Building2,
    Mail,
    Download,
    Briefcase,
    Filter,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
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
    const [departments, setDepartments] = useState([]); // List of departments from DB

    const [editingRecord, setEditingRecord] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ full_name: '', email: '', department: '', position: '' });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'asc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        fetchDirectory();
        fetchDepartments();
    }, []);

    // Reset page on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterDepartment, filterStatus]);

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
            setDeleteModalOpen(false);
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleUpdateRecord = async () => {
        try {
            const response = await axios.put(`${API_URL}/directory/${editingRecord.email}`, editingRecord, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Registro actualizado');
                setIsEditModalOpen(false);
                fetchDirectory();
            }
        } catch (error) {
            toast.error('Error al actualizar');
        }
    };

    const handleCreateRecord = async () => {
        if (!newRecord.email || !newRecord.full_name) {
            return toast.error('Email y Nombre son requeridos');
        }
        try {
            // Reusing upload logic but for a single record via a hypothetical POST (we should add this to backend if not exists, but for now let's assume update logic covers it or add a specific route)
            // Let's use the update route logic for "single insert/update" if possible or a proper POST.
            // Actually let's just make a POST to /directory/ as a new route.
            const response = await axios.post(`${API_URL}/directory/single`, newRecord, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                toast.success('Funcionario agregado');
                setIsAddModalOpen(false);
                setNewRecord({ full_name: '', email: '', department: '', position: '' });
                fetchDirectory();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Error al agregar');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await axios.get(`${API_URL}/directory/template`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'plantilla_directorio_cgr.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error('Error al descargar la plantilla');
        }
    };

    const filteredDirectory = directory.filter(person => {
        const matchesSearch = person.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (person.department && person.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (person.position && person.position.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesDepartment = !filterDepartment || person.department === filterDepartment;
        const matchesStatus = !filterStatus ||
            (filterStatus === 'registered' ? person.is_registered : !person.is_registered);

        return matchesSearch && matchesDepartment && matchesStatus;
    });

    const sortedDirectory = [...filteredDirectory].sort((a, b) => {
        if (!sortConfig.key) return 0;

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Manejo especial para status (bool)
        if (sortConfig.key === 'is_registered') {
            aValue = a.is_registered ? 1 : 0;
            bValue = b.is_registered ? 1 : 0;
        }

        // Manejo de nulos
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        // Comparación de strings
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedDirectory.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedDirectory.length / itemsPerPage);

    // const departments = [...new Set(directory.map(p => p.department).filter(Boolean))].sort(); // This is now fetched from DB

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
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[9px] font-black uppercase tracking-widest mb-1"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Volver al Panel Admin
                    </button>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Directorio Maestro</h1>
                    <p className="text-gray-400 text-xs font-medium">Lista oficial de funcionarios para pre-asignación y control de acceso.</p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-5 py-3 bg-secondary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-secondary-400 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Funcionario
                    </button>
                    <label className={`flex-1 md:flex-none px-5 py-3 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-xl cursor-pointer hover:bg-primary-400 transition-all flex items-center justify-center gap-2 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <FileUp className="w-4 h-4" />
                        {uploading ? 'Sincronizando...' : 'Subir CSV'}
                        <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button
                        onClick={handleDownloadTemplate}
                        className="p-3 bg-slate-800 text-white rounded-xl border border-white/5 hover:bg-slate-700 transition-colors"
                        title="Descargar Plantilla"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-5 flex items-center gap-4 bg-primary-500/5 border-white/5">
                    <div className="w-11 h-11 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white">{stats.total}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Funcionarios Totales</p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4 bg-green-500/5 border-green-500/10">
                    <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-green-500">{stats.registered}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Iniciaron Sesión</p>
                    </div>
                </div>
                <div className="card p-5 flex items-center gap-4 bg-secondary-500/5 border-secondary-500/10">
                    <div className="w-11 h-11 rounded-xl bg-secondary-500/10 flex items-center justify-center text-secondary-500">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-orange-500">{stats.pending}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pendientes de Acceso</p>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email, departamento o puesto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                    />
                </div>

                <div className="flex gap-3">
                    <div className="relative min-w-[180px]">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select
                            value={filterDepartment}
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-primary-500 appearance-none cursor-pointer uppercase tracking-tight"
                        >
                            <option value="">Todas las Unidades</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative min-w-[180px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-white/5 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-primary-500 appearance-none cursor-pointer uppercase tracking-tight"
                        >
                            <option value="">Todos los Estados</option>
                            <option value="registered">Registrados</option>
                            <option value="pending">Pendientes</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="card overflow-hidden !p-0 border-white/5">
                <div className="max-h-[800px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 border-b border-white/5 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-[9px] font-black text-white uppercase tracking-widest pl-10 cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => handleSort('full_name')}>
                                    <div className="flex items-center gap-2">
                                        Funcionario
                                        {sortConfig.key === 'full_name' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-400" /> : <ArrowDown className="w-3 h-3 text-primary-400" />
                                        ) : <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-[9px] font-black text-white uppercase tracking-widest cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => handleSort('department')}>
                                    <div className="flex items-center gap-2">
                                        Departamento / Unidad
                                        {sortConfig.key === 'department' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-400" /> : <ArrowDown className="w-3 h-3 text-primary-400" />
                                        ) : <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-[9px] font-black text-white uppercase tracking-widest cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => handleSort('position')}>
                                    <div className="flex items-center gap-2">
                                        Cargo / Puesto
                                        {sortConfig.key === 'position' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-400" /> : <ArrowDown className="w-3 h-3 text-primary-400" />
                                        ) : <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-[9px] font-black text-white uppercase tracking-widest text-center cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => handleSort('is_registered')}>
                                    <div className="flex items-center justify-center gap-2">
                                        Estado
                                        {sortConfig.key === 'is_registered' ? (
                                            sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 text-primary-400" /> : <ArrowDown className="w-3 h-3 text-primary-400" />
                                        ) : <ArrowUpDown className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-[9px] font-black text-white uppercase tracking-widest text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {currentItems.map((person) => (
                                <tr key={person.email} className={`hover:bg-white/[0.02] transition-colors ${!person.is_registered ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    <td className="px-6 py-3.5 pl-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${person.is_registered ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-800 text-gray-600 border-white/5'}`}>
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-base font-black text-white">{person.full_name}</p>
                                                <p className="text-[11px] text-gray-300 font-medium flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3 text-primary-400" /> {person.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-tight">
                                            <Building2 className="w-3.5 h-3.5 text-secondary-400" />
                                            {person.department || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-white">
                                            <Briefcase className="w-3.5 h-3.5 text-primary-400" />
                                            {person.position || 'Sin cargo'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        {person.is_registered ? (
                                            <div className="inline-flex flex-col items-center text-center">
                                                <span className="text-[9px] font-black text-green-500 uppercase tracking-tighter bg-green-500/10 px-3 py-1 rounded-full mb-1 whitespace-nowrap border border-green-500/20">Activo</span>
                                                <p className="text-[9px] text-gray-200 font-bold uppercase flex items-center justify-center gap-1 mt-1">
                                                    <Clock className="w-3 h-3 text-green-400" /> {person.last_login ? new Date(person.last_login).toLocaleDateString() : 'S/I'}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="inline-flex flex-col items-center text-center">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter bg-white/5 px-3 py-1 rounded-full border border-white/5 whitespace-nowrap">No registrado</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => { setEditingRecord({ ...person }); setIsEditModalOpen(true); }}
                                                className="p-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-blue-500/20"
                                                title="Editar Registro"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(person.email)}
                                                className="p-3 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-lg hover:shadow-red-500/20"
                                                title="Quitar del Directorio"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-400">
                <div className="flex items-center gap-2">
                    <span>Mostrar</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 focus:outline-none focus:border-primary-500"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <span>por página</span>
                </div>

                <div className="flex items-center gap-4">
                    <span>
                        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedDirectory.length)} de {sortedDirectory.length} resultados
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Record Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="card w-full max-w-lg p-0 overflow-hidden border-white/10">
                        <div className="p-8 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Agregar Funcionario</h2>
                            <p className="text-gray-500 text-xs font-medium mt-1">Ingresa los datos del nuevo funcionario autorizado.</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Email Institucional</label>
                                <input type="email" value={newRecord.email} onChange={(e) => setNewRecord({ ...newRecord, email: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500" placeholder="ejemplo@cgr.go.cr" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Nombre Completo</label>
                                <input type="text" value={newRecord.full_name} onChange={(e) => setNewRecord({ ...newRecord, full_name: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500" placeholder="Juan Pérez..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Área / Unidad</label>
                                    <select value={newRecord.department} onChange={(e) => setNewRecord({ ...newRecord, department: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500">
                                        <option value="">Seleccionar...</option>
                                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Cargo</label>
                                    <input type="text" value={newRecord.position} onChange={(e) => setNewRecord({ ...newRecord, position: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500" placeholder="Técnico..." />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-white/5 border-t border-white/5 flex gap-4">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-gray-500 hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleCreateRecord} className="flex-1 py-4 bg-secondary-500 rounded-2xl text-xs font-black uppercase text-white shadow-lg hover:bg-secondary-400 transition-all">Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Record Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="card w-full max-w-lg p-0 overflow-hidden border-white/10">
                        <div className="p-8 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Editar Registro</h2>
                            <p className="text-gray-500 text-xs font-medium mt-1">Actualizando datos de {editingRecord.email}</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Nombre Completo</label>
                                <input type="text" value={editingRecord.full_name} onChange={(e) => setEditingRecord({ ...editingRecord, full_name: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Área / Unidad</label>
                                    <select value={editingRecord.department} onChange={(e) => setEditingRecord({ ...editingRecord, department: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500">
                                        <option value="">Seleccionar...</option>
                                        {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Cargo</label>
                                    <input type="text" value={editingRecord.position} onChange={(e) => setEditingRecord({ ...editingRecord, position: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500" />
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-white/5 border-t border-white/5 flex gap-4">
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase text-gray-500 hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleUpdateRecord} className="flex-1 py-4 bg-primary-500 rounded-2xl text-xs font-black uppercase text-white shadow-lg hover:bg-primary-400 transition-all">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}

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
