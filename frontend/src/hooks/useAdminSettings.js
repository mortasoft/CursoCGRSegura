import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    Award,
    Shield,
    ShieldAlert,
    Trophy,
    ChevronRight,
    ShieldCheck,
    Eye,
    Zap,
    Star,
    Crown
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function useAdminSettings() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        levels: [],
        maintenanceMode: false
    });

    const iconMap = {
        'Award': Award,
        'Shield': Shield,
        'ShieldAlert': ShieldAlert,
        'Trophy': Trophy,
        'ChevronRight': ChevronRight,
        'ShieldCheck': ShieldCheck,
        'Eye': Eye,
        'Zap': Zap,
        'Star': Star,
        'Crown': Crown
    };

    const colorMap = {
        'Award': 'text-gray-400',
        'ChevronRight': 'text-gray-300',
        'Shield': 'text-blue-400',
        'ShieldCheck': 'text-emerald-400',
        'ShieldAlert': 'text-purple-400',
        'Eye': 'text-cyan-400',
        'Zap': 'text-yellow-400',
        'Star': 'text-orange-400',
        'Trophy': 'text-secondary-500',
        'Crown': 'text-yellow-200'
    };

    const bgColorMap = {
        'Award': 'bg-gray-400/10',
        'Shield': 'bg-blue-400/10',
        'ShieldAlert': 'bg-purple-400/10',
        'Crown': 'bg-yellow-200/10'
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const [gamificationRes, systemRes] = await Promise.all([
                axios.get(`${API_URL}/gamification/settings`),
                axios.get(`${API_URL}/system/settings`)
            ]);

            if (gamificationRes.data.success) {
                const { levels } = gamificationRes.data;
                setSettings({
                    levels: levels.map(l => ({
                        ...l,
                        icon: iconMap[l.icon] || Award,
                        iconName: l.icon,
                        color: colorMap[l.icon] || 'text-primary-500',
                        bgColor: bgColorMap[l.icon] || 'bg-primary-500/10'
                    })),
                    maintenanceMode: systemRes.data.settings?.maintenance_mode === 'true'
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Error al cargar configuraciones del sistema');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateLevel = (index, minPoints) => {
        const newLevels = [...settings.levels];
        newLevels[index].minPoints = parseInt(minPoints) || 0;
        setSettings(prev => ({ ...prev, levels: newLevels }));
    };

    const toggleMaintenance = () => {
        setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }));
    };

    const saveSettings = async () => {
        const payload = {
            levels: settings.levels.map(l => ({
                name: l.name,
                minPoints: l.minPoints,
                icon: l.iconName || 'Award'
            }))
        };

        toast.promise(
            Promise.all([
                axios.put(`${API_URL}/gamification/settings`, payload),
                axios.put(`${API_URL}/system/settings`, {
                    maintenance_mode: settings.maintenanceMode
                })
            ]),
            {
                loading: 'Guardando configuraciones...',
                success: 'Configuraciones guardadas permanentemente',
                error: 'Error al salvar cambios'
            }
        ).finally(() => setSaving(false));
    };

    const refreshLeaderboard = async () => {
        toast.promise(
            axios.post(`${API_URL}/gamification/leaderboard/refresh`),
            {
                loading: 'Recalculando ranking global...',
                success: 'Ranking recalculado con éxito',
                error: 'Error al sincronizar ranking'
            }
        ).finally(() => setSaving(false));
    };

    return {
        settings,
        loading,
        saving,
        updateLevel,
        toggleMaintenance,
        saveSettings,
        refreshLeaderboard,
        refresh: fetchSettings
    };
}
