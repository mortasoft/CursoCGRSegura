import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { PlayCircle, CheckCircle, CheckCircle2, XCircle, Download, FileText, Link as LinkIcon, Shield, Award, HelpCircle, ClipboardList, Upload, Zap, Eye, RotateCcw, Clock, AlertTriangle } from 'lucide-react';
import YouTubePlayer from './YouTubePlayer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function LessonContentItem({
    item,
    ytApiLoaded,
    markVideoAsWatched,
    markLinkAsVisited,
    handleResourceDownload,
    handleAssignmentUpload,
    uploadingAssignment,
    watchedVideos,
    visitedLinks,
    navigate
}) {
    const [isIncorrect, setIsIncorrect] = useState(null);
    const [revealing, setRevealing] = useState(false);

    let data = item.data || {};

    // Safety check: if data is a string, try to parse it
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            console.error("Error parsing content data:", e);
        }
    }

    // Deep safety check: if data.text is also stringified JSON
    if (data.text && typeof data.text === 'string' && data.text.startsWith('{"')) {
        try {
            const inner = JSON.parse(data.text);
            if (inner.text) data.text = inner.text;
        } catch (e) { }
    }

    switch (item.content_type) {
        case 'text':
            let textContent = data.text || '';
            if (typeof textContent === 'string') {
                textContent = textContent.replace(/\\n/g, '\n');
            }
            const isHtml = /<[a-z][\s\S]*>/i.test(textContent);

            return (
                <div className="card p-5 md:p-7 prose prose-invert prose-slate max-w-none bg-slate-800/30 border-white/5 shadow-inner">
                    {isHtml ? (
                        <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(textContent) }}
                        />
                    ) : (
                        <div className="text-gray-300">
                            {textContent.split('\n').map((paragraph, idx) => (
                                <p key={idx} className={paragraph.trim() === '' ? 'h-4 m-0' : 'mb-4 leading-relaxed'}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            );

        case 'video':
            const isYT = !!data.url?.includes('youtube.com') || !!data.url?.includes('youtu.be');
            const ytId = isYT ? (data.url.split('v=')[1]?.split('&')[0] || data.url.split('/').pop()) : null;
            const videoSrc = data.file_url ? `${API_URL.replace('/api', '')}${data.file_url}` : null;
            const isWatched = watchedVideos.has(item.id);

            return (
                <div className={`space-y-4 p-4 rounded-3xl transition-all duration-700 ${isWatched ? 'bg-green-500/5 border border-green-500/20 shadow-lg shadow-green-500/10' : 'bg-slate-800/10 border border-white/5'}`}>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5 ring-1 ring-white/10 group">
                        {isYT ? (
                            <YouTubePlayer
                                id={item.id}
                                videoId={ytId}
                                ytApiLoaded={ytApiLoaded}
                                onEnded={() => markVideoAsWatched(item.id)}
                            />
                        ) : videoSrc ? (
                            <video
                                src={videoSrc}
                                className="w-full h-full"
                                controls
                                onEnded={() => markVideoAsWatched(item.id)}
                                controlsList="nodownload"
                            ></video>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-900">
                                <PlayCircle className="w-20 h-20 text-gray-700" />
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Video no disponible</p>
                            </div>
                        )}

                        {/* Overlays for watched state */}
                        {isWatched && (
                            <div className="absolute top-4 right-4 z-10 animate-fade-in">
                                <div className="bg-green-500 text-white p-2.5 rounded-2xl shadow-xl shadow-green-500/40 border-2 border-green-400 scale-110 drop-shadow-lg">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center px-2">
                        <div className="flex flex-col gap-2">
                            <h3 className={`text-lg font-bold flex items-center gap-3 transition-all duration-500 ${isWatched ? 'text-green-400' : 'text-white'}`}>
                                <div className={`p-2.5 rounded-xl transition-all duration-500 ${isWatched ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-blue-500/20 text-blue-400'}`}>
                                    <PlayCircle className="w-5 h-5" />
                                </div>
                                {item.title}
                            </h3>

                            <div className="flex items-center gap-2">
                                {!!item.is_required && !isWatched && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                        <Clock className="w-3.5 h-3.5" /> Requerido
                                    </span>
                                )}

                                {isWatched ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/30 animate-fade-in">
                                        <CheckCircle className="w-3.5 h-3.5" /> ¡Video Completado!
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                        <Eye className="w-3.5 h-3.5" /> Pendiente
                                    </span>
                                )}
                            </div>
                        </div>

                        {item.points > 0 && (
                            <div className="flex flex-col items-end gap-1.5">
                                <div className={`relative px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-500 transform ${isWatched ? 'bg-yellow-500 text-slate-950 scale-110 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                    +{item.points} XP
                                    {isWatched && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>
                                    )}
                                </div>
                                {isWatched && (
                                    <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                                        <Award className="w-3 h-3" /> ¡Ganados!
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'image':
            const imgSrc = data.file_url ? `${API_URL.replace('/api', '')}${data.file_url}` : data.url;
            return (
                <div className="space-y-4">
                    <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                        <img src={imgSrc} alt={item.title} className="w-full h-auto max-h-[600px] object-contain mx-auto" />
                    </div>
                </div>
            );

        case 'file':
            const fileLink = data.file_url ? `${API_URL.replace('/api', '')}${data.file_url}` : '#';
            return (
                <a
                    href={fileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                    onClick={() => handleResourceDownload(item.id, item.title)}
                >
                    <div className="flex items-center gap-6 p-6 rounded-2xl bg-slate-800/40 border border-white/5 hover:bg-slate-800 hover:border-red-500/40 transition-all">
                        <div className="w-14 h-14 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)] group-hover:scale-110 transition-transform border border-red-500/20">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">{item.title}</h4>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                {data.original_name || 'Documento adjunto'}
                                {data.size && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400">{(data.size / 1024 / 1024).toFixed(2)} MB</span>}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-primary-500 group-hover:text-white transition-all">
                            <Download className="w-5 h-5" />
                        </div>
                    </div>
                </a>
            );

        case 'link':
            const isVisited = visitedLinks.has(item.id);
            return (
                <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                    onClick={() => markLinkAsVisited(item.id)}
                >
                    <div className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl transition-all duration-500 border ${isVisited ? 'bg-green-500/5 border-green-500/30 shadow-lg shadow-green-500/10' : 'bg-slate-800/20 border-white/5 hover:border-green-500/30'}`}>
                        <div className={`w-16 h-16 rounded-2xl transition-all duration-500 flex items-center justify-center flex-shrink-0 ${isVisited ? 'bg-green-500 text-white shadow-lg shadow-green-500/30 rotate-0' : 'bg-green-500/10 text-green-400 group-hover:scale-110'}`}>
                            <LinkIcon className="w-8 h-8" />
                        </div>

                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <h4 className={`text-lg font-bold flex items-center justify-center md:justify-start gap-2 transition-colors ${isVisited ? 'text-green-400' : 'text-white'}`}>
                                {item.title}
                                {isVisited && <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />}
                            </h4>
                            <p className="text-sm text-gray-500 truncate mt-1">{data.url}</p>

                            <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                                {!!item.is_required && !isVisited && (
                                    <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                        <Clock className="w-3.5 h-3.5 mr-1 inline" /> Requerido
                                    </span>
                                )}
                                {isVisited ? (
                                    <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Visitado
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-lg bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest border border-white/5">
                                        <Eye className="w-3.5 h-3.5 mr-1 inline" /> Pendiente
                                    </span>
                                )}
                            </div>
                        </div>

                        {item.points > 0 && (
                            <div className="flex flex-col items-center md:items-end gap-1.5">
                                <div className={`relative px-5 py-2.5 rounded-2xl font-black text-sm transition-all duration-500 transform ${isVisited ? 'bg-yellow-500 text-slate-950 scale-110 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                    +{item.points} XP
                                </div>
                                {isVisited && (
                                    <span className="text-[10px] text-yellow-500 font-black uppercase tracking-widest animate-pulse flex items-center gap-1">
                                        <Award className="w-3 h-3" /> ¡Ganados!
                                    </span>
                                )}
                            </div>
                        )}

                        <div className={`w-12 h-12 rounded-full hidden md:flex items-center justify-center transition-all ${isVisited ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 group-hover:bg-green-500 group-hover:text-white'}`}>
                            {isVisited ? <CheckCircle className="w-6 h-6" /> : <Zap className="w-6 h-6 animate-pulse" />}
                        </div>
                    </div>
                </a>
            );

        case 'heading':
            return (
                <div className="py-8 border-b border-white/5 mb-6">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-4">
                        <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
                        {data.text || 'Sin Título'}
                        <span className="flex-1 h-px bg-white/5"></span>
                    </h2>
                </div>
            );

        case 'bullets':
            return (
                <div className="card p-5 md:p-7 prose prose-invert prose-slate max-w-none bg-slate-800/30 border-white/5 shadow-inner">
                    <ul className="list-disc pl-5 space-y-3 text-gray-300 marker:text-primary-500 marker:text-xl">
                        {(data.items || []).map((bullet, idx) => (
                            <li key={idx} className="leading-relaxed pl-1">
                                {bullet.title && <strong className="text-white font-bold mr-1">{bullet.title}:</strong>}
                                <span>{typeof bullet.text === 'string' ? bullet.text.split('\n').map((line, i) => <span key={i}>{line}<br /></span>) : bullet.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            );

        case 'note':
            return (
                <div className="p-6 rounded-2xl bg-primary-500/5 border border-primary-500/10 flex gap-5 items-start animate-fade-in shadow-[inset_0_0_20px_rgba(59,130,246,0.02)]">
                    <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400 flex-shrink-0 shadow-lg border border-primary-500/20">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-primary-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">{item.title || 'Nota de Aprendizaje'}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed font-medium">
                            {data.text || 'Recuerda tomar apuntes de los conceptos clave de esta sección.'}
                        </p>
                    </div>
                </div>
            );

        case 'quiz':
        case 'survey':
        case 'assignment':
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
                        <p className="text-gray-400">{data.description || 'Completa esta actividad para continuar.'}</p>

                        {item.content_type === 'assignment' && item.submission && (
                            <div className="mt-3 inline-flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-white/5 text-xs font-medium">
                                <span className={`px-2 py-0.5 rounded uppercase tracking-wider font-black ${item.submission.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : item.submission.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                                    {item.submission.status === 'approved' ? 'Aprobada' : item.submission.status === 'rejected' ? 'Rechazada' : 'Enviada / Pendiente'}
                                </span>
                                <a href={`${API_URL.replace('/api', '')}${item.submission.file_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline ml-2">Ver archivo enviado</a>
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
                                    <span>Valor: <span className="text-white">{item.points} puntos</span></span>
                                </div>
                            )}

                            {item.content_type === 'quiz' && (
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${item.attemptsMade >= item.maxAttempts ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-900 border-white/10 text-gray-300'}`}>
                                    <Clock className="w-3 h-3" />
                                    <span>Intentos: <span className={item.attemptsMade >= item.maxAttempts ? 'text-red-400' : 'text-white'}>{item.attemptsMade} / {item.maxAttempts}</span></span>
                                </div>
                            )}
                        </div>
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
                                        const url = (item.isCompleted || (item.attemptsMade >= item.maxAttempts)) ? `/quizzes/${quizId}?review=true` : `/quizzes/${quizId}`;
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
                            {item.isCompleted ? (item.content_type === 'survey' ? <><CheckCircle className="w-4 h-4 mr-2" /> Encuesta Completada</> : <><Eye className="w-4 h-4 mr-2" /> Repasar Actividad</>) : (item.attemptsMade >= item.maxAttempts) ? <><RotateCcw className="w-4 h-4 mr-2" /> Ver Resultados</> : <><Zap className="w-4 h-4 mr-2" /> Iniciar Actividad</>}
                        </button>
                    )}
                </div>
            );

        case 'confirmation':
            const isConfirmed = visitedLinks.has(item.id);
            const handleConfirmation = (optNum) => {
                if (isConfirmed || revealing) return;

                if (optNum === data.correctOption) {
                    setRevealing(true);
                    markLinkAsVisited(item.id, { selectedOption: optNum, answeredAt: new Date().toISOString() });
                    setTimeout(() => setRevealing(false), 1000);
                } else {
                    setIsIncorrect(optNum);
                    setTimeout(() => setIsIncorrect(null), 1000);
                }
            };

            return (
                <div className={`p-8 rounded-[2.5rem] transition-all duration-700 border-2 ${isConfirmed
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-slate-800/20 border-white/5'
                    }`}>
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isConfirmed ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                            {isConfirmed ? <CheckCircle2 className="w-10 h-10" /> : <HelpCircle className="w-10 h-10" />}
                        </div>

                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <div>

                                <h3 className="text-xl font-bold text-white leading-tight">
                                    {data.description || 'Por favor confirma la siguiente información:'}
                                </h3>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                {[1, 2].map((num) => {
                                    const optionText = num === 1 ? data.option1 : data.option2;
                                    const isThisCorrect = num === data.correctOption;
                                    const isSelectedIncorrect = isIncorrect === num;

                                    return (
                                        <button
                                            key={num}
                                            onClick={() => handleConfirmation(num)}
                                            disabled={isConfirmed || revealing}
                                            className={`flex-1 group relative p-5 rounded-2xl border-2 transition-all duration-300 transform active:scale-95 ${isConfirmed
                                                ? (isThisCorrect ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' : 'bg-slate-900/50 border-white/5 text-gray-600 opacity-60')
                                                : isSelectedIncorrect
                                                    ? 'bg-red-500 border-red-400 text-white animate-shake shadow-lg shadow-red-500/20'
                                                    : 'bg-slate-900/40 border-white/10 text-gray-300 hover:border-emerald-500/50 hover:bg-slate-800'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-3">
                                                {isConfirmed && isThisCorrect && <CheckCircle2 className="w-5 h-5 animate-bounce" />}
                                                {isSelectedIncorrect && <XCircle className="w-5 h-5" />}
                                                <span className="font-bold uppercase tracking-widest text-[11px]">
                                                    {optionText || `Opción ${num}`}
                                                </span>
                                            </div>

                                            {!isConfirmed && !isSelectedIncorrect && (
                                                <div className="absolute inset-0 rounded-2xl bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4 text-[10px] font-black uppercase tracking-[0.1em]">
                                {isConfirmed ? (
                                    <span className="text-emerald-400 flex items-center gap-2">
                                        <Zap className="w-4 h-4 fill-emerald-400" /> ¡Completado Correctamente!
                                    </span>
                                ) : (
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Selecciona la respuesta adecuada
                                    </span>
                                )}

                                {item.points > 0 && (
                                    <span className={`px-3 py-1 rounded-full border transition-all ${isConfirmed ? 'bg-yellow-500 border-yellow-400 text-slate-950 px-4 scale-110 shadow-lg shadow-yellow-500/20' : 'bg-slate-950 border-white/5 text-yellow-500'
                                        }`}>
                                        +{item.points} XP {isConfirmed ? 'GANADOS' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );

        default:
            return null;
    }
}
