import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Shield, Clock, CheckCircle, XCircle, Loader2, AlertTriangle,
    HardDrive, FileText, ChevronLeft, ChevronRight, ExternalLink,
    RefreshCw, History, ArrowLeft, Trash2
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const STATUS_CONFIG = {
    completed: {
        label: 'Completado',
        icon: CheckCircle,
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
    },
    running: {
        label: 'En progreso',
        icon: Loader2,
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        text: 'text-blue-600 dark:text-blue-400',
        animate: true
    },
    failed: {
        label: 'Fallido',
        icon: XCircle,
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        text: 'text-red-600 dark:text-red-400',
    }
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.failed;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
            <Icon className={`w-3.5 h-3.5 ${cfg.animate ? 'animate-spin' : ''}`} />
            {cfg.label}
        </span>
    );
}

function formatDateCR(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('es-CR', {
        timeZone: 'America/Costa_Rica',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatDuration(started, completed) {
    if (!started || !completed) return '—';
    const secs = Math.floor((new Date(completed) - new Date(started)) / 1000);
    if (secs < 0) return '0 seg';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
}

// ─── Modal de confirmación ──────────────────────────────────────────────────
function DeleteModal({ report, onConfirm, onCancel, isDeleting }) {
    if (!report) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
                {/* Header rojo */}
                <div className="bg-red-50 dark:bg-red-950/30 px-6 py-5 border-b border-red-100 dark:border-red-900/30 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-red-800 dark:text-red-300">
                            Eliminar reporte
                        </h3>
                        <p className="text-xs text-red-600/70 dark:text-red-400/70 font-mono mt-0.5">
                            #{report.id.slice(0, 8).toUpperCase()}
                        </p>
                    </div>
                </div>
                {/* Body */}
                <div className="px-6 py-5">
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Estás a punto de eliminar el reporte del <strong className="text-slate-800 dark:text-slate-200">{formatDateCR(report.started_at)}</strong>.
                        {report.status === 'completed' && report.total_scanned > 0 && (
                            <> Contiene datos de <strong className="text-slate-800 dark:text-slate-200">{report.total_scanned.toLocaleString()} archivos</strong> analizados.</>
                        )}
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            Esta acción es <strong>irreversible</strong>. Se eliminarán el reporte y todos los archivos asociados permanentemente.
                        </p>
                    </div>
                </div>
                {/* Actions */}
                <div className="px-6 pb-5 flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-md"
                    >
                        {isDeleting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Eliminando...</>
                        ) : (
                            <><Trash2 className="w-4 h-4" /> Sí, eliminar</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function DriveAuditHistory() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado de eliminación
    const [deleteTarget, setDeleteTarget] = useState(null);  // report object a eliminar
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchReports = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_URL}/drive-auditor/history?page=${page}&limit=10`, { withCredentials: true });
            const d = res.data.data;
            setReports(d.reports);
            setPagination({ page: d.page, totalPages: d.totalPages, total: d.total });
        } catch (err) {
            setError('No se pudo cargar el historial de reportes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchReports(1); }, [fetchReports]);

    const handlePage = (p) => {
        if (p < 1 || p > pagination.totalPages) return;
        fetchReports(p);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await axios.delete(`${API_URL}/drive-auditor/report/${deleteTarget.id}`, { withCredentials: true });

            // Optimistic: quitar de la lista local
            setReports(prev => prev.filter(r => r.id !== deleteTarget.id));
            setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));

            toast.success('Reporte eliminado correctamente');
            setDeleteTarget(null);

            // Si la página queda vacía y hay más páginas, ir a la anterior
            if (reports.length === 1 && pagination.page > 1) {
                fetchReports(pagination.page - 1);
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'No se pudo eliminar el reporte';
            toast.error(msg);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">
            {/* Modal */}
            <DeleteModal
                report={deleteTarget}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
                isDeleting={isDeleting}
            />

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                        title="Volver"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                                Historial de Auditorías
                            </h1>
                            {!loading && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {pagination.total} reporte{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => fetchReports(pagination.page)}
                        disabled={loading}
                        className="ml-auto p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 disabled:opacity-40"
                        title="Actualizar"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
                {/* Stats */}
                {!loading && reports.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { label: 'Total de auditorías', value: pagination.total, icon: Shield, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                            { label: 'Completadas', value: reports.filter(r => r.status === 'completed').length, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                            { label: 'Archivos revisados', value: reports.reduce((acc, r) => acc + (r.total_scanned || 0), 0).toLocaleString(), icon: HardDrive, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' }
                        ].map(({ label, value, icon: Icon, color, bg }) => (
                            <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
                                <div className={`p-2 rounded-xl bg-white dark:bg-slate-900 shadow-sm ${color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                                    <p className={`text-xl font-extrabold ${color}`}>{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Cargando historial...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">{error}</p>
                        <button onClick={() => fetchReports(1)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                            Reintentar
                        </button>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FileText className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Sin reportes todavía</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-xs">
                            Aún no has ejecutado ninguna auditoría de Google Drive.
                        </p>
                        <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                            Ir al Auditor
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report, idx) => {
                            const isLatest = idx === 0 && pagination.page === 1;
                            const canDelete = report.status !== 'running';
                            return (
                                <div
                                    key={report.id}
                                    className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${
                                        isLatest
                                            ? 'border-indigo-200 dark:border-indigo-800 shadow-md shadow-indigo-500/5'
                                            : 'border-slate-200 dark:border-slate-800'
                                    }`}
                                >
                                    {isLatest && (
                                        <div className="absolute -top-2.5 left-4">
                                            <span className="px-3 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-md">
                                                Más reciente
                                            </span>
                                        </div>
                                    )}
                                    <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                                            report.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                            report.status === 'running'   ? 'bg-blue-50 dark:bg-blue-900/20' :
                                            'bg-red-50 dark:bg-red-900/20'
                                        }`}>
                                            <Shield className={`w-6 h-6 ${
                                                report.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                                                report.status === 'running'   ? 'text-blue-600 dark:text-blue-400' :
                                                'text-red-500'
                                            }`} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <StatusBadge status={report.status} />
                                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                                                    #{report.id.slice(0, 8).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDateCR(report.started_at)}
                                                </span>
                                                {report.status === 'completed' && (
                                                    <span className="flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                                                        Duración: {formatDuration(report.started_at, report.completed_at)}
                                                    </span>
                                                )}
                                            </div>
                                            {report.status === 'failed' && report.error_message && (
                                                <p className="text-xs text-red-500 dark:text-red-400 mt-1 truncate max-w-md">
                                                    {report.error_message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Metrics */}
                                        {report.status === 'completed' && (
                                            <div className="flex items-center gap-5 text-center flex-shrink-0">
                                                <div>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Archivos</p>
                                                    <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                                                        {(report.total_scanned || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Riesgos</p>
                                                    <p className={`text-lg font-extrabold ${report.risk_count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                                        {(report.risk_count || 0).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {report.status === 'completed' && (
                                                <button
                                                    onClick={() => navigate(`/dashboard/drive-auditor/report/${report.id}`)}
                                                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Ver reporte
                                                </button>
                                            )}

                                            {/* Botón eliminar */}
                                            <button
                                                onClick={() => setDeleteTarget(report)}
                                                disabled={!canDelete}
                                                title={canDelete ? 'Eliminar reporte' : 'No se puede eliminar un reporte en ejecución'}
                                                className={`p-2.5 rounded-xl border transition-all duration-200 ${
                                                    canDelete
                                                        ? 'border-red-200 dark:border-red-900/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-700 opacity-0 group-hover:opacity-100'
                                                        : 'border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                }`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                            onClick={() => handlePage(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => handlePage(p)}
                                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-150 ${
                                        p === pagination.page
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePage(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600 dark:text-slate-400"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
