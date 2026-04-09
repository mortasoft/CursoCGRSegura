import { ArrowLeft, Download, Users, BarChart3, RefreshCw } from 'lucide-react';

export default function ReportsHeader({ view, onToggleView, onExport, onBack, onRefresh, syncing }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1 text-left">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Panel Admin
                </button>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Analytics de Cumplimiento</h1>
                <p className="text-white/60 text-sm font-medium">Panel gerencial de seguimiento y control de capacitación.</p>
            </div>

            <div className="flex gap-4 w-full md:w-auto flex-wrap">
                <button
                    onClick={onRefresh}
                    disabled={syncing}
                    className={`flex-1 md:flex-none px-6 py-4 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-3 ${syncing ? 'opacity-50' : ''}`}
                >
                    <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} /> 
                    {syncing ? 'Sincronizando...' : 'Sincronizar Datos'}
                </button>
                <button
                    onClick={onExport}
                    className="flex-1 md:flex-none px-6 py-4 bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                >
                    <Download className="w-5 h-5" /> Exportar CSV
                </button>
                <button
                    onClick={onToggleView}
                    className="flex-1 md:flex-none px-6 py-4 bg-primary-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:bg-primary-400 transition-all flex items-center justify-center gap-3"
                >
                    {view === 'summary' ? <Users className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
                    {view === 'summary' ? 'Ver Detalle Personal' : 'Ver Resumen'}
                </button>
            </div>
        </div>
    );
}
