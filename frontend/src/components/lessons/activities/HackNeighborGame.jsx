import React, { useState, useEffect, useMemo } from 'react';
import { Lock, Camera, CheckCircle2, Shield, Calendar, Briefcase, Users, Heart, MessageCircle, Share2, Terminal, Award, EyeOff, Eye, Zap, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../../../utils/axios';
import { HACK_PROFILES } from '../../../utils/gamesData';


export default function HackNeighborGame({ item, data, playSuccess, playError, markLinkAsVisited, visitedLinks }) {
    const isCompleted = visitedLinks.has(item.id);
    const [status, setStatus] = useState(isCompleted ? 'won' : 'browsing');
    const [attempts, setAttempts] = useState(0);
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [lastError, setLastError] = useState(false);
    const [revealedHints, setRevealedHints] = useState(() => {
        const saved = localStorage.getItem(`cgr_lesson_hints_${item.id}`);
        return saved ? JSON.parse(saved) : {};
    }); // { hintIndex: true }

    useEffect(() => {
        localStorage.setItem(`cgr_lesson_hints_${item.id}`, JSON.stringify(revealedHints));
    }, [revealedHints, item.id]);

    const profile = useMemo(() => {
        const index = (item.id % HACK_PROFILES.length);
        return HACK_PROFILES[index];
    }, [item.id]);

    const handleHackAttempt = async () => {
        try {
            const index = (item.id % HACK_PROFILES.length);
            const response = await axios.post('/api/games/hack-neighbor/verify', {
                index,
                password: passwordInput
            });

            if (response.data.isCorrect) {
                setStatus('won');
                playSuccess();
                toast.success('¡Acceso concedido! Has vulnerado la cuenta.', { id: `hack-neighbor-${item.id}` });
                const hintsUsedCount = Object.keys(revealedHints).length;
                markLinkAsVisited(item.id, { success: true, hintsUsed: hintsUsedCount });
                // Actualizamos el perfil local con la contraseña para que se muestre en el UI
                profile.password = response.data.password;
            } else {
                setAttempts(prev => prev + 1);
                setLastError(true);
                playError();
                setTimeout(() => {
                    setLastError(false);
                }, 800);
                setPasswordInput('');
            }
        } catch (error) {
            console.error('Error verificando contraseña:', error);
            toast.error('Error al verificar la contraseña. Intente de nuevo.', { id: `hack-neighbor-${item.id}` });
        }
    };


    const isHackWon = status === 'won';

    return (
        <div className="space-y-6 animate-fade-in group/hack">
            <div className={`bg-slate-900/60 border-2 rounded-[3.5rem] overflow-hidden shadow-2xl transition-all duration-700 ${isHackWon ? 'border-green-500/30 shadow-green-500/10' : 'border-white/5'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                    {/* Feed SocialCGR */}
                    <div className="lg:col-span-8 border-r border-white/5 bg-black/20 flex flex-col">
                        <div className="bg-slate-800/50 p-4 border-b border-white/5 flex items-center gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="flex-1 bg-black/40 rounded-lg px-4 py-1.5 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                <Lock className="w-3 h-3 text-green-500/50" /> https://socialcgr.facebook.com/profile/{profile.name.toLowerCase().replace(' ', '.')}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="relative">
                                <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-white/5 overflow-hidden relative">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                    <div className="absolute top-4 right-4 bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                        <Camera className="w-3 h-3" /> Editar Portada
                                    </div>
                                </div>
                                <div className="flex items-end px-8 -mt-12 gap-5 mb-4">
                                    <div className="w-28 h-28 bg-slate-800 rounded-[2rem] border-4 border-slate-950 shadow-2xl flex items-center justify-center text-4xl font-black text-primary-400 overflow-hidden relative">
                                        {profile.profile_pic ? (
                                            <img src={profile.profile_pic} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            profile.name.split(' ').map(n => n[0]).join('')
                                        )}
                                        <div className="absolute inset-0 bg-primary-500/5"></div>
                                    </div>
                                    <div className="pb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-black text-white tracking-tight">{profile.name}</h3>
                                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Digital Security Consultant</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                                <div className="space-y-5">
                                    <div className="bg-slate-800/20 p-5 rounded-3xl border border-white/5 space-y-4 shadow-sm">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-primary-400" /> Información Básica
                                        </div>
                                        <p className="text-xs text-gray-300 italic font-medium leading-relaxed">"{profile.bio}"</p>
                                        <div className="space-y-3 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold"><Calendar className="w-4 h-4 text-primary-400" /> Nací el {profile.birthday}</div>
                                            <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold"><Briefcase className="w-4 h-4 text-primary-400" /> Trabajo en {profile.work}</div>
                                            <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold"><Users className="w-4 h-4 text-primary-400" /> 1,248 Amigos</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/20 p-4 rounded-3xl border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center text-[10px] font-bold text-primary-400 overflow-hidden">
                                                {profile.profile_pic ? (
                                                    <img src={profile.profile_pic} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    profile.name[0]
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white">Publicado hoy</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Público 🌍</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed font-medium">Mi gato <strong>{profile.cat}</strong> me tiene loco hoy. ¡No para de jugar con los cables! ❤️🐾</p>
                                        <div className="aspect-video bg-slate-900/50 rounded-2xl border border-white/5 flex items-center justify-center text-gray-700/30 group-hover:bg-slate-900/80 transition-all overflow-hidden">
                                            {profile.pet_pic ? (
                                                <img src={profile.pet_pic} alt={profile.cat} className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-12 h-12 opacity-10" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <div className="bg-slate-800/20 p-4 rounded-3xl border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400 overflow-hidden">
                                                {profile.profile_pic ? (
                                                    <img src={profile.profile_pic} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    profile.name[0]
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-white">Ayer a las 18:45</span>
                                                <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Amigos 👥</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed font-medium">¡Qué orgullo ser del <strong>{profile.team}</strong>! El domingo vamos por el liderato. ⚽🔥</p>
                                        <div className="flex items-center gap-6 text-gray-500 pt-2 px-1">
                                            <div className="flex items-center gap-2 text-primary-400"><Heart className="w-4 h-4 fill-primary-400" /> <span className="text-[10px] font-black">1.2k</span></div>
                                            <MessageCircle className="w-4 h-4" />
                                            <Share2 className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-3xl bg-gradient-to-br from-primary-600/10 to-indigo-600/10 border border-white/5 flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center border border-white/10 group-hover:rotate-6 transition-transform shadow-xl">
                                                <Camera className="w-6 h-6 text-primary-400" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[10px] font-black text-white uppercase tracking-wider">Álbum: Recuerdos de Viaje</p>
                                                <p className="text-[9px] text-gray-500 font-bold">248 fotos compartidas</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terminal Hacker */}
                    <div className="lg:col-span-4 p-10 flex flex-col justify-between bg-[#050505] relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary-500/[0.02] pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 blur-[80px] rounded-full"></div>

                        <div className="space-y-8 relative z-10">
                            <div>
                                <div className="flex items-center gap-3 text-primary-500 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                                        <Terminal className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <span className="font-black text-[11px] uppercase tracking-[0.4em]">Hacker Mission</span>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter leading-none mb-3 text-left">ESTRATEGIA BRUTE FORCE</h3>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-[11px] text-gray-500 text-left leading-relaxed font-bold uppercase tracking-tight">Vulnera la cuenta utilizando ingeniería social.</p>
                                    <div className="bg-slate-900 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">
                                            {Math.max(0, (item.points || 0) - (Object.keys(revealedHints).length * (item.data?.hint_penalty || 0)))} PUNTOS EN JUEGO
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {isHackWon ? (
                                <div className="space-y-6 animate-scale-up">
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-[2.5rem] p-8 text-center space-y-5 shadow-[0_0_50px_rgba(34,197,94,0.15)] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                        <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                                        <div className="space-y-1">
                                            <div className="text-green-400 font-black uppercase tracking-[0.2em] text-sm">¡Infiltración Completada!</div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Status: LOGGED_IN</p>
                                        </div>
                                        <p className="text-xs text-slate-300 font-mono bg-black/40 py-2 rounded-xl border border-white/5">PASSWORD: <span className="text-white font-black">{profile.password}</span></p>
                                    </div>
                                    <div className="bg-slate-900/80 backdrop-blur-sm border border-white/10 p-6 rounded-3xl text-left space-y-4 shadow-2xl relative">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                                                <Award className="w-5 h-5 text-yellow-500" />
                                            </div>
                                            <div className="text-yellow-500 font-black text-[11px] uppercase tracking-widest">Lección Aprendida</div>
                                        </div>
                                        <p className="text-xs text-white leading-relaxed font-bold">
                                            Has visto lo predecible que es una clave basada en datos personales (como <strong>{profile.cat}</strong> o tu equipo <strong>{profile.team}</strong>).
                                        </p>
                                        <p className="text-[11px] text-primary-300 font-black uppercase tracking-tight line-through opacity-50">#ContraseñaObvia</p>
                                        <p className="text-xs text-green-300 font-bold italic leading-relaxed">
                                            Tip: ¡Las frases aleatorias largas (ej: "MiElefanteAzulComePizza22!") son tu mejor escudo!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className={`space-y-3 transition-all duration-300 ${lastError ? 'scale-95' : ''}`}>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block pl-1 text-left">Introducir Secuencia de Acceso</label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={passwordInput}
                                                onChange={(e) => setPasswordInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleHackAttempt()}
                                                placeholder="Sugerencia: NombreGato + Mes"
                                                className={`w-full bg-[#080808] border-2 rounded-2xl py-5 px-7 text-xl font-mono text-white outline-none transition-all shadow-inner ${lastError ? 'border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-white/5 focus:border-primary-600/50'}`}
                                            />
                                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-700 hover:text-primary-500 transition-colors">
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {lastError && (
                                            <div className="bg-red-950/20 border border-red-900/30 p-3 rounded-2xl animate-shake">
                                                <p className="text-[10px] text-red-500 font-black text-center tracking-widest uppercase font-mono">ACCESS_DENIED :: CREDENTIAL_MISMATCH</p>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleHackAttempt}
                                        disabled={!passwordInput}
                                        className="w-full h-16 bg-gradient-to-r from-primary-700 to-indigo-700 hover:from-primary-600 hover:to-indigo-600 disabled:from-slate-900 disabled:to-slate-900 disabled:text-gray-700 text-white font-black uppercase tracking-[0.2em] text-[12px] rounded-2xl transition-all shadow-[0_10px_30px_rgba(79,70,229,0.2)] active:scale-[0.98] flex items-center justify-center gap-3 group"
                                    >
                                        <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" /> Atacar Cuenta
                                    </button>

                                    {/* Hints Section */}
                                    <div className="pt-6 border-t border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">¿Atascado? Considera una pista</p>
                                            {item.data?.hint_penalty > 0 && (
                                                <p className="text-[10px] text-red-500/80 font-black italic">
                                                    Penalización: -{item.data.hint_penalty} pts por pista
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-3">
                                            {[0, 1, 2].map((idx) => {
                                                const isLocked = idx > 0 && !revealedHints[idx - 1];
                                                return (
                                                    <div key={idx} className="space-y-2">
                                                        {!revealedHints[idx] ? (
                                                            <button
                                                                onClick={() => !isLocked && setRevealedHints(prev => ({ ...prev, [idx]: true }))}
                                                                disabled={isLocked}
                                                                className={`w-full py-3.5 px-5 rounded-2xl text-[10px] font-black transition-all flex items-center justify-between group/btn shadow-inner ${isLocked
                                                                    ? 'bg-[#050505] border-white/0 text-gray-700 cursor-not-allowed opacity-50'
                                                                    : 'bg-[#080808] hover:bg-slate-900 border border-white/5 text-gray-500'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Lock className={`w-4 h-4 transition-colors ${!isLocked && 'group-hover/btn:text-primary-500'}`} />
                                                                    <span className={`transition-colors ${!isLocked && 'group-hover/btn:text-gray-300'} uppercase tracking-[0.2em]`}>
                                                                        {isLocked ? `Bloqueada (Usa la anterior)` : `Desbloquear Pista #${idx + 1}`}
                                                                    </span>
                                                                </div>
                                                                {!isLocked && (
                                                                    <span className="text-[9px] text-red-500/50 font-black tracking-tighter bg-red-500/5 px-2 py-0.5 rounded-lg border border-red-500/10">
                                                                        -{item.data?.hint_penalty || 0} PTS
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <div className="w-full py-4 px-5 bg-primary-500/5 border border-primary-500/20 rounded-2xl text-xs font-medium text-primary-200 animate-scale-up text-left flex gap-3">
                                                                <div className="w-1 h-full bg-primary-500 rounded-full"></div>
                                                                <p>{profile.hints?.[idx] || "Analiza los posts y la biografía del perfil."}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                            {item.points > 0 && (
                                <div className={`px-6 py-2.5 rounded-2xl font-black text-[11px] transition-all duration-700 shadow-xl ${isHackWon ? 'bg-yellow-500 text-slate-950 scale-105' : 'bg-slate-900 border border-white/10 text-yellow-500'}`}>
                                    +{item.points} PTS {isHackWon ? 'GANADOS' : ''}
                                </div>
                            )}
                            <div className="text-right">
                                <p className="text-[9px] font-mono text-gray-700 font-black">X-CORP INTRUSION SYSTEM</p>
                                <p className="text-[8px] font-mono text-gray-800 uppercase">Version 4.2.0-STABLE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
