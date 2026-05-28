import React from 'react';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import CyberCat from '../CyberCat';

export default function QuizReview({ results, questions, userAnswers }) {
    if (!results.passed || !results.feedback || !Array.isArray(results.feedback)) return null;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary-400" /> Revisión de Respuestas
            </h2>
            {questions.filter(q => q.question_type !== 'video').map((q, idx) => {
                const feedback = results.feedback.find(f => f.questionId === q.id);
                if (!feedback) return null;
                return (
                    <div key={q.id} className={`card p-6 border-l-4 ${feedback.isCorrect ? 'border-green-500/50' : 'border-red-500/50'}`}>
                        <div className="flex gap-4">
                            <span className="text-lg font-black text-gray-700">{(idx + 1).toString().padStart(2, '0')}</span>
                            <div className="space-y-4 flex-1">
                                <p className="text-white font-bold leading-tight text-left">{q.question_text}</p>
                                {q.image_url && (
                                    <div className="w-full max-h-48 rounded-xl overflow-hidden border border-white/5 bg-slate-950/20">
                                        <img src={q.image_url} alt="Imagen de pregunta" className="w-full h-full object-contain mx-auto" />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    {q.question_type === 'mfa_defender' ? (
                                        <div className={`p-4 rounded-xl text-left border ${feedback.isCorrect ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                                            <div className={`flex items-center gap-2 font-bold mb-2 ${feedback.isCorrect ? 'text-indigo-400' : 'text-red-400'}`}>
                                                {feedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                {feedback.isCorrect ? '¡Misión Cumplida: Ataque Detenido!' : 'Ataque Exitoso: El MFA no fue completado a tiempo'}
                                            </div>
                                            <div className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
                                                Como acabas de experimentar, la contraseña por sí sola ya no es suficiente. En este escenario, el atacante logró obtener tus credenciales, pero se topó con un muro: el MFA (Autenticación de Múltiples Factores).
                                            </div>
                                            <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                                                <div className="text-indigo-400 font-bold text-[11px] mb-1">¿Por qué el MFA es tu mejor aliado?</div>
                                                <div className="text-[10px] text-slate-400">
                                                    La importancia de activar y utilizar el MFA radica en que añade una capa de seguridad física o digital que el atacante no posee.
                                                </div>
                                            </div>
                                        </div>
                                    ) : q.question_type === 'hack_neighbor' ? (
                                        <div className={`p-4 rounded-xl text-left border ${feedback.isCorrect ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                                            <div className={`flex items-center gap-2 font-bold mb-2 ${feedback.isCorrect ? 'text-indigo-400' : 'text-red-400'}`}>
                                                {feedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                {feedback.isCorrect ? '¡Felicidades: Has entendido el riesgo!' : 'No lograste completar el desafío de hackeo'}
                                            </div>
                                            <div className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
                                                En este ejercicio aprendiste que usar datos personales como el nombre de tu mascota, fechas de cumpleaños o equipos favoritos hace que tu contraseña sea extremadamente predecible ante un ataque de ingeniería social.
                                            </div>
                                            <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                                                <div className="text-indigo-400 font-bold text-[11px] mb-1">¿Cómo protegerte mejor?</div>
                                                <div className="text-[10px] text-slate-400">
                                                    Evita usar información que alguien pueda encontrar en tus redes sociales. Una frase aleatoria como "MiElefanteAzulComePizza22!" es mucho más segura y fácil de recordar.
                                                </div>
                                            </div>
                                        </div>
                                    ) : q.question_type === 'data_tetris' ? (
                                        <div className={`p-4 rounded-xl text-left border ${feedback.isCorrect ? 'bg-indigo-900/10 border-indigo-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
                                            <div className={`flex items-center gap-2 font-bold mb-2 ${feedback.isCorrect ? 'text-indigo-400' : 'text-red-400'}`}>
                                                {feedback.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                {feedback.isCorrect ? '¡Clasificación de Datos Completada!' : 'No alcanzaste el puntaje mínimo de clasificación'}
                                            </div>
                                            <div className="text-xs text-slate-300 font-medium leading-relaxed mb-3">
                                                A través de Data Tetris has puesto en práctica la identificación y clasificación de la información en sus niveles respectivos (Pública, Confidencial y Restringida). Una mala clasificación puede exponer datos sensibles a filtraciones destructivas.
                                            </div>
                                            <div className="bg-slate-950 p-3 rounded-lg border border-white/5">
                                                <div className="text-indigo-400 font-bold text-[11px] mb-1">Importancia de proteger tus datos</div>
                                                <div className="text-[10px] text-slate-400">
                                                    La ciberseguridad efectiva empieza por saber qué datos manejas. Resguardar y limitar el acceso a la información confidencial reduce la superficie de ataque y previene el robo de identidad y propiedad intelectual.
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        q.options.map(opt => {
                                            const isUserAnswer = userAnswers[q.id] === opt.id;
                                            const isCorrect = opt.id === feedback.correctOptionId;

                                            let bgColor = 'bg-slate-900/30 text-gray-400 border-white/5';
                                            if (isCorrect) bgColor = 'bg-green-500/10 text-green-400 border-green-500/30';
                                            else if (isUserAnswer && !isCorrect) bgColor = 'bg-red-500/10 text-red-400 border-red-500/30';

                                            return (
                                                <div key={opt.id} className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${bgColor}`}>
                                                    {opt.option_text}
                                                    {isCorrect && <CheckCircle2 className="w-4 h-4" />}
                                                    {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4" />}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {!feedback.isCorrect && (
                                    <div className="p-4 bg-slate-900/50 rounded-xl border border-white/5 flex gap-4 items-start group">
                                        <CyberCat
                                            className="w-10 h-10 shrink-0 animate-float-subtle"
                                            variant="panic"
                                            color="#ef4444"
                                        />
                                        <div className="space-y-1 text-left">
                                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Explicación de la respuesta</p>
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">{feedback.explanation}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
