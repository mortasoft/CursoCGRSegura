import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Shield, Lock, Info, ExternalLink, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="min-h-screen flex flex-col bg-[#0d1127] relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-950/20 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]"></div>

                {/* Decorative lines */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-xl flex flex-col items-center gap-10"
                >
                    {/* Header: Large Logo and Brand */}
                    <div className="flex flex-col items-center text-center gap-6">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                            className="w-48 h-48 md:w-56 md:h-56 relative flex items-center justify-center"
                        >
                            <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
                            <img
                                src="/images/Logotipo-CGR-blanco-transp.png"
                                alt="CGR Logo"
                                className="w-full h-full object-contain filter drop-shadow-[0_20px_50px_rgba(255,255,255,0.15)] relative z-10"
                            />
                        </motion.div>

                        <div className="space-y-2">
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none"
                            >
                                CGR <span className="text-secondary-500">SEGUR@</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs"
                            >
                                Programa de Concientización en Ciberseguridad
                            </motion.p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="w-full glass-card overflow-hidden rounded-[2.5rem] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative group"
                    >
                        {/* Interactive hover gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="p-8 md:p-12 space-y-8 relative z-10">
                            <div className="space-y-2 flex justify-center">
                                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Bienvenido al Portal</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Google Button */}
                                <button
                                    onClick={() => googleLogin()}
                                    disabled={isLoading}
                                    className="w-full group relative flex items-center justify-center gap-4 bg-white text-[#0d1127] px-8 py-5 rounded-2xl font-black text-lg transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                                    <span>{isLoading ? "Validando cuenta..." : "Acceder con Google"}</span>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 overflow-hidden w-6 h-6">
                                        <ArrowRight className="w-6 h-6 opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-primary-600" />
                                    </div>
                                </button>

                                {/* System Info Box */}
                                <div className="p-5 rounded-2xl bg-primary-500/5 border border-primary-500/10 flex gap-4 items-start">
                                    <div className="p-2 bg-primary-500/10 rounded-lg text-primary-400">
                                        <Shield className="w-5 h-5 font-black" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Acceso Restringido</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                            Sistema exclusivo para funcionarios de la Contraloría General de la República.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Support Link */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                        ¿Problemas de acceso? <button className="text-primary-500 hover:text-primary-400 transition-colors">Contactar a Soporte TI</button>
                    </motion.p>
                </motion.div>
            </div>

            {/* Footer Synchronized with Main Layout */}
            <footer className="mt-auto border-t border-primary-500/10 bg-[#0d1127]/50 backdrop-blur-md relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-5 opacity-80 group">
                            <img src="/images/Logotipo-CGR-blanco-transp.png" alt="CGR Logo" className="h-10 w-10 object-contain transition-transform group-hover:scale-110" />
                            <div className="h-10 w-[1px] bg-white/10 hidden md:block"></div>
                            <div className="flex flex-col">
                                <p className="text-[10px] md:text-xs font-black text-white leading-tight uppercase tracking-[0.1em]">
                                    Contraloría General de la República
                                </p>
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                    División de Gestion de Apoyo (DGA)
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2">

                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">
                                Versión 1.7.0 • 2026
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
