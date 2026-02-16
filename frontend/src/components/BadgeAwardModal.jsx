import React, { useEffect, useState } from 'react';
import { Award, Star, X, Check, Share2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

const BadgeAwardModal = ({ isOpen, onClose, badge }) => {
    const [isVisible, setIsVisible] = useState(false);
    const audioRef = React.useRef(null);
    const isAnimatingRef = React.useRef(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            isAnimatingRef.current = true;

            // Suena efecto de puntos/insignia (ya se dispara en el store pero por si acaso o para consistencia)
            // audioRef.current = new Audio('/celebrate.mp3');
            // audioRef.current.play().catch(e => console.log('Audio blocked'));

            // Lanzar confeti premium
            const end = Date.now() + 2000;
            const colors = ['#384A99', '#E57B3C', '#ffffff', '#28a9e0'];

            (function frame() {
                if (!isAnimatingRef.current) return;
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: colors,
                    zIndex: 9999
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: colors,
                    zIndex: 9999
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        } else {
            setIsVisible(false);
            isAnimatingRef.current = false;
        }
        return () => { isAnimatingRef.current = false; };
    }, [isOpen]);

    if (!isOpen || !badge) return null;

    // Intentar construir la URL de la imagen si está en assets/badges
    // Asumimos que el backend devuelve el nombre del archivo en image_url
    const badgeImageUrl = badge.image_url ? `/src/assets/badges/${badge.image_url}` : null;

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className={`relative w-full max-w-sm bg-[#0d1127] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(229,123,60,0.3)] transition-all duration-700 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`}>

                {/* Glow Background */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-secondary-500/20 rounded-full blur-[80px] pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-10"
                >
                    <X className="w-4 h-4 text-gray-400" />
                </button>

                <div className="relative p-8 pt-12 flex flex-col items-center text-center">
                    {/* Badge Container */}
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-secondary-500/40 rounded-full blur-2xl animate-pulse group-hover:bg-secondary-500/60 transition-all" />
                        <div className="relative w-40 h-40 flex items-center justify-center bg-slate-900 rounded-full border-2 border-secondary-500/30 p-4 shadow-2xl overflow-hidden group">
                            {/* Inner Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                            {badgeImageUrl ? (
                                <img
                                    src={badgeImageUrl}
                                    alt={badge.name}
                                    className="w-full h-full object-contain animate-float transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <Award className="w-20 h-20 text-secondary-500 animate-float" />
                            )}
                        </div>
                        {/* Little star decorations */}
                        <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-lg shadow-lg rotate-12 animate-bounce">
                            <Star className="w-4 h-4 text-slate-900 fill-slate-900" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-secondary-400 font-black uppercase tracking-[0.3em] text-[10px]">¡Nueva Insignia Ganada!</p>
                        <h2 className="text-2xl font-black text-white leading-tight tracking-tight uppercase">
                            {badge.name}
                        </h2>
                        <div className="w-12 h-1 bg-gradient-to-r from-transparent via-secondary-500 to-transparent mx-auto rounded-full" />
                        <p className="text-gray-400 text-xs font-medium px-4 leading-relaxed">
                            {badge.description}
                        </p>
                    </div>

                    <div className="mt-8 w-full">
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-secondary-600 hover:bg-secondary-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary-900/40 transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                            ¡Excelente, Coleccionarla!
                        </button>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-gray-500">
                        <Trophy className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Insignia Coleccionable</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BadgeAwardModal;
