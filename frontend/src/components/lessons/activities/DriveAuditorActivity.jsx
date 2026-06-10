import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Shield, PlayCircle, Loader2, CheckCircle, ExternalLink, HardDrive, AlertTriangle, Award, Zap, Clock, Eye, History, ChevronRight, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DriveAuditorActivity = ({ item, data, playSuccess, playError, markLinkAsVisited, visitedLinks, isStandalone }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const [status, setStatus] = useState('idle'); // idle, loading, running, completed, error
    const [reportId, setReportId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const isVisited = visitedLinks?.has(item?.id);

    const [startedAt, setStartedAt] = useState(null);
    const [completedAt, setCompletedAt] = useState(null);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [totalScanned, setTotalScanned] = useState(0);
    const [riskCount, setRiskCount] = useState(0);
    const [showCancelModal, setShowCancelModal] = useState(false);
    
    const [limitInfo, setLimitInfo] = useState({ canRun: true, reason: null, nextAvailableDate: null, recentCount: 0 });
    const [recentReports, setRecentReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    const checkLimits = async () => {
        try {
            const res = await axios.get(`${API_URL}/drive-auditor/limit-status`, { withCredentials: true });
            setLimitInfo(res.data.data);
        } catch (error) {
            console.error("Error comprobando límites de auditoría", error);
        }
    };

    const fetchRecentReports = useCallback(async () => {
        setReportsLoading(true);
        try {
            const res = await axios.get(`${API_URL}/drive-auditor/history?page=1&limit=5`, { withCredentials: true });
            setRecentReports(res.data.data.reports || []);
        } catch (err) {
            console.error('Error cargando reportes recientes', err);
        } finally {
            setReportsLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        if (status === 'idle' || status === 'completed' || status === 'error') {
            checkLimits();
            fetchRecentReports();
        }
    }, [status]);

    // Timer para el tiempo transcurrido
    useEffect(() => {
        let interval;
        if ((status === 'running' || status === 'loading') && startedAt) {
            // Actualizar inmediatamente
            const updateTime = () => {
                const now = new Date();
                const diff = Math.floor((now - startedAt) / 1000);
                if (diff >= 0) {
                    const hours = Math.floor(diff / 3600).toString().padStart(2, '0');
                    const minutes = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
                    const seconds = (diff % 60).toString().padStart(2, '0');
                    setElapsedTime(`${hours}:${minutes}:${seconds}`);
                }
            };
            updateTime();
            interval = setInterval(updateTime, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, startedAt]);

    // Comprobar si hay un reporte guardado en localStorage o hacer un fetch del estado general
    useEffect(() => {
        const checkLatestStatus = async () => {
            try {
                const response = await axios.get(`${API_URL}/drive-auditor/latest`, { withCredentials: true });
                const report = response.data.data;
                if (report) {
                    setReportId(report.id);
                    if (report.started_at) {
                        setStartedAt(new Date(report.started_at));
                    }
                    if (report.completed_at) {
                        setCompletedAt(new Date(report.completed_at));
                    }
                    if (report.total_scanned !== undefined) {
                        setTotalScanned(report.total_scanned);
                    }
                    if (report.risk_count !== undefined) {
                        setRiskCount(report.risk_count);
                    }
                    if (report.status === 'running') {
                        setStatus('running');
                    } else if (report.status === 'completed') {
                        setStatus('completed');
                    } else if (report.status === 'failed') {
                        setStatus('error');
                        setErrorMessage(report.error_message || 'La auditoría falló anteriormente');
                    }
                }
            } catch (error) {
                console.error("Error comprobando estado inicial", error);
            }
        };
        checkLatestStatus();
    }, [API_URL]);

    const login = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        onSuccess: async (tokenResponse) => {
            try {
                setStatus('loading');
                setStartedAt(new Date());
                const { access_token } = tokenResponse;
                
                const response = await axios.post(`${API_URL}/drive-auditor/start`, {
                    access_token
                }, { withCredentials: true });

                const newReportId = response.data.data.reportId;
                setReportId(newReportId);
                setStatus('running');
                setCompletedAt(null);
                toast.success('Auditoría iniciada en segundo plano');
                playSuccess();
                
            } catch (error) {
                console.error("Error iniciando auditoría", error);
                setStatus('error');
                setErrorMessage(error.response?.data?.error || 'Error al iniciar la auditoría');
                toast.error(error.response?.data?.error || 'Error al iniciar la auditoría');
                playError();
            }
        },
        onError: error => {
            console.error('Login Failed:', error);
            toast.error('Error de autenticación con Google');
            setStatus('error');
            playError();
        }
    });

    // Polling si está running (opcional, ya que enviamos correo)
    useEffect(() => {
        let interval;
        if (status === 'running' && reportId) {
            interval = setInterval(async () => {
                try {
                    const res = await axios.get(`${API_URL}/drive-auditor/status/${reportId}`, { withCredentials: true });
                    const st = res.data.data.status;
                    if (res.data.data.total_scanned !== undefined) {
                        setTotalScanned(res.data.data.total_scanned);
                    }
                    if (res.data.data.risk_count !== undefined) {
                        setRiskCount(res.data.data.risk_count);
                    }
                    if (st === 'completed') {
                        setStatus('completed');
                        if (res.data.data.completed_at) {
                            setCompletedAt(new Date(res.data.data.completed_at));
                        }
                        toast.success('Auditoría completada exitosamente');
                        playSuccess();
                        clearInterval(interval);
                    } else if (st === 'failed') {
                        setStatus('error');
                        const errMsg = res.data.data.error_message || 'La auditoría falló';
                        setErrorMessage(errMsg);
                        toast.error(errMsg);
                        playError();
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error("Error polling", e);
                }
            }, 10000); // 10 segundos
        }
        return () => {
            if (interval) clearInterval(interval);
        }
    }, [status, reportId, API_URL, playSuccess, playError]);

    // Sincronizar el progreso en el backend cuando se complete localmente
    useEffect(() => {
        if (status === 'completed' && markLinkAsVisited && visitedLinks && !visitedLinks.has(item?.id) && item?.id) {
            markLinkAsVisited(item.id).catch(err => {
                console.error("Error al registrar el progreso de la auditoría:", err);
            });
        }
    }, [status, item?.id, markLinkAsVisited, visitedLinks]);

    const handleCancel = async () => {
        if (!reportId) return;
        setShowCancelModal(false);
        try {
            await axios.post(`${API_URL}/drive-auditor/cancel`, { reportId }, { withCredentials: true });
            setStatus('error');
            setErrorMessage('Cancelado por el usuario');
            toast.success('Auditoría cancelada');
        } catch (error) {
            console.error("Error cancelando", error);
            toast.error('No se pudo cancelar la auditoría');
        }
    };

    const getDurationText = () => {
        if (!startedAt || !completedAt) return '';
        const diffMs = completedAt - startedAt;
        const diffSecs = Math.floor(diffMs / 1000);
        if (diffSecs < 0) return '0 seg';
        const hours = Math.floor(diffSecs / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        const seconds = diffSecs % 60;

        const parts = [];
        if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} min${minutes > 1 ? 's' : ''}`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds} seg`);
        return parts.join(' ');
    };

    const handleViewReport = () => {
        if (reportId) {
            navigate(`/dashboard/drive-auditor/report/${reportId}`);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
            <div className="p-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                    <Shield className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                    Drive Auditor
                </h2>
               
                
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg leading-relaxed mb-10">
                    {data?.description || 'Esta aplicación auxiliar de CGRSegur@ analiza permisos de Google Drive, identifica archivos accesibles públicamente, mapea relaciones de compartición a nivel de dominio y exporta los resultados. Sus datos permanecen privados.'}
                </p>

                {!isStandalone && item?.id && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                        {isVisited ? (
                            <span className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-xs font-black uppercase tracking-wider border border-green-500/30 flex items-center gap-1.5 shadow-lg shadow-green-500/5">
                                <CheckCircle className="w-4 h-4" /> Completada
                            </span>
                        ) : (
                            <>
                                {!!item?.is_required ? (
                                    <span className="px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-xs font-black uppercase tracking-wider border border-orange-500/20 flex items-center gap-1.5 shadow-lg shadow-orange-500/5 animate-pulse">
                                        <Clock className="w-4 h-4" /> Requerida - Pendiente
                                    </span>
                                ) : (
                                    <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-500/20 flex items-center gap-1.5 shadow-lg">
                                        <Eye className="w-4 h-4" /> Opcional - Pendiente
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                )}

                {status === 'idle' || status === 'error' ? (
                    <div className="flex flex-col items-center w-full">
                        {item?.points > 0 && (
                            <div className="mb-6 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 font-black text-xs uppercase tracking-wider">
                                <Zap className="w-3.5 h-3.5" /> Recompensa: +{item.points} PTS
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl max-w-lg w-full">
                                <h4 className="text-red-800 dark:text-red-300 font-semibold mb-2">Error en la auditoría</h4>
                                <p className="text-red-600 dark:text-red-400 text-sm break-words">{errorMessage}</p>
                            </div>
                        )}

                        {!limitInfo.canRun && limitInfo.reason === 'limit_reached' && (
                            <div className="mb-6 p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl max-w-lg w-full text-center shadow-sm">
                                <h4 className="text-amber-800 dark:text-amber-400 font-bold mb-1.5 flex items-center justify-center gap-1.5 text-sm uppercase tracking-wider">
                                    <AlertTriangle className="w-4 h-4" /> Límite Diario Alcanzado
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mt-1">
                                    Has completado el máximo de 2 análisis de Drive permitidos por día para evitar saturar el servicio.
                                </p>
                                {limitInfo.nextAvailableDate && (
                                    <p className="text-amber-700 dark:text-amber-400 text-xs font-semibold mt-3 bg-amber-500/10 dark:bg-amber-500/5 py-2.5 px-4 rounded-xl border border-amber-500/20 inline-block">
                                        Podrás volver a correr la auditoría y enviar correos a partir de:<br />
                                        <span className="font-extrabold text-sm block mt-1.5">
                                            {new Date(limitInfo.nextAvailableDate).toLocaleString('es-CR', { 
                                                timeZone: 'America/Costa_Rica',
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}

                        {!limitInfo.canRun && limitInfo.reason === 'running' && (
                            <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl max-w-lg w-full text-center shadow-sm">
                                <h4 className="text-indigo-800 dark:text-indigo-400 font-bold mb-1.5 flex items-center justify-center gap-1.5 text-sm uppercase tracking-wider">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Auditoría en Progreso
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mt-1">
                                    Ya tienes una auditoría ejecutándose en segundo plano. Espera a que esta finalice.
                                </p>
                            </div>
                        )}

                        <button 
                            onClick={() => {
                                if (!limitInfo.canRun) {
                                    if (limitInfo.reason === 'limit_reached') {
                                        toast.error(`Límite diario alcanzado. Podrás correr una auditoría a partir de: ${new Date(limitInfo.nextAvailableDate).toLocaleString('es-CR', { timeZone: 'America/Costa_Rica' })}`);
                                    } else if (limitInfo.reason === 'running') {
                                        toast.error('Ya tienes un análisis en curso.');
                                    }
                                    return;
                                }
                                login();
                            }}
                            disabled={!limitInfo.canRun}
                            className={`group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                !limitInfo.canRun
                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] hover:-translate-y-1'
                            }`}
                        >
                            <PlayCircle className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                            {status === 'error' ? 'Reintentar auditoría' : 'Iniciar proceso en segundo plano'}
                        </button>
                    </div>
                ) : status === 'loading' || status === 'running' ? (
                    <div className="flex flex-col items-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md">
                        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            Auditoría en Progreso
                        </h4>
                        
                        {startedAt && (
                            <div className="mt-4 mb-2 flex flex-col items-center text-sm font-medium text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-6 py-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30 w-full">
                                <span className="mb-2 pb-2 border-b border-indigo-200/50 dark:border-indigo-800/50 w-full text-center">
                                    Iniciado el {startedAt.toLocaleDateString()} a las {startedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <div className="text-center pb-3 border-b border-indigo-200/50 dark:border-indigo-800/50 w-full mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500/80 dark:text-indigo-400/80 mb-1 block">
                                        Duración del proceso
                                    </span>
                                    <span className="text-2xl tabular-nums tracking-wider font-extrabold">{elapsedTime}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 w-full text-center">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500/80 dark:text-indigo-400/80 mb-1 block">
                                            Archivos Escaneados
                                        </span>
                                        <span className="text-xl tabular-nums font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center">
                                            <HardDrive className="w-4 h-4 mr-1.5 text-indigo-400" />
                                            {totalScanned.toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-500/80 dark:text-indigo-400/80 mb-1 block">
                                            Riesgos Detectados
                                        </span>
                                        <span className={`text-xl tabular-nums font-bold flex items-center justify-center ${riskCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                            <AlertTriangle className={`w-4 h-4 mr-1.5 ${riskCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                                            {riskCount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4 text-center">
                            Estamos analizando tus archivos. Recibirás un correo cuando el proceso termine, o puedes esperar aquí.
                        </p>
                        
                        <button 
                            onClick={() => setShowCancelModal(true)}
                            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-lg transition-colors border border-red-200 dark:border-red-800/30"
                        >
                            Cancelar proceso
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center p-6 bg-green-50 dark:bg-emerald-900/20 rounded-2xl border border-green-200 dark:border-emerald-800 w-full max-w-md">
                        <div className="w-16 h-16 bg-green-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-green-800 dark:text-emerald-300">
                            Auditoría Completada
                        </h4>
                        
                        {item?.points > 0 && (
                            <div className="mt-3 mb-2 flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-yellow-500 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(234,179,8,0.4)] animate-bounce border border-yellow-400">
                                <Award className="w-4 h-4 text-slate-950" />
                                <span>+{item.points} PUNTOS GANADOS</span>
                            </div>
                        )}

                        {startedAt && completedAt && (
                            <div className="mt-4 mb-4 flex flex-col items-center text-sm font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/30 dark:bg-emerald-950/20 px-6 py-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 w-full gap-2 transition-all">
                                <div className="flex justify-between w-full border-b border-emerald-500/10 pb-2 gap-4">
                                    <span className="opacity-80">Tiempo transcurrido:</span>
                                    <span className="font-extrabold text-slate-900 dark:text-white">{getDurationText()}</span>
                                </div>
                                <div className="flex justify-between w-full border-b border-emerald-500/10 pb-2 gap-4">
                                    <span className="opacity-80">Archivos analizados:</span>
                                    <span className="font-extrabold text-slate-900 dark:text-white">{totalScanned.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between w-full gap-4">
                                    <span className="opacity-80">Riesgos encontrados:</span>
                                    <span className={`font-extrabold ${riskCount > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>{riskCount.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-green-600 dark:text-emerald-400 mt-2 text-center mb-6">
                            El análisis de tus archivos finalizó con éxito. Puedes ver los resultados en el panel de detalles.
                        </p>
                        <button 
                            onClick={handleViewReport}
                            className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all duration-200 bg-green-600 border border-transparent rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 shadow-md hover:shadow-lg"
                        >
                            Ver reporte detallado
                        </button>

                        <button 
                            onClick={() => {
                                setStatus('idle');
                                setErrorMessage('');
                            }}
                            className="mt-4 w-full px-6 py-2.5 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl text-xs font-black text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 uppercase tracking-widest bg-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                            Volver a correr reporte / Auditar de nuevo
                        </button>
                    </div>
                )}
            </div>

            {/* Historial compacto */}
            {(recentReports.length > 0 || reportsLoading) && (
                <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-400" />
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Auditorías anteriores
                            </h3>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/drive-auditor/history')}
                            className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                        >
                            Ver todo <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {reportsLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentReports.map(report => {
                                const statusColors = {
                                    completed: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
                                    running:   'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
                                    failed:    'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                                };
                                const statusLabel = { completed: 'Completado', running: 'En progreso', failed: 'Fallido' };
                                const StatusIcon = report.status === 'completed' ? CheckCircle : report.status === 'running' ? Loader2 : XCircle;
                                const dateStr = report.started_at
                                    ? new Date(report.started_at).toLocaleString('es-CR', {
                                        timeZone: 'America/Costa_Rica',
                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                      })
                                    : '—';
                                return (
                                    <div
                                        key={report.id}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group/item"
                                    >
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[report.status] || statusColors.failed}`}>
                                            <StatusIcon className={`w-3 h-3 ${report.status === 'running' ? 'animate-spin' : ''}`} />
                                            {statusLabel[report.status] || 'Fallido'}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{dateStr}</p>
                                            {report.status === 'completed' && (
                                                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                                    {(report.total_scanned || 0).toLocaleString()} archivos &bull; {(report.risk_count || 0).toLocaleString()} riesgos
                                                </p>
                                            )}
                                        </div>
                                        {report.status === 'completed' && (
                                            <button
                                                onClick={() => navigate(`/dashboard/drive-auditor/report/${report.id}`)}
                                                className="opacity-0 group-hover/item:opacity-100 p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all"
                                                title="Ver reporte"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Modal de Cancelación */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden transform scale-100 transition-all">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                ¿Cancelar la auditoría?
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                                Si cancelas el proceso ahora, el progreso actual se perderá y deberás iniciar un nuevo escaneo desde cero. ¿Estás seguro de que deseas continuar?
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <button 
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors"
                                >
                                    No, mantener
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    className="flex-1 px-4 py-3 border border-transparent rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none shadow-md hover:shadow-lg transition-all"
                                >
                                    Sí, cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriveAuditorActivity;
