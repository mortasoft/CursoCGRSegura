import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import {
    BarChart3,
    Users,
    Award,
    AlertTriangle,
    Download,
    Filter,
    ArrowLeft,
    TrendingUp,
    Building2,
    Search,
    FileText,
    PieChart as PieIcon,
    Calendar,
    Mail,
    ChevronRight,
    CheckCircle2,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
} from 'recharts';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Reports() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState('summary'); // 'summary' or 'detailed'
    const [chartType, setChartType] = useState('departments');
    const [sortConfig, setSortConfig] = useState({ key: 'avg_completion', direction: 'desc' });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/reports/compliance`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setReportData(response.data);
            }
        } catch (error) {
            toast.error('Error al cargar reportes gerenciales');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!reportData?.detailedUsers) return;

        const headers = ["ID", "Funcionario", "Email", "Unidad", "Puesto", "Progreso %", "Módulos Completados"];
        const rows = reportData.detailedUsers.map(u => [
            u.id,
            `${u.first_name} ${u.last_name}`,
            u.email,
            u.department,
            u.position,
            `${u.progress}%`,
            `${u.completed_modules}/${u.total_modules}`
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_cumplimiento_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSendReminders = () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Preparando correos para funcionarios en riesgo...',
                success: 'Recordatorios enviados correctamente',
                error: 'Error al enviar recordatorios',
            }
        );
    };

    const filteredUsers = useMemo(() => {
        if (!reportData?.detailedUsers) return [];
        return reportData.detailedUsers.filter(u =>
            `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reportData, searchTerm]);

    const getColorForName = (name) => {
        if (!name) return '#cbd5e1';
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
    };

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedDepartments = useMemo(() => {
        if (!reportData?.departments) return [];
        let sortableItems = [...reportData.departments];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [reportData, sortConfig]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in text-center">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-6 drop-shadow-[0_0_15px_rgba(56,74,153,0.4)]"></div>
                <h2 className="text-white font-black uppercase text-xl tracking-tighter">Generando Inteligencia...</h2>
                <p className="text-gray-400 font-medium mt-2">Sincronizando métricas de cumplimiento institucional.</p>
            </div>
        );
    }

    if (!reportData) return null;

    const { summary, departments, atRisk, moduleCompliance } = reportData;

    // Ensure activeChartData is always defined
    const activeChartData = (chartType === 'departments' ? departments : moduleCompliance) || [];
    const yDataKey = chartType === 'departments' ? 'department' : 'title';

    console.log('Reports Render:', { chartType, dataLength: activeChartData.length });



    // Chart Data Preparation
    const pieData = [
        { name: 'Completado', value: summary.avgCompletion, color: '#384A99' },
        { name: 'Pendiente', value: 100 - summary.avgCompletion, color: '#1e293b' }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Panel Admin
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Analytics de Cumplimiento</h1>
                    <p className="text-gray-300 text-sm font-medium">Panel gerencial de seguimiento y control de capacitación.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="flex-1 md:flex-none px-6 py-4 bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                    >
                        <Download className="w-5 h-5" /> Exportar CSV
                    </button>
                    <button
                        onClick={() => setView(view === 'summary' ? 'detailed' : 'summary')}
                        className="flex-1 md:flex-none px-6 py-4 bg-primary-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-primary-400 transition-all flex items-center justify-center gap-3"
                    >
                        {view === 'summary' ? <Users className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                        {view === 'summary' ? 'Ver Detalle Personal' : 'Ver Resumen'}
                    </button>
                </div>
            </div>

            {view === 'summary' ? (
                <>
                    {/* Summary View Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card p-8 border-l-4 border-primary-500 bg-slate-900/40">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-primary-500/10 rounded-2xl text-primary-400">
                                    <Users className="w-7 h-7" />
                                </div>
                                <div className="px-2 py-1 bg-green-500/10 rounded-lg">
                                    <span className="text-[9px] font-black text-green-500 uppercase">Activos</span>
                                </div>
                            </div>
                            <p className="text-4xl font-black text-white">{summary.totalStaff}</p>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2 px-1">Funcionarios en Sistema</p>
                        </div>

                        <div className="card p-8 border-l-4 border-secondary-500 bg-slate-900/40">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-secondary-500/10 rounded-2xl text-secondary-500">
                                    <TrendingUp className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1 text-[9px] font-black text-white bg-slate-800 px-3 py-1 rounded-full border border-white/5">
                                    PROMEDIO
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-black text-white">{summary.avgCompletion}</p>
                                <p className="text-xl font-black text-secondary-500">%</p>
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2 px-1">Cumplimiento Global</p>
                        </div>

                        <div className="card p-8 border-l-4 border-green-500 bg-slate-900/40">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                    <Award className="w-7 h-7" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-white">{summary.totalCerts}</p>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2 px-1">Diplomas Emitidos</p>
                        </div>

                        <div className="card p-8 border-l-4 border-blue-500 bg-slate-900/40">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <FileText className="w-7 h-7" />
                                </div>
                            </div>
                            <p className="text-4xl font-black text-white">{summary.activeModules}</p>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-2 px-1">Módulos Publicados</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Charts Section */}
                        <div className="lg:col-span-2 space-y-10">
                            <div className="card p-8 space-y-8">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        <BarChart3 className="w-6 h-6 text-primary-400" />
                                        {chartType === 'departments' ? 'Cumplimiento por Unidad' : 'Cumplimiento por Módulo'}
                                    </h3>
                                    <select
                                        value={chartType}
                                        onChange={(e) => setChartType(e.target.value)}
                                        className="bg-slate-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none focus:border-primary-500/50"
                                    >
                                        <option value="departments">Por Unidad Administrativa</option>
                                        <option value="modules">Por Módulo Educativo</option>
                                    </select>
                                </div>
                                <div className="h-[1000px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={activeChartData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} hide />
                                            <YAxis
                                                dataKey={yDataKey}
                                                type="category"
                                                width={260}
                                                tick={{ fill: '#94a3b8', fontSize: 9, width: 250 }}
                                                interval={0}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#ffffff05' }}
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', color: '#fff' }}
                                            />
                                            <Bar dataKey="avg_completion" radius={[0, 4, 4, 0]} barSize={20}>
                                                {activeChartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={getColorForName(entry[yDataKey])}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="card overflow-hidden !p-0">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        <Building2 className="w-6 h-6 text-primary-400" /> Tabla de Rendimiento
                                    </h3>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Buscar unidad..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-[10px] text-white focus:outline-none focus:border-primary-500/50 uppercase font-black"
                                        />
                                    </div>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-900/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-white/5">
                                        <tr>
                                            <th className="px-8 py-5 cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => requestSort('department')}>
                                                <div className="flex items-center gap-2">
                                                    Área / Unidad
                                                    {sortConfig.key === 'department' && (
                                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary-400" /> : <ChevronDown className="w-3 h-3 text-primary-400" />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-8 py-5 text-center cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => requestSort('staff_count')}>
                                                <div className="flex items-center justify-center gap-2">
                                                    Total Pax
                                                    {sortConfig.key === 'staff_count' && (
                                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary-400" /> : <ChevronDown className="w-3 h-3 text-primary-400" />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-8 py-5 text-center cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => requestSort('completed_count')}>
                                                <div className="flex items-center justify-center gap-2">
                                                    Completado
                                                    {sortConfig.key === 'completed_count' && (
                                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary-400" /> : <ChevronDown className="w-3 h-3 text-primary-400" />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-8 py-5 text-center cursor-pointer group hover:bg-white/5 transition-colors" onClick={() => requestSort('avg_completion')}>
                                                <div className="flex items-center justify-center gap-2">
                                                    % Cumplimiento
                                                    {sortConfig.key === 'avg_completion' && (
                                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary-400" /> : <ChevronDown className="w-3 h-3 text-primary-400" />
                                                    )}
                                                </div>
                                            </th>
                                            <th className="px-8 py-5 text-right">Estatus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {sortedDepartments
                                            .filter(d => d.department.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map((dept, idx) => (
                                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <p className="text-sm font-black text-white group-hover:text-primary-400 transition-colors uppercase">{dept.department}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="text-xs font-black text-gray-300">{dept.staff_count}</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className="text-xs font-black text-white">{dept.completed_count || 0}</span>
                                                        <span className="text-[10px] text-gray-500 ml-1">/ {dept.staff_count}</span>
                                                    </td>
                                                    <td className="px-8 py-6 max-w-[200px]">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                                                <div
                                                                    className={`h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-1000 ${dept.avg_completion >= 80 ? 'bg-green-500' :
                                                                        dept.avg_completion >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                                                        }`}
                                                                    style={{ width: `${dept.avg_completion}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-black text-white w-10">{dept.avg_completion}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className={`inline-flex px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${dept.avg_completion >= 80 ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                                            dept.avg_completion >= 50 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                                            }`}>
                                                            {dept.avg_completion >= 80 ? 'Excelente' : dept.avg_completion >= 50 ? 'En Progreso' : 'Crítico'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-10">
                            {/* Distribution Pie */}
                            <div className="card p-8 space-y-6">
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                                    <PieIcon className="w-5 h-5 text-secondary-500" /> Distribución Global
                                </h3>
                                <div className="h-64 flex items-center justify-center relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-white">{summary.avgCompletion}%</span>
                                        <span className="text-[8px] font-black text-gray-500 uppercase">Logrado</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {pieData.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></div>
                                                <span className="text-[10px] font-black text-gray-400 uppercase">{p.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black text-white">{p.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Risk Alerts */}
                            <div className="card bg-red-500/5 border-red-500/20 p-8 space-y-6 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full blur-[80px] group-hover:bg-red-500/20 transition-all"></div>
                                <h3 className="text-lg font-black text-red-400 uppercase tracking-tight flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                                    Alertas de Riesgo
                                </h3>
                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                    Listado de funcionarios con avance crítico (<span className="text-red-400 font-bold">menos del 20%</span>) que requieren seguimiento inmediato.
                                </p>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                    {atRisk.length > 0 ? atRisk.map((user, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-red-500/20 transition-all">
                                            <div className="flex-1">
                                                <p className="text-xs font-black text-white uppercase">{user.first_name} {user.last_name}</p>
                                                <p className="text-[9px] text-gray-500 font-black uppercase mt-1 italic">{user.department}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-black text-red-500">{Math.round(user.progress)}%</span>
                                                <p className="text-[8px] text-gray-700 font-black uppercase leading-none">Progreso</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="py-10 text-center space-y-3">
                                            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest italic font-medium">Bajo control: 0 alertas</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSendReminders}
                                    className="w-full py-5 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-red-400 transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Mail className="w-4 h-4" /> Enviar Recordatorio Masivo
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                /* DETAILED VIEW - ALL USERS TABLE */
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Listado Detallado</h2>
                                <p className="text-xs text-gray-400 font-medium font-bold uppercase tracking-widest">Seguimiento individual de funcionarios</p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, unidad o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-slate-900 border border-white/5 rounded-2xl text-white font-medium focus:outline-none focus:border-primary-500/50 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="card overflow-hidden !p-0">
                        <div className="max-h-[800px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 sticky top-0 z-10 border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Funcionario</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unidad / Área</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Progreso</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Módulos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 flex items-center justify-center text-gray-600 group-hover:bg-primary-500/10 group-hover:text-primary-400 transition-colors">
                                                        <Users className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white uppercase">{u.first_name} {u.last_name}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium lowercase italic flex items-center gap-1">
                                                            <Mail className="w-3 h-3 opacity-30" /> {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-[11px] font-black text-gray-300 uppercase italic opacity-80">{u.department}</p>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">{u.position}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="w-full max-w-[150px] space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[10px] font-black ${u.progress >= 80 ? 'text-green-500' : u.progress >= 50 ? 'text-orange-500' : 'text-red-500'}`}>{u.progress}%</span>
                                                        <span className="text-[8px] font-bold text-gray-600 uppercase">Avance</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                                        <div
                                                            className={`h-full rounded-full ${u.progress >= 80 ? 'bg-green-500' : u.progress >= 50 ? 'bg-orange-500' : 'bg-red-500'}`}
                                                            style={{ width: `${u.progress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="inline-flex flex-col items-end">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-black text-white">{u.completed_modules}</span>
                                                        <span className="text-xs font-bold text-gray-700">/ {u.total_modules}</span>
                                                    </div>
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">Completados</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
