import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full bg-[#0d1127] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="max-w-xl w-full text-center space-y-8 relative z-10">
                {/* Cybersecurity White Cat (SVG) */}
                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-primary-500/20 blur-[60px] rounded-full scale-110 animate-pulse"></div>

                    <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 lg:w-80 md:h-64 lg:h-80 drop-shadow-[0_0_30px_rgba(40,169,224,0.3)] animate-float">
                        {/* Ears */}
                        <path d="M50 60 L30 10 L80 40 Z" fill="#ffffff" />
                        <path d="M150 60 L170 10 L120 40 Z" fill="#ffffff" />
                        <path d="M55 55 L40 25 L75 42 Z" fill="#ffccd5" />
                        <path d="M145 55 L160 25 L125 42 Z" fill="#ffccd5" />

                        {/* Face */}
                        <circle cx="100" cy="100" r="70" fill="#ffffff" />

                        {/* Cyber Goggles */}
                        <rect x="40" y="80" width="120" height="35" rx="10" fill="#1a2245" />
                        <rect x="45" y="85" width="50" height="25" rx="5" fill="#28a9e0" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="105" y="85" width="50" height="25" rx="5" fill="#28a9e0" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.5s" />
                        </rect>

                        {/* Goggle strap */}
                        <path d="M40 97.5 Q20 97.5 30 97.5" stroke="#1a2245" strokeWidth="10" />
                        <path d="M160 97.5 Q180 97.5 170 97.5" stroke="#1a2245" strokeWidth="10" />

                        {/* Technical details on goggles */}
                        <circle cx="55" cy="90" r="1.5" fill="#fff" />
                        <circle cx="65" cy="90" r="1.5" fill="#fff" />
                        <rect x="130" y="88" width="15" height="2" fill="#fff" opacity="0.5" />

                        {/* Nose and mouth */}
                        <path d="M95 125 Q100 130 105 125" stroke="#ffccd5" strokeWidth="3" fill="none" />
                        <path d="M100 120 L100 115" stroke="#ffccd5" strokeWidth="2" />
                        <circle cx="100" cy="118" r="4" fill="#ffccd5" />

                        {/* Whiskers */}
                        <line x1="30" y1="120" x2="60" y2="115" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="30" y1="130" x2="60" y2="125" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="170" y1="120" x2="140" y2="115" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="170" y1="130" x2="140" y2="125" stroke="#f0f0f0" strokeWidth="1" />

                        {/* Hoodie (Simplified) */}
                        <path d="M40 155 Q100 140 160 155 L160 200 L40 200 Z" fill="#1a2245" />
                        <path d="M100 150 L80 180 L120 180 Z" fill="#28a9e0" opacity="0.2" />
                    </svg>
                </div>

                {/* Big 404 with Glitch Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] opacity-10 pointer-events-none">
                    <span className="text-[15rem] font-black text-white tracking-widest leading-none">404</span>
                </div>

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

            {/* Custom Styles for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
