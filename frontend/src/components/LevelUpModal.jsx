import React, { useEffect, useState } from 'react';
import { Trophy, Zap, ChevronRight, X, Star } from 'lucide-react';

const LevelUpModal = ({ isOpen, onClose, levelData }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // Reproducir sonido de level up
            const audio = new Audio('/level-up.mp3');
            audio.play().catch(e => console.log('Audio play blocked:', e));
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const { newLevel, levelNumber } = levelData || {};
    // Extract level number and name from props or string
    const extractLevelInfo = (levelStr, levelNum) => {
        if (levelNum) return { number: levelNum, name: levelStr || 'Nuevo Rango' };
        if (!levelStr) return { number: '?', name: 'Desconocido' };

        const match = levelStr.match(/Nivel (\d+): (.+)/i);
        if (match) {
            return { number: match[1], name: match[2] };
        }
        return { number: '?', name: levelStr };
    };

    const info = extractLevelInfo(newLevel, levelNumber);

    return (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className={`relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-12'}`}>

                {/* Decorative Background Elements */}
                <div className="absolute top-10 left-10 opacity-10 transform -rotate-12">
                    <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors z-10"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>

                <div className="p-10 pt-16 flex flex-col items-center text-center">

                    {/* Level Badge Circle */}
                    <div className="relative mb-8">
                        {/* Outer Glow */}
                        <div className="absolute inset-0 bg-orange-500/30 blur-3xl rounded-full scale-150 animate-pulse" />

                        {/* Main Circle */}
                        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-8 border-slate-900 shadow-2xl flex flex-col items-center justify-center">
                            <span className="text-[10px] font-black text-orange-100 uppercase tracking-widest leading-none mb-1">LEVEL</span>
                            <span className="text-6xl font-black text-white leading-none tracking-tighter">{info.number}</span>
                        </div>

                        {/* Overlapping Trophy Badge */}
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-800 rounded-xl shadow-lg border border-white/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>

                        {/* Overlapping Lightning Badge */}
                        <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-indigo-500 rounded-2xl shadow-lg border-4 border-slate-900 flex items-center justify-center transform -rotate-12">
                            <Zap className="w-6 h-6 text-white fill-white" />
                        </div>
                    </div>

                    {/* Achievement Tag */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                        <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">LOGRO DESBLOQUEADO</span>
                        <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                    </div>

                    <h2 className="text-4xl font-black text-white leading-[0.9] mb-6 tracking-tighter">
                        ¡Nuevo Rango<br />Alcanzado!
                    </h2>

                    {/* Title Box */}
                    <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 backdrop-blur-sm">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">TÍTULO ACTUAL</p>
                        <p className="text-3xl font-black text-indigo-400 italic uppercase tracking-tight">
                            {info.name}
                        </p>
                    </div>

                    <p className="text-gray-400 font-medium mb-10 px-4 leading-relaxed">
                        ¡Lo estás logrando! Sigue así con el gran trabajo y mantén tu impulso.
                    </p>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="group w-full bg-primary-500 hover:bg-primary-600 text-white rounded-[2rem] py-5 px-8 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl shadow-primary-500/20"
                    >
                        <span className="text-lg font-black tracking-tight">Continuar</span>
                        <ChevronRight className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" />
                    </button>

                </div>
            </div>
        </div>
    );
};

export default LevelUpModal;
