import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar Acción',
    message = '¿Estás seguro de que deseas realizar esta acción?',
    confirmText = 'Continuar',
    cancelText = 'Cancelar',
    isDestructive = false
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="card w-full max-w-md p-0 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-white/10 scale-100 animate-slide-up-fade">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-white/5 flex items-start gap-4">
                    <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">{title}</h3>
                        <p className="text-gray-400 text-sm font-medium mt-1 leading-relaxed">
                            {message}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Actions */}
                <div className="p-6 bg-slate-900 border-t border-white/5 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all ${isDestructive
                                ? 'bg-red-500 hover:bg-red-400 shadow-red-500/20'
                                : 'bg-primary-500 hover:bg-primary-400 shadow-primary-500/20'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
