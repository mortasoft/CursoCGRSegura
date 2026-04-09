import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Lock, PlayCircle, HelpCircle, Zap, FileText, ImageIcon, Award, Clock } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function LessonSidebar({ lesson, moduleLessons, currentLessonId, user, viewAsStudent }) {
    const navigate = useNavigate();
    const activeRef = useRef(null);

    useEffect(() => {
        if (activeRef.current) {
            // Un pequeño retraso para permitir que la vista se dibuje adecuadamente
            setTimeout(() => {
                activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [currentLessonId]);

    return (
        <aside className="lg:col-span-3 xl:col-span-3">
            <div className="lg:sticky lg:top-20 space-y-4">
                {/* Module Header / Back Link */}
                <div className="card bg-slate-800/20 border-white/5 p-3 md:p-4 mb-3">
                    <Link
                        to={`/modules/${lesson.module_id}`}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest group mb-2"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Módulo
                    </Link>

                    <h2 className="text-xl font-black text-white leading-tight mb-2 uppercase tracking-tighter">
                        {lesson.module_title}
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded-md border border-white/5">
                            {moduleLessons.length} LECCIONES
                        </span>
                        <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary-500 transition-all duration-500"
                                style={{ width: `${moduleLessons.length > 0 ? Math.round((moduleLessons.filter(l => l.status === 'completed').length / moduleLessons.length) * 100) : 0}%` }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-bold text-primary-400">
                            {moduleLessons.length > 0 ? Math.round((moduleLessons.filter(l => l.status === 'completed').length / moduleLessons.length) * 100) : 0}%
                        </span>
                    </div>
                </div>

                {/* Lessons List Navigation */}
                <nav className="card bg-slate-900/40 p-2 border-white/5 shadow-2xl border-dashed">
                    <div className="p-2 border-b border-white/5 mb-1">
                        <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Ruta de Aprendizaje</p>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {moduleLessons.map((ml, index) => {
                            const isCurrent = parseInt(ml.id) === parseInt(currentLessonId);
                            const isCompleted = ml.status === 'completed';
                            const previousMandatoryLessons = moduleLessons.slice(0, index).filter(l => !l.is_optional);
                            const isLocked = previousMandatoryLessons.some(l => l.status !== 'completed') && (user?.role !== 'admin' || viewAsStudent);

                            return (
                                <button
                                    key={ml.id}
                                    ref={isCurrent ? activeRef : null}
                                    onClick={() => !isLocked && navigate(`/lessons/${ml.id}`)}
                                    disabled={isLocked}
                                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 group
                                        ${isCurrent
                                            ? 'bg-primary-500/10 border border-primary-500/20 shadow-lg'
                                            : isLocked
                                                ? 'opacity-40 cursor-not-allowed border border-transparent'
                                                : 'hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <div className="relative mt-0.5 flex-shrink-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all border
                                            ${isCompleted
                                                ? 'bg-green-500/10 border-green-500/30 text-green-500 shadow-sm shadow-green-500/10'
                                                : isCurrent
                                                    ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20'
                                                    : isLocked
                                                        ? 'bg-slate-900 border-white/5 text-gray-700'
                                                        : 'bg-slate-800 border-white/10 text-gray-400 group-hover:border-primary-500/30 group-hover:text-primary-400'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : isLocked ? (
                                                <Lock className="w-3.5 h-3.5" />
                                            ) : (
                                                ml.lesson_type === 'quiz' ? <HelpCircle className="w-4 h-4 text-secondary-500" /> :
                                                    ml.lesson_type === 'video' ? <PlayCircle className="w-4 h-4" /> :
                                                        (ml.lesson_type === 'interactive' || ml.lesson_type === 'h5p') ? <Zap className="w-4 h-4" /> :
                                                            <FileText className="w-4 h-4" />
                                            )}
                                        </div>
                                        {!isCompleted && isCurrent && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-[#0f172a] animate-pulse"></div>
                                        )}
                                    </div>

                                    <div className="text-left flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-0">
                                            <p className={`text-[9px] font-black uppercase tracking-widest
                                                ${isCurrent ? 'text-primary-400' : 'text-gray-500'}`}>
                                                {ml.lesson_type === 'quiz' ? 'EVALUACIÓN' : `L${index + 1}`}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {isCompleted && (
                                                    <span className="flex items-center gap-1 text-green-500 text-[8px] font-black uppercase tracking-tighter bg-green-500/10 px-1.5 py-0.5 rounded-full">
                                                        Completada
                                                    </span>
                                                )}
                                                {!ml.is_published && user?.role === 'admin' && (
                                                    <span className="flex items-center gap-1 text-orange-500 text-[8px] font-black uppercase tracking-tighter bg-orange-500/10 px-1.5 py-0.5 rounded-full border border-orange-500/20">
                                                        <ImageIcon className="w-2.5 h-2.5" /> Borrador
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className={`text-xs font-bold leading-tight transition-colors line-clamp-2
                                            ${isCurrent ? 'text-white' : isLocked ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'}
                                             ${isCompleted ? 'text-gray-300' : ''}`}>
                                            {ml.title}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            {ml.is_optional ? (
                                                <span className="text-[7px] font-black uppercase text-indigo-400 px-1.5 py-0 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-0.5">
                                                    Opcional
                                                </span>
                                            ) : (
                                                <span className={`text-[7px] font-black uppercase px-1.5 py-0 rounded-full border flex items-center gap-0.5
                                                    ${isLocked ? 'bg-slate-900 border-white/5 text-gray-700' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                                                    {isLocked && <Lock className="w-2 h-2" />} REQ
                                                </span>
                                            )}
                                            <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1 whitespace-nowrap">
                                                <Award className="w-2.5 h-2.5 text-secondary-500" /> {ml.total_points || 0}
                                            </span>
                                            {ml.duration_minutes > 0 && (
                                                <span className="text-[9px] font-bold text-gray-500 flex items-center gap-1 whitespace-nowrap">
                                                    <Clock className="w-2.5 h-2.5" /> {ml.duration_minutes}m
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            </div>
        </aside>
    );
}
