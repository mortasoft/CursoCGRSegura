import React, { useState } from 'react';
import { Type, Zap, CheckCircle, CheckCircle2, AlertTriangle, Clock, Eye } from 'lucide-react';
import DOMPurify from 'dompurify';
import { linkify } from '../../../utils/textUtils';

export default function InteractiveInputActivity({ item, data, visitedLinks, markLinkAsVisited }) {
    const [inputValue, setInputValue] = useState('');
    const [localFeedback, setLocalFeedback] = useState(null); // 'correct', 'incorrect'
    const [revealing, setRevealing] = useState(false);
    const isInputCompleted = visitedLinks.has(item.id);

    const validateAnswer = () => {
        if (isInputCompleted || revealing) return;

        const vType = data.validation_type || 'free';
        let isValid = true;

        if (vType === 'exact') {
            isValid = inputValue.trim().toLowerCase() === (data.correct_answer || '').trim().toLowerCase();
        } else if (vType === 'regex') {
            try {
                const regex = new RegExp(data.regex_pattern);
                isValid = regex.test(inputValue.trim());
            } catch (e) {
                console.error("Invalid regex:", e);
                isValid = true;
            }
        }

        if (isValid || vType === 'free') {
            setLocalFeedback('correct');
            setRevealing(true);
            markLinkAsVisited(item.id, { answer: inputValue, validation_type: vType, validated: isValid });
            setTimeout(() => setRevealing(false), 1000);
        } else {
            setLocalFeedback('incorrect');
            setTimeout(() => setLocalFeedback(null), 2000);
        }
    };

    return (
        <div className={`p-8 rounded-[2.5rem] transition-all duration-700 border-2 ${isInputCompleted
            ? 'bg-indigo-500/5 border-indigo-500/30'
            : 'bg-slate-800/20 border-white/5'
            }`}>
            <div className="flex flex-col gap-6">
                <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isInputCompleted ? 'bg-indigo-500 text-white shadow-lg' : 'bg-indigo-500/10 text-indigo-400'}`}>
                        <Type className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-tight">{item.title}</h3>
                        <div className="text-sm text-gray-400 font-medium italic">
                            {(() => {
                                const desc = data.description || 'Proporciona una respuesta:';
                                const isHtml = /<[a-z][\s\S]*>/i.test(desc);
                                return isHtml ? (
                                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(desc) }} />
                                ) : (
                                    <p className="whitespace-pre-wrap">{linkify(desc)}</p>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                <div className="relative group max-w-2xl">
                    {data.input_size === 'multi' ? (
                        <div className="relative w-full">
                            <textarea
                                value={isInputCompleted ? (item.interactionData?.answer || inputValue) : inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isInputCompleted || revealing}
                                placeholder={data.placeholder || 'Escribe aquí tu respuesta...'}
                                rows="4"
                                className={`w-full bg-black/40 border-2 rounded-2xl py-4 px-6 text-white transition-all outline-none font-medium placeholder:text-gray-600 resize-y custom-scrollbar ${isInputCompleted
                                    ? 'border-indigo-500/50 text-indigo-200 bg-indigo-500/5 pr-16'
                                    : localFeedback === 'incorrect'
                                        ? 'border-red-500/50 bg-red-500/5 animate-shake'
                                        : localFeedback === 'correct'
                                            ? 'border-emerald-500/50 bg-emerald-500/5'
                                            : 'border-white/5 focus:border-indigo-500/40 hover:border-white/10'
                                    }`}
                            />
                            {isInputCompleted && (
                                <div className="absolute right-6 top-6 text-indigo-400">
                                    <CheckCircle className="w-6 h-6 animate-fade-in" />
                                </div>
                            )}
                            {!isInputCompleted && (
                                <div className="flex justify-end mt-3">
                                    <button
                                        onClick={validateAnswer}
                                        disabled={revealing || !inputValue.trim()}
                                        className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                    >
                                        Enviar <Zap className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={isInputCompleted ? (item.interactionData?.answer || inputValue) : inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isInputCompleted || revealing}
                                placeholder={data.placeholder || 'Escribe aquí tu respuesta...'}
                                className={`w-full bg-black/40 border-2 rounded-2xl py-4 px-6 pr-32 text-white transition-all outline-none font-medium placeholder:text-gray-600 ${isInputCompleted
                                    ? 'border-indigo-500/50 text-indigo-200 bg-indigo-500/5'
                                    : localFeedback === 'incorrect'
                                        ? 'border-red-500/50 bg-red-500/5 animate-shake'
                                        : localFeedback === 'correct'
                                            ? 'border-emerald-500/50 bg-emerald-500/5'
                                            : 'border-white/5 focus:border-indigo-500/40 hover:border-white/10'
                                    }`}
                                onKeyDown={(e) => e.key === 'Enter' && validateAnswer()}
                            />
                            {!isInputCompleted && (
                                <button
                                    onClick={validateAnswer}
                                    disabled={revealing || !inputValue.trim()}
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                >
                                    Enviar <Zap className="w-3 h-3" />
                                </button>
                            )}
                            {isInputCompleted && (
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-400">
                                    <CheckCircle className="w-6 h-6 animate-fade-in" />
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-3">
                        {/* Required/Optional status indicator */}
                        {!isInputCompleted && (
                            <>
                                {!!item.is_required && (
                                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 shadow-lg">
                                        <Clock className="w-3.5 h-3.5" /> Requerido
                                    </span>
                                )}
                                <span className={`text-[10px] font-black uppercase tracking-widest border px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${item.is_required ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                    <Eye className="w-3.5 h-3.5" /> {item.is_required ? 'Pendiente' : 'Opcional'}
                                </span>
                            </>
                        )}
                        {localFeedback === 'incorrect' && (
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest animate-fade-in flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/10 shadow-lg shadow-red-500/5">
                                <AlertTriangle className="w-4 h-4" /> Respuesta Incorrecta
                            </span>
                        )}
                        {isInputCompleted && (
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-fade-in flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10 shadow-lg shadow-emerald-500/5">
                                <CheckCircle2 className="w-4 h-4" /> {data.validation_type === 'free' ? 'Respuesta Guardada' : 'Validación Superada'}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {item.points > 0 && (
                            <div className={`relative px-5 py-2 rounded-2xl font-black text-[11px] transition-all duration-500 transform ${isInputCompleted ? 'bg-yellow-500 text-slate-950 scale-110 shadow-lg shadow-yellow-500/20' : 'bg-slate-950 border border-white/5 text-yellow-500'}`}>
                                +{item.points} PTS {isInputCompleted ? 'GANADOS' : ''}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
