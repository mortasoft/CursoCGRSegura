import React from 'react';
import { Target, ImageIcon, MessageSquare, Trash2, CheckCircle2, XCircle, PlayCircle } from 'lucide-react';
import PremiumSelect from '../../PremiumSelect';

export default function QuestionItem({ 
    question, 
    index, 
    onUpdateQuestion, 
    onRemoveQuestion, 
    onUpdateOption, 
    onAddOption, 
    onRemoveOption 
}) {
    const INTERACTIVE_GAME_TYPES = ['mfa_defender', 'hack_neighbor', 'data_tetris'];
    const questionTypes = [
        { value: 'multiple_choice', label: 'Selección Múltiple' },
        { value: 'true_false', label: 'Falso / Verdadero' },
        { value: 'multiple_select', label: 'Selección Múltiple (Varias)' },
        { value: 'mfa_defender', label: 'Simulador MFA' },
        { value: 'hack_neighbor', label: 'Hackea al Vecino (Juego)' },
        { value: 'data_tetris', label: 'Data Tetris (Juego)' },
        { value: 'video', label: 'Video (Solo Visualización)' }
    ];

    const isInteractiveGame = INTERACTIVE_GAME_TYPES.includes(question.question_type);
    const hasOptionsAndExplanation = !['mfa_defender', 'hack_neighbor', 'data_tetris', 'video'].includes(question.question_type);

    return (
        <div className="card p-8 bg-slate-900/40 border-white/5 relative group hover:border-primary-500/20 transition-all text-left">
            <div className="space-y-6">
                {/* Question Text (Full Row Width) */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary-500/10 rounded-lg border border-primary-500/30 flex items-center justify-center font-black text-xs text-primary-400 shadow-inner">
                            {index + 1}
                        </span>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 text-left">
                            <Target className="w-3 h-3 text-primary-400" /> Texto de la Pregunta
                        </label>
                    </div>
                    <textarea
                        className={`input-field bg-slate-950/50 border-white/10 font-bold text-white transition-all w-full ${
                            isInteractiveGame 
                            ? 'h-28 text-lg' 
                            : 'h-24 text-sm'
                        }`}
                        placeholder="¿Cuál es el protocolo de seguridad...?"
                        value={question.question_text}
                        onChange={e => onUpdateQuestion(question.id, 'question_text', e.target.value)}
                    />
                </div>

                {/* Settings & Actions Row */}
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    {question.question_type === 'video' ? (
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 text-left">
                                <PlayCircle className="w-3 h-3 text-secondary-500" /> Video URL (mp4 o YouTube)
                            </label>
                            <input
                                type="text"
                                className="input-field bg-slate-950/50 border-white/10 text-[11px] py-3.5"
                                placeholder="https://www.youtube.com/watch?v=... o https://ejemplo.com/video.mp4"
                                value={question.image_url || ''}
                                onChange={e => onUpdateQuestion(question.id, 'image_url', e.target.value)}
                            />
                            {question.image_url && (
                                <div className="mt-2 relative group aspect-video w-full max-h-32 overflow-hidden rounded-lg border border-white/5 bg-black flex items-center justify-center">
                                    {question.image_url.includes('youtube.com') || question.image_url.includes('youtu.be') ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${question.image_url.split('v=')[1]?.split('&')[0] || question.image_url.split('/').pop()}`}
                                            className="w-full h-full border-0"
                                            title="Vista previa del video"
                                        />
                                    ) : (
                                        <video src={question.image_url} className="w-full h-full object-contain" controls />
                                    )}
                                </div>
                            )}
                        </div>
                    ) : !isInteractiveGame ? (
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 text-left">
                                <ImageIcon className="w-3 h-3 text-secondary-500" /> Imagen (URL)
                            </label>
                            <input
                                type="text"
                                className="input-field bg-slate-950/50 border-white/10 text-[11px] py-3.5"
                                placeholder="https://ejemplo.com/imagen.jpg"
                                value={question.image_url || ''}
                                onChange={e => onUpdateQuestion(question.id, 'image_url', e.target.value)}
                            />
                            {question.image_url && (
                                <div className="mt-2 relative group h-12 w-full overflow-hidden rounded-lg border border-white/5">
                                    <img src={question.image_url} alt="Vista previa" className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-all" />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded text-white font-black uppercase">Vista Previa</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}

                    <div className="flex-1 min-w-[200px] space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-left block">Puntos</label>
                        <input
                            type="number"
                            className="input-field bg-slate-950/50 border-white/10 py-3.5"
                            value={question.points}
                            onChange={e => onUpdateQuestion(question.id, 'points', parseInt(e.target.value) || 0)}
                        />
                    </div>

                    <div className="flex-1 min-w-[200px] space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-left block">Tipo</label>
                        <PremiumSelect
                            options={questionTypes}
                            value={question.question_type || 'multiple_choice'}
                            onChange={value => onUpdateQuestion(question.id, 'question_type', value)}
                            className="input-field bg-slate-950/50 border-white/10 py-3.5 text-xs text-left"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => onRemoveQuestion(question.id)}
                        className="p-3.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:scale-105 active:scale-95 shrink-0 self-end md:mb-[1px]"
                        title="Eliminar Pregunta"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {hasOptionsAndExplanation ? (
                    <>
                        {/* Options Grid */}
                        <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opciones de Respuesta</label>
                                <button
                                    onClick={() => onAddOption(question.id)}
                                    className="text-[9px] font-black text-primary-400 hover:text-white uppercase tracking-widest bg-primary-500/10 px-3 py-1 rounded-full border border-primary-500/20"
                                >
                                    + Añadir Opción
                                </button>
                            </div>
                            <div className="grid gap-3">
                                {question.options.map((opt, oIdx) => (
                                    <div key={opt.id} className="flex items-center gap-3 group/opt">
                                        <button
                                            onClick={() => onUpdateOption(question.id, opt.id, 'is_correct', !opt.is_correct)}
                                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all ${opt.is_correct ? 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'bg-slate-950/50 border-white/5 text-gray-600 hover:border-white/20'}`}
                                            title={opt.is_correct ? 'Respuesta Correcta' : 'Marcar como correcta'}
                                        >
                                            {opt.is_correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </button>
                                        <input
                                            type="text"
                                            className={`flex-1 input-field bg-slate-950/50 border-white/10 text-sm ${opt.is_correct ? 'border-green-500/30' : ''}`}
                                            placeholder={`Opción ${oIdx + 1}`}
                                            value={opt.option_text}
                                            onChange={e => onUpdateOption(question.id, opt.id, 'option_text', e.target.value)}
                                        />
                                        <button
                                            onClick={() => onRemoveOption(question.id, opt.id)}
                                            className="opacity-0 group-hover/opt:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="pt-4 border-t border-white/5 space-y-2 text-left">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3 text-primary-400" /> Explicación de la Respuesta Correcta
                            </label>
                            <textarea
                                className="input-field bg-slate-950/50 border-white/10 text-xs italic"
                                placeholder="Esta respuesta es correcta porque..."
                                value={question.explanation || ''}
                                onChange={e => onUpdateQuestion(question.id, 'explanation', e.target.value)}
                            />
                        </div>
                    </>
                ) : isInteractiveGame ? (
                    <div className="pt-4 border-t border-white/5 space-y-4 text-left">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                            Configuración de {
                                question.question_type === 'mfa_defender' ? 'Defensa MFA' : 
                                question.question_type === 'hack_neighbor' ? 'Hackea al Vecino' :
                                'Data Tetris'
                            }
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            {question.question_type === 'mfa_defender' ? (
                                (() => {
                                    const qData = typeof question.data === 'string' ? JSON.parse(question.data) : (question.data || {});
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    T. de Hackeo (seg)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input-field bg-slate-950/30 border-white/5 text-xs text-white"
                                                    placeholder="Segundos (ej: 20)"
                                                    value={qData.hack_time || ''}
                                                    onChange={e => onUpdateQuestion(question.id, 'data', { ...qData, hack_time: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    Cambio Código (seg)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input-field bg-slate-950/30 border-white/5 text-xs text-white"
                                                    placeholder="Segundos (ej: 5)"
                                                    value={qData.rotate_time || ''}
                                                    onChange={e => onUpdateQuestion(question.id, 'data', { ...qData, rotate_time: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    Penalización (PTS)
                                                </label>
                                                <input
                                                    type="number"
                                                    className="input-field bg-slate-950/30 border-white/5 text-xs text-secondary-400"
                                                    placeholder="Puntos por fallo (ej: 10)"
                                                    value={qData.fail_penalty || ''}
                                                    onChange={e => onUpdateQuestion(question.id, 'data', { ...qData, fail_penalty: parseInt(e.target.value) })}
                                                />
                                            </div>
                                        </div>
                                    );
                                })()
                            ) : question.question_type === 'hack_neighbor' ? (
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400">Penalización por Pista Revelada (Puntos)</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="number"
                                            className="input-field bg-slate-950/50 border-white/10 text-sm w-32"
                                            value={question.data?.hint_penalty || 0}
                                            onChange={e => onUpdateQuestion(question.id, 'data', { ...(question.data || {}), hint_penalty: parseInt(e.target.value) })}
                                        />
                                        <p className="text-[11px] text-gray-500 italic">Cada vez que el estudiante revele una de las 3 pistas, se le restarán estos puntos del total ganado.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5 col-span-2">
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dificultad Inicial</label>
                                        <div className="flex gap-2">
                                            {['easy', 'medium', 'hard'].map(level => (
                                                <button
                                                    key={level}
                                                    onClick={() => onUpdateQuestion(question.id, 'data', { ...(question.data || {}), difficulty: level })}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                                        (question.data?.difficulty || 'easy') === level
                                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                                        : 'bg-slate-950/50 text-gray-500 border border-white/5 hover:border-white/20'
                                                    }`}
                                                >
                                                    {level === 'easy' ? 'Básico' : level === 'medium' ? 'Medio' : 'Avanzado'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-left">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Puntaje Mínimo para Aprobar</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="number"
                                                className="input-field bg-slate-950/50 border-white/10 text-sm w-32"
                                                placeholder="500"
                                                value={question.data?.min_score || 0}
                                                onChange={e => onUpdateQuestion(question.id, 'data', { ...(question.data || {}), min_score: parseInt(e.target.value) })}
                                            />
                                            <p className="text-[11px] text-gray-500 italic">El estudiante debe alcanzar este puntaje para que la pregunta se marque como correcta.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
