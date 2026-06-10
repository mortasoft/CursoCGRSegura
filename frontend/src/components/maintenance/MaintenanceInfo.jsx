import React from 'react';

export default function MaintenanceInfo() {
    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    ¡Mejorando la <span className="text-yellow-500 font-black">seguridad!</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-tight">
                    Nuestra gata cibersegura está realizando ajustes técnicos en la infraestructura. ¡Gracias por tu paciencia!
                </p>
            </div>

            <div className="pt-6">
                <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900/50 border border-white/5 rounded-3xl">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Sincronizando servidores...</span>
                </div>
            </div>
        </div>
    );
}
