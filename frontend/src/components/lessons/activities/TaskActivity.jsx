import React from 'react';
import { CheckCircle, HelpCircle, ClipboardList, Upload, Award, Clock, RotateCcw, Eye, Zap, FileText } from 'lucide-react';

export default function TaskActivity({ item, data, navigate, handleAssignmentUpload, uploadingAssignment, API_URL }) {
    const iconMap = {
        quiz: item.isCompleted ? <CheckCircle className="w-8 h-8 text-green-400" /> : <HelpCircle className="w-8 h-8 text-red-400" />,
        survey: item.isCompleted ? <CheckCircle className="w-8 h-8 text-green-400" /> : <ClipboardList className="w-8 h-8 text-yellow-400" />,
        assignment: item.isCompleted ? <CheckCircle className="w-8 h-8 text-green-400" /> : <Upload className="w-8 h-8 text-pink-400" />
    };
    const colorMap = {
        quiz: 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10',
        survey: 'border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10',
        assignment: 'border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/10'
    };

    return (
        <div className={`p-8 rounded-2xl border transition-all flex flex-col md:flex-row items-center gap-6 text-center md:text-left ${item.isCompleted ? 'border-green-500/30 bg-green-500/10 hover:bg-green-500/15' : colorMap[item.content_type]}`}>
            <div className="p-4 bg-slate-900/50 rounded-2xl shadow-lg">
                {iconMap[item.content_type]}
            </div>
            <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{data.description || 'Completa esta actividad para continuar.'}</p>

                {item.content_type === 'assignment' && item.submission && (
                    <div className="mt-3 inline-flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-white/5 text-xs font-medium">
                        <span className={`px-2 py-0.5 rounded uppercase tracking-wider font-black ${item.submission.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : item.submission.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                            {item.submission.status === 'approved' ? 'Aprobada' : item.submission.status === 'rejected' ? 'Rechazada' : 'Enviada / Pendiente'}
                        </span>
                        <a href={`${API_URL.replace('/api', '')}${item.submission.file_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline ml-2">Ver archivo enviado</a>

                        {(item.submission.grade !== null && item.submission.grade !== undefined) && (
                            <span className="ml-3 px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-400 border border-primary-500/20 font-black">
                                NOTA: {item.submission.grade}
                            </span>
                        )}
                    </div>
                )}

                {item.content_type === 'assignment' && item.submission?.feedback && (
                    <p className="text-sm text-yellow-500 mt-2 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                        <strong>Comentario del instructor:</strong> {item.submission.feedback}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                    {item.points > 0 && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-lg text-xs font-bold text-gray-300 border border-white/10">
                            <Award className="w-3 h-3 text-yellow-500" />
                            {item.isCompleted && item.pointsEarned > 0 ? (
                                <span className="flex items-center gap-1">
                                    <span className={item.pointsEarned > item.points ? 'text-yellow-400' : 'text-green-400'}>
                                        {item.pointsEarned} PTS ganados
                                    </span>
                                    <span className="text-gray-500">/ {item.points} PTS</span>
                                    {item.pointsEarned > item.points && (
                                        <Zap className="w-3 h-3 text-yellow-400 ml-0.5" />
                                    )}
                                </span>
                            ) : (
                                <span>Valor: <span className="text-white">{item.points} PTS</span></span>
                            )}
                        </div>
                    )}

                    {item.content_type === 'quiz' && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${item.attemptsMade >= item.maxAttempts ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-900 border-white/10 text-gray-300'}`}>
                            <Clock className="w-3 h-3" />
                            <span>Intentos: <span className={item.attemptsMade >= item.maxAttempts ? 'text-red-400' : 'text-white'}>{item.attemptsMade} / {item.maxAttempts}</span></span>
                        </div>
                    )}
                    {item.content_type === 'assignment' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 rounded-lg text-xs font-bold text-gray-300 border border-white/10">
                            <FileText className="w-3 h-3 text-blue-400" />
                            <span>Formatos permitidos: <span className="text-white">PDF, Imagen, Video, Zip</span></span>
                        </div>
                    )}
                </div>

                {item.content_type === 'quiz' && item.isCompleted && item.attemptsMade < item.maxAttempts && (
                    <p className="text-xs text-blue-400/80 mt-2 flex items-center gap-1.5">
                        <Zap className="w-3 h-3 shrink-0" />
                        Puedes reintentar para mejorar tu puntaje.
                    </p>
                )}

            </div>

            {item.content_type === 'assignment' ? (
                <div className="relative">
                    <input
                        type="file"
                        id={`assign-${item.id}`}
                        className="hidden"
                        onChange={(e) => handleAssignmentUpload(item.id, e)}
                        disabled={uploadingAssignment === item.id || item.submission?.status === 'approved'}
                    />
                    <label
                        htmlFor={`assign-${item.id}`}
                        className={`btn-secondary px-8 cursor-pointer inline-flex items-center justify-center gap-2 ${item.submission?.status === 'approved' ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                    >
                        {uploadingAssignment === item.id ? (
                            <><div className="w-4 h-4 border-[3px] border-white/20 border-t-white rounded-full animate-spin"></div> Subiendo...</>
                        ) : (
                            <><Upload className="w-4 h-4" /> {item.submission ? 'Reemplazar Entrega' : 'Subir Tarea'}</>
                        )}
                    </label>
                </div>
            ) : (
                <button
                    onClick={() => {
                        if (item.content_type === 'quiz') {
                            const quizId = data.quiz_id;
                            if (quizId) {
                                const noAttemptsLeft = item.attemptsMade >= item.maxAttempts;
                                const url = noAttemptsLeft ? `/quizzes/${quizId}?review=true` : `/quizzes/${quizId}`;
                                navigate(url);
                            }
                        } else if (item.content_type === 'survey') {
                            if (item.isCompleted) return;
                            const surveyId = data.survey_id;
                            if (surveyId) navigate(`/surveys/${surveyId}`);
                        }
                    }}
                    disabled={item.isCompleted && item.content_type === 'survey'}
                    className={`px-8 font-black uppercase tracking-widest transition-all rounded-xl h-12 flex items-center justify-center border-2 ${item.isCompleted ? (item.content_type === 'survey' ? 'bg-green-600/20 border-green-600/30 text-green-400 cursor-not-allowed shadow-none' : 'bg-green-600 hover:bg-green-700 border-green-600 text-white shadow-lg shadow-green-500/20') : (item.attemptsMade >= item.maxAttempts) ? 'bg-red-600 hover:bg-red-700 border-red-600 text-white shadow-lg shadow-red-500/20' : 'btn-secondary'}`}
                >
                    {item.isCompleted
                        ? item.content_type === 'survey'
                            ? <><CheckCircle className="w-4 h-4 mr-2" /> Encuesta Completada</>
                            : item.attemptsMade < item.maxAttempts
                                ? <><Zap className="w-4 h-4 mr-2" /> Realizar otro intento</>
                                : <><Eye className="w-4 h-4 mr-2" /> Repasar Actividad</>
                        : item.attemptsMade >= item.maxAttempts
                            ? <><RotateCcw className="w-4 h-4 mr-2" /> Ver Resultados</>
                            : <><Zap className="w-4 h-4 mr-2" /> Iniciar Actividad</>
                    }
                </button>
            )}
        </div>
    );
}
