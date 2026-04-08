import { CheckCircle2, EyeOff, Award, Calendar, Clock, Eye, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import ModuleLessons from './ModuleLessons.jsx';
import ModuleResources from './ModuleResources.jsx';

export default function ModuleCard({ 
    module, 
    expandedModule, 
    onToggleExpansion, 
    onTogglePublish, 
    onEditModule, 
    onDeleteModule,
    lessons,
    resources,
    contentLoading,
    onNewLesson,
    onEditLesson,
    onDeleteLesson,
    onToggleLessonOptional,
    onNewResource,
    onEditResource,
    onDeleteResource,
    onReorderLessons
}) {
    const isExpanded = expandedModule === module.id;

    return (
        <div 
            className={`group relative overflow-hidden transition-all duration-300 rounded-3xl border ${
                isExpanded 
                ? 'bg-[#161b2e] border-blue-500/30 shadow-2xl' 
                : 'bg-[#121625]/60 border-white/5 hover:border-white/10 hover:shadow-xl shadow-lg'
            }`}
        >
            {/* Decorative Background for active module */}
            {isExpanded && (
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>
            )}

            <div className="p-6 md:p-8">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-5">
                        {/* Thumbnail Number */}
                        <div className="relative w-20 h-20 bg-black rounded-2xl flex items-center justify-center text-2xl font-black border border-white/10 overflow-hidden shadow-2xl flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                            {(() => {
                                const num = module.module_number ?? 0;
                                const paddedNum = num.toString().padStart(2, '0');
                                const cardSrc = new URL(`../../../assets/card-banner/Tar-Sec-${paddedNum}.svg`, import.meta.url).href;
                                return (
                                    <>
                                        <img
                                            src={cardSrc}
                                            alt=""
                                            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                        <div className="relative z-10 text-white italic">{module.module_number}</div>
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent"></div>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                                {module.title}
                            </h3>
                            <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest text-gray-500">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/40 rounded-lg border border-white/5">
                                    <Calendar className="w-3.5 h-3.5 text-gray-600" />
                                    {module.release_date ? new Date(module.release_date).toLocaleDateString('es-ES') : module.month}
                                </span>
                                {module.is_published ? (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                                        <CheckCircle2 className="w-3 h-3" /> PUBLICADO
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-gray-400 rounded-full border border-white/10">
                                        <EyeOff className="w-3 h-3" /> BORRADOR
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions Corner */}
                    <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onTogglePublish(module)}
                            className={`p-2.5 rounded-xl transition-all ${module.is_published ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-gray-500 hover:text-white hover:bg-slate-800'}`}
                            title={module.is_published ? 'Desactivar' : 'Activar'}
                        >
                            {module.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => onEditModule(module)}
                            className="p-2.5 text-gray-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                            title="Editar"
                        >
                            <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDeleteModule(module)}
                            className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Eliminar"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mb-6 group-hover:text-gray-400 transition-colors line-clamp-2 min-h-[2.5rem]">
                    {module.description}
                </p>

                {/* Footer Data & Expansion Toggle */}
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex gap-8 items-center">
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase text-gray-600 font-black tracking-widest">Lecciones</p>
                            <p className="text-white font-bold text-lg leading-none">{module.total_lessons || 0}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase text-gray-600 font-black tracking-widest">Duración</p>
                            <p className="text-white font-bold text-lg leading-none">{module.total_duration || 0} min</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] uppercase text-gray-600 font-black tracking-widest">Puntos</p>
                            <p className="text-blue-400 font-black text-lg leading-none">{module.points_to_earn || 0}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => onToggleExpansion(module.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                            isExpanded ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        Gestionar contenido
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Expanded Content Section */}
            {isExpanded && (
                <div className="px-6 pb-12 md:px-10 md:pb-16 pt-4 space-y-10">
                    <ModuleLessons 
                        lessons={lessons}
                        onNewLesson={() => onNewLesson(module.id)}
                        onEditLesson={(lesson) => onEditLesson(module.id, lesson)}
                        onDeleteLesson={(lesson) => onDeleteLesson(lesson)}
                        onToggleOptional={onToggleLessonOptional}
                        onOpenEditor={onOpenLessonEditor}
                        onReorderLessons={onReorderLessons}
                        loading={contentLoading}
                    />

                    <ModuleResources 
                        resources={resources}
                        onNewResource={() => onNewResource(module.id)}
                        onEditResource={(res) => onEditResource(module.id, res)}
                        onDeleteResource={(res) => onDeleteResource(res)}
                    />
                </div>
            )}
        </div>
    );
}
