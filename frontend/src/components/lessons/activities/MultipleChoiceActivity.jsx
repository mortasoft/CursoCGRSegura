import React, { useState } from 'react';
import { CheckSquare, CheckCircle2, Zap, XCircle, AlertTriangle, Clock, Eye } from 'lucide-react';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';
import { linkify } from '../../../utils/textUtils';

export default function MultipleChoiceActivity({ item, data, playSuccess, playError, markLinkAsVisited }) {
    const options_mc = data.options || [];
    const hasCorrectAnswer = options_mc.some(o => o.is_correct);
    const interactionData_mc = item.interactionData ? (typeof item.interactionData === 'string' ? JSON.parse(item.interactionData) : item.interactionData) : null;

    const [selectedIdx, setSelectedIdx] = useState(interactionData_mc?.selectedIndex ?? null);
    const [status_mc, setStatus_mc] = useState(interactionData_mc?.status ?? (item.isCompleted ? 'completed' : 'pending'));
    const [submitting_mc, setSubmitting_mc] = useState(false);

    const handleSelect = (index) => {
        if (status_mc !== 'pending' && status_mc !== 'incorrect') return;
        setSelectedIdx(index);
    };

    const handleSubmit = async () => {
        if (selectedIdx === null || status_mc === 'completed' || submitting_mc) return;

        setSubmitting_mc(true);
        const selectedOption = options_mc[selectedIdx];
        const isCorrect = hasCorrectAnswer ? selectedOption.is_correct : true;

        try {
            const resData = await markLinkAsVisited(item.id, {
                selectedIndex: selectedIdx,
                text: selectedOption.text,
                status: isCorrect ? 'completed' : 'incorrect'
            });

            if (resData?.success) {
                if (isCorrect) {
                    setStatus_mc('completed');
                    playSuccess();
                    if (hasCorrectAnswer) toast.success('¡Correcto!');
                } else {
                    setStatus_mc('incorrect');
                    playError();
                    toast.error('Respuesta incorrecta. Inténtalo de nuevo.');
                }
            }
        } catch (error) {
            toast.error('Error al procesar respuesta');
        } finally {
            setSubmitting_mc(false);
        }
    };

    return (
        <div className={`p-8 rounded-[2.5rem] transition-all duration-700 border-2 ${status_mc === 'completed' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/40 border-white/5'}`}>
            <div className="flex flex-col gap-6">
                <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${status_mc === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 text-orange-400'}`}>
                        <CheckSquare className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{item.title}</h3>
                        {data.description && (
                            <div className="text-sm text-gray-400 font-medium leading-relaxed mt-1">
                                {(() => {
                                    const desc = data.description;
                                    const isHtml = /<[a-z][\s\S]*>/i.test(desc);
                                    return isHtml ? (
                                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(desc) }} />
                                    ) : (
                                        <p>{linkify(desc)}</p>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                    {status_mc === 'completed' && (
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Completado
                            </span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {options_mc.map((option, idx) => {
                        const isSelected = selectedIdx === idx;
                        const showAsCorrect = status_mc === 'completed' && isSelected;
                        const showAsIncorrect = status_mc === 'incorrect' && isSelected;

                        return (
                            <button
                                key={idx}
                                disabled={status_mc === 'completed' || submitting_mc}
                                onClick={() => handleSelect(idx)}
                                className={`group relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${showAsCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                    : showAsIncorrect
                                        ? 'bg-red-500/10 border-red-500/50 text-red-400 animate-shake'
                                        : isSelected
                                            ? 'bg-primary-500/10 border-primary-500/50 text-white'
                                            : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/10 hover:bg-black/40'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-white/10'
                                    }`}>
                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <span className="font-semibold text-sm">{option.text}</span>

                                {showAsCorrect && <CheckCircle2 className="w-5 h-5 ml-auto" />}
                                {showAsIncorrect && <XCircle className="w-5 h-5 ml-auto" />}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                    <div className="flex flex-wrap items-center gap-3">
                        {status_mc !== 'completed' && (
                            <button
                                onClick={handleSubmit}
                                disabled={selectedIdx === null || submitting_mc}
                                className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${selectedIdx !== null && !submitting_mc
                                    ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20 active:scale-95'
                                    : 'bg-slate-800 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {submitting_mc ? 'Procesando...' : (hasCorrectAnswer ? 'Verificar Respuesta' : 'Confirmar Selección')}
                                <Zap className={`w-4 h-4 ${submitting_mc ? 'animate-spin' : ''}`} />
                            </button>
                        )}

                        {status_mc === 'incorrect' && !submitting_mc && (
                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Inténtalo de nuevo
                            </p>
                        )}

                        {status_mc !== 'completed' ? (
                            <>
                                {!!item.is_required && (
                                    <span className="px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 flex items-center gap-1.5 shadow-lg">
                                        <Clock className="w-3.5 h-3.5" /> Requerido
                                    </span>
                                )}
                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 shadow-lg ${item.is_required ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                    <Eye className="w-3.5 h-3.5" /> {item.is_required ? 'Pendiente' : 'Opcional'}
                                </span>
                            </>
                        ) : (
                            <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/30 flex items-center gap-1.5 shadow-lg shadow-green-500/5">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completado
                            </span>
                        )}
                    </div>

                    {item.points > 0 && (
                        <div className={`relative px-5 py-2.5 rounded-2xl font-black text-[11px] transition-all duration-500 transform ${status_mc === 'completed' ? 'bg-yellow-500 text-slate-950 scale-105 shadow-lg shadow-yellow-500/20' : 'bg-slate-950 border border-white/5 text-yellow-500'}`}>
                            +{item.points} PTS {status_mc === 'completed' ? 'GANADOS' : ''}
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
