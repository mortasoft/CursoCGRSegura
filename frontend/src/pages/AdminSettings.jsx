import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    Settings,
    ArrowLeft,
    Save,
    Award,
    Shield,
    ShieldAlert,
    Trophy,
    Info,
    ChevronRight,
    Loader2,
    ShieldCheck,
    Eye,
    Zap,
    Star,
    Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminSettings() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('levels');

    // Estado real de configuraciones
    const [settings, setSettings] = useState({
        levels: [],
        maintenanceMode: false
    });

    // Carga de configuraciones desde el servidor
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/gamification/settings`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const { levels } = response.data;

                    // Fetch global system settings (including maintenance)
                    const sysResponse = await axios.get(`${API_URL}/system/settings`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setSettings({
                        levels: levels.map(l => ({
                            ...l,
                            icon: l.icon === 'Award' ? Award :
                                l.icon === 'Shield' ? Shield :
                                    l.icon === 'ShieldAlert' ? ShieldAlert :
                                        l.icon === 'Trophy' ? Trophy :
                                            l.icon === 'ChevronRight' ? ChevronRight :
                                                l.icon === 'ShieldCheck' ? ShieldCheck :
                                                    l.icon === 'Eye' ? Eye :
                                                        l.icon === 'Zap' ? Zap :
                                                            l.icon === 'Star' ? Star :
                                                                l.icon === 'Crown' ? Crown : Award,
                            iconName: l.icon,
                            color: l.icon === 'Award' ? 'text-gray-400' :
                                l.icon === 'ChevronRight' ? 'text-gray-300' :
                                    l.icon === 'Shield' ? 'text-blue-400' :
                                        l.icon === 'ShieldCheck' ? 'text-emerald-400' :
                                            l.icon === 'ShieldAlert' ? 'text-purple-400' :
                                                l.icon === 'Eye' ? 'text-cyan-400' :
                                                    l.icon === 'Zap' ? 'text-yellow-400' :
                                                        l.icon === 'Star' ? 'text-orange-400' :
                                                            l.icon === 'Trophy' ? 'text-secondary-500' :
                                                                l.icon === 'Crown' ? 'text-yellow-200' : 'text-primary-500',
                            bgColor: l.icon === 'Award' ? 'bg-gray-400/10' :
                                l.icon === 'Shield' ? 'bg-blue-400/10' :
                                    l.icon === 'ShieldAlert' ? 'bg-purple-400/10' :
                                        l.icon === 'Crown' ? 'bg-yellow-200/10' : 'bg-primary-500/10'
                        })),
                        maintenanceMode: sysResponse.data.settings?.maintenance_mode === 'true'
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching settings:', error);
                toast.error('Error al cargar configuraciones reales');
                setLoading(false);
            }
        };

        fetchSettings();
    }, [token]);

    const handleSave = async () => {
        try {
            // 1. Save Levels
            const payload = {
                levels: settings.levels.map(l => ({
                    name: l.name,
                    minPoints: l.minPoints,
                    icon: l.iconName || 'Award'
                }))
            };

            await axios.put(`${API_URL}/gamification/settings`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2. Save Maintenance Mode
            await axios.put(`${API_URL}/system/settings`, {
                maintenance_mode: settings.maintenanceMode
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Configuraciones guardadas permanentemente');
            setSaving(false);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Error al guardar configuraciones');
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <Loader2 className="w-16 h-16 text-primary-500 animate-spin mb-4" />
                <p className="text-gray-400 font-medium">Cargando configuraciones del sistema...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'levels', label: 'Estructura de Niveles', icon: Trophy },
        { id: 'general', label: 'Ajustes Generales', icon: Settings },
        { id: 'logs', label: 'Auditoría', icon: ShieldCheck }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-4 animate-fade-in pb-10 text-left">
            {/* Header Compact - More inline */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/40 px-6 py-4 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400"
                        title="Volver"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tight">Configuraciones</h1>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-none">Gestión global de gamificación</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/60 p-1 rounded-2xl border border-white/5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-primary-500/20 text-white border border-primary-500/30'
                                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-primary-400' : ''}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-primary-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-400 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'levels' && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/5">
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest w-20 text-center">Rango</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Nombre del Nivel</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest w-40">Min. Puntos</th>
                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest w-40">Incremento</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest w-24">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {settings.levels.map((level, index) => (
                                        <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-3 text-center">
                                                <div className={`w-10 h-10 mx-auto rounded-xl ${level.bgColor} ${level.color} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                                                    <level.icon className="w-5 h-5" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white uppercase tracking-tight">{level.name}</span>
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">Nivel {index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="relative group/input max-w-[120px]">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-950/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-black focus:outline-none focus:border-primary-500/50 hover:border-white/20 transition-all uppercase"
                                                        value={level.minPoints}
                                                        onChange={(e) => {
                                                            const newLevels = [...settings.levels];
                                                            newLevels[index].minPoints = parseInt(e.target.value) || 0;
                                                            setSettings({ ...settings, levels: newLevels });
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    {index > 0 ? (
                                                        <>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-secondary-500/40"></div>
                                                            <span className="text-[10px] text-secondary-400 font-black tracking-widest">
                                                                +{level.minPoints - settings.levels[index - 1].minPoints} PTS
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] text-emerald-500/40 font-black tracking-widest">CATEGORÍA BASE</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end">
                                                    <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${index === 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary-500/10 text-primary-400 border-primary-500/20'}`}>
                                                        {index === 0 ? 'ACTIVO' : 'DEF.'}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10 flex gap-4 items-center">
                            <Info className="w-4 h-4 text-primary-400 shrink-0" />
                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                <span className="text-primary-400 font-black uppercase mr-1">Regla de Progresión:</span>
                                El sistema valida secuencialmente los puntos del usuario de abajo hacia arriba. Los niveles deben tener puntajes incrementales para un correcto funcionamiento.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 text-yellow-500" />
                                Control de Disponibilidad
                            </h3>

                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="space-y-1 text-center md:text-left">
                                    <h4 className="text-xs font-black text-white uppercase tracking-widest">Modo Mantenimiento</h4>
                                    <p className="text-[10px] text-gray-500 font-medium">Si se activa, solo los administradores podrán acceder al sistema. Otros usuarios verán una pantalla de mantenimiento.</p>
                                </div>

                                <button
                                    onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none ${settings.maintenanceMode ? 'bg-yellow-500' : 'bg-gray-700'}`}
                                >
                                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 ${settings.maintenanceMode ? 'translate-x-9' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10 flex gap-4 items-center">
                            <Info className="w-4 h-4 text-yellow-500 shrink-0" />
                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                <span className="text-yellow-500 font-black uppercase mr-1">Toma en cuenta:</span>
                                Activar el mantenimiento no cerrará sesiones activas de usuarios, pero impedirá que realicen nuevas acciones o carguen contenido del servidor.
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/5 animate-fade-in text-center">
                        <ShieldCheck className="w-10 h-10 text-gray-700 mb-3" />
                        <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest text-gray-400">Historial de Auditoría</h3>
                        <p className="text-[10px] text-gray-600 italic">Próximamente: registro detallado de cambios por administrador.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
