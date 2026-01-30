import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Shield, Lock, Info, ExternalLink } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { loginWithGoogle, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const result = await loginWithGoogle(tokenResponse.access_token);
            if (result.success) {
                toast.success(`¡Bienvenido ${result.user.firstName}!`);
                navigate('/dashboard');
            }
        },
        onError: () => {
            toast.error('Error al iniciar sesión con Google');
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondo con gradientes y patrones dinámicos */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-500/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8">
                {/* Banner Institucional con Efecto Glassmorphism */}
                <div className="w-full h-40 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                    <img
                        src="/assets/banner.png"
                        alt="CGR Segur@ Banner"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                </div>

                {/* Título Principal y Logo */}
                <div className="text-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 relative p-1">
                            <img src="/images/Logotipo-CGR-blanco-transp.png" alt="CGR Logo" className="w-full h-full object-contain filter drop-shadow-[0_10px_30px_rgba(255,255,255,0.1)]" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter mb-1">
                                CGR <span className="text-secondary-500">SEGUR@</span>
                            </h1>

                        </div>
                    </div>
                </div>

                {/* Tarjeta de Login Refinada */}
                <div className="card w-full p-8 space-y-8 animate-slide-up bg-slate-800/40 border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-secondary-500/50 to-transparent"></div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white">Iniciar Sesión</h2>
                        <p className="text-gray-400 text-sm">
                            Acceder con su cuenta de usuario de Google
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Info Box */}
                        <div className="flex gap-4 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
                            <Info className="w-6 h-6 text-primary-400 flex-shrink-0" />
                            <p className="text-xs text-gray-300 leading-relaxed font-medium">
                                Esta plataforma es de uso exclusivo para funcionarios de la Contraloría General de la República.
                            </p>
                        </div>

                        {/* Botón de Google Estilo Premium */}
                        <button
                            onClick={() => googleLogin()}
                            disabled={isLoading}
                            className="w-full group relative flex items-center justify-center gap-4 bg-white text-slate-900 px-6 py-4 rounded-xl font-black text-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 transition-transform group-hover:scale-110" />
                            {isLoading ? (
                                <span className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                    Procesando...
                                </span>
                            ) : (
                                "Acceder con Google"
                            )}
                            <ExternalLink className="w-4 h-4 absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                    </div>
                </div>

                {/* Footer Credits */}
                <div className="flex flex-col items-center gap-2 opacity-60">
                    <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-widest">
                        Contraloría General de la República de Costa Rica
                    </p>
                    <div className="flex gap-4 text-[15px] text-gray-400">
                        <span>2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
