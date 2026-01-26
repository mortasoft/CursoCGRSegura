import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    Award,
    BarChart3,
    BookOpen,
    BookUser,
    ChevronRight,
    Settings,
    ShieldAlert,
    Users
} from 'lucide-react';

export default function AdminPanel() {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const [stats, setStats] = useState({
        users: 0,
        modules: 0,
        campaigns: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const response = await axios.get(`${API_URL}/dashboard/admin-stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setStats(response.data.stats);
                }
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            }
        };

        if (token) fetchStats();
    }, [token]);

    const adminCards = [
        {
            title: 'Módulos y Lecciones',
            description: 'Crear, editar y organizar el contenido de los cursos.',
            icon: BookOpen,
            path: '/admin/modules',
            color: 'from-blue-500 to-indigo-600',
            stats: `${stats.modules} Módulos`
        },
        {
            title: 'Usuarios',
            description: 'Gestionar funcionarios, roles y permisos del sistema.',
            icon: Users,
            path: '/admin/users',
            color: 'from-purple-500 to-pink-600',
            stats: `${stats.users} Usuarios`
        },
        {
            title: 'Reportes y Analítica',
            description: 'Ver el progreso global y estadísticas de cumplimiento.',
            icon: BarChart3,
            path: '/admin/reports',
            color: 'from-emerald-500 to-teal-600',
            stats: '94% Completitud'
        },
        {
            title: 'Simulacros Phishing',
            description: 'Configurar campañas y ver reportes de vulnerabilidad.',
            icon: ShieldAlert,
            path: '/admin/phishing',
            color: 'from-orange-500 to-red-600',
            stats: `${stats.campaigns} Campañas`
        },
        {
            title: 'Logros e Insignias',
            description: 'Administrar el sistema de gamificación y puntos.',
            icon: Award,
            path: '/admin/gamification',
            color: 'from-yellow-400 to-orange-500',
            stats: '15 Insignias'
        },
        {
            title: 'Directorio Maestro',
            description: 'Subir lista oficial de funcionarios (CSV) y ver quién falta de entrar.',
            icon: BookUser,
            path: '/admin/directory',
            color: 'from-cyan-500 to-blue-600',
            stats: 'Sincronización'
        },
        {
            title: 'Configuraciones',
            description: 'Ajustes generales del sistema y notificaciones.',
            icon: Settings,
            path: '/admin/settings',
            color: 'from-slate-500 to-slate-700',
            stats: 'V1.0'
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                <p className="text-gray-400">Bienvenido al centro de control del LMS CGR Segur@.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminCards.map((card, index) => (
                    <button
                        key={index}
                        onClick={() => navigate(card.path)}
                        className="group relative flex flex-col p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-primary-500/50 hover:bg-slate-800 transition-all duration-300 text-left overflow-hidden"
                    >
                        {/* Gradient corner accent */}
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 group-hover:opacity-20 transition-opacity rounded-bl-full`} />

                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <card.icon className="w-6 h-6 text-white" />
                        </div>

                        <div className="space-y-2 relative">
                            <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                {card.description}
                            </p>
                        </div>

                        <div className="mt-8 flex items-center justify-between relative pt-4 border-t border-white/5">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {card.stats}
                            </span>
                            <div className="flex items-center gap-1 text-primary-400 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                                Entrar <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Global Admin Alerts / Notifications Section can go here */}
            <div className="card bg-primary-500/5 border-primary-500/20 p-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-500/20 rounded-full text-primary-400">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-bold">Estado del Sistema</h4>
                        <p className="text-gray-400 text-sm">Todos los servicios operan correctamente. Sincronización con Directorio Activo exitosa.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-500 text-sm font-medium">Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
