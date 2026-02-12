import { useNavigate } from 'react-router-dom';
import { Home, Wrench } from 'lucide-react';

export default function Maintenance() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full bg-[#0d1127] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="max-w-xl w-full text-center space-y-8 relative z-10">
                {/* Cybersecurity White Cat (SVG) - Working Mode */}
                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full scale-110 animate-pulse"></div>

                    <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 lg:w-80 md:h-64 lg:h-80 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-float">
                        {/* Ears */}
                        <path d="M50 60 L30 10 L80 40 Z" fill="#ffffff" />
                        <path d="M150 60 L170 10 L120 40 Z" fill="#ffffff" />
                        <path d="M55 55 L40 25 L75 42 Z" fill="#ffccd5" />
                        <path d="M145 55 L160 25 L125 42 Z" fill="#ffccd5" />

                        {/* Face */}
                        <circle cx="100" cy="100" r="70" fill="#ffffff" />

                        {/* Cyber Goggles - YELLOW MAINTENANCE */}
                        <rect x="40" y="80" width="120" height="35" rx="10" fill="#1a2245" />
                        <rect x="45" y="85" width="50" height="25" rx="5" fill="#eab308" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="105" y="85" width="50" height="25" rx="5" fill="#eab308" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.5s" />
                        </rect>

                        {/* Goggle strap */}
                        <path d="M40 97.5 Q20 97.5 30 97.5" stroke="#1a2245" strokeWidth="10" />
                        <path d="M160 97.5 Q180 97.5 170 97.5" stroke="#1a2245" strokeWidth="10" />

                        {/* Hard hat (Simplified) */}
                        <path d="M60 40 Q100 20 140 40 L145 50 Q100 45 55 50 Z" fill="#eab308" />
                        <rect x="95" y="25" width="10" height="15" fill="#ca8a04" />

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
                        <path d="M100 150 L80 180 L120 180 Z" fill="#eab308" opacity="0.2" />
                    </svg>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        ¡Mejorando la <span className="text-yellow-500 font-black">seguridad!</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-tight">
                        Nuestra gata cibersegura está realizando ajustes técnicos en la infraestructura. Estaremos de vuelta en unos minutos.
                    </p>
                </div>

                <div className="pt-6">
                    <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900/50 border border-white/5 rounded-3xl">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping"></div>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Sincronizando servidores...</span>
                    </div>
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
