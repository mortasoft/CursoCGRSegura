import React from 'react';
import {
    Award,
    BarChart3,
    BookOpen,
    BookUser,
    Building2,
    Settings,
    ShieldAlert,
    Users,
    ClipboardList,
    MessageSquare,
    Bell
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { isAnalyst } from '../utils/authUtils';
import { useAdminPanel } from '../hooks/useAdminPanel';
import AdminHeader from '../components/admin/AdminHeader';
import AdminCard from '../components/admin/AdminCard';

export default function AdminPanel() {
    const { stats } = useAdminPanel();
    const { user } = useAuthStore();

    const allCards = [
        {
            title: 'Módulos y Lecciones',
            description: 'Crear, editar y organizar el contenido de los cursos.',
            icon: BookOpen,
            path: '/admin/modules',
            iconBg: 'bg-indigo-600',
            stats: `${stats.modules} MÓDULOS`
        },
        {
            title: 'Usuarios',
            description: 'Gestionar funcionarios, roles y permisos del sistema.',
            icon: Users,
            path: '/admin/users',
            iconBg: 'bg-purple-600',
            stats: `${stats.activeUsers} ACTIVOS / ${stats.users} TOTAL`
        },
        {
            title: 'Gestión de Áreas',
            description: 'Administrar el catálogo de unidades administrativas y departamentos.',
            icon: Building2,
            path: '/admin/areas',
            iconBg: 'bg-blue-600',
            stats: 'CATÁLOGO OFICIAL'
        },
        {
            title: 'Reportes y Analítica',
            description: 'Ver el progreso global y estadísticas de cumplimiento.',
            icon: BarChart3,
            path: '/admin/reports',
            iconBg: 'bg-teal-600',
            stats: 'Gestion de Reportes'
        },
        {
            title: 'Simulacros Phishing',
            description: 'Configurar campañas y ver reportes de vulnerabilidad.',
            icon: ShieldAlert,
            path: '/admin/phishing',
            iconBg: 'bg-orange-600',
            stats: `${stats.campaigns} CAMPAÑAS`
        },
        {
            title: 'Logros e Insignias',
            description: 'Administrar el sistema de gamificación y logros institucionales.',
            icon: Award,
            path: '/admin/badges',
            iconBg: 'bg-yellow-600',
            stats: 'GESTIÓN DE LOGROS'
        },
        {
            title: 'Revisión de Tareas',
            description: 'Evaluar y retroalimentar las entregas pendientes de archivos.',
            icon: ClipboardList,
            path: '/admin/assignments',
            iconBg: 'bg-rose-600',
            stats: 'ARCHIVOS ADJUNTOS'
        },
        {
            title: 'Monitoreo de Actividades',
            description: 'Revisar las respuestas a las actividades realizadas por los usuarios en el sistema.',
            icon: MessageSquare,
            path: '/admin/interactions',
            iconBg: 'bg-emerald-600',
            stats: 'REFLEXIONES'
        },
        {
            title: 'Respuestas de Encuestas',
            description: 'Ver y analizar los resultados y feedback de las encuestas de satisfacción.',
            icon: ClipboardList,
            path: '/admin/surveys',
            iconBg: 'bg-teal-500',
            stats: 'FEEDBACK'
        },
        {
            title: 'Anuncios del Sistema',
            description: 'Configurar notificaciones modales globales o segmentadas por módulo.',
            icon: Bell,
            path: '/admin/announcements',
            iconBg: 'bg-indigo-500',
            stats: 'MODALES'
        },
        {
            title: 'Notificaciones Manuales',
            description: 'Enviar mensajes directos a la campana de notificaciones por área o rol.',
            icon: Bell,
            path: '/admin/notifications',
            iconBg: 'bg-blue-500',
            stats: 'DIRECTO'
        },
        {
            title: 'Auditorías de Drive',
            description: 'Ver procesos de escaneo en segundo plano de funcionarios en ejecución.',
            icon: ShieldAlert,
            path: '/admin/drive-auditor',
            iconBg: 'bg-indigo-600',
            stats: 'EN TIEMPO REAL'
        },
        {
            title: 'Directorio Maestro',

            description: 'Subir lista oficial de funcionarios (CSV) y ver quién falta de entrar.',
            icon: BookUser,
            path: '/admin/directory',
            iconBg: 'bg-cyan-600',
            stats: 'SINCRONIZACIÓN'
        },
        {
            title: 'Configuraciones',
            description: 'Ajustes generales del sistema y parámetros globales.',
            icon: Settings,
            path: '/admin/settings',
            iconBg: 'bg-slate-600',
            stats: 'V1.0'
        }
    ];

    // Si es analista, solo mostrar las tarjetas de Reportes, Encuestas e Interacciones
    const analystAllowedPaths = ['/admin/reports', '/admin/surveys', '/admin/interactions'];
    const adminCards = isAnalyst(user)
        ? allCards.filter(card => analystAllowedPaths.includes(card.path))
        : allCards;



    return (
        <div className="animate-fade-in pb-20">
            <AdminHeader showBack={false} />

            <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'analyst' ? 'lg:grid-cols-2 max-w-4xl mx-auto' : 'lg:grid-cols-3'} gap-6`}>

                {adminCards.map((card, index) => (
                    <AdminCard
                        key={index}
                        {...card}
                    />
                ))}
            </div>
        </div>
    );
}

