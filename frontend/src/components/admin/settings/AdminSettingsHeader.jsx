import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminSettingsHeader({ tabs, activeTab, onTabChange, onSave, saving }) {
    const navigate = useNavigate();

    return (
        <div className="space-y-10 mb-12 animate-fade-in text-left">
            {/* Header simple similar al Dashboard principal */}
            <div className="flex items-center gap-6">
                <button
                    onClick={() => navigate('/admin')}
                    className="p-3.5 bg-slate-900 border border-white/10 rounded-2xl transition-all text-gray-400 hover:text-white hover:bg-white/5 active:scale-95"
                    title="Volver al Panel"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase italic">
                        Configuración del Sistema
                    </h1>
                    <p className="text-white/40 font-medium">Módulo de configuración del sistema</p>
                </div>
            </div>

            {/* Pestañas de navegación abajo del header */}
            <div className="flex items-center gap-2 bg-slate-900/40 p-1.5 rounded-3xl border border-white/5 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab.id
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 border border-white/10'
                            : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'animate-pulse' : 'opacity-40'}`} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
