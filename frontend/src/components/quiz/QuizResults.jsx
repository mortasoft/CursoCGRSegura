import { Star, AlertTriangle, RotateCcw, Gamepad2, Award } from 'lucide-react';
import CyberCat from '../CyberCat';
import PointsCounter from './PointsCounter';

export default function QuizResults({ results, quiz, questions, userAnswers, onBack, onRetry, onReplay }) {
    const tetrisQuestion = questions?.find(q => q.question_type === 'data_tetris');
    const basePoints = tetrisQuestion?.points || 0;
    const tetrisAnswer = tetrisQuestion ? userAnswers?.[tetrisQuestion.id] : null;

    // Determine if they completed Data Tetris and with what parameters
    const tetrisScore = tetrisAnswer?.score || 0;
    const tetrisDiff = tetrisAnswer?.difficulty || 'easy';

    // Parse question data to get min_score
    let tetrisMinScore = 500;
    if (tetrisQuestion?.data) {
        try {
            const qData = typeof tetrisQuestion.data === 'string' ? JSON.parse(tetrisQuestion.data) : tetrisQuestion.data;
            tetrisMinScore = qData.min_score || 500;
        } catch (e) {
            // fallback
        }
    }

    // Calculate performance tier
    let tetrisPerformance = 'normal';
    if (tetrisScore >= tetrisMinScore * 3) tetrisPerformance = 'legend';
    else if (tetrisScore >= tetrisMinScore * 2) tetrisPerformance = 'master';
    else if (tetrisScore >= tetrisMinScore * 1.5) tetrisPerformance = 'expert';

    const renderCell = (rowDiff, colPerf, value) => {
        const isMatched = tetrisQuestion && tetrisDiff === rowDiff && tetrisPerformance === colPerf;
        return (
            <td className={`py-2 px-1 text-center text-[10px] transition-all rounded-lg ${
                isMatched 
                ? 'bg-secondary-500/20 text-secondary-400 font-black border-2 border-secondary-500/40 shadow-[0_0_15px_rgba(249,115,22,0.15)] animate-pulse' 
                : 'text-slate-400 font-semibold'
            }`}>
                {value}
            </td>
        );
    };

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

                <div className="flex flex-col items-center gap-3">
                    {results.pointsAwarded > 0 && (
                        <div className="space-y-2 flex flex-col items-center">
                            <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-secondary-500/20 border border-secondary-500/30 rounded-full text-secondary-500 font-black text-[11px] animate-bounce">
                                <Star className="w-3.5 h-3.5 fill-secondary-500" /> +<PointsCounter target={results.pointsAwarded} /> PTS
                            </div>
                            {results.score > 100 && (
                                <p className="text-[9px] font-black text-secondary-400 uppercase tracking-widest flex items-center gap-1.5 bg-secondary-500/5 px-2.5 py-1 rounded-lg border border-secondary-500/10">
                                    ¡Incluye bonificación por dificultad y desempeño en Data Tetris!
                                </p>
                            )}
                            {results.penaltyApplied > 0 && (
                                <p className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1.5 bg-red-500/5 px-2.5 py-1 rounded-lg border border-red-500/10">
                                    <AlertTriangle className="w-2.5 h-2.5" /> Penalización de {(results.attemptNumber - 1) * 10}% por intentos
                                </p>
                            )}
                        </div>
                    )}

                    {results.badgeAwarded && (
                        <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl animate-fade-in flex flex-col items-center gap-3 max-w-sm w-full mx-auto shadow-lg shadow-primary-500/5">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/30 to-primary-600/10 flex items-center justify-center border border-primary-500/30 shadow-inner">
                                    <Award className="w-8 h-8 text-primary-400 animate-pulse" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none mb-1.5">¡Insignia Desbloqueada!</p>
                                    <h3 className="text-xl font-black text-white uppercase leading-none tracking-tight">{results.badgeAwarded.name}</h3>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                                <Star className="w-3.5 h-3.5 fill-primary-500 text-primary-500" />
                                <span className="text-[11px] font-black text-white uppercase">+{results.badgeAwarded.points || 5} PTS EXTRAS</span>
                            </div>
                        </div>
                    )}
                </div>

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

                {/* Tabla de Puntos Posibles para Data Tetris */}
                {tetrisQuestion && (
                    <div className="mt-6 p-5 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3 max-w-lg mx-auto text-left shadow-2xl backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-500/5 rounded-bl-full blur-2xl"></div>
                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <Star className="w-4 h-4 text-secondary-500 fill-secondary-500" />
                            <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                                Matriz de Puntos Bonus (Data Tetris)
                            </p>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                            Tus puntos obtenidos en el juego se calculan según la dificultad elegida y tu puntuación alcanzada. La celda iluminada representa tu logro actual (Puntos Base: <strong className="text-white">{basePoints} PTS</strong>):
                        </p>
                        <div className="overflow-x-auto pt-1">
                            <table className="w-full text-[9px] text-gray-400 border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-gray-500 font-bold uppercase text-[8px] tracking-wider">
                                        <th className="py-2 px-1 text-left">Dificultad</th>
                                        <th className="py-2 px-1 text-center">Normal</th>
                                        <th className="py-2 px-1 text-center">Experto</th>
                                        <th className="py-2 px-1 text-center">Maestro</th>
                                        <th className="py-2 px-1 text-center">Leyenda</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-white/5">
                                        <td className="py-2 px-1 font-bold text-slate-300 text-left">Fácil (1.0x)</td>
                                        {renderCell('easy', 'normal', basePoints)}
                                        {renderCell('easy', 'expert', Math.round(basePoints * 1.25))}
                                        {renderCell('easy', 'master', Math.round(basePoints * 1.5))}
                                        {renderCell('easy', 'legend', basePoints * 2)}
                                    </tr>
                                    <tr className="border-b border-white/5">
                                        <td className="py-2 px-1 font-bold text-slate-300 text-left">Medio (1.2x)</td>
                                        {renderCell('medium', 'normal', Math.round(basePoints * 1.2))}
                                        {renderCell('medium', 'expert', Math.round(basePoints * 1.5))}
                                        {renderCell('medium', 'master', Math.round(basePoints * 1.8))}
                                        {renderCell('medium', 'legend', Math.round(basePoints * 2.4))}
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-1 font-bold text-slate-300 text-left">Difícil (1.5x)</td>
                                        {renderCell('hard', 'normal', Math.round(basePoints * 1.5))}
                                        {renderCell('hard', 'expert', Math.round(basePoints * 1.875))}
                                        {renderCell('hard', 'master', Math.round(basePoints * 2.25))}
                                        {renderCell('hard', 'legend', basePoints * 3)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="pt-4 flex flex-col md:flex-row gap-3 justify-center">
                    <button
                        onClick={onBack}
                        className="px-10 py-3.5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all"
                    >
                        Volver
                    </button>
                    {results.attemptNumber < quiz.max_attempts ? (
                        <button
                            onClick={onRetry}
                            className="px-10 py-3.5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-slate-700 hover:border-orange-500/50 transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Intentar de nuevo</span>
                        </button>
                    ) : (
                        results.passed && onReplay && (
                            <button
                                onClick={onReplay}
                                className="px-10 py-4 bg-secondary-600/20 text-secondary-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-secondary-500/30 hover:bg-secondary-600 hover:text-white transition-all flex flex-col items-center justify-center gap-1 hover:scale-105 active:scale-95"
                            >
                                <div className="flex items-center gap-2">
                                    <Gamepad2 className="w-4 h-4" />
                                    <span>Rejugar por diversión</span>
                                </div>
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
