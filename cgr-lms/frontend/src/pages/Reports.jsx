import { useState, useEffect } from 'react';
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
    ChevronDown,
    FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Reports() {
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium">Generando informes analíticos...</p>
            </div>
        );
    }

    if (!reportData) return null;

    const { summary, departments, atRisk } = reportData;

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Volver al Panel Admin
                    </button>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">Reportes de Cumplimiento</h1>
                    <p className="text-gray-400 text-sm font-medium">Analítica avanzada de capacitación institucional en ciberseguridad.</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-3 rounded-xl bg-slate-800 text-white text-xs font-black uppercase border border-white/5 hover:bg-slate-700 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Exportar PDF
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-primary-500 text-white text-xs font-black uppercase shadow-lg hover:bg-primary-400 transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filtrar Período
                    </button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6 border-l-4 border-primary-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black text-green-500 uppercase">+2% mes</span>
                    </div>
                    <p className="text-3xl font-black text-white">{summary.totalStaff}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Funcionarios Activos</p>
                </div>

                <div className="card p-6 border-l-4 border-secondary-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-secondary-500/10 rounded-xl text-secondary-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-secondary-500 uppercase bg-secondary-500/10 px-2 py-0.5 rounded-full">
                            Objetivo: 85%
                        </div>
                    </div>
                    <p className="text-3xl font-black text-white">{summary.avgCompletion}%</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Cumplimiento Global</p>
                </div>

                <div className="card p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-white">{summary.totalCerts}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Diplomas Emitidos</p>
                </div>

                <div className="card p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                            <FileText className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-white">{summary.activeModules}</p>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Módulos en Curso</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Department Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-primary-400" /> Rendimiento por Unidad
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Filtrar unidad..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-800/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-primary-500/50"
                            />
                        </div>
                    </div>

                    <div className="card overflow-hidden !p-0">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Unidad Administrativa</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Personal</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Cumplimiento</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {departments
                                    .filter(d => d.department.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map((dept, idx) => (
                                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-white">{dept.department}</p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-xs font-medium text-gray-400">{dept.staff_count}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${dept.avg_completion >= 80 ? 'bg-green-500' :
                                                                    dept.avg_completion >= 50 ? 'bg-orange-500' : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${dept.avg_completion}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-black text-white w-8">{dept.avg_completion}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${dept.avg_completion >= 80 ? 'bg-green-500/10 text-green-500' :
                                                        dept.avg_completion >= 50 ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {dept.avg_completion >= 80 ? 'Excelente' : dept.avg_completion >= 50 ? 'En Progreso' : 'Crítico'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar: Risk Alerts */}
                <div className="space-y-8">
                    <div className="card bg-red-500/5 border-red-500/20 p-8 space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full blur-2xl"></div>
                        <h3 className="text-xl font-black text-red-400 uppercase tracking-tight flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6" />
                            Alertas de Riesgo
                        </h3>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                            Funcionarios con menos del 20% de avance en el programa de capacitación obligatoria.
                        </p>

                        <div className="space-y-4">
                            {atRisk.length > 0 ? atRisk.map((user, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-white/5">
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-white leading-tight">{user.first_name} {user.last_name}</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">{user.department}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs font-black text-red-500">{Math.round(user.progress)}%</span>
                                        <p className="text-[8px] text-gray-700 font-black uppercase">Avance</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center py-6 text-xs text-gray-600 font-medium italic">No hay alertas críticas registradas.</p>
                            )}
                        </div>

                        <button className="w-full py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 transition-all shadow-lg shadow-red-500/20">
                            Enviar Recordatorio Masivo
                        </button>
                    </div>

                    {/* Insights Card */}
                    <div className="card p-8 space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <BarChart3 className="w-6 h-6" />
                        </div>
                        <h4 className="text-white font-black uppercase tracking-tight">Análisis Predictivo</h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            Al ritmo actual, se estima que la institución alcanzará el <span className="text-white font-bold italic">90% de cumplimiento</span> el 15 de Marzo de 2026.
                        </p>
                        <div className="pt-2 flex justify-end">
                            <button className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2">
                                Ver proyecciones <Download className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
