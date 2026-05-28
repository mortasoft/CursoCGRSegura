import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, RefreshCw, Loader2, HardDrive, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminHeader from '../components/admin/AdminHeader';

export default function AdminDriveAuditor() {
    const API_URL = import.meta.env.VITE_API_URL;
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedAuditId, setSelectedAuditId] = useState(null);
    const [auditDetails, setAuditDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const fetchAudits = async (isRefresh = false) => {
        try {
            if (isRefresh && !selectedAuditId) setRefreshing(true);
            const response = await axios.get(`${API_URL}/drive-auditor/admin/running`, { withCredentials: true });
            setAudits(response.data.data || []);
        } catch (error) {
            console.error('Error cargando auditorías:', error);
            toast.error('Error al cargar procesos en ejecución');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchAuditDetails = async (id) => {
        setLoadingDetails(true);
        try {
            const response = await axios.get(`${API_URL}/drive-auditor/admin/report/${id}`, { withCredentials: true });
            setAuditDetails(response.data.data);
        } catch (error) {
            console.error('Error fetching details', error);
            toast.error('No se pudo cargar el detalle');
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleRowClick = (auditId) => {
        setSelectedAuditId(auditId);
        fetchAuditDetails(auditId);
    };

    const handleCancelAdmin = async (reportId) => {
        if (!window.confirm('¿Estás seguro de detener este proceso? El usuario tendrá que iniciarlo nuevamente desde cero.')) return;
        
        try {
            await axios.post(`${API_URL}/drive-auditor/admin/cancel`, { reportId }, { withCredentials: true });
            toast.success('Proceso detenido exitosamente');
            closeModal();
            fetchAudits(true);
        } catch (error) {
            console.error('Error al detener proceso:', error);
            toast.error(error.response?.data?.error || 'Error al detener el proceso');
        }
    };

    const getSharingBadge = (level) => {   };

    const closeModal = () => {
        setSelectedAuditId(null);
        setAuditDetails(null);
    };

    useEffect(() => {
        fetchAudits();
        
        // Auto-refresh cada 10 segundos
        const interval = setInterval(() => {
            fetchAudits(true);
            if (selectedAuditId) {
                fetchAuditDetails(selectedAuditId);
            }
        }, 10000);
        
        return () => clearInterval(interval);
    }, [selectedAuditId]);

    const handleRefresh = () => {
        fetchAudits(true);
        if (selectedAuditId) {
            fetchAuditDetails(selectedAuditId);
        }
    };

    return (
        <div className="animate-fade-in pb-20">
            <AdminHeader 
                title="Auditorías de Drive Activas" 
                description="Monitoreo en tiempo real de los procesos de auditoría en segundo plano"
                icon={HardDrive}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                                <Shield className="w-5 h-5 mr-2 text-indigo-500" />
                                Procesos en Ejecución ({audits.length})
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Procesos actualmente analizando Google Drive de los funcionarios.
                            </p>
                        </div>
                        <button 
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                    </div>

                    {loading && !refreshing && audits.length === 0 ? (
                        <div className="p-12 flex justify-center">
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                    ) : audits.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Sin procesos activos</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                En este momento ningún funcionario está ejecutando la auditoría de Drive.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Funcionario
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Inicio
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Archivos Escaneados
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Archivos en Riesgo
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                                    {audits.map((audit) => (
                                        <tr key={audit.id} onClick={() => handleRowClick(audit.id)} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                                                        {audit.first_name.charAt(0)}{audit.last_name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                            {audit.first_name} {audit.last_name}
                                                        </div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                                            {audit.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-900 dark:text-white">
                                                    {new Date(audit.started_at).toLocaleTimeString()}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(audit.started_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                                                    <Loader2 className="w-4 h-4 mr-2 text-indigo-500 animate-spin" />
                                                    {audit.total_scanned.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-medium ${audit.risk_count > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {audit.risk_count.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                    Analizando...
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {selectedAuditId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                                <Loader2 className="w-5 h-5 mr-2 text-indigo-500 animate-spin" />
                                Detalle en vivo del Escaneo
                            </h3>
                            <div className="flex items-center space-x-4">
                                <button 
                                    onClick={() => handleCancelAdmin(selectedAuditId)}
                                    className="flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-800/30"
                                >
                                    <StopCircle className="w-4 h-4 mr-1.5" />
                                    Detener Proceso
                                </button>
                                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1">
                            {loadingDetails && !auditDetails ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                </div>
                            ) : auditDetails ? (
                                <div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Funcionario</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{auditDetails.report.first_name} {auditDetails.report.last_name}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Archivos Escaneados</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{auditDetails.report.total_scanned.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Riesgos Detectados</p>
                                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{auditDetails.report.risk_count.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Estado</p>
                                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
                                                En Progreso <span className="flex h-2 w-2 relative ml-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span></span>
                                            </p>
                                        </div>
                                    </div>

                                    <h4 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                                        Últimos Archivos Detectados ({auditDetails.files.length})
                                    </h4>
                                    
                                    {auditDetails.files.length > 0 ? (
                                        <div className="overflow-hidden border border-slate-200 dark:border-slate-700 rounded-xl">
                                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                                                <thead className="bg-slate-50 dark:bg-slate-800/80">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Archivo</th>
                                                        <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Propietario</th>
                                                        <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Nivel de Acceso</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                                                    {auditDetails.files.map((file, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                            <td className="px-4 py-3 break-all font-medium text-slate-900 dark:text-slate-200">
                                                                {file.file_name}
                                                            </td>
                                                            <td className="px-4 py-3 truncate max-w-[150px] text-slate-500 dark:text-slate-400">
                                                                {file.owner_email}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                                                    {file.sharing_level}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 p-4 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                                            Todavía no se han encontrado archivos con acceso público o externo en este escaneo.
                                        </p>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
