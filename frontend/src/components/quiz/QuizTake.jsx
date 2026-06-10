import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Target, ChevronLeft, ChevronRight, ShieldAlert, Terminal, Smartphone, XCircle, CheckCircle2, Heart, MessageCircle, Share2, Search, Camera, Calendar, Briefcase, Users, AtSign, Lock, Eye, EyeOff, Activity, Trophy, Zap, Maximize, Minimize, Star, Award, TrendingUp, PlayCircle } from 'lucide-react';
import { calculateTetrisPoints, TETRIS_RANKS } from '../lessons/activities/DataTetris/tetrisUtils';
import PhaserGame from '../lessons/activities/DataTetris/PhaserGame';
import '../lessons/activities/DataTetris/DataTetris.css';
import { HACK_PROFILES } from '../../utils/gamesData';
import axios from '../../utils/axios';

import CyberCat from '../CyberCat';

export const INTERACTIVE_QUESTION_TYPES = ['mfa_defender', 'hack_neighbor', 'data_tetris'];


import { useSoundStore } from '../../store/soundStore';

function HackNeighborQuestion({ question, isAnswered, onWin, sessionSeed }) {
    const [status, setStatus] = useState(isAnswered ? 'won' : 'browsing');
    const [attempts, setAttempts] = useState(0);
    const [passwordInput, setPasswordInput] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [lastError, setLastError] = useState(false);
    const [revealedHints, setRevealedHints] = useState(() => {
        const saved = localStorage.getItem(`cgr_quiz_hints_${question.id}_${sessionSeed}`);
        return saved ? JSON.parse(saved) : {};
    }); // { hintIndex: true }

    const { playSound } = useSoundStore();
    const audioRef = useRef(null);

    useEffect(() => {
        localStorage.setItem(`cgr_quiz_hints_${question.id}_${sessionSeed}`, JSON.stringify(revealedHints));
    }, [revealedHints, question.id, sessionSeed]);

    // Control de audio para la actividad de hacking
    useEffect(() => {
        if (status === 'browsing' && !isAnswered) {
            // Detener cualquier audio previo si existe
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = playSound('/sounds/hack_neighbor.mp3');
            if (audioRef.current) {
                audioRef.current.loop = true;
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [status, isAnswered, playSound]);

    // Seleccionar perfil basado en el ID de la pregunta y el seed de la sesión para variedad
    const profile = useMemo(() => {
        const index = ((question.id + (sessionSeed || 0)) % HACK_PROFILES.length);
        return HACK_PROFILES[index];
    }, [question.id, sessionSeed]);

    const handleHackAttempt = async () => {
        try {
            const index = ((question.id + (sessionSeed || 0)) % HACK_PROFILES.length);
            const response = await axios.post('/api/games/hack-neighbor/verify', {
                index,
                password: passwordInput
            });

            if (response.data.isCorrect) {
                setStatus('won');
                const hintsUsedCount = Object.keys(revealedHints).length;
                onWin({ success: true, hintsUsed: hintsUsedCount });
                // Actualizamos el perfil local con la contraseña para que se muestre en el UI
                profile.password = response.data.password;
            } else {
                setAttempts(prev => prev + 1);
                setLastError(true);
                setTimeout(() => setLastError(false), 800);
                setPasswordInput('');
            }
        } catch (error) {
            console.error('Error verificando contraseña:', error);
            toast.error('Error al verificar la contraseña', { id: `quiz-hack-neighbor-${question.id}` });
        }
    };


    return (
        <div className="mt-4 space-y-6 animate-fade-in">
            <div className="bg-slate-900/40 border-2 border-white/5 rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
                    {/* Left: Feed (SocialCGR) */}
                    <div className="lg:col-span-8 border-r border-white/5 bg-black/20 flex flex-col">
                        {/* Fake Browser Header */}
                        <div className="bg-slate-800/50 p-4 border-b border-white/5 flex items-center gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="flex-1 bg-black/40 rounded-lg px-4 py-1.5 flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                <Lock className="w-3 h-3" /> https://socialcgr.facebook.com/profile/{profile.name.toLowerCase().replace(' ', '.')}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Profile Header */}
                            <div className="relative">
                                <div className="h-32 bg-gradient-to-r from-primary-600/30 to-indigo-600/30 rounded-2xl border border-white/5 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                </div>
                                <div className="flex items-end px-6 -mt-10 gap-4 mb-4">
                                    <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-900 shadow-xl flex items-center justify-center text-4xl font-black text-primary-400 overflow-hidden relative">
                                        {profile.profile_pic ? (
                                            <img src={profile.profile_pic} alt={profile.name} className="w-full h-full object-cover" />
                                        ) : (
                                            profile.name.split(' ').map(n => n[0]).join('')
                                        )}
                                        <div className="absolute inset-0 bg-primary-500/10"></div>
                                    </div>
                                    <div className="pb-2">
                                        <h3 className="text-xl font-black text-white">{profile.name}</h3>
                                        <p className="text-xs text-gray-400 font-bold">@{(profile.name.toLowerCase().replace(' ', ''))}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bio & Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                <div className="space-y-4">
                                    <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 space-y-3">
                                        <p className="text-xs text-gray-300 italic">"{profile.bio}"</p>
                                        <div className="space-y-2 pt-2 border-t border-white/5">
                                            <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold">
                                                <Calendar className="w-4 h-4 text-primary-400" /> Nací el {profile.birthday}
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold">
                                                <Briefcase className="w-4 h-4 text-primary-400" /> Trabajo en {profile.work}
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-400 text-[11px] font-bold">
                                                <Users className="w-4 h-4 text-primary-400" /> Seguido por 1.2k personas
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Photos (The "Clues") */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Publicaciones Recientes</h4>
                                        <div className="bg-slate-800/30 p-3 rounded-2xl border border-white/5 space-y-3">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-[8px] font-bold text-primary-400 overflow-hidden">
                                                    {profile.profile_pic ? (
                                                        <img src={profile.profile_pic} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        profile.name[0]
                                                    )}
                                                </div>
                                                <span className="text-[10px] font-black text-white">Hace 2 horas</span>
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed">
                                                Aquí con mi gato <strong>{profile.cat}</strong> que hoy amaneció con ganas de travesuras. ❤️🐾
                                            </p>
                                            <div className="aspect-video bg-black/40 rounded-xl border border-white/5 flex items-center justify-center text-gray-600 overflow-hidden">
                                                {profile.pet_pic ? (
                                                    <img src={profile.pet_pic} alt={profile.cat} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera className="w-10 h-10 opacity-20" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Hobby/Team Post */}
                                    <div className="bg-slate-800/30 p-3 rounded-2xl border border-white/5 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-[8px] font-bold text-primary-400 overflow-hidden">
                                                {profile.profile_pic ? (
                                                    <img src={profile.profile_pic} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    profile.name[0]
                                                )}
                                            </div>
                                            <span className="text-[10px] font-black text-white">Ayer</span>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed">
                                            ¡Qué orgullo ser del <strong>{profile.team}</strong>! Preparándome para el clásico de este fin de semana. ⚽🔥
                                        </p>
                                        <div className="flex items-center gap-4 text-gray-500 pt-2">
                                            <Heart className="w-4 h-4" /> <MessageCircle className="w-4 h-4" /> <Share2 className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/30 p-4 rounded-2xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-slate-800/50 transition-all">
                                        <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                                            <Camera className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-white uppercase tracking-wider">Ver álbum de fotos</p>
                                            <p className="text-[9px] text-gray-500">248 fotos / Actualizado hace 3 días</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Hacker Terminal Intro */}
                    <div className="lg:col-span-4 p-8 flex flex-col justify-between bg-[#0a0a0a] relative">
                        <div className="absolute inset-0 bg-primary-500/[0.02] pointer-events-none"></div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex items-center gap-2 text-primary-400 mb-2">
                                    <Terminal className="w-5 h-5" />
                                    <span className="font-black text-[10px] uppercase tracking-[0.3em]">Hacker Mission</span>
                                </div>
                                <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2 text-left">HACKEA AL VECINO</h3>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs text-gray-500 text-left font-medium leading-relaxed">Ponte en los zapatos de un atacante.</p>
                                    <div className="bg-slate-900 px-3 py-1 rounded-full border border-white/5 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">
                                            {Math.max(0, (question.points || 0) - (Object.keys(revealedHints).length * (question.data?.hint_penalty || 0)))} PUNTOS EN JUEGO
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-600 text-left font-medium leading-relaxed">Usa los datos de <strong>{profile.name.split(' ')[0]}</strong> para adivinar su contraseña.</p>
                            </div>

                            {status === 'won' ? (
                                <div className="space-y-4 animate-scale-up">
                                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                                        <CheckCircle2 className="w-16 h-16 text-indigo-400 mx-auto" />
                                        <div className="text-indigo-400 font-black uppercase tracking-widest text-sm">¡Hackeo Exitoso!</div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            Contraseña vulnerada comercialmente: <span className="font-mono text-white font-bold">{profile.password}</span>
                                        </p>
                                    </div>
                                    <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl text-left space-y-2">
                                        <div className="text-indigo-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                            <ShieldAlert className="w-4 h-4" /> El Riesgo de lo Obvio
                                        </div>
                                        <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                                            Como has visto, usar datos personales (como <strong>{profile.cat}</strong> y el mes de cumpleaños <strong>{profile.birthday.split(' ')[0]}</strong>) hace que tu contraseña sea predecible para un atacante con ingeniería social básica.
                                        </p>
                                        <p className="text-[10px] text-indigo-300 font-bold">
                                            Tip: ¡Una frase aleatoria como "MiElefanteAzulComePizza22!" habría sido imposible de hackear!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className={`space-y-2 transition-all duration-300 ${lastError ? 'scale-95' : ''}`}>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block pl-1 text-left">Probar Contraseña</label>
                                        <div className="relative group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="¿Pelusa2024? ¿Marzo123?"
                                                value={passwordInput}
                                                onChange={(e) => setPasswordInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleHackAttempt()}
                                                className={`w-full bg-[#111] border-2 rounded-2xl py-4 px-6 text-lg font-mono text-white outline-none transition-all ${lastError ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'border-white/5 focus:border-primary-500/50'}`}
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {lastError && (
                                            <p className="text-[10px] text-red-500 font-bold animate-shake text-center pt-1">ACCESO DENEGADO - CLAVE INCORRECTA</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleHackAttempt}
                                        disabled={!passwordInput}
                                        className="w-full bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-gray-600 text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
                                    >
                                        <AtSign className="w-4 h-4 group-hover:animate-pulse" /> Ejecutar Brute Force
                                    </button>

                                    <div className="pt-6 border-t border-white/5 space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                            <span>Estadísticas de Ataque</span>
                                            <span>Intentos: {attempts}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${attempts > i ? 'bg-red-500/30' : 'bg-slate-800'}`}></div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Hints Section */}
                                    <div className="pt-4 border-t border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">¿Necesitas ayuda?</p>
                                            {question.data?.hint_penalty > 0 && (
                                                <p className="text-[9px] text-red-500/70 font-bold italic">
                                                    Penalización: -{question.data.hint_penalty} pts por pista
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            {[0, 1, 2].map((idx) => {
                                                const isLocked = idx > 0 && !revealedHints[idx - 1];
                                                return (
                                                    <div key={idx} className="space-y-1">
                                                        {!revealedHints[idx] ? (
                                                            <button
                                                                onClick={() => !isLocked && setRevealedHints(prev => ({ ...prev, [idx]: true }))}
                                                                disabled={isLocked}
                                                                className={`w-full py-2.5 px-4 rounded-xl text-[10px] font-bold transition-all flex items-center justify-between group/btn shadow-inner ${isLocked
                                                                    ? 'bg-[#0a0a0a] border-white/0 text-gray-700 cursor-not-allowed opacity-50'
                                                                    : 'bg-[#111] hover:bg-slate-900 border border-white/5 text-gray-500'}`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <Lock className={`w-3.5 h-3.5 transition-colors ${!isLocked && 'group-hover/btn:text-primary-500'}`} />
                                                                    <span className={`transition-colors ${!isLocked && 'group-hover/btn:text-gray-300'}`}>
                                                                        {isLocked ? `Pista #${idx + 1} (Desbloquea la anterior)` : `Ver Pista #${idx + 1}`}
                                                                    </span>
                                                                </div>
                                                                {!isLocked && (
                                                                    <span className="text-[9px] text-red-500/50 font-black tracking-tighter">
                                                                        -{question.data?.hint_penalty || 0} PTS
                                                                    </span>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <div className="w-full py-2 px-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-[10px] font-medium text-primary-200 animate-fade-in text-left">
                                                                {profile.hints?.[idx] || "Revisa los datos personales."}
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

                        {/* Bottom: Terminal Footer */}
                        <div className="mt-auto p-4 border-t border-white/5">
                            <div className="flex items-center justify-between text-[8px] font-mono text-primary-900/40 uppercase font-black">
                                <span>Session: x002A3-99</span>
                                <span>Secure: FALSE</span>
                                <span>Status: {status === 'won' ? 'BREACHED' : 'EXPLOITING'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MfaDefenderQuestion({ question, isAnswered, storedAnswer, onWin }) {
    const [mfaStatus, setMfaStatus] = useState(() => {
        if (isAnswered) return 'won';
        if (storedAnswer && (storedAnswer.success === false || storedAnswer === 'false')) return 'failed';
        return 'idle';
    });
    const [mfaCode, setMfaCode] = useState('------');
    const [userMfaInput, setUserMfaInput] = useState('');
    const [mfaFails, setMfaFails] = useState(() => {
        if (typeof storedAnswer === 'object' && storedAnswer !== null) {
            return parseInt(storedAnswer.mfaFails) || 0;
        }
        return 0;
    });
    const mfaFailsRef = useRef(mfaFails);

    useEffect(() => {
        mfaFailsRef.current = mfaFails;
    }, [mfaFails]);

    const ensureDataObject = (data) => {
        if (!data) return {};
        if (typeof data === 'object') return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    };

    const qData = ensureDataObject(question.data);
    const hackTimeLimit = qData.hack_time || 20;
    const mfaRotateTime = qData.rotate_time || 5;
    const failPenalty = parseInt(qData.fail_penalty) || 0;
    const currentPotentialPoints = Math.max(0, question.points - (mfaFails * failPenalty));
    const [timeLeft, setTimeLeft] = useState(hackTimeLimit);
    const [rotateProgress, setRotateProgress] = useState(100);
    const rotateProgressRef = useRef(100);

    useEffect(() => {
        rotateProgressRef.current = rotateProgress;
    }, [rotateProgress]);

    const { playSound } = useSoundStore();
    const audioRef = useRef(null);

    const generateMfaCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const startMfaGame = () => {
        if (isAnswered) return;
        setMfaStatus('playing');
        setTimeLeft(hackTimeLimit);
        setMfaCode(generateMfaCode());
        setRotateProgress(100);
        setUserMfaInput('');

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        audioRef.current = playSound('/sounds/mistery.mp3');
        if (audioRef.current) {
            audioRef.current.loop = true;
        }
    };

    useEffect(() => {
        if (mfaStatus !== 'playing' && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [mfaStatus]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);

    useEffect(() => {
        let interval;
        if (mfaStatus === 'playing') {
            interval = setInterval(() => {
                const step = (100 / (mfaRotateTime * 10));
                const nextProgress = rotateProgressRef.current - step;
                
                if (nextProgress <= 0) {
                    rotateProgressRef.current = 100; // Bloqueo inmediato
                    setRotateProgress(100);
                    setMfaCode(generateMfaCode());
                    setMfaFails(f => f + 1);
                } else {
                    rotateProgressRef.current = nextProgress; // Sincronización manual
                    setRotateProgress(nextProgress);
                }

                setTimeLeft(prev => {
                    if (prev <= 0.1) {
                        setMfaStatus('failed');
                        // Use ref + potential rotation if it was about to happen
                        const finalFails = mfaFailsRef.current + (nextProgress <= 0 ? 1 : 0) + 1;
                        onWin({ success: false, mfaFails: finalFails });
                        return 0;
                    }
                    return prev - 0.1;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [mfaStatus, hackTimeLimit, mfaRotateTime]);

    const handleMfaSubmit = () => {
        if (mfaStatus !== 'playing') return;

        if (userMfaInput === mfaCode) {
            setMfaStatus('won');
            onWin({ success: true, mfaFails });
        } else {
            setMfaFails(prev => {
                const newFails = prev + 1;
                console.info(`[MFA-Quiz] FAILURE (Wrong Code)! Current fails: ${newFails}`);
                return newFails;
            });
            setUserMfaInput('');
        }
    };

    return (
        <div className={`p-8 mt-4 rounded-[2.5rem] transition-all duration-700 border-2 ${mfaStatus === 'won' ? 'bg-indigo-500/10 border-indigo-500/30' : mfaStatus === 'failed' ? 'bg-red-500/10 border-red-500/30 animate-shake' : 'bg-slate-900/40 border-white/5'}`}>
            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Actividad de Evaluación</span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-3">
                            <span className="text-[11px] font-black text-white/40 uppercase tracking-wider">Recompensa:</span>
                            <span className={`text-lg font-black tracking-tighter ${currentPotentialPoints === question.points ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                {currentPotentialPoints} <span className="text-xs text-white/30">/ {question.points} PTS</span>
                            </span>
                        </div>
                        {failPenalty > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest">
                                    Panel de Riesgo: -{failPenalty} PTS x fallo
                                </span>
                                {mfaFails > 0 && (
                                    <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded text-[9px] font-black text-red-500 uppercase">
                                        -{mfaFails * failPenalty} acumulado ({mfaFails})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto w-full">
                    {/* Left Side: Hacker Terminal */}
                    <div className="bg-[#0a0a0a] rounded-3xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0"></div>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-red-500 animate-pulse">
                                <div className="flex items-center gap-2"><Terminal className="w-4 h-4" /> Intruso Detectado</div>
                                <div>IP 192.168.XXX.XXX</div>
                            </div>
                            <div className="font-mono text-sm text-gray-500 leading-relaxed font-bold break-words">
                                &gt; Extrayendo credenciales... OK<br />
                                &gt; Match de contraseña... OK<br />
                                &gt; Obteniendo acceso root...
                            </div>
                        </div>
                        <div className="mt-8 space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">Progreso del Hackeo</span>
                                <span className="font-mono text-red-500 font-bold">{Math.max(0, timeLeft).toFixed(1)}s</span>
                            </div>
                            <div className="w-full h-3 bg-red-950/50 rounded-full overflow-hidden border border-red-500/20">
                                <div
                                    className="h-full bg-red-500 rounded-full transition-all duration-100 relative"
                                    style={{ width: `${(1 - (timeLeft / hackTimeLimit)) * 100}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Virtual Authenticator Phone */}
                    <div className="bg-slate-800 rounded-3xl p-6 border-4 border-slate-700 relative shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
                        <div className="absolute top-2 w-16 h-1.5 bg-slate-900 rounded-full"></div>

                        {mfaStatus === 'idle' ? (
                            <div className="flex flex-col items-center gap-3">
                                <button
                                    onClick={startMfaGame}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs px-8 py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 hover:scale-105 active:scale-95 text-center"
                                >
                                    <ShieldAlert className="w-5 h-5" /> Iniciar Defensa
                                </button>
                            </div>
                        ) : mfaStatus === 'failed' ? (
                            <div className="text-center space-y-4 animate-fade-in">
                                <XCircle className="w-16 h-16 text-red-500 mx-auto animate-shake" />
                                <div className="text-red-400 font-black uppercase tracking-widest">¡Sistema Comprometido!</div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Actividad Finalizada</p>
                            </div>
                        ) : mfaStatus === 'won' ? (
                            <div className="text-center space-y-4 animate-fade-in p-2">
                                <CheckCircle2 className="w-16 h-16 text-indigo-400 mx-auto scale-110" />
                                <div className="space-y-1">
                                    <div className="text-indigo-400 font-black uppercase tracking-widest text-lg">¡Misión Cumplida!</div>
                                    <div className="flex flex-col items-center gap-1">
                                        <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">
                                            PUNTOS GANADOS: {currentPotentialPoints} PTS
                                        </p>
                                        {mfaFails > 0 && failPenalty > 0 && (
                                            <p className="text-[9px] text-red-500/80 font-bold uppercase tracking-[0.1em]">
                                                (Penalización aplicada: -{mfaFails * failPenalty} pts por {mfaFails} fallos)
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-sm text-slate-300 font-medium leading-relaxed">
                                    Como acabas de experimentar, la contraseña por sí sola ya no es suficiente. En este escenario, el atacante logró obtener tus credenciales, pero se topó con un muro: el MFA (Autenticación de Múltiples Factores).
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl text-left border border-indigo-500/20 mt-4">
                                    <div className="text-indigo-400 font-bold mb-1">¿Por qué el MFA es tu mejor aliado?</div>
                                    <div className="text-xs text-slate-400">
                                        La importancia de activar y utilizar el MFA radica en que añade una capa de seguridad física o digital que el atacante no posee.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full space-y-6 text-center animate-fade-in">
                                <div className="flex items-center justify-center gap-2 text-indigo-400 mb-2">
                                    <Smartphone className="w-5 h-5" />
                                    <span className="font-extrabold text-[11px] uppercase tracking-widest text-slate-400">Authenticator App</span>
                                </div>
                                <div className="font-mono text-4xl text-white font-black tracking-[0.2em]">
                                    {mfaCode.substring(0, 3)} <span className="text-indigo-400">{mfaCode.substring(3)}</span>
                                </div>
                                <div className="w-full max-w-[200px] mx-auto h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-100"
                                        style={{ width: `${rotateProgress}%` }}
                                    ></div>
                                </div>
                                <div className="pt-4 space-y-3">
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength={6}
                                        value={userMfaInput}
                                        onChange={(e) => setUserMfaInput(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && userMfaInput.length === 6) {
                                                handleMfaSubmit();
                                            }
                                        }}
                                        className="w-full bg-slate-900 border-2 border-indigo-500/30 focus:border-indigo-500 rounded-xl py-3 text-center text-xl font-mono text-white outline-none transition-colors"
                                    />
                                    <button
                                        onClick={handleMfaSubmit}
                                        disabled={userMfaInput.length < 6}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-black uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all shadow-lg active:scale-95"
                                    >
                                        Verificar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DataTetrisQuestion({ question, isAnswered, storedAnswer, onWin, onRetry }) {
    const [score, setScore] = useState(() => {
        if (storedAnswer && typeof storedAnswer === 'object') {
            return storedAnswer.score || 0;
        }
        return 0;
    });
    const [combo, setCombo] = useState(0);
    const [lines, setLines] = useState(0);
    const [integrity, setIntegrity] = useState(100);
    const [gameState, setGameState] = useState(() => {
        if (isAnswered) return 'won';
        if (storedAnswer && (storedAnswer.success === false || storedAnswer === 'false')) return 'failed';
        return 'start';
    });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [difficulty, setDifficulty] = useState(() => {
        if (storedAnswer && typeof storedAnswer === 'object') {
            return storedAnswer.difficulty || 'easy';
        }
        return 'easy';
    });
    const containerRef = useRef(null);

    const ensureDataObject = (data) => {
        if (!data) return {};
        if (typeof data === 'object') return data;
        try {
            return JSON.parse(data);
        } catch (e) {
            return {};
        }
    };

    const minScore = ensureDataObject(question.data).min_score || 500;

    const toggleFullscreen = () => {
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        if (gameState === 'start') {
            const initialIntegrity = difficulty === 'hard' ? 50 : difficulty === 'medium' ? 70 : 100;
            setIntegrity(initialIntegrity);
        }
    }, [difficulty, gameState]);

    const handleGameOver = (finalScore) => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(err => console.error(err));
        }

        if (finalScore >= minScore) {
            onWin({
                success: true,
                score: finalScore,
                difficulty: difficulty
            });
            setGameState('won');
        } else {
            onWin({
                success: false,
                score: finalScore,
                difficulty: difficulty
            });
            setGameState('failed');
        }
    };

    const startGame = () => {
        setScore(0);
        setCombo(0);
        setLines(0);
        const initialIntegrity = difficulty === 'hard' ? 50 : difficulty === 'medium' ? 70 : 100;
        setIntegrity(initialIntegrity);
        setGameState('playing');
    };

    return (
        <div
            ref={containerRef}
            className={`data-tetris-container animate-fade-in shadow-2xl border-2 border-white/5 mt-4 ${isFullscreen ? 'dt-fullscreen bg-slate-950' : ''}`}
        >
            <div className="data-tetris-wrapper relative">
                <header className="dt-header">
                    <div className="dt-logo-container">
                        <div className="dt-logo-main">
                            <span className="dt-logo-data">DATA</span>
                            <span className="dt-logo-tetris">TETRIS</span>
                        </div>
                        <p className="dt-logo-slogan">Clasificación de Datos CGR</p>
                    </div>

                    <div className="dt-stats-section">
                        <div className="dt-stat-box">
                            <span className="dt-stat-label">Integridad</span>
                            <div className="dt-hearts-grid">
                                {Array.from({ length: 10 }, (_, i) => {
                                    const filled = i < Math.ceil(integrity / 10);
                                    return (
                                        <span key={i} className={`dt-heart ${filled ? 'dt-heart-full' : 'dt-heart-empty'}`}>
                                            {filled ? '❤️' : '🤍'}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="dt-stat-box">
                            <span className="dt-stat-label">Puntos</span>
                            <span className="dt-stat-value text-white">{score}</span>
                        </div>
                        <div className="dt-stat-box">
                            <span className="dt-stat-label">Meta</span>
                            <span className="dt-stat-value dt-stat-value-highlight text-emerald-400">{ensureDataObject(question.data).min_score || 500}</span>
                        </div>
                    </div>
                </header>

                <section className="dt-canvas-section">
                    {gameState === 'playing' && (
                        <aside className="dt-sidebar-left">
                            <div className="dt-sidebar-title">Protocolos</div>
                            <div className="dt-legend-item publico">
                                <div className="dt-legend-dot"></div>
                                <div className="dt-legend-text">
                                    <strong>Público</strong>
                                    <p>Acceso Irrestricto</p>
                                </div>
                            </div>
                            <div className="dt-legend-item confidencial">
                                <div className="dt-legend-dot"></div>
                                <div className="dt-legend-text">
                                    <strong>Restringido</strong>
                                    <p>Datos Personales</p>
                                </div>
                            </div>
                            <div className="dt-legend-item restringido">
                                <div className="dt-legend-dot"></div>
                                <div className="dt-legend-text">
                                    <strong>Sensible</strong>
                                    <p>Privacidad Total</p>
                                </div>
                            </div>

                            <div className="dt-sidebar-hint">
                                <p>Presiona <span>ESPACIO</span> para rotar la clasificación de la pieza.</p>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col items-center">
                                <span className="dt-stat-label">Combo</span>
                                <span className={`dt-combo-val ${combo > 1 ? 'active' : ''}`}>x{combo}</span>
                            </div>
                        </aside>
                    )}

                    <div className="dt-game-container">
                        {gameState === 'start' && (
                            <div
                                className="dt-overlay cursor-pointer"
                                onClick={() => !isFullscreen && toggleFullscreen()}
                                title="Click para expandir y ver instrucciones"
                            >
                                <div className="dt-overlay-content">
                                    <div className="flex flex-col gap-2 mb-2">
                                        <p className="text-gray-300 text-sm leading-relaxed max-width-xl mx-auto font-medium">
                                            Juego clásico de Tetris, pero con un giro de seguridad de la información.
                                            <br />Clasifica las piezas de datos según su nivel de seguridad antes de que toquen el suelo.
                                        </p>
                                    </div>

                                    <div className="dt-overlay-grid">
                                        {/* Columna Izquierda: Recompensas */}
                                        <div className="dt-overlay-left">
                                            <div className="bg-black/40 rounded-2xl p-5 border border-white/5 flex-1 flex flex-col">
                                                <div className="flex items-center gap-2 mb-4 justify-center">
                                                    <Star className="w-4 h-4 text-yellow-400" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">Tabla de Recompensas</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2 flex-1">
                                                    {TETRIS_RANKS.map(rank => {
                                                        const qData = ensureDataObject(question.data);
                                                        const minScoreThreshold = qData.min_score || 500;
                                                        const thresholdScore = Math.ceil(minScoreThreshold * rank.threshold);
                                                        const basePoints = question.points || 0;
                                                        const pot = Math.round((basePoints * (1 + (rank.bonus / 100))) * (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.2 : 1.5));

                                                        return (
                                                            <div key={rank.name} className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 px-4">
                                                                <span className={`text-[10px] font-black uppercase ${rank.color}`}>{rank.name}</span>
                                                                <span className="text-white text-sm font-bold">{thresholdScore} <span className="text-[8px] text-gray-500 uppercase">Pts</span></span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Columna Derecha: Controles y Dificultad */}
                                        <div className="dt-overlay-right">
                                            <div className="dt-instructions-grid bg-black/40 p-5 rounded-2xl border border-white/5">
                                                <div className="dt-ins-item"><span>&larr; &rarr;</span> Mover</div>
                                                <div className="dt-ins-item"><span>ESPACIO</span> Clasificar</div>
                                                <div className="dt-ins-item"><span>&uarr;</span> Rotar</div>
                                                <div className="dt-ins-item"><span>&darr;</span> Caída Rápida</div>
                                            </div>

                                            <div className="dt-difficulty-section bg-black/40 p-5 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-2 mb-4 justify-center">
                                                    <Award className="w-4 h-4 text-primary-400" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-gray-300">Nivel de Dificultad</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        { id: 'easy', label: 'Básico', mult: '1.0x', color: 'text-emerald-400' },
                                                        { id: 'medium', label: 'Medio', mult: '1.2x', color: 'text-amber-400' },
                                                        { id: 'hard', label: 'Avanzado', mult: '1.5x', color: 'text-rose-400' }
                                                    ].map(level => (
                                                        <button
                                                            key={level.id}
                                                            onClick={() => setDifficulty(level.id)}
                                                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${difficulty === level.id
                                                                ? 'bg-primary-500/20 border-primary-500/50 scale-[1.02] ring-1 ring-primary-500/30'
                                                                : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            <span className={`text-[10px] font-black uppercase ${difficulty === level.id ? level.color : 'text-gray-500'}`}>{level.label}</span>
                                                            <span className={`text-xs font-bold ${difficulty === level.id ? 'text-white' : 'text-gray-400'}`}>{level.mult}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button className="dt-primary-btn group w-full" onClick={startGame}>
                                                <Zap className="w-5 h-5 group-hover:animate-pulse text-yellow-400" />
                                                <span>Iniciar</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {gameState === 'playing' && (
                            <PhaserGame
                                difficulty={difficulty}
                                onScoreChange={(s, c) => { setScore(s); setCombo(c); }}
                                onLinesChange={setLines}
                                onIntegrityChange={setIntegrity}
                                onGameOver={handleGameOver}
                            />
                        )}

                        {gameState === 'won' && (
                            <div className="dt-overlay">
                                <div className="dt-overlay-content">
                                    <div className="flex justify-center mb-6">
                                        <div className="p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
                                            <CyberCat variant="normal" showMedal={true} className="w-32 h-32" />
                                        </div>
                                    </div>
                                    <h2 className="text-emerald-400 text-2xl font-black uppercase tracking-tighter mb-2">¡Evaluación Superada!</h2>
                                    <p className="text-gray-400 text-sm">Has demostrado un excelente dominio en la clasificación de datos.</p>

                                    <div className="dt-final-stats">
                                        <div className="dt-final-stat">
                                            <span>Puntaje Final</span>
                                            <strong className="text-white">{score}</strong>
                                        </div>
                                        <div className="dt-final-stat">
                                            <span>Rango Alcanzado</span>
                                            <strong className="text-primary-400 text-sm">
                                                {calculateTetrisPoints(score, ensureDataObject(question.data).min_score || 500, question.points || 0, difficulty).rank}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 justify-center text-emerald-400 font-bold text-xs uppercase tracking-widest bg-emerald-400/10 py-2 px-4 rounded-xl border border-emerald-400/20">
                                        <CheckCircle2 className="w-4 h-4" /> Pregunta Completada
                                    </div>
                                </div>
                            </div>
                        )}

                        {gameState === 'failed' && (
                            <div className="dt-overlay">
                                <div className="dt-overlay-content">
                                    <div className="flex justify-center mb-6">
                                        <div className="p-2 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
                                            <CyberCat variant="panic" className="w-32 h-32" />
                                        </div>
                                    </div>
                                    <h2 className="text-red-500 text-2xl font-black uppercase tracking-tighter mb-2">¡Sesión Fallida!</h2>
                                    <p className="text-gray-400 text-sm">Necesitas al menos {minScore} puntos para aprobar esta sección.</p>

                                    <div className="dt-final-stats">
                                        <div className="dt-final-stat">
                                            <span>Tu Puntaje</span>
                                            <strong className="text-white">{score}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default function QuizTake({
    quiz,
    questions,
    currentQuestionIndex,
    answers,
    onOptionSelect,
    onNext,
    onPrev,
    onSubmit,
    submitting,
    attemptsMade,
    sessionSeed,
    onBack
}) {
    const [localAttempts, setLocalAttempts] = useState(attemptsMade || 0);

    useEffect(() => {
        setLocalAttempts(attemptsMade || 0);
    }, [attemptsMade]);

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="w-full px-4 sm:px-6 lg:px-12 space-y-4 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Salir de la evaluación
                    </button>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">{quiz.title}</h1>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Intento</p>
                        <p className="text-xl font-black text-white">{(localAttempts || 0) + 1} <span className="text-gray-600">/ {quiz.max_attempts}</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pregunta</p>
                        <p className="text-xl font-black text-white">{currentQuestionIndex + 1} <span className="text-gray-600">/ {questions.length}</span></p>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,74,153,0.5)]"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Question Card */}
            <div className="card px-4 md:px-8 py-3 md:py-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-bl-full blur-2xl"></div>

                <div className="space-y-3 relative z-10">
                    <div className="flex flex-col gap-2">
                        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-secondary-500/10 rounded-full border border-secondary-500/20 self-start">
                            <Target className="w-3 h-3 text-secondary-500" />
                            <span className="text-[8px] font-black text-secondary-400 uppercase tracking-widest">Actividad de Evaluación</span>
                        </div>
                    </div>

                    {currentQuestion.image_url && currentQuestion.question_type !== 'video' && (
                        <div className="w-full max-h-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-950/40 flex justify-center">
                            <img
                                src={currentQuestion.image_url}
                                alt="Contexto de la pregunta"
                                className="max-w-full max-h-96 object-contain"
                            />
                        </div>
                    )}
                    <h2 className="text-sm md:text-base font-bold text-white leading-relaxed tracking-tight text-left">
                        {currentQuestion.question_text}
                    </h2>
                </div>

                {currentQuestion.question_type === 'mfa_defender' ? (
                    <div className="relative z-10">
                        <MfaDefenderQuestion
                            question={currentQuestion}
                            isAnswered={answers[currentQuestion.id]?.success === true || answers[currentQuestion.id] === 'true' || answers[currentQuestion.id] === true}
                            storedAnswer={answers[currentQuestion.id]}
                            onWin={(data) => onOptionSelect(currentQuestion.id, data)}
                        />
                    </div>
                ) : currentQuestion.question_type === 'hack_neighbor' ? (
                    <div className="relative z-10">
                        <HackNeighborQuestion
                            key={`${currentQuestion.id}-${sessionSeed}`}
                            question={currentQuestion}
                            isAnswered={answers[currentQuestion.id]?.success === true || answers[currentQuestion.id] === 'true' || answers[currentQuestion.id] === true}
                            onWin={(data) => onOptionSelect(currentQuestion.id, data)}
                            sessionSeed={sessionSeed}
                        />
                    </div>
                ) : currentQuestion.question_type === 'data_tetris' ? (
                    <div className="relative z-10">
                        <DataTetrisQuestion
                            key={`${currentQuestion.id}-${sessionSeed}`}
                            question={currentQuestion}
                            isAnswered={answers[currentQuestion.id]?.success === true || answers[currentQuestion.id] === 'true' || answers[currentQuestion.id] === true}
                            storedAnswer={answers[currentQuestion.id]}
                            onWin={(data) => onOptionSelect(currentQuestion.id, data)}
                            onRetry={() => {
                                if ((localAttempts + 1) >= quiz.max_attempts) {
                                    toast.error("Has alcanzado el limite de intentos para esta evaluacion.", { id: `quiz-attempts-${quiz.id}` });
                                    return;
                                }
                                setLocalAttempts(prev => prev + 1);
                            }}
                        />
                    </div>
                ) : currentQuestion.question_type === 'video' ? (
                    <div className="relative z-10 w-full max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5 ring-1 ring-white/10 mt-4">
                        {(() => {
                            const isYT = !!currentQuestion.image_url?.includes('youtube.com') || !!currentQuestion.image_url?.includes('youtu.be');
                            const ytId = isYT ? (currentQuestion.image_url.split('v=')[1]?.split('&')[0] || currentQuestion.image_url.split('/').pop()) : null;
                            const videoSrc = currentQuestion.image_url;

                            if (isYT) {
                                return (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${ytId}`}
                                        className="w-full h-full border-0 animate-fade-in"
                                        allowFullScreen
                                        title="Video de Evaluación"
                                    />
                                );
                            } else if (videoSrc) {
                                return (
                                    <video
                                        src={videoSrc}
                                        className="w-full h-full animate-fade-in"
                                        controls
                                        controlsList="nodownload"
                                    />
                                );
                            } else {
                                return (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-900 animate-fade-in">
                                        <PlayCircle className="w-20 h-20 text-gray-700" />
                                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Video no disponible</p>
                                    </div>
                                );
                            }
                        })()}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 relative z-10">
                        {currentQuestion.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => onOptionSelect(currentQuestion.id, option.id)}
                                className={`w-full p-6 text-left rounded-2xl border-2 transition-all duration-200 group flex items-center justify-between ${answers[currentQuestion.id] === option.id
                                    ? 'bg-primary-500/10 border-primary-500 text-white shadow-[0_0_30px_rgba(56,74,153,0.2)]'
                                    : 'bg-slate-900/50 border-white/5 text-gray-400 hover:border-white/10 hover:bg-slate-900 group'
                                    }`}
                            >
                                <span className="font-bold">{option.option_text}</span>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentQuestion.id] === option.id
                                    ? 'border-primary-400 bg-primary-400'
                                    : 'border-gray-700'
                                    }`}>
                                    {answers[currentQuestion.id] === option.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between py-6 mt-4 border-t border-white/5">
                <button
                    onClick={onPrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/10 hover:bg-slate-700 hover:border-orange-500/50 transition-all disabled:opacity-0"
                >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                </button>

                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        onClick={onSubmit}
                        disabled={submitting}
                        className="px-10 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-orange-500 hover:to-orange-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50"
                    >
                        {submitting ? 'Calificando...' : 'Finalizar Evaluación'}
                    </button>
                ) : (
                    <button
                        onClick={onNext}
                        className="flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:from-orange-500 hover:to-orange-400 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20 group"
                    >
                        Siguiente <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>
        </div>
    );
}
