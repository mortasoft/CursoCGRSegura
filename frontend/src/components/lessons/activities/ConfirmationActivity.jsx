import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, XCircle, Zap, Clock, Eye } from 'lucide-react';
import DOMPurify from 'dompurify';
import { linkify } from '../../../utils/textUtils';

export default function ConfirmationActivity({ item, data, visitedLinks, markLinkAsVisited, playSuccess, playError }) {
    const [isIncorrect, setIsIncorrect] = useState(null);
    const [revealing, setRevealing] = useState(false);
    const isConfirmed = visitedLinks.has(item.id);

    const handleConfirmation = (optNum) => {
        if (isConfirmed || revealing) return;

        if (optNum === data.correctOption) {
            setRevealing(true);
            playSuccess();
            markLinkAsVisited(item.id, { selectedOption: optNum, answeredAt: new Date().toISOString() });
            setTimeout(() => setRevealing(false), 1000);
        } else {
            setIsIncorrect(optNum);
            playError();
            setTimeout(() => setIsIncorrect(null), 1000);
        }
    };

    return (
        <div className={`p-8 rounded-[2.5rem] transition-all duration-700 border-2 ${isConfirmed
            ? 'bg-emerald-500/5 border-emerald-500/30'
            : 'bg-slate-800/20 border-white/5'
            }`}>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isConfirmed ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                    {isConfirmed ? <CheckCircle2 className="w-10 h-10" /> : <HelpCircle className="w-10 h-10" />}
                </div>

                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                        <div className="text-xl font-bold text-white leading-tight">
                            {(() => {
                                const desc = data.description || 'Por favor confirma la siguiente información:';
                                const isHtml = /<[a-z][\s\S]*>/i.test(desc);
                                return isHtml ? (
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(desc) }} />
                                ) : (
                                    <h3 className="whitespace-pre-wrap">{linkify(desc)}</h3>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        {[1, 2].map((num) => {
                            const optionText = num === 1 ? data.option1 : data.option2;
                            const isThisCorrect = num === data.correctOption;
                            const isSelectedIncorrect = isIncorrect === num;

                            return (
                                <button
                                    key={num}
                                    onClick={() => handleConfirmation(num)}
                                    disabled={isConfirmed || revealing}
                                    className={`flex-1 group relative p-5 rounded-2xl border-2 transition-all duration-300 transform active:scale-95 ${isConfirmed
                                        ? (isThisCorrect ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-slate-900/50 border-white/5 text-gray-600 opacity-60')
                                        : isSelectedIncorrect
                                            ? 'bg-red-500 border-red-400 text-white animate-shake shadow-lg shadow-red-500/20'
                                            : 'bg-slate-900/40 border-white/10 text-gray-300 hover:border-emerald-500/50 hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-3">
                                        {isConfirmed && isThisCorrect && <CheckCircle2 className="w-5 h-5 animate-bounce" />}
                                        {isSelectedIncorrect && <XCircle className="w-5 h-5" />}
                                        <span className="font-bold uppercase tracking-widest text-[11px]">
                                            {optionText || `Opción ${num}`}
                                        </span>
                                    </div>

                                    {!isConfirmed && !isSelectedIncorrect && (
                                        <div className="absolute inset-0 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                        {!!item.is_required && !isConfirmed && (
                            <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 flex items-center gap-1.5 shadow-lg shadow-orange-500/5">
                                <Clock className="w-3.5 h-3.5" /> Requerido
                            </span>
                        )}
                        {isConfirmed ? (
                            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/30 flex items-center gap-1.5 shadow-lg shadow-green-500/5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                            </span>
                        ) : (
                            <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 shadow-lg ${item.is_required ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                <Eye className="w-3.5 h-3.5" /> {item.is_required ? 'Pendiente' : 'Opcional'}
                            </span>
                        )}

                        {item.points > 0 && (
                            <span className={`px-3 py-1.5 rounded-full border transition-all font-black text-[11px] ${isConfirmed ? 'bg-yellow-500 border-yellow-400 text-slate-950 scale-105 shadow-lg shadow-yellow-500/20' : 'bg-slate-950 border border-white/5 text-yellow-500'}`}>
                                +{item.points} PTS {isConfirmed ? 'GANADOS' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
