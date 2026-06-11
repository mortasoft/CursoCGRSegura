import React from 'react';
import { 
    PlayCircle, 
    FileText, 
    HelpCircle, 
    CheckCircle, 
    Clock, 
    ChevronRight, 
    Lock, 
    Zap, 
    Award, 
    AlertTriangle 
} from 'lucide-react';

export default function LessonList({ lessons, isAdmin, onLessonClick }) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#582c19] tracking-tight uppercase flex items-center gap-3">
                <div className="w-2 h-8 bg-[#8f032a] rounded-full"></div>
                Contenido del Módulo
            </h2>

            {lessons.some(l => l.is_optional) && (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 items-center">
                    <AlertTriangle className="w-5 h-5 text-indigo-400 opacity-60 flex-shrink-0" />
                    <p className="text-indigo-300/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Las <span className="text-indigo-400">actividades opcionales</span> brindan puntos extra y conocimiento complementario, pero no bloquean el progreso del curso.
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {lessons.map((lesson, index) => {
                    const previousMandatoryLessons = lessons.slice(0, index).filter(l => !l.is_optional);
                    const isLocked = previousMandatoryLessons.some(l => l.status !== 'completed') && !isAdmin;

                    return (
                        <div
                            key={lesson.id}
                            className={`group relative p-6 rounded-2xl border transition-all duration-300 ${isLocked
                                ? 'bg-slate-900/40 border-white/5 opacity-60 cursor-not-allowed'
                                : !!lesson.is_optional
                                    ? 'bg-indigo-500/5 border-dashed border-indigo-500/30 hover:border-indigo-500/50'
                                    : lesson.status === 'completed'
                                        ? 'border-green-500/20 bg-green-500/5 cursor-pointer'
                                        : 'bg-slate-800/20 border-white/5 hover:border-primary-500/40 hover:bg-slate-800/40 cursor-pointer'
                                }`}
                            onClick={() => !isLocked && onLessonClick(lesson)}
                        >
                            {!!lesson.is_optional && (
                                <div className="absolute top-0 right-10 mt-[-12px]">
                                    <span className="bg-gradient-to-r from-indigo-600 to-primary-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-[0_5px_15px_rgba(79,70,229,0.4)] flex items-center gap-2 border border-white/10">
                                        <Zap className="w-3 h-3 fill-white" /> Actividad Opcional
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isLocked
                                    ? 'bg-slate-900 text-gray-700'
                                    : lesson.status === 'completed'
                                        ? 'bg-green-500/20 text-green-500'
                                        : 'bg-slate-900 text-gray-500 group-hover:text-primary-400'
                                    }`}>
                                    {isLocked ? (
                                        <Lock className="w-6 h-6" />
                                    ) : (
                                        lesson.lesson_type === 'quiz' ? <HelpCircle className="w-6 h-6 text-secondary-500" /> :
                                            lesson.lesson_type === 'video' ? <PlayCircle className="w-6 h-6 text-blue-500" /> :
                                                (lesson.lesson_type === 'interactive' || lesson.lesson_type === 'h5p') ? <Zap className="w-6 h-6 text-yellow-500" /> :
                                                    <FileText className="w-6 h-6 text-indigo-400" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                            {lesson.lesson_type === 'quiz' ? (
                                                <span className="text-secondary-500 flex items-center gap-1">
                                                    <Award className="w-3 h-3" /> Evaluación Final
                                                </span>
                                            ) : `Lección ${index + 1}`}
                                        </span>
                                        {lesson.status === 'completed' && (
                                            <span className="flex items-center gap-1 text-green-500 text-[9px] font-black uppercase tracking-tighter bg-green-500/10 px-2 py-0.5 rounded-full">
                                                <CheckCircle className="w-3 h-3" /> Completada
                                            </span>
                                        )}
                                    </div>
                                    <h3 className={`font-bold transition-colors ${isLocked ? 'text-gray-600' : 'text-white group-hover:text-primary-400'}`}>
                                        {lesson.title}
                                    </h3>

                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{lesson.duration_minutes} min</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-secondary-500">
                                            <Award className="w-3 h-3" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">+{lesson.total_points || 0} Puntos</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-gray-500">
                                    {!isLocked && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
