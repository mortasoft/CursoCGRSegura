import { Plus, CheckCircle2, Clock, Award, Target, Edit2, Trash2, ExternalLink, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';

export default function ModuleLessons({
    lessons,
    onNewLesson,
    onEditLesson,
    onDeleteLesson,
    onToggleOptional,
    onOpenEditor,
    onReorderLessons,
    loading
}) {
    const handleMoveLesson = (index, direction) => {
        const newLessons = [...lessons];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= newLessons.length) return;
        
        // Swap elements
        [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]];
        
        const orderedIds = newLessons.map(l => l.id);
        const moduleId = lessons[0].module_id;
        
        onReorderLessons(moduleId, orderedIds);
    };
    return (
        <div className="animate-slide-up bg-slate-950/20 p-6 md:p-8 rounded-3xl border border-white/5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-primary-500 rounded-full shadow-lg shadow-primary-500/20"></div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] italic leading-none mb-1">Estructura Académica</h4>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{lessons.length} UNIDADES PROGRAMADAS</p>
                    </div>
                </div>
                <button
                    onClick={onNewLesson}
                    className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-500/10 hover:bg-primary-500 text-primary-400 hover:text-white py-2.5 px-6 rounded-xl transition-all border border-primary-500/20 hover:shadow-xl hover:shadow-primary-500/20 active:scale-95"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Añadir Unidad</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-5 bg-slate-900/10 rounded-[2rem] border border-white/5">
                    <div className="relative w-14 h-14">
                        <div className="absolute inset-0 border-4 border-primary-500/10 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] animate-pulse italic">Indexando Material de Clase...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {lessons.length > 0 ? (
                        lessons.map((lesson) => (
                            <div
                                key={lesson.id}
                                className="group/item flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 bg-slate-900/60 border border-white/5 rounded-[2rem] hover:border-primary-500/30 transition-all hover:bg-slate-900 shadow-xl"
                            >
                                <div className="flex items-center gap-5 w-full lg:w-auto mb-4 lg:mb-0">
                                    <div className="relative group/idx w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-lg font-black text-gray-600 border border-white/10 shadow-inner group-hover/item:text-primary-400 transition-colors group-hover/item:scale-105 duration-500">
                                        <div className="absolute inset-x-0 -top-6 flex justify-center opacity-0 group-hover/idx:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleMoveLesson(lessons.indexOf(lesson), 'up')}
                                                disabled={lessons.indexOf(lesson) === 0}
                                                className="p-1 bg-slate-800 rounded-lg text-gray-400 hover:text-primary-400 disabled:opacity-30 disabled:hover:text-gray-400"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {lesson.order_index}
                                        
                                        <div className="absolute inset-x-0 -bottom-6 flex justify-center opacity-0 group-hover/idx:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleMoveLesson(lessons.indexOf(lesson), 'down')}
                                                disabled={lessons.indexOf(lesson) === lessons.length - 1}
                                                className="p-1 bg-slate-800 rounded-lg text-gray-400 hover:text-primary-400 disabled:opacity-30 disabled:hover:text-gray-400"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary-500/20 border-2 border-slate-900">
                                            {lesson.is_published ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        </div>
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <h5 className="text-base font-black text-white group-hover/item:text-primary-400 transition-colors uppercase tracking-tight truncate max-w-[280px]">
                                            {lesson.title}
                                        </h5>
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-lg ${lesson.lesson_type === 'quiz'
                                                    ? 'bg-secondary-500/10 text-secondary-500 border-secondary-500/10 shadow-secondary-500/5'
                                                    : 'bg-primary-500/10 text-primary-400 border-primary-500/10 shadow-primary-500/5'
                                                }`}>
                                                {lesson.lesson_type}
                                                {lesson.lesson_type === 'quiz' && <Award className="inline w-3 h-3 ml-1 mb-0.5" />}
                                            </span>
                                            <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                            <span className="text-[9px] font-black text-gray-600 flex items-center gap-1 uppercase tracking-widest group-hover/item:text-gray-400 transition-colors">
                                                <Target className="w-3.5 h-3.5 text-primary-500" /> {lesson.total_points || 0} PTS
                                            </span>
                                            <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                                            <span className="text-[9px] font-black text-gray-600 flex items-center gap-1 uppercase tracking-widest group-hover/item:text-gray-400 transition-colors">
                                                <Clock className="w-3.5 h-3.5 text-secondary-500" /> {lesson.duration_minutes || 0} MIN
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
                                    <div className="flex items-center gap-4 group/toggle bg-slate-950 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest group-hover/toggle:text-secondary-400/70 transition-colors">Progreso Opcional</span>
                                        <button
                                            onClick={() => onToggleOptional(lesson)}
                                            className={`w-10 h-5 rounded-full relative transition-all shadow-inner border border-white/5 ${lesson.is_optional ? 'bg-secondary-500 shadow-secondary-500/30' : 'bg-slate-800'}`}
                                        >
                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-xl ${lesson.is_optional ? 'left-5.5' : 'left-0.5'}`}></div>
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                                        <button
                                            onClick={() => onEditLesson(lesson)}
                                            className="p-2 text-gray-600 hover:text-white hover:bg-slate-800 rounded-xl transition-all group/btn"
                                            title="Editar Propiedades"
                                        >
                                            <Edit2 className="w-4 h-4 group-hover/btn:scale-110" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteLesson(lesson)}
                                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all group/btn"
                                            title="Destruir Unidad"
                                        >
                                            <Trash2 className="w-4 h-4 group-hover/btn:scale-110" />
                                        </button>
                                        <div className="w-px h-5 bg-white/10 mx-2"></div>
                                        <button
                                            onClick={() => onOpenEditor(lesson.id)}
                                            className="flex items-center gap-2.5 px-5 py-2.5 bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-primary-500/20 active:scale-95 group/edit"
                                        >
                                            CONTENIDO
                                            <ExternalLink className="w-3.5 h-3.5 group-hover/edit:translate-x-0.5 group-hover/edit:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center bg-slate-950/40 rounded-[3rem] border border-dashed border-white/10 group hover:bg-slate-950/60 transition-all duration-700 hover:border-primary-500/20">
                            <div className="p-6 bg-slate-900 rounded-[2rem] mb-6 group-hover:scale-110 group-hover:bg-primary-500/5 transition-all duration-700 shadow-2xl border border-white/5">
                                <BookOpen className="w-12 h-12 text-gray-800 group-hover:text-primary-500/40" />
                            </div>
                            <p className="text-gray-500 text-sm font-black uppercase tracking-[0.3em] mb-2 italic">Sin unidades arquitectadas</p>
                            <p className="text-gray-700 text-[10px] font-black uppercase tracking-widest max-w-[200px] text-center leading-relaxed">Inicia la creación del cuerpo académico para este módulo estratégico</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
