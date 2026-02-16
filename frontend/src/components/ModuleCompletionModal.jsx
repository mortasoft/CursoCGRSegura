import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, ChevronRight, X, Download, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const ModuleCompletionModal = ({ isOpen, onClose, data }) => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();
    const audioRefs = React.useRef({ celebrate: null, completed: null });
    const isAnimatingRef = React.useRef(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            isAnimatingRef.current = true;

            // Reproducir sonidos de celebracion
            audioRefs.current.celebrate = new Audio('/celebrate.mp3');
            audioRefs.current.completed = new Audio('/completed.mp3');

            audioRefs.current.celebrate.play().catch(e => console.log('Audio play blocked:', e));
            audioRefs.current.completed.play().catch(e => console.log('Audio play blocked:', e));

            // Launch confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                if (!isAnimatingRef.current) return;

                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#384A99', '#E57B3C', '#ffffff'],
                    zIndex: 9999
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#384A99', '#E57B3C', '#ffffff'],
                    zIndex: 9999
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        } else {
            setIsVisible(false);
            isAnimatingRef.current = false;

            // Detener sonidos al cerrar
            Object.values(audioRefs.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });

            // Detener confeti inmediatamente
            confetti.reset();
        }

        return () => {
            isAnimatingRef.current = false;
            // Cleanup: detener sonidos y confeti si el componente se desmonta
            Object.values(audioRefs.current).forEach(audio => {
                if (audio) {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });
            confetti.reset();
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const { bonusPoints } = data || {};

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className={`relative w-full max-w-md bg-[#0d1127] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(56,74,153,0.3)] transition-all duration-700 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`}>

                {/* Background Rays */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-3xl animate-pulse" />
                    <svg className="absolute top-0 left-0 w-full h-full opacity-10 animate-spin-slow" viewBox="0 0 100 100">
                        <path d="M50 50 L50 0 L55 50 L100 50 L55 55 L50 100 L45 55 L0 50 L45 50 Z" fill="white" />
                    </svg>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                <div className="relative p-8 pt-12 flex flex-col items-center text-center">

                    {/* Cat SVG Illustration */}
                    <div className="w-48 h-48 mb-6 relative animate-wiggle">
                        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                            {/* Círculo de fondo glow */}
                            <circle cx="100" cy="100" r="90" className="fill-slate-800/50 stroke-primary-500/30" strokeWidth="2" />

                            {/* Cola animada (detrás) */}
                            <path d="M140 140 Q170 140 170 110 Q160 90 150 100" className="stroke-white" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                                <animate attributeName="d" values="M140 140 Q170 140 170 110 Q160 90 150 100;M140 140 Q180 150 180 100 Q170 70 150 100;M140 140 Q170 140 170 110 Q160 90 150 100" dur="2s" repeatCount="indefinite" />
                            </path>

                            {/* Cuerpo (Traje) */}
                            <path d="M50 180 L50 145 Q50 110 100 110 Q150 110 150 145 L150 180 Z" className="fill-slate-900" />

                            {/* Pechera/Camisa blanca */}
                            <path d="M100 110 L85 140 L115 140 Z" className="fill-white" />

                            {/* Corbata */}
                            <path d="M100 110 L92 120 L100 135 L108 120 Z" className="fill-primary-500" />

                            {/* Cabeza */}
                            <circle cx="100" cy="80" r="42" className="fill-white" />

                            {/* Orejas */}
                            <path d="M70 50 L58 25 L90 45 Z" className="fill-white" />
                            <path d="M130 50 L142 25 L110 45 Z" className="fill-white" />
                            <path d="M72 48 L63 32 L85 46 Z" className="fill-pink-200" />
                            <path d="M128 48 L137 32 L115 46 Z" className="fill-pink-200" />

                            {/* Lentes COOL */}
                            {/* Montura */}
                            <rect x="52" y="70" width="45" height="22" rx="5" className="fill-slate-900" />
                            <rect x="103" y="70" width="45" height="22" rx="5" className="fill-slate-900" />
                            <rect x="95" y="76" width="10" height="4" className="fill-slate-900" />
                            {/* Lentes */}
                            <rect x="55" y="73" width="39" height="16" rx="3" className="fill-primary-500" />
                            <rect x="106" y="73" width="39" height="16" rx="3" className="fill-primary-500" />
                            {/* Brillo en lentes */}
                            <rect x="58" y="75" width="10" height="3" rx="1" className="fill-white/40" />
                            <rect x="125" y="75" width="12" height="3" rx="1" className="fill-white/40" />
                            {/* Patillas de lentes salen a los lados */}
                            <rect x="45" y="78" width="7" height="4" className="fill-slate-900" />
                            <rect x="148" y="78" width="7" height="4" className="fill-slate-900" />

                            {/* Nariz y Boca */}
                            <circle cx="100" cy="98" r="3" className="fill-pink-300" />
                            <path d="M97 102 Q100 105 103 102" className="stroke-slate-900" strokeWidth="2" strokeLinecap="round" />

                            {/* Bigotes */}
                            <line x1="50" y1="95" x2="25" y2="92" className="stroke-white/50" strokeWidth="2" />
                            <line x1="50" y1="100" x2="25" y2="100" className="stroke-white/50" strokeWidth="2" />
                            <line x1="150" y1="95" x2="175" y2="92" className="stroke-white/50" strokeWidth="2" />
                            <line x1="150" y1="100" x2="175" y2="100" className="stroke-white/50" strokeWidth="2" />

                            {/* Sombrero de Fiesta (ladeado por cool) */}
                            <g transform="rotate(-15 100 45)">
                                <path d="M85 45 L100 5 L115 45 Z" className="fill-secondary-500" />
                                <circle cx="100" cy="5" r="5" className="fill-yellow-400 animate-bounce" />
                            </g>

                            {/* Brazos Trajeados Levantados */}
                            <path d="M55 130 Q40 100 45 70" className="stroke-slate-900" strokeWidth="16" strokeLinecap="round" />
                            <path d="M145 130 Q160 100 155 70" className="stroke-slate-900" strokeWidth="16" strokeLinecap="round" />

                            {/* Manos/Guantes blancos */}
                            <circle cx="45" cy="65" r="7" className="fill-white" />
                            <circle cx="155" cy="65" r="7" className="fill-white" />

                            {/* Confeti extra integrado */}
                            <circle cx="30" cy="40" r="3" className="fill-blue-400 animate-pulse" />
                            <circle cx="170" cy="50" r="4" className="fill-purple-400 animate-bounce" />
                            <path d="M160 30 L170 40" className="stroke-orange-400" strokeWidth="3" />
                            <rect x="25" y="110" width="6" height="6" className="fill-yellow-400" transform="rotate(25 33 93)" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-black text-white leading-tight mb-2 tracking-tight">
                        ¡Módulo Completado!
                    </h2>
                    <p className="text-gray-400 text-sm font-medium mb-8 px-8">
                        Has demostrado un excelente dominio del tema. Tu dedicación fortalece la seguridad de todos.
                    </p>

                    {/* Stats Card */}
                    <div className="w-full bg-slate-800/50 border border-white/5 rounded-2xl p-4 mb-8 flex items-center justify-around gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-secondary-500/20 flex items-center justify-center mb-1 text-secondary-400">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-black text-white">100%</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Progreso</span>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mb-1 text-primary-400">
                                <Star className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-black text-white">+{bonusPoints}</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Puntos Bonus</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col w-full gap-3">
                        {!!data?.generatesCertificate && (
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate(`/certificates/module/${data?.moduleId}`);
                                }}
                                className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:shadow-primary-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Ver Certificado <ChevronRight className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={() => {
                                navigate('/modules');
                                onClose();
                            }}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                        >
                            Continuar Aprendiendo
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ModuleCompletionModal;
