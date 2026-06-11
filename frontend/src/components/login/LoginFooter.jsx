import React from 'react';

export default function LoginFooter() {
    return (
        <footer className="mt-auto border-t border-primary-500/10 bg-[#e8dbbe]/50 backdrop-blur-md relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-5 opacity-80 group">
                        <img src="/images/logo-cgr-blanco.webp" alt="CGR Logo" className="h-10 w-10 object-contain transition-transform group-hover:scale-110" />
                        <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                        <div className="flex flex-col">
                            <p className="text-[10px] md:text-xs font-black text-white leading-tight uppercase tracking-[0.1em]">
                                Contraloría General de la República
                            </p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                Área para la Innovación y Aprendizaje en la Fiscalización
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2">
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">
                            Versión {import.meta.env.VITE_APP_VERSION || '1.8.0'} • 2026
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
