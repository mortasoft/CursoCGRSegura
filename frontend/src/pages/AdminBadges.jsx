import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    Award,
    Plus,
    Search,
    Edit2,
    Trash2,
    ArrowLeft,
    Shield,
    Image as ImageIcon,
    Target,
    Settings2,
    CheckCircle2,
    Info,
    HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminBadges() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [badges, setBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBadge, setEditingBadge] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon_name: 'Award',
        criteria_type: 'manual',
        criteria_value: ''
    });

    const criteriaOptions = [
        { value: 'manual', label: 'Asignación Manual', description: 'El administrador la otorga discrecionalmente.' },
        { value: 'module_completion', label: 'Completar Módulo', description: 'Se otorga al terminar un módulo específico.' },
        { value: 'quiz_score', label: 'Puntaje en Quiz', description: 'Se otorga al obtener una nota mínima.' },
        { value: 'total_points', label: 'Acumulación de Puntos', description: 'Se otorga al llegar a una meta de experiencia.' },
        { value: 'phishing_report', label: 'Reporte de Phishing', description: 'Se otorga por reportar simulacros.' }
    ];

    const iconOptions = ['Award', 'Shield', 'Star', 'Trophy', 'Crown', 'Target', 'Zap', 'Lock', 'ShieldCheck', 'Key', 'Bell'];

    useEffect(() => {
        fetchBadges();
    }, []);

    const fetchBadges = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/badges`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setBadges(response.data.badges);
            }
        } catch (error) {
            toast.error('Error al cargar insignias');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!formData.name || !formData.description) {
                toast.error('Nombre y descripción son obligatorios');
                return;
            }

            if (editingBadge) {
                await axios.put(`${API_URL}/badges/${editingBadge.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Insignia actualizada');
            } else {
                await axios.post(`${API_URL}/badges`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Insignia creada');
            }
            setIsModalOpen(false);
            setEditingBadge(null);
            setFormData({ name: '', description: '', icon_name: 'Award', criteria_type: 'manual', criteria_value: '' });
            fetchBadges();
        } catch (error) {
            toast.error('Error al guardar la insignia');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Estás seguro de eliminar esta insignia? Los usuarios que ya la tienen la conservarán en su historial, pero no se podrá otorgar más.')) return;
        try {
            await axios.delete(`${API_URL}/badges/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Insignia eliminada');
            fetchBadges();
        } catch (error) {
            toast.error('Error al eliminar insignia');
        }
    };

    const filteredBadges = badges.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium tracking-widest uppercase text-[10px]">Cargando Sistema de Logros...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Panel
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Administrador de Insignias</h1>
                    <p className="text-gray-400 text-sm font-medium mt-1">Configura los logros y reconocimientos del programa de gamificación.</p>
                </div>

                <button
                    onClick={() => { setEditingBadge(null); setFormData({ name: '', description: '', icon_name: 'Award', criteria_type: 'manual', criteria_value: '' }); setIsModalOpen(true); }}
                    className="px-8 py-4 bg-primary-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-400 hover:scale-[1.02] transition-all flex items-center gap-3"
                >
                    <Plus className="w-5 h-5" /> Nueva Insignia
                </button>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBadges.map((badge) => (
                    <div key={badge.id} className="card p-8 bg-slate-900/40 border-white/5 hover:border-primary-500/30 transition-all group relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-full blur-3xl group-hover:bg-primary-500/10 transition-all"></div>

                        <div className="flex items-start justify-between mb-8 relative">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-slate-950 border border-white/10 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                                <div className="absolute inset-0 bg-primary-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <Award className="w-10 h-10 text-primary-400 relative z-10" />
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-gray-500">
                                    <ImageIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditingBadge(badge); setFormData({ ...badge }); setIsModalOpen(true); }}
                                    className="p-3 bg-white/5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(badge.id)}
                                    className="p-3 bg-red-500/5 rounded-xl text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 relative">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{badge.name}</h3>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed mt-2 line-clamp-2">{badge.description}</p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary-500/10">
                                    {badge.criteria_type}
                                </span>
                                {badge.criteria_value && (
                                    <span className="px-3 py-1 bg-white/5 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                                        Val: {badge.criteria_value}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                    <div className="card w-full max-w-2xl !p-0 overflow-hidden border-white/10 shadow-[0_0_100px_rgba(56,74,153,0.2)]">
                        <div className="p-10 border-b border-white/5 bg-white/[0.02]">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                {editingBadge ? <Edit2 className="w-6 h-6 text-primary-400" /> : <Plus className="w-6 h-6 text-primary-400" />}
                                {editingBadge ? 'Editar Insignia' : 'Nueva Insignia'}
                            </h2>
                            <p className="text-gray-400 text-sm mt-2">Configura los parámetros para el otorgamiento automático o manual.</p>
                        </div>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Nombre Comercial</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-primary-500 transition-all shadow-inner"
                                        placeholder="Ej: Defensor de Datos"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Icono de Referencia</label>
                                    <select
                                        value={formData.icon_name}
                                        onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-primary-500 transition-all uppercase text-xs tracking-widest"
                                    >
                                        {iconOptions.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Descripción y Requisitos</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-primary-500 transition-all shadow-inner resize-none"
                                    placeholder="Explica qué debe hacer el funcionario para ganar este logro..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Tipo de Criterio</label>
                                    <div className="space-y-2">
                                        <select
                                            value={formData.criteria_type}
                                            onChange={(e) => setFormData({ ...formData, criteria_type: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-primary-500 transition-all text-sm"
                                        >
                                            {criteriaOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                        </select>
                                        <p className="text-[9px] text-gray-600 font-bold uppercase italic ml-1">
                                            {criteriaOptions.find(o => o.value === formData.criteria_type)?.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Valor del Criterio</label>
                                    <input
                                        type="text"
                                        value={formData.criteria_value}
                                        onChange={(e) => setFormData({ ...formData, criteria_value: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:border-primary-500 transition-all"
                                        placeholder="Ej: 1 (para Módulo 1) o 85 (para puntaje)"
                                    />
                                    <p className="text-[9px] text-gray-600 font-bold uppercase italic ml-1 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> ID del módulo, nota en el quiz, o meta de puntos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 bg-white/[0.02] border-t border-white/5 flex gap-4">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-5 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 hover:bg-primary-400 transition-all"
                            >
                                {editingBadge ? 'Guardar Cambios' : 'Crear Insignia'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
