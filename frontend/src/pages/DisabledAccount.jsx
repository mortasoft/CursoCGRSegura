import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import CyberCatSVG from '../components/auth/CyberCatSVG';

export default function DisabledAccount() {
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="h-screen w-full bg-[#161b33] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
            {/* Infrastructure Layer (Background) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Strategic Gloom */}
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[150px]"></div>
                
                {/* Sub-grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            <div className="max-w-2xl w-full text-center space-y-12 relative z-10 animate-fade-in px-8">
                
                {/* Visual Identity: The Cyber-Security Guardian (Offered in Alert Mode) */}
                <div className="relative inline-block group">
                    <div className="absolute inset-0 bg-red-500/30 blur-[80px] rounded-full scale-125 animate-pulse duration-[3000ms]"></div>
                    <CyberCatSVG 
                        color="#ef4444" 
                        className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 relative z-10" 
                    />
                </div>

                {/* Status Message Layer */}
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-4 px-6 py-2 bg-red-500/10 border border-red-500/20 rounded-full mb-4">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                        <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.4em] italic">Segregación de Cuenta v3.1</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                        ¡Miau! <span className="text-red-500 not-italic block md:inline mt-2 md:mt-0">Acceso Revocado</span>
                    </h1>
                    
                    <p className="text-gray-400 text-lg md:text-xl font-bold max-w-lg mx-auto leading-relaxed italic uppercase tracking-[0.05em] opacity-80">
                        Tu credencial ha sido <span className="text-white brightness-125 underline decoration-red-500/40 underline-offset-8">interceptada por el firewall</span> administrativo. 
                        Los protocolos de capacitación para este perfil están suspendidos temporalmente.
                    </p>
                </div>

                {/* Actions: Return to Base / Termination */}
                <div className="flex flex-col items-center gap-8">
                    <div className="flex items-center gap-4 text-xs font-black text-gray-500 uppercase tracking-[0.3em] border-t border-white/5 pt-8 w-full justify-center">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        Consulte con la Dirección de TI para la reactivación
                    </div>

                    <button
                        onClick={handleLogout}
                        className="group relative flex items-center justify-center gap-5 px-16 py-5 bg-slate-900 border border-white/10 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-2xl hover:bg-slate-800 hover:-translate-y-1.5 active:scale-95 transition-all w-full md:w-auto"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-2 transition-transform text-red-500" />
                        Finalizar Sesión Actual
                    </button>
                </div>
            </div>

            {/* Custom Styles Injection */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-30px) rotate(2deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
