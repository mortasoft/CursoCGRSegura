import React, { useState } from 'react';
import { Lock, Zap, CheckCircle2, Clock, Eye } from 'lucide-react';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';

export default function PasswordTesterActivity({ item, data, visitedLinks, markLinkAsVisited }) {
    const [passValue, setPassValue] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [pwnedCount, setPwnedCount] = useState(null);
    const [checkingPwned, setCheckingPwned] = useState(false);
    const isTesterCompleted = visitedLinks.has(item.id);

    const calculateStrength = (password) => {
        let score = 0;
        if (!password) return { score: 0, label: 'Vacío', color: 'bg-slate-800', textColor: 'text-gray-500' };

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        if (score <= 2) return { score, label: 'Muy Débil', color: 'bg-red-500', textColor: 'text-red-500', bgSoft: 'bg-red-500/10' };
        if (score <= 3) return { score, label: 'Débil', color: 'bg-orange-500', textColor: 'text-orange-500', bgSoft: 'bg-orange-500/10' };
        if (score <= 4) return { score, label: 'Media', color: 'bg-yellow-500', textColor: 'text-yellow-500', bgSoft: 'bg-yellow-500/10' };
        if (score <= 5) return { score, label: 'Fuerte', color: 'bg-emerald-500', textColor: 'text-emerald-500', bgSoft: 'bg-emerald-500/10' };
        return { score, label: 'Muy Segura', color: 'bg-blue-500', textColor: 'text-blue-500', bgSoft: 'bg-blue-500/10' };
    };

    const estimateCrackTime = (password) => {
        if (!password) return '0 segundos';
        let charsetSize = 0;
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

        const combinations = Math.pow(charsetSize, password.length);
        const hashesPerSecond = 1000000000;
        const seconds = combinations / hashesPerSecond;

        if (seconds < 1) return 'Instante';
        if (seconds < 60) return `${Math.floor(seconds)} segundos`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas`;
        if (seconds < 2592000) return `${Math.floor(seconds / 86400)} días`;
        if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} meses`;
        if (seconds < 31536000000) return `${Math.floor(seconds / 31536000)} años`;
        return 'Siglos';
    };

    const strength = calculateStrength(passValue);
    const crackTime = estimateCrackTime(passValue);

    const checks = [
        { label: 'Minúsculas', met: /[a-z]/.test(passValue) },
        { label: 'Mayúsculas', met: /[A-Z]/.test(passValue) },
        { label: 'Números', met: /[0-9]/.test(passValue) },
        { label: 'Símbolos', met: /[^a-zA-Z0-9]/.test(passValue) }
    ];

    const checkPwned = async () => {
        if (!passValue) return;
        setCheckingPwned(true);
        setPwnedCount(null);
        try {
            const msgUint8 = new TextEncoder().encode(passValue);
            const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

            const prefix = hashHex.substring(0, 5);
            const suffix = hashHex.substring(5);

            const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);

            if (response.status === 429) {
                toast.error('Demasiadas solicitudes. Inténtalo más tarde.', { id: `pwd-tester-${item.id}` });
                return;
            }

            if (!response.ok) {
                throw new Error('Error en la API');
            }

            const text = await response.text();
            const lines = text.split('\n');

            const match = lines.find(line => line.trim().startsWith(suffix));
            if (match) {
                const count = parseInt(match.split(':')[1]);
                setPwnedCount(count);
            } else {
                setPwnedCount(0);
            }
        } catch (error) {
            console.error('Error checking pwned:', error);
            toast.error('Error al verificar filtraciones', { id: `pwd-tester-${item.id}` });
        } finally {
            setCheckingPwned(false);
        }
    };

    const handleFinishTester = () => {
        if (isTesterCompleted) return;
        markLinkAsVisited(item.id);
    };

    return (
        <div className={`p-8 rounded-[2.5rem] transition-all duration-700 border-2 bg-slate-900/40 border-white/5`}>
            <div className="flex flex-col gap-6">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">{item.title || 'Take the Password Test'}</h3>
                        {data.description && (
                            <div
                                className="text-sm text-gray-500 font-medium leading-relaxed italic"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data.description) }}
                            />
                        )}
                    </div>
                </div>

                <div className="max-w-2xl w-full mx-auto space-y-6">
                    <div className="relative">
                        <div className="flex justify-end mb-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <span className="text-[10px] font-black uppercase text-gray-500 group-hover:text-white transition-colors">Mostrar contraseña</span>
                                <input
                                    type="checkbox"
                                    checked={showPass}
                                    onChange={() => setShowPass(!showPass)}
                                    className="w-4 h-4 rounded border-white/10 bg-slate-950 text-pink-500 focus:ring-pink-500/50"
                                />
                            </label>
                        </div>
                        <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${passValue ? `border-opacity-50 ${strength.color.replace('bg-', 'border-')}` : 'border-white/5'}`}>
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={passValue}
                                onChange={(e) => setPassValue(e.target.value)}
                                placeholder="Ingresa una contraseña para probar..."
                                className="w-full bg-slate-950/80 p-6 text-2xl text-center font-mono tracking-[0.3em] text-white outline-none placeholder:text-gray-800 placeholder:text-sm placeholder:tracking-normal placeholder:font-sans"
                            />
                            {passValue && (
                                <div className={`py-2 text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${strength.color} text-slate-950`}>
                                    {strength.label}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <div className="bg-black/20 p-6 rounded-3xl border border-white/5 space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Composición:</p>
                            <div className="grid grid-cols-1 gap-3">
                                {checks.map((check, idx) => (
                                    <div key={idx} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${check.met ? 'text-emerald-400' : 'text-gray-600'}`}>
                                        <div className={`w-2 h-2 rounded-full ${check.met ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-gray-800'}`} />
                                        {check.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black/20 p-6 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center space-y-2">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Tiempo de hackeo:</p>
                            <div className={`text-3xl font-black tracking-tighter ${passValue ? strength.textColor : 'text-gray-800 animate-pulse'}`}>
                                {passValue ? crackTime : '????'}
                            </div>
                        </div>

                        <div className="bg-black/20 p-6 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center space-y-4">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Base de Filtraciones:</p>

                            {pwnedCount === null ? (
                                <button
                                    onClick={checkPwned}
                                    disabled={!passValue || checkingPwned}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    {checkingPwned ? 'Verificando...' : 'Verificar Filtraciones'}
                                </button>
                            ) : (
                                <div className={`flex flex-col items-center animate-comic-pop`}>
                                    <div className={`text-2xl font-black ${pwnedCount > 0 ? 'text-red-500' : 'text-emerald-400'}`}>
                                        {pwnedCount.toLocaleString()} veces
                                    </div>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mt-1">
                                        {pwnedCount > 0 ? '¡Contraseña filtrada!' : 'Segura en filtraciones'}
                                    </p>
                                    <button
                                        onClick={() => setPwnedCount(null)}
                                        className="mt-3 text-[9px] text-indigo-400 hover:text-indigo-300 font-bold uppercase underline"
                                    >
                                        Verificar otra
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-white/5 mt-4">
                        {!isTesterCompleted ? (
                            <>
                                {!!item.is_required && (
                                    <span className="px-5 py-2.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" /> Requerido
                                    </span>
                                )}
                                <span className={`px-5 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all ${item.is_required ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                    <Eye className="w-3.5 h-3.5" /> {item.is_required ? 'Pendiente' : 'Opcional'}
                                </span>
                            </>
                        ) : (
                            <span className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Actividad Completada
                            </span>
                        )}
                    </div>

                    {!isTesterCompleted && passValue.length > 0 && (
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={handleFinishTester}
                                className="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-pink-600/20 active:scale-95 flex items-center gap-3 group"
                            >
                                Finalizar Actividad <Zap className="w-4 h-4 group-hover:animate-pulse" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
