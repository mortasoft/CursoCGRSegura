import React, { useState } from 'react';
import { useForum } from '../../../../hooks/useForum';
import ForumPost from './ForumPost';
import ForumInput from './ForumInput';
import { MessageSquare, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSoundStore } from '../../../../store/soundStore';

export default function ForumActivity({ item, user, onComplete }) {
    const {
        posts,
        loading,
        error,
        pagination,
        submitPost,
        submitReply,
        deletePost,
        toggleUpvote,
        goToPage
    } = useForum(item.id);

    const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'upvotes'
    const { playSound } = useSoundStore(); // Still need to fix the import in previous chunk if wrong

    // Call onComplete when the forum loads (visiting counts as complete for now)
    React.useEffect(() => {
        if (onComplete) {
            onComplete(item.id, null);
        }
    }, [item.id, onComplete]);

    const title = item.title || 'Foro de Discusión';
    const description = typeof item.data === 'object' ? item.data?.description : item.data;

    return (
        <div className="card border border-white/5 overflow-hidden animate-fade-in">
            {/* Header / Topic */}
            <div className="p-6 md:p-8 bg-slate-900/80 border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                            <MessageSquare className="w-5 h-5 text-teal-400" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white">{title}</h3>
                    </div>

                    {description && (
                        <div className="text-gray-300 text-sm md:text-base leading-relaxed bg-slate-800/50 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                            {description}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 md:p-8 space-y-8 bg-[#0a0d18]">

                {/* New Post Input */}
                <div className="bg-slate-900/30 p-5 rounded-2xl border border-white/5 shadow-inner">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Iniciar nueva conversación</h4>
                    <ForumInput
                        onSubmit={async (message) => {
                            const result = await submitPost(message);
                            if (result.success) {
                                playSound('/sounds/create-post.mp3');
                            }
                            return result;
                        }}
                        placeholder="Escribe tu mensaje o pregunta aquí para iniciar un hilo..."
                        buttonText="Publicar Mensaje"
                    />
                </div>

                {/* State Handling */}
                {loading && posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-teal-500/50" />
                        <p className="text-xs font-bold uppercase tracking-widest">Cargando discusiones...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                ) : (
                    /* Posts List */
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                Hilos de Discusión
                            </h4>
                            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-2 pr-1">
                                    Ordenar por:
                                </span>
                                <button
                                    onClick={() => {
                                        setSortBy('recent');
                                        goToPage(1);
                                    }}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${sortBy === 'recent' ? 'bg-primary-500/20 text-primary-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Más Recientes
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('upvotes');
                                        goToPage(1);
                                    }}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${sortBy === 'upvotes' ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Más Votados
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy('comments');
                                        goToPage(1);
                                    }}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all ${sortBy === 'comments' ? 'bg-purple-500/20 text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Más Comentados
                                </button>
                            </div>
                        </div>

                        {posts.length === 0 ? (
                            <div className="text-center py-12 bg-slate-900/20 rounded-2xl border border-white/5 border-dashed">
                                <MessageSquare className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                                <h5 className="text-gray-400 font-bold mb-1">Aún no hay mensajes</h5>
                                <p className="text-gray-600 text-xs uppercase tracking-wider font-medium max-w-xs mx-auto">Sé el primero en iniciar la conversación en este foro.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-6">
                                    {[...posts].sort((a, b) => {
                                        if (sortBy === 'upvotes') {
                                            return (b.upvotes || 0) - (a.upvotes || 0);
                                        }
                                        if (sortBy === 'comments') {
                                            const countReplies = (post) => post.replies ? post.replies.length + post.replies.reduce((sum, r) => sum + countReplies(r), 0) : 0;
                                            return countReplies(b) - countReplies(a);
                                        }
                                        return new Date(b.created_at) - new Date(a.created_at); // Recent first
                                    }).map(post => (
                                        <ForumPost
                                            key={post.id}
                                            post={post}
                                            currentUser={user}
                                            onReply={submitReply}
                                            onDelete={deletePost}
                                            onUpvote={toggleUpvote}
                                        />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-6 mt-4 border-t border-white/5">
                                        <button
                                            onClick={() => goToPage(pagination.page - 1)}
                                            disabled={pagination.page <= 1 || loading}
                                            className="p-2 rounded-xl bg-slate-900/50 border border-white/5 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {[...Array(pagination.totalPages)].map((_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => goToPage(pageNum)}
                                                        className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border ${pagination.page === pageNum
                                                                ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20'
                                                                : 'bg-slate-900/30 border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => goToPage(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.totalPages || loading}
                                            className="p-2 rounded-xl bg-slate-900/50 border border-white/5 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
