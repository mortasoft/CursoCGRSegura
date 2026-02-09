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

/**
 * Los niveles están definidos actualmente en el backend (utils/gamification.js)
 * pero en un futuro podrían venir de una tabla de configuración.
 * Por ahora, los mostramos y permitimos entender la estructura.
 */
const DEFAULT_LEVELS = [
    { name: 'Novato', minPoints: 0, icon: Award, color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
    { name: 'Defensor', minPoints: 100, icon: Shield, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    { name: 'Guardián', minPoints: 500, icon: ShieldAlert, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
    { name: 'CISO Honorario', minPoints: 1000, icon: Trophy, color: 'text-secondary-500', bgColor: 'bg-secondary-500/10' }
];

export default function AdminSettings() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Estado real de configuraciones
    const [settings, setSettings] = useState({
        points_per_lesson: 10,
        points_per_quiz: 50,
        bonus_perfect_score: 25,
        levels: []
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
                    const { levels, points } = response.data;
                    setSettings({
                        ...points,
                        levels: levels.map(l => ({
                            ...l,
                            // Mapeo selectivo de íconos para Lucide
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
                            iconName: l.icon, // Guardamos el nombre string para el PUT
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
                        }))
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
            setSaving(true);

            // Preparar data para el backend
            const payload = {
                levels: settings.levels.map(l => ({
                    name: l.name,
                    minPoints: l.minPoints,
                    icon: l.iconName || 'Award'
                })),
                points: {
                    points_per_lesson: settings.points_per_lesson,
                    points_per_quiz: settings.points_per_quiz,
                    bonus_perfect_score: settings.bonus_perfect_score
                }
            };

            const response = await axios.put(`${API_URL}/gamification/settings`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success('Configuraciones guardadas permanentemente');
            }
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

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Panel Admin
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Configuraciones Globales</h1>
                    <p className="text-gray-400 text-sm font-medium">Ajusta los parámetros de gamificación y niveles del sistema.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-3 bg-primary-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-400 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar Cambios
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gamification Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Award className="w-5 h-5 text-secondary-500" />
                            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Puntos y Recompensas</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Puntos por Lección</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={settings.points_per_lesson}
                                    onChange={(e) => setSettings({ ...settings, points_per_lesson: parseInt(e.target.value) })}
                                />
                                <p className="text-[10px] text-gray-600 italic">Puntos base otorgados al finalizar cualquier lección.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Puntos por Evaluación</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={settings.points_per_quiz}
                                    onChange={(e) => setSettings({ ...settings, points_per_quiz: parseInt(e.target.value) })}
                                />
                                <p className="text-[10px] text-gray-600 italic">Puntos base por aprobar un examen (80%+).</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Bono de Perfección</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={settings.bonus_perfect_score}
                                    onChange={(e) => setSettings({ ...settings, bonus_perfect_score: parseInt(e.target.value) })}
                                />
                                <p className="text-[10px] text-gray-600 italic">Extra por obtener 100% en una evaluación.</p>
                            </div>
                        </div>

                        <div className="pt-4 p-4 bg-primary-500/5 rounded-xl border border-primary-500/10">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-primary-400 shrink-0" />
                                <p className="text-[11px] text-primary-200/70 leading-relaxed font-medium">
                                    Estos valores afectan el cálculo de puntos en tiempo real para todos los funcionarios.
                                    Los cambios no son retroactivos para actividades ya completadas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Levels Grid */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card h-full space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-5 h-5 text-secondary-500" />
                                <h2 className="text-lg font-bold text-white uppercase tracking-tight">Escalafón de Niveles</h2>
                            </div>
                            <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">Definición Actual</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.levels.map((level, index) => (
                                <div
                                    key={index}
                                    className="p-5 bg-slate-800/20 border border-white/5 rounded-2xl hover:border-primary-500/30 transition-all group relative overflow-hidden text-left"
                                >
                                    <div className={`absolute top-0 right-0 w-16 h-16 ${level.bgColor} opacity-20 group-hover:opacity-40 transition-opacity rounded-bl-full`} />

                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-12 h-12 rounded-xl ${level.bgColor} ${level.color} flex items-center justify-center shadow-inner`}>
                                            <level.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black uppercase tracking-tight">{level.name}</h3>
                                            <div className="flex items-center gap-1.5">
                                                <ChevronRight className="w-3 h-3 text-primary-500" />
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Nivel {index + 1}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 relative">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Puntaje Mínimo Requerido</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-primary-500/50 group-hover:bg-slate-900 transition-colors"
                                                    value={level.minPoints}
                                                    onChange={(e) => {
                                                        const newLevels = [...settings.levels];
                                                        newLevels[index].minPoints = parseInt(e.target.value);
                                                        setSettings({ ...settings, levels: newLevels });
                                                    }}
                                                />
                                                <Award className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                                            </div>
                                        </div>

                                        <div className="pt-2 flex items-center justify-between">
                                            <span className="text-[10px] text-gray-500 font-medium">Requisito de ascenso</span>
                                            {index > 0 && (
                                                <span className="text-[10px] text-secondary-400 font-black tracking-tighter">
                                                    +{level.minPoints - settings.levels[index - 1].minPoints} pts desde anterior
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 bg-secondary-500/5 rounded-2xl border border-secondary-500/10">
                            <h4 className="text-secondary-400 text-xs font-black uppercase tracking-widest mb-2">Funcionamiento de Niveles</h4>
                            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                                El sistema evalúa automáticamente el puntaje total del funcionario después de cada actividad completada.
                                Cuando el puntaje alcanza el umbral definido aquí, el nivel del funcionario se actualiza instantáneamente en su perfil y en el Dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
