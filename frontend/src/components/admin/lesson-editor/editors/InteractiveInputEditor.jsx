import React from 'react';
import { Type, CheckCircle, Search, MessageSquare, AlignLeft } from 'lucide-react';

export default function InteractiveInputEditor({ 
    description, 
    onChangeDescription,
    placeholder,
    onChangePlaceholder,
    validationType,
    onChangeValidationType,
    correctAnswer,
    onChangeCorrectAnswer,
    regexPattern,
    onChangeRegexPattern,
    inputSize = 'single',
    onChangeInputSize
}) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Description/Instruction */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Instrucción / Pregunta</label>
                <textarea
                    className="w-full bg-[#0a0d18] border border-white/5 focus:border-primary-500/50 rounded-xl py-3 px-4 text-white text-sm font-medium outline-none transition-all hover:border-white/10 min-h-[100px] resize-none"
                    placeholder="Ej: ¿Qué medidas de seguridad implementarías en este caso? o Escribe la contraseña que consideres segura..."
                    value={description}
                    onChange={(e) => onChangeDescription(e.target.value)}
                />
            </div>

            {/* Placeholder */}
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Sugerencia (Placeholder)</label>
                <input
                    type="text"
                    className="w-full bg-[#0a0d18] border border-white/5 focus:border-primary-500/50 rounded-xl py-3 px-4 text-white text-sm font-medium outline-none transition-all"
                    placeholder="Ej: Escribe aquí..."
                    value={placeholder}
                    onChange={(e) => onChangePlaceholder(e.target.value)}
                />
            </div>

            {/* Validation Type Selector */}
            <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Tipo de Validación</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                        { id: 'free', label: 'Entrada Libre', sub: 'Reflexión/Tutor', icon: MessageSquare },
                        { id: 'exact', label: 'Texto Exacto', sub: 'Match estricto', icon: CheckCircle },
                        { id: 'regex', label: 'Expresión Regular', sub: 'Patrones complejos', icon: Search }
                    ].map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => onChangeValidationType(type.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
                                validationType === type.id 
                                    ? 'bg-primary-500/10 border-primary-500 text-white shadow-lg shadow-primary-500/10' 
                                    : 'bg-slate-900/50 border-white/5 text-gray-400 hover:border-white/10'
                            }`}
                        >
                            <type.icon className={`w-5 h-5 ${validationType === type.id ? 'text-primary-400' : 'text-gray-600'}`} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest">{type.label}</p>
                                <p className="text-[9px] text-gray-500 font-medium">{type.sub}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Size/Type Selector */}
            <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Diseño de Entrada</label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'single', label: 'Línea Única', sub: 'Input de texto simple', icon: Type },
                        { id: 'multi', label: 'Multilínea', sub: 'Cuadro de texto extendido', icon: AlignLeft }
                    ].map((sizeOpt) => (
                        <button
                            key={sizeOpt.id}
                            type="button"
                            onClick={() => onChangeInputSize(sizeOpt.id)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                                inputSize === sizeOpt.id 
                                    ? 'bg-primary-500/10 border-primary-500 text-white shadow-lg shadow-primary-500/10' 
                                    : 'bg-slate-900/50 border-white/5 text-gray-400 hover:border-white/10'
                            }`}
                        >
                            <sizeOpt.icon className={`w-5 h-5 ${inputSize === sizeOpt.id ? 'text-primary-400' : 'text-gray-600'} shrink-0`} />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest">{sizeOpt.label}</p>
                                <p className="text-[9px] text-gray-500 font-medium">{sizeOpt.sub}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Conditional Fields */}
            {validationType === 'exact' && (
                <div className="space-y-1.5 animate-slide-up">
                    <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider ml-1">Respuesta Correcta</label>
                    <input
                        type="text"
                        className="w-full bg-[#0a0d18] border border-emerald-500/20 focus:border-emerald-500/50 rounded-xl py-3 px-4 text-white text-sm font-medium outline-none transition-all"
                        placeholder="Ej: 1234 (Se validará exactamente)"
                        value={correctAnswer}
                        onChange={(e) => onChangeCorrectAnswer(e.target.value)}
                    />
                </div>
            )}

            {validationType === 'regex' && (
                <div className="space-y-1.5 animate-slide-up">
                    <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider ml-1">Patrón de Validación (Regex)</label>
                    <input
                        type="text"
                        className="w-full bg-[#0a0d18] border border-amber-500/20 focus:border-amber-500/50 rounded-xl py-3 px-4 text-white text-sm font-mono outline-none transition-all"
                        placeholder="Ej: ^(?=.*[A-Z]).{8,}$"
                        value={regexPattern}
                        onChange={(e) => onChangeRegexPattern(e.target.value)}
                    />
                    <p className="text-[9px] text-gray-500 italic ml-1">Se usará para validar fortaleza o formatos específicos.</p>
                </div>
            )}
        </div>
    );
}
