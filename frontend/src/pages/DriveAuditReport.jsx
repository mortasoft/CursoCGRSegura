import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Shield, HelpCircle, FileText, Download, Users, Lock, Unlock, Globe, Link as LinkIcon, ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileSpreadsheet, Presentation, File, Image as ImageIcon, Folder, FileQuestion, Mail } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL;

const formatNum = (n) => {
    if (n == null || isNaN(n)) return '0';
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const DriveAuditorReport = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/drive-auditor');
        }
    };
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtros de tabla
    const [search, setSearch] = useState('');
    const [filterSharing, setFilterSharing] = useState('Todos');
    const [filterType, setFilterType] = useState('Todos');
    const [domainPage, setDomainPage] = useState(1);
    const DOMAINS_PER_PAGE = 6;
    const [filesPage, setFilesPage] = useState(1);
    const FILES_PER_PAGE = 10;
    const [showLegendModal, setShowLegendModal] = useState(false);
    const [sendingFiles, setSendingFiles] = useState({});

    const handleSendWarning = async (file) => {
        const fileId = file.file_id;
        setSendingFiles(prev => ({ ...prev, [fileId]: true }));
        try {
            await axios.post(`${API_URL}/drive-auditor/send-warning`, {
                ownerEmail: file.owner_email,
                ownerName: file.owner_name,
                fileName: file.file_name,
                sharingLevel: file.sharing_level === 'Restringido' ? 'Restringido (Externo)' : file.sharing_level,
                fileLink: file.file_link
            }, { withCredentials: true });
            toast.success(`Alerta enviada a ${file.owner_email}`);
        } catch (error) {
            console.error("Error sending warning email", error);
            toast.error("No se pudo enviar el correo de alerta");
        } finally {
            setSendingFiles(prev => ({ ...prev, [fileId]: false }));
        }
    };

    useEffect(() => {
        setFilesPage(1);
    }, [search, filterSharing, filterType]);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`${API_URL}/drive-auditor/report/${reportId}`, { withCredentials: true });
                setReportData(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching report", err);
                setError("No se pudo cargar el reporte. Es posible que no tengas permisos o no exista.");
                setLoading(false);
            }
        };
        fetchReport();
    }, [reportId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0d1127]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !reportData) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-[#0d1127]">
                <div className="text-center">
                    <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Error</h2>
                    <p className="text-slate-600 dark:text-slate-400">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    const { report, files } = reportData;
    const sharingMap = JSON.parse(report.sharing_map_json || '{}');
    const externalDomains = JSON.parse(report.external_domains_json || '{}');

    // --- Security Score ---
    const totalFiles = files.length || 1;
    const counts = {
        private:            sharingMap.private             || 0,
        restrictedInternal: sharingMap.restricted_internal || 0,
        restrictedExternal: sharingMap.restricted_external || 0,
        domain:             sharingMap.domain              || 0,
        link:               sharingMap.link                || 0,
        public:             sharingMap.public              || 0,
    };

    // Soporte para reportes antiguos
    if (sharingMap.restricted !== undefined && counts.restrictedInternal === 0 && counts.restrictedExternal === 0) {
        counts.restrictedInternal = sharingMap.restricted;
    }

    // Weighted risk (0=safe, 1=fully risky per file)
    const riskWeighted =
        counts.private             * 0.00 +
        counts.restrictedInternal  * 0.05 +
        counts.restrictedExternal  * 0.25 +
        counts.domain              * 0.30 +
        counts.link                * 0.60 +
        counts.public              * 1.00;
    const rawScore = Math.round((1 - riskWeighted / totalFiles) * 100);
    const securityScore = Math.max(0, Math.min(100, rawScore));
    const riskyFiles = counts.link + counts.public;
    const riskyPercent = Math.round((riskyFiles / totalFiles) * 100);

    const getSecurityLevel = (score) => {
        if (score >= 90) return { label: 'Super Seguro',      color: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', ring: '#10b981' };
        if (score >= 70) return { label: 'Seguro',            color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-950/30',       text: 'text-blue-600 dark:text-blue-400',       ring: '#3b82f6' };
        if (score >= 50) return { label: 'Riesgo Moderado',   color: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-950/30',     text: 'text-amber-600 dark:text-amber-400',     ring: '#f59e0b' };
        if (score >= 30) return { label: 'Riesgo Alto',       color: '#f97316', bg: 'bg-orange-50 dark:bg-orange-950/30',   text: 'text-orange-600 dark:text-orange-400',   ring: '#f97316' };
        return              { label: 'Crítico',               color: '#ef4444', bg: 'bg-red-50 dark:bg-red-950/30',         text: 'text-red-600 dark:text-red-400',         ring: '#ef4444' };
    };
    const secLevel = getSecurityLevel(securityScore);

    // SVG arc helpers (270-degree gauge)
    const GAUGE_R = 58;
    const GAUGE_CX = 80;
    const GAUGE_CY = 80;
    const GAUGE_SWEEP = 270; // degrees
    const toRad = (deg) => (deg * Math.PI) / 180;
    const gaugeStart = 135; // degrees from 3-o-clock
    const gaugeArcLen = (pct) => (pct / 100) * GAUGE_SWEEP;
    const polarToXY = (cx, cy, r, angleDeg) => {
        const a = toRad(angleDeg - 90);
        return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    };
    const describeArc = (cx, cy, r, startAngle, endAngle) => {
        const s = polarToXY(cx, cy, r, startAngle);
        const e = polarToXY(cx, cy, r, endAngle);
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
    };
    const trackPath = describeArc(GAUGE_CX, GAUGE_CY, GAUGE_R, gaugeStart, gaugeStart + GAUGE_SWEEP);
    const filledAngle = gaugeArcLen(securityScore);
    const scorePath  = filledAngle > 0
        ? describeArc(GAUGE_CX, GAUGE_CY, GAUGE_R, gaugeStart, gaugeStart + filledAngle)
        : null;


    // Preparar datos para gráficos
    const pieData = [
        { name: 'Privado', value: counts.private, color: '#10b981' }, // Verde
        { name: 'Restringido (Int)', value: counts.restrictedInternal, color: '#3b82f6' }, // Azul
        { name: 'Restringido (Ext)', value: counts.restrictedExternal, color: '#ec4899' }, // Fucsia/Rosa
        { name: 'Dominio', value: counts.domain, color: '#f59e0b' }, // Naranja
        { name: 'Con Enlace', value: counts.link, color: '#ef4444' }, // Rojo
        { name: 'Público', value: counts.public, color: '#8b5cf6' } // Morado
    ].filter(d => d.value > 0);

    // Tipos de archivo (agrupación manual rápida)
    const mimeMap = {
        'document': 0, 'spreadsheet': 0, 'presentation': 0, 'pdf': 0, 'image': 0, 'folder': 0, 'other': 0
    };
    
    files.forEach(f => {
        const type = f.mime_type || '';
        if (type.includes('document')) mimeMap['document']++;
        else if (type.includes('spreadsheet')) mimeMap['spreadsheet']++;
        else if (type.includes('presentation')) mimeMap['presentation']++;
        else if (type.includes('pdf')) mimeMap['pdf']++;
        else if (type.includes('image')) mimeMap['image']++;
        else if (type.includes('folder')) mimeMap['folder']++;
        else mimeMap['other']++;
    });

    const barData = [
        { name: 'Documentos', count: mimeMap.document, formattedCount: formatNum(mimeMap.document), color: '#3b82f6' },
        { name: 'Hojas', count: mimeMap.spreadsheet, formattedCount: formatNum(mimeMap.spreadsheet), color: '#10b981' },
        { name: 'Diapositivas', count: mimeMap.presentation, formattedCount: formatNum(mimeMap.presentation), color: '#f59e0b' },
        { name: 'PDFs', count: mimeMap.pdf, formattedCount: formatNum(mimeMap.pdf), color: '#ef4444' },
        { name: 'Imágenes', count: mimeMap.image, formattedCount: formatNum(mimeMap.image), color: '#8b5cf6' },
        { name: 'Carpetas', count: mimeMap.folder, formattedCount: formatNum(mimeMap.folder), color: '#64748b' },
        { name: 'Otros', count: mimeMap.other, formattedCount: formatNum(mimeMap.other), color: '#94a3b8' }
    ];

    const getFileTypeInfo = (mimeType = '') => {
        if (mimeType.includes('document')) return { Icon: FileText, tailwind: 'text-blue-500' };
        if (mimeType.includes('spreadsheet')) return { Icon: FileSpreadsheet, tailwind: 'text-emerald-500' };
        if (mimeType.includes('presentation')) return { Icon: Presentation, tailwind: 'text-amber-500' };
        if (mimeType.includes('pdf')) return { Icon: File, tailwind: 'text-red-500' };
        if (mimeType.includes('image')) return { Icon: ImageIcon, tailwind: 'text-purple-500' };
        if (mimeType.includes('folder')) return { Icon: Folder, tailwind: 'text-slate-500 dark:text-slate-400' };
        return { Icon: FileQuestion, tailwind: 'text-slate-400' };
    };

    // Dominios tabla
    const domainList = Object.entries(externalDomains).map(([domain, count]) => ({ domain, count })).sort((a,b) => b.count - a.count);
    const totalDomainPages = Math.ceil(domainList.length / DOMAINS_PER_PAGE);
    const paginatedDomains = domainList.slice((domainPage - 1) * DOMAINS_PER_PAGE, domainPage * DOMAINS_PER_PAGE);

    // Filtrar archivos para la tabla
    const filteredFiles = files.filter(f => {
        const matchesSearch = 
            f.file_name.toLowerCase().includes(search.toLowerCase()) || 
            (f.owner_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (f.owner_email || '').toLowerCase().includes(search.toLowerCase()) ||
            (f.shared_with_emails || '').toLowerCase().includes(search.toLowerCase());
        
        let matchesSharing = false;
        if (filterSharing === 'Todos') {
            matchesSharing = true;
        } else if (filterSharing === 'Dominio') {
            matchesSharing = f.sharing_level === 'Dominio Publico' || f.sharing_level === 'Dominio con Enlace';
        } else {
            matchesSharing = f.sharing_level === filterSharing;
        }
        
        let matchesType = true;
        if (filterType !== 'Todos') {
            const mimeType = f.mime_type || '';
            if (filterType === 'other') {
                const known = ['document', 'spreadsheet', 'presentation', 'pdf', 'image', 'folder'];
                matchesType = !known.some(k => mimeType.includes(k));
            } else {
                matchesType = mimeType.includes(filterType);
            }
        }
        
        return matchesSearch && matchesSharing && matchesType;
    });

    const totalFilesPages = Math.ceil(filteredFiles.length / FILES_PER_PAGE);
    const paginatedFiles = filteredFiles.slice((filesPage - 1) * FILES_PER_PAGE, filesPage * FILES_PER_PAGE);

    const getSharingBadge = (level) => {
        if (level === 'Publico') return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md text-xs font-bold flex items-center gap-1"><Globe className="w-3 h-3"/> Público</span>;
        if (level === 'Con Enlace') return <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-md text-xs font-bold flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Enlace</span>;
        if (level === 'Dominio Publico' || level === 'Dominio con Enlace') return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-md text-xs font-bold flex items-center gap-1"><Users className="w-3 h-3"/> Dominio</span>;
        if (level === 'Restringido') return <span className="px-2 py-1 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 rounded-md text-xs font-bold flex items-center gap-1"><Unlock className="w-3 h-3"/> Restringido (Ext)</span>;
        return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md text-xs font-bold flex items-center gap-1"><Lock className="w-3 h-3"/> Privado</span>;
    };

    const CustomYAxisTick = (props) => {
        const { x, y, payload } = props;
        const nameMap = {
            'Documentos': 'document',
            'Hojas': 'spreadsheet',
            'Diapositivas': 'presentation',
            'PDFs': 'pdf',
            'Imágenes': 'image',
            'Carpetas': 'folder',
            'Otros': 'other'
        };
        const mimeType = nameMap[payload.value] || 'other';
        const typeInfo = getFileTypeInfo(mimeType);
        const Icon = typeInfo.Icon;

        return (
            <g transform={`translate(${x},${y})`}>
                <foreignObject x="-120" y="-12" width="115" height="24">
                    <div 
                        className="flex items-center justify-end h-full gap-2 w-full pr-2 cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => {
                            const filterVal = nameMap[payload.value];
                            if (filterVal) {
                                setFilterType(prev => prev === filterVal ? 'Todos' : filterVal);
                                const tableEl = document.getElementById('details-table');
                                if (tableEl) {
                                    tableEl.scrollIntoView({ behavior: 'smooth' });
                                }
                            }
                        }}
                    >
                        <span className="text-[11px] text-slate-500 font-medium leading-none">{payload.value}</span>
                        <Icon className={`w-3.5 h-3.5 ${typeInfo.tailwind}`} />
                    </div>
                </foreignObject>
            </g>
        );
    };

    const handleBarClick = (data) => {
        if (data && data.name) {
            const nameMap = {
                'Documentos': 'document',
                'Hojas': 'spreadsheet',
                'Diapositivas': 'presentation',
                'PDFs': 'pdf',
                'Imágenes': 'image',
                'Carpetas': 'folder',
                'Otros': 'other'
            };
            const filterVal = nameMap[data.name];
            if (filterVal) {
                setFilterType(prev => prev === filterVal ? 'Todos' : filterVal);
                const tableEl = document.getElementById('details-table');
                if (tableEl) {
                    tableEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    const handlePieClick = (data) => {
        if (data && data.name) {
            const nameMap = {
                'Privado': 'Privado',
                'Restringido (Int)': 'Restringido_Interno',
                'Restringido (Ext)': 'Restringido',
                'Dominio': 'Dominio',
                'Con Enlace': 'Con Enlace',
                'Público': 'Publico'
            };
            const filterVal = nameMap[data.name];
            if (filterVal) {
                setFilterSharing(prev => prev === filterVal ? 'Todos' : filterVal);
                const tableEl = document.getElementById('details-table');
                if (tableEl) {
                    tableEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0d1127] text-slate-800 dark:text-slate-200 pb-12">
            {/* Header Navbar */}
            <div className="bg-white dark:bg-[#0d1127] border-b border-slate-200 dark:border-white/5 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <button onClick={handleBack} className="mr-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                Reporte de Auditoría de Drive
                                <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                                    {formatNum(files.length)} archivos
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generado: {new Date(report.completed_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* Security Score Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3">

                        {/* Left: Gauge */}
                        <div className="flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Nivel de Protección</p>
                            <svg width="160" height="160" viewBox="0 0 160 160">
                                {/* track */}
                                <path d={trackPath} fill="none" stroke="#e2e8f0" className="dark:stroke-white/10" strokeWidth="12" strokeLinecap="round" />
                                {/* filled arc */}
                                {scorePath && (
                                    <path d={scorePath} fill="none" stroke={secLevel.color} strokeWidth="12" strokeLinecap="round"
                                        style={{ filter: `drop-shadow(0 0 6px ${secLevel.color}60)` }} />
                                )}
                                {/* score text */}
                                <text x="80" y="76" textAnchor="middle" dominantBaseline="middle"
                                    fontSize="32" fontWeight="800" fill={secLevel.color}>
                                    {securityScore}
                                </text>
                                <text x="80" y="99" textAnchor="middle" dominantBaseline="middle"
                                    fontSize="11" fontWeight="600" fill="#94a3b8">
                                    / 100
                                </text>
                            </svg>
                            <span className={`mt-2 px-4 py-1.5 rounded-full text-sm font-extrabold ${secLevel.bg} ${secLevel.text}`}>
                                {secLevel.label}
                            </span>
                        </div>

                        {/* Center: Risk breakdown */}
                        <div className="flex flex-col justify-center p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-white/5 gap-5">
                            <div>
                                <div className="flex items-end justify-between mb-1.5">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Archivos en Riesgo</span>
                                    <span className="text-2xl font-extrabold" style={{ color: riskyPercent > 30 ? '#ef4444' : riskyPercent > 10 ? '#f97316' : '#10b981' }}>
                                        {riskyPercent}%
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{
                                            width: `${riskyPercent}%`,
                                            background: riskyPercent > 30 ? 'linear-gradient(90deg,#f97316,#ef4444)' : riskyPercent > 10 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : '#10b981'
                                        }} />
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">
                                    {formatNum(riskyFiles)} de {formatNum(totalFiles)} archivos expuestos públicamente o con enlace
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Públicos',           val: counts.public,             color: '#ef4444', icon: '🌐' },
                                    { label: 'Con Enlace',         val: counts.link,               color: '#f97316', icon: '🔗' },
                                    { label: 'Dominio',            val: counts.domain,             color: '#f59e0b', icon: '🏢' },
                                    { label: 'Restringidos (Ext)', val: counts.restrictedExternal, color: '#ec4899', icon: '🔒' },
                                    { label: 'Restringidos (Int)', val: counts.restrictedInternal, color: '#3b82f6', icon: '👥' },
                                ].map(item => (
                                    <div key={item.label} className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-xl px-3 py-2">
                                        <span className="text-base leading-none">{item.icon}</span>
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-medium leading-none">{item.label}</p>
                                            <p className="text-sm font-extrabold mt-0.5" style={{ color: item.color }}>{formatNum(item.val)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right: Level scale */}
                        <div className="flex flex-col justify-center p-8 gap-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Escala de Seguridad</p>
                            {[
                                { min: 90, max: 100, label: 'Super Seguro',    color: '#10b981', desc: 'Casi todos los archivos privados' },
                                { min: 70, max: 89,  label: 'Seguro',          color: '#3b82f6', desc: 'Pocos archivos compartidos' },
                                { min: 50, max: 69,  label: 'Riesgo Moderado', color: '#f59e0b', desc: 'Varios archivos con acceso amplio' },
                                { min: 30, max: 49,  label: 'Riesgo Alto',     color: '#f97316', desc: 'Muchos archivos expuestos' },
                                { min: 0,  max: 29,  label: 'Crítico',         color: '#ef4444', desc: 'Exposición masiva de datos' },
                            ].map(lvl => {
                                const isActive = securityScore >= lvl.min && securityScore <= lvl.max;
                                return (
                                    <div key={lvl.label}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${isActive ? 'ring-2 shadow-sm' : 'opacity-50'}`}
                                        style={isActive ? { ringColor: lvl.color, boxShadow: `0 0 0 2px ${lvl.color}` } : {}}>
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lvl.color }} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{lvl.label}
                                                <span className="ml-1.5 font-normal text-slate-400">{lvl.min}–{lvl.max}</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{lvl.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Visibilidad Compartida</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Desglose por alcance de permiso</p>
                            </div>
                            <button 
                                onClick={() => setShowLegendModal(true)} 
                                className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 -mt-1"
                                title="Explicación de Niveles de Permiso"
                            >
                                <HelpCircle className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onClick={handlePieClick} cursor="pointer">
                                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [formatNum(value)]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {pieData.map((entry, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center text-xs font-semibold bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                    onClick={() => {
                                        const nameMap = {
                                            'Privado': 'Privado',
                                            'Restringido (Int)': 'Restringido_Interno',
                                            'Restringido (Ext)': 'Restringido',
                                            'Dominio': 'Dominio',
                                            'Con Enlace': 'Con Enlace',
                                            'Público': 'Publico'
                                        };
                                        const filterVal = nameMap[entry.name];
                                        if (filterVal) {
                                            setFilterSharing(prev => prev === filterVal ? 'Todos' : filterVal);
                                            const tableEl = document.getElementById('details-table');
                                            if (tableEl) {
                                                tableEl.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }
                                    }}
                                >
                                    <div className="w-2.5 h-2.5 rounded-sm mr-1.5 animate-pulse" style={{ backgroundColor: entry.color }}></div>
                                    <span className="text-slate-600 dark:text-slate-400 mr-1">{entry.name}:</span>
                                    <span className="text-slate-900 dark:text-white font-bold">{formatNum(entry.value)}</span>
                                </div>
                            ))}
                        </div>


                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Categorías de Tipo de Archivo</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Formatos principales detectados</p>
                        <div className="h-72 flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={barData} margin={{ top: 0, right: 40, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={<CustomYAxisTick />} width={120} />
                                    <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => [formatNum(value), "total"]} />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} onClick={handleBarClick} cursor="pointer">
                                        {barData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                        <LabelList dataKey="formattedCount" position="right" fill="#94a3b8" fontSize={11} fontWeight="bold" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Total de archivos escaneados</span>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatNum(report.total_scanned)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Archivos compartidos / en riesgo</span>
                                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">{formatNum(files.length)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Dominios Compartidos</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Dominios externos que acceden a tus documentos</p>
                        <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                                    <tr>
                                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wider">DOMINIO</th>
                                        <th className="py-3 px-4 font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wider text-right">ARCHIVOS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {paginatedDomains.length > 0 ? paginatedDomains.map((d, i) => {
                                        const isSelected = search === d.domain;
                                        return (
                                            <tr 
                                                key={i} 
                                                className={`cursor-pointer transition-colors relative ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                                onClick={() => {
                                                    setSearch(prev => prev === d.domain ? '' : d.domain);
                                                }}
                                            >
                                                {isSelected && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-md"></div>
                                                )}
                                                <td className={`py-3 px-4 font-medium ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{d.domain}</td>
                                                <td className={`py-3 px-4 text-right ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>{formatNum(d.count)}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="2" className="py-4 text-center text-slate-500 text-xs">No hay dominios externos</td></tr>
                                    )}
                                    {paginatedDomains.length > 0 && Array.from({ length: DOMAINS_PER_PAGE - paginatedDomains.length }).map((_, i) => (
                                        <tr key={`empty-${i}`} className="opacity-0 pointer-events-none select-none">
                                            <td className="py-3 px-4">&nbsp;</td>
                                            <td className="py-3 px-4">&nbsp;</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {totalDomainPages > 1 && (
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-4">
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    Página {domainPage} de {totalDomainPages}
                                </span>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => setDomainPage(1)}
                                        disabled={domainPage === 1}
                                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Primera página"
                                    >
                                        <ChevronsLeft className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setDomainPage(p => Math.max(1, p - 1))}
                                        disabled={domainPage === 1}
                                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Página anterior"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setDomainPage(p => Math.min(totalDomainPages, p + 1))}
                                        disabled={domainPage === totalDomainPages}
                                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Página siguiente"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setDomainPage(totalDomainPages)}
                                        disabled={domainPage === totalDomainPages}
                                        className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        title="Última página"
                                    >
                                        <ChevronsRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabla de detalles */}
                <div id="details-table" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Detalles de los Elementos Auditados</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Archivos que representan riesgo potencial o colaboración externa.</p>
                        </div>
                        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre o correo..." 
                                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <select 
                                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                                value={filterSharing}
                                onChange={(e) => setFilterSharing(e.target.value)}
                            >
                                <option value="Todos">Todos los niveles</option>
                                <option value="Privado">Privado</option>
                                <option value="Restringido">Restringido (Externo)</option>
                                <option value="Restringido_Interno">Restringido (Interno)</option>
                                <option value="Dominio">Dominio (Público / Enlace)</option>
                                <option value="Con Enlace">Con Enlace</option>
                                <option value="Publico">Público</option>
                            </select>
                            <select 
                                className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="Todos">Todos los tipos</option>
                                <option value="document">Documentos</option>
                                <option value="spreadsheet">Hojas de Cálculo</option>
                                <option value="presentation">Diapositivas</option>
                                <option value="pdf">PDFs</option>
                                <option value="image">Imágenes</option>
                                <option value="folder">Carpetas</option>
                                <option value="other">Otros formatos</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-800/30">
                                <tr>
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase">Nombre del Archivo</th>
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase">Propietario</th>
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase">Nivel</th>
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase">Detalles Compartidos</th>
                                    <th className="py-4 px-6 font-bold text-slate-500 dark:text-slate-400 text-xs tracking-wider uppercase text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                {paginatedFiles.length > 0 ? paginatedFiles.map((file, i) => {
                                    const TypeIcon = getFileTypeInfo(file.mime_type).Icon;
                                    const typeColor = getFileTypeInfo(file.mime_type).tailwind;
                                    return (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-6 whitespace-normal min-w-[200px] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                                            <a 
                                                href={file.file_link} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="flex items-start group/file hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                title="Abrir archivo en Google Drive"
                                            >
                                                <TypeIcon className={`w-4 h-4 ${typeColor} mr-3 mt-1 flex-shrink-0 group-hover/file:scale-110 transition-transform`} />
                                                <div className="font-semibold text-slate-900 dark:text-slate-200 group-hover/file:text-indigo-600 dark:group-hover/file:text-indigo-400 break-all md:break-words">
                                                    {file.file_name}
                                                    <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/file:opacity-100 transition-all text-indigo-500 dark:text-indigo-400 scale-75 group-hover/file:scale-100 inline-block ml-1.5 align-middle flex-shrink-0" />
                                                </div>
                                            </a>
                                        </td>
                                        <td className="py-4 px-6 text-sm">
                                            <div className="font-semibold text-slate-800 dark:text-slate-200">{file.owner_name}</div>
                                            {file.owner_email && (
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{file.owner_email}</div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            {getSharingBadge(file.sharing_level)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                                            {file.shared_with_emails ? (
                                                <div className="flex flex-wrap gap-1 items-center">
                                                    {file.shared_with_emails.split(',').map((email, idx) => (
                                                        <span key={idx} className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-medium break-all whitespace-normal" title={email.trim()}>
                                                            {email.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">N/A</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                onClick={() => handleSendWarning(file)}
                                                disabled={sendingFiles[file.file_id] || !file.owner_email}
                                                className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm ${
                                                    sendingFiles[file.file_id] 
                                                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed' 
                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/10'
                                                }`}
                                                title={file.owner_email ? `Notificar a ${file.owner_email}` : "Sin correo del propietario"}
                                            >
                                                {sendingFiles[file.file_id] ? (
                                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-slate-600 mr-1.5"></div>
                                                ) : (
                                                    <Mail className="w-3.5 h-3.5 mr-1.5" />
                                                )}
                                                Notificar
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-slate-500">
                                            No se encontraron archivos que coincidan con los filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalFilesPages > 1 && (
                        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                Mostrando página {filesPage} de {totalFilesPages} ({formatNum(filteredFiles.length)} elementos)
                            </span>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => setFilesPage(1)}
                                    disabled={filesPage === 1}
                                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Primera página"
                                >
                                    <ChevronsLeft className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setFilesPage(p => Math.max(1, p - 1))}
                                    disabled={filesPage === 1}
                                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Página anterior"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setFilesPage(p => Math.min(totalFilesPages, p + 1))}
                                    disabled={filesPage === totalFilesPages}
                                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Página siguiente"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setFilesPage(totalFilesPages)}
                                    disabled={filesPage === totalFilesPages}
                                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Última página"
                                >
                                    <ChevronsRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal de Explicación de Niveles de Compartido */}
            {showLegendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl max-w-2xl w-full overflow-hidden transform animate-slide-up">
                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Niveles de Visibilidad</h3>
                            </div>
                            <button 
                                onClick={() => setShowLegendModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div className="flex gap-3 items-start">
                                    <div className="flex-shrink-0 w-32">{getSharingBadge('Privado')}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Privado</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Solo el propietario tiene acceso a este archivo. No se comparte ni dentro ni fuera de la organización.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="flex-shrink-0 w-32">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-xs font-bold flex items-center gap-1">
                                            <Unlock className="w-3 h-3"/> Restringido (Int)
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Restringido (Interno)</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Compartido con personas o grupos de la organización. Es seguro y no representa riesgo externo.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="flex-shrink-0 w-32">{getSharingBadge('Restringido')}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Restringido (Externo)</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Compartido selectivamente con personas o cuentas de correo ajenas a la organización.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="flex-shrink-0 w-32">{getSharingBadge('Dominio Publico')}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Dominio</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Cualquier miembro de la organización o institución que posea el enlace puede abrir el archivo.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="flex-shrink-0 w-32">{getSharingBadge('Con Enlace')}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Con Enlace</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Cualquier persona en internet que obtenga el enlace puede acceder sin necesidad de iniciar sesión.</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="flex-shrink-0 w-32">{getSharingBadge('Publico')}</div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Público</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">El archivo es indexable por buscadores y cualquier persona en internet puede encontrarlo y acceder a él de manera libre.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex justify-end">
                            <button 
                                onClick={() => setShowLegendModal(false)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriveAuditorReport;
