import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowRight } from 'lucide-react';

export default function LoginCard({ onLogin, isLoading }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="w-full glass-card overflow-hidden rounded-[2.5rem] bg-[#582c19] backdrop-blur-2xl border border-[#6b3a24] shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative group"
        >
            {/* Interactive hover gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="p-8 md:p-12 space-y-8 relative z-10">
                <div className="space-y-2 flex justify-center">
                    <h2 className="text-2xl md:text-3xl font-black text-[#e8dbbe] tracking-tight">Bienvenido al Portal</h2>
                </div>

                <div className="space-y-6">
                    {/* Google Button */}
                    <motion.button
                        onClick={onLogin}
                        disabled={isLoading}
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full group relative flex items-center justify-center gap-4 bg-gradient-to-b from-white to-gray-50 text-[#161b33] px-8 py-5 rounded-2xl font-black text-lg transition-all duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(56,74,153,0.3)] disabled:opacity-70 disabled:pointer-events-none overflow-hidden border border-white"
                    >
                        {/* Animated Shimmer Overlay */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none z-20"></div>

                        {/* Background Glow on Hover */}
                        <div className="absolute inset-0 bg-primary-500/0 group-hover:bg-primary-500/5 transition-colors duration-500"></div>

                        {isLoading ? (
                            <div className="flex items-center gap-3 relative z-30">
                                <div className="w-6 h-6 border-[3px] border-[#161b33]/10 border-t-[#384A99] rounded-full animate-spin"></div>
                                <span className="animate-pulse">Sincronizando...</span>
                            </div>
                        ) : (
                            <>
                                <div className="relative z-30 flex items-center gap-4">
                                    <svg className="w-6 h-6 filter drop-shadow-sm" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    <span className="tracking-tight">Acceder con Google</span>
                                </div>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 overflow-hidden w-6 h-6 z-30 hidden md:block">
                                    <ArrowRight className="w-6 h-6 opacity-0 -translate-x-full group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 text-primary-500" />
                                </div>
                            </>
                        )}
                    </motion.button>

                    {/* System Info Box */}
                    <div className="p-5 rounded-2xl bg-[#4a2414] border border-[#6b3a24] flex gap-4 items-start">
                        <div className="p-2 bg-[#6b3a24] rounded-lg text-[#e8dbbe]">
                            <Shield className="w-5 h-5 font-black" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-[14px] font-black text-[#e8dbbe] uppercase tracking-widest">Acceso Restringido</h4>
                            <p className="text-[12px] text-[#e8dbbe]/80 leading-relaxed font-medium">
                                Sistema exclusivo para funcionarios de la Contraloría General de la República. Debe iniciar sesión con su cuenta de Google institucional.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
