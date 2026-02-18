import { useNavigate } from 'react-router-dom';
import { Home, LogOut, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DisabledAccount() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="h-screen w-full bg-[#0d1127] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            </div>

            <div className="max-w-xl w-full text-center space-y-8 relative z-10">
                {/* Cybersecurity White Cat (SVG) with Angry/Serious Look */}
                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-red-500/20 blur-[60px] rounded-full scale-110 animate-pulse"></div>

                    <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 lg:w-80 md:h-64 lg:h-80 drop-shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-float">
                        {/* Ears */}
                        <path d="M50 60 L30 10 L80 40 Z" fill="#ffffff" />
                        <path d="M150 60 L170 10 L120 40 Z" fill="#ffffff" />
                        <path d="M55 55 L40 25 L75 42 Z" fill="#ffccd5" />
                        <path d="M145 55 L160 25 L125 42 Z" fill="#ffccd5" />

                        {/* Face */}
                        <circle cx="100" cy="100" r="70" fill="#ffffff" />

                        {/* Cyber Goggles - RED VERSION */}
                        <rect x="40" y="80" width="120" height="35" rx="10" fill="#1a2245" />
                        <rect x="45" y="85" width="50" height="25" rx="5" fill="#ef4444" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
                        </rect>
                        <rect x="105" y="85" width="50" height="25" rx="5" fill="#ef4444" opacity="0.8">
                            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" begin="0.5s" />
                        </rect>

                        {/* Angry Eyes on Goggles */}
                        <path d="M50 90 L60 95" stroke="white" strokeWidth="2" />
                        <path d="M140 90 L130 95" stroke="white" strokeWidth="2" />

                        {/* Goggle strap */}
                        <path d="M40 97.5 Q20 97.5 30 97.5" stroke="#1a2245" strokeWidth="10" />
                        <path d="M160 97.5 Q180 97.5 170 97.5" stroke="#1a2245" strokeWidth="10" />

                        {/* Nose and mouth (Sad/Serious) */}
                        <path d="M90 130 Q100 120 110 130" stroke="#ffccd5" strokeWidth="3" fill="none" />
                        <path d="M100 120 L100 115" stroke="#ffccd5" strokeWidth="2" />
                        <circle cx="100" cy="118" r="4" fill="#ffccd5" />

                        {/* Whiskers */}
                        <line x1="30" y1="120" x2="60" y2="115" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="30" y1="130" x2="60" y2="125" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="170" y1="120" x2="140" y2="115" stroke="#f0f0f0" strokeWidth="1" />
                        <line x1="170" y1="130" x2="140" y2="125" stroke="#f0f0f0" strokeWidth="1" />

                        {/* Hoodie (Dark) */}
                        <path d="M40 155 Q100 140 160 155 L160 200 L40 200 Z" fill="#1a2245" />
                        <path d="M100 150 L80 180 L120 180 Z" fill="#ef4444" opacity="0.2" />
                    </svg>
                </div>

                {/* Big ACCESS DENIED with Glitch Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] opacity-5 pointer-events-none">
                    <span className="text-[8rem] md:text-[12rem] font-black text-white tracking-widest leading-none text-center">ACCESS<br />DENIED</span>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        ¡Miau! <span className="text-red-500 font-black">Acceso Denegado</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-medium max-w-md mx-auto leading-tight">
                        Parece que tu cuenta ha sido <span className="text-white">desconectada del firewall</span> por un administrador. La gata cibersegura dice que "no tienes los permisos necesarios" por ahora.
                    </p>
                </div>

                <div className="pt-6 flex flex-col items-center gap-4">
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl flex items-center gap-3 text-red-400 font-bold text-sm mb-4">
                        <ShieldAlert className="w-5 h-5" />
                        CUENTA DESHABILITADA TEMPORALMENTE
                    </div>

                    <button
                        onClick={handleLogout}
                        className="group relative flex items-center justify-center gap-4 px-12 py-5 bg-slate-800 rounded-[2rem] text-sm font-black uppercase tracking-widest text-white shadow-xl hover:bg-slate-700 hover:-translate-y-1 active:scale-95 transition-all w-full md:w-auto"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Cerrar Sesión
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
