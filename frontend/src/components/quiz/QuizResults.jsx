import React from 'react';
import { Star, AlertTriangle, RotateCcw } from 'lucide-react';
import CyberCat from '../CyberCat';
import PointsCounter from './PointsCounter';

export default function QuizResults({ results, quiz, onBack, onRetry }) {
    return (
        <div className={`card overflow-hidden border-t-8 ${results.passed ? 'border-green-500 bg-green-500/5' : 'border-red-500 bg-red-500/5'}`}>
            <div className="p-6 md:p-8 text-center space-y-4">
                <div className="flex justify-center -mt-2">
                    {results.passed ? (
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-green-500/10 flex items-center justify-center ring-[8px] ring-green-500/5 mb-4 backdrop-blur-md relative shadow-[0_0_40px_rgba(34,197,94,0.15)]">
                            <CyberCat
                                className="w-24 h-24 md:w-28 md:h-28 animate-float-subtle"
                                variant="success"
                                color="#22c55e"
                                showMedal={true}
                            />
                            <div className="absolute inset-0 rounded-full animate-pulse bg-green-500/5 blur-xl"></div>
                        </div>
                    ) : (
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-red-500/10 flex items-center justify-center ring-[8px] ring-red-500/5 mb-4 backdrop-blur-md relative shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                            <CyberCat
                                className="w-24 h-24 md:w-28 md:h-28 animate-panic"
                                variant="panic"
                                color="#ef4444"
                            />
                            <div className="absolute inset-0 rounded-full animate-pulse bg-red-500/5 blur-xl"></div>
                        </div>
                    )}
                </div>

                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                        {results.passed ? 'Evaluación Aprobada' : 'Resultado Insuficiente'}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                        Has obtenido un <span className={results.passed ? 'text-green-500' : 'text-red-500'}>{Number(results.score || 0).toFixed(1)}%</span>
                    </p>
                </div>

                {results.pointsAwarded > 0 && (
                    <div className="space-y-2 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-500 font-black text-[11px] animate-bounce">
                            <Star className="w-3.5 h-3.5 fill-secondary-500" /> +<PointsCounter target={results.pointsAwarded} /> PTS
                        </div>
                        {results.penaltyApplied > 0 && (
                            <p className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 bg-red-500/5 px-2.5 py-1 rounded-lg border border-red-500/10">
                                <AlertTriangle className="w-2.5 h-2.5" /> Penalización de {(results.attemptNumber - 1) * 10}% por intentos
                            </p>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
                    <div className="bg-slate-900/50 p-3 md:p-4 rounded-2xl border border-white/5">
                        <p className="text-xl md:text-2xl font-black text-white">{results.earnedPoints}/{results.totalPoints}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Puntos</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 md:p-4 rounded-2xl border border-white/5">
                        <p className="text-xl md:text-2xl font-black text-white">{quiz.passing_score}%</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Requerido</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 md:p-4 rounded-2xl border border-white/5">
                        <p className="text-xl md:text-2xl font-black text-white">{results.attemptNumber}/{quiz.max_attempts}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Intento</p>
                    </div>
                </div>

                <div className="pt-4 flex flex-col md:flex-row gap-3 justify-center">
                    <button
                        onClick={onBack}
                        className="px-10 py-3.5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                    >
                        Volver
                    </button>
                    {!results.passed && results.attemptNumber < quiz.max_attempts && (
                        <button
                            onClick={onRetry}
                            className="px-10 py-3.5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" /> Reintentar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
