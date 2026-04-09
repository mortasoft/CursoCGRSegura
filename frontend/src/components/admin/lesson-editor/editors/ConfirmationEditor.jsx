import React from 'react';

export default function ConfirmationEditor({ 
    description, 
    onChangeDescription,
    option1, 
    onChangeOption1,
    option2, 
    onChangeOption2,
    correctOption,
    onChangeCorrectOption
}) {
    return (
        <div className="space-y-6">
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Pregunta / Contexto</label>
                <textarea
                    className="w-full bg-[#0a0d18] border border-white/5 focus:border-primary-500/50 rounded-xl py-3 px-4 text-white text-sm font-semibold outline-none transition-all hover:border-white/10 min-h-[100px]"
                    placeholder="Ej: ¿Has comprendido los lineamientos de seguridad presentados?"
                    value={description}
                    onChange={(e) => onChangeDescription(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Opción 1</label>
                    <input
                        type="text"
                        className="w-full bg-[#0a0d18] border border-white/5 focus:border-primary-500/50 rounded-xl py-3 px-4 text-white text-sm font-semibold outline-none transition-all hover:border-white/10"
                        placeholder="Ej: Sí, perfectamente"
                        value={option1}
                        onChange={(e) => onChangeOption1(e.target.value)}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Opción 2</label>
                    <input
                        type="text"
                        className="w-full bg-[#0a0d18] border border-white/5 focus:border-primary-500/50 rounded-xl py-3 px-4 text-white text-sm font-semibold outline-none transition-all hover:border-white/10"
                        placeholder="Ej: No, necesito repaso"
                        value={option2}
                        onChange={(e) => onChangeOption2(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Opción Correcta</label>
                <div className="flex gap-4">
                    {[1, 2].map((num) => (
                        <button
                            key={num}
                            type="button"
                            onClick={() => onChangeCorrectOption(num)}
                            className={`flex-1 py-3 px-4 rounded-xl border transition-all font-bold uppercase tracking-widest text-[10px] ${
                                correctOption === num 
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' 
                                : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                            }`}
                        >
                            Opción {num}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
