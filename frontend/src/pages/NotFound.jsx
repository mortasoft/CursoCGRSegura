import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import CyberCat404 from '../components/not-found/CyberCat404';
import GlitchBackground from '../components/not-found/GlitchBackground';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full bg-[#161b33] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
            <GlitchBackground />

            <div className="max-w-xl w-full text-center space-y-8 relative z-10">
                <CyberCat404 />

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        Miau... <span className="text-primary-400 font-black">¡Pá-gina encriptada!</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-tight">
                        Nuestra gata cibersegura ha interceptado tu conexión. Esta ruta no existe, pero ella dice que <span className="text-white">"todo está bajo control"</span>.
                    </p>
                </div>

                <div className="pt-6 flex flex-col items-center gap-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group relative flex items-center justify-center gap-4 px-12 py-5 bg-primary-500 rounded-[2rem] text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_rgba(40,169,224,0.3)] hover:shadow-[0_25px_50px_rgba(40,169,224,0.5)] hover:-translate-y-1 active:scale-95 transition-all w-full md:w-auto"
                    >
                        <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        Regresar a casa
                    </button>
                </div>
            </div>
        </div>
    );
}
