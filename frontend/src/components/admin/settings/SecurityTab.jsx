import { ShieldAlert, Loader2 } from 'lucide-react';

export default function SecurityTab({ maintenanceMode, onToggleMaintenance }) {
    return (
        <div className="space-y-10 animate-fade-in max-w-4xl mx-auto py-10">
            <div className="bg-slate-900 border border-white/10 rounded-[3.5rem] p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] group relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-yellow-500/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-10 flex items-center gap-5">
                    <ShieldAlert className="w-10 h-10 text-yellow-500 animate-pulse bg-yellow-500/10 p-2.5 rounded-2xl border border-yellow-500/20 shadow-2xl shadow-yellow-500/10" />
                    Ajustes Generales
                </h3>

                <div className="bg-slate-950/60 p-10 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-10 hover:bg-slate-950/80 transition-all duration-700 shadow-inner group/item relative z-10">
                    <div className="space-y-4 text-center md:text-left flex-1 h-full">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                            <h4 className="text-lg font-black text-white uppercase tracking-widest italic group-hover/item:text-yellow-500 transition-colors">Modo de Mantenimiento</h4>
                            <div className={`w-2 h-2 rounded-full ${maintenanceMode ? 'bg-yellow-500 animate-ping' : 'bg-emerald-500'} shadow-lg`}></div>
                        </div>
                        <p className="text-[11px] text-gray-500 font-black leading-relaxed max-w-lg uppercase tracking-[0.2em] italic opacity-60 group-hover/item:opacity-100 transition-opacity">
                            Restringe el acceso total a la plataforma.
                        </p>
                    </div>

                    <button
                        onClick={onToggleMaintenance}
                        className={`relative inline-flex h-12 w-24 items-center rounded-full transition-all duration-700 focus:outline-none shadow-2xl border-2 ${maintenanceMode ? 'bg-yellow-500 border-yellow-400/30' : 'bg-slate-800 border-white/5 shadow-inner opacity-60 hover:opacity-100'}`}
                    >
                        <span className={`inline-block h-9 w-9 transform rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-700 ${maintenanceMode ? 'translate-x-13 scale-110 rotate-180' : 'translate-x-1'}`}>
                            {maintenanceMode ? <Loader2 className="w-5 h-5 text-yellow-600 m-2 animate-spin" /> : null}
                        </span>
                    </button>
                </div>

            </div>
        </div>
    );
}
