import React, { useEffect } from 'react';
import { Award, Star, X, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

/** 
 * Componente Presentacional: BadgeVisual (Pattern Section 1)
 * Encapsula solo la representación gráfica de la insignia con sus efectos de brillo.
 */
const BadgeVisual = ({ imageUrl, name }) => (
    <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-secondary-500/40 rounded-full blur-2xl animate-pulse group-hover:bg-secondary-500/60 transition-all" />
        <div className="relative w-40 h-40 flex items-center justify-center bg-slate-900 rounded-full border-2 border-secondary-500/30 p-4 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
                />
            ) : (
                <Award className="w-20 h-20 text-secondary-500" />
            )}
        </div>
        <div className="absolute -top-2 -right-2 bg-yellow-400 p-1.5 rounded-lg shadow-lg rotate-12 animate-bounce">
            <Star className="w-4 h-4 text-slate-900 fill-slate-900" />
        </div>
    </div>
);

const BadgeAwardModal = ({ isOpen, onClose, badge }) => {

    useEffect(() => {
        if (isOpen && badge) {
            // Suena efecto de insignia
            const audio = new Audio('/sounds/badge.mp3');
            audio.play().catch(() => {/* Blocked by browser */ });

            // Lanzar confeti premium (Pattern Section 6)
            const end = Date.now() + 2000;
            const colors = ['#384A99', '#E57B3C', '#ffffff', '#28a9e0'];

            (function frame() {
                if (!isOpen) return;
                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: colors,
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: colors,
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }, [isOpen, badge]);

    // Nota: Las imágenes dinámicas deben estar en /public/images/badges/
    // ya que /src/assets no es accesible directamente vía URL en build de producción.
    const badgeImageUrl = badge?.image_url
        ? (badge.image_url.startsWith('http') ? badge.image_url : `/images/badges/${badge.image_url}`)
        : null;

    return (
        <AnimatePresence>
            {isOpen && badge && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl pointer-events-auto"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 100, rotateX: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50, transition: { duration: 0.2 } }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-gradient-to-b from-[#161c3a] to-[#0d1127] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(229,123,60,0.5)]"
                    >
                        {/* Interactive Shine */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-secondary-500/10 rounded-full blur-[80px] pointer-events-none" />

                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-20 group"
                        >
                            <X className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                        </button>

                        <div className="relative p-8 pt-16 flex flex-col items-center text-center z-10">

                            <BadgeVisual imageUrl={badgeImageUrl} name={badge.name} />

                            <div className="space-y-4">
                                <motion.p
                                    initial={{ letterSpacing: "0.1em", opacity: 0 }}
                                    animate={{ letterSpacing: "0.3em", opacity: 1 }}
                                    className="text-secondary-400 font-black uppercase text-[10px]"
                                >
                                    ¡Nueva Insignia Ganada!
                                </motion.p>

                                <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                                    {badge.name}
                                </h2>

                                <div className="w-16 h-1.5 bg-gradient-to-r from-transparent via-secondary-500 to-transparent mx-auto rounded-full shadow-[0_0_15px_rgba(229,123,60,0.8)]" />

                                <p className="text-gray-400 text-sm font-medium px-4 leading-relaxed line-clamp-3">
                                    {badge.description}
                                </p>
                            </div>

                            <motion.div
                                className="mt-10 w-full"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <button
                                    onClick={onClose}
                                    className="w-full py-5 bg-gradient-to-r from-secondary-600 to-secondary-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-secondary-900/40 hover:shadow-secondary-500/20 transition-all border border-white/10"
                                >
                                    ¡Excelente, Coleccionarla!
                                </button>
                            </motion.div>

                            <div className="mt-8 flex items-center gap-2 text-gray-600">
                                <Trophy className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Insignia Coleccionable</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BadgeAwardModal;
