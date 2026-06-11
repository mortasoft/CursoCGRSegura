import React from 'react';
import { Download, FileText, ExternalLink } from 'lucide-react';

export default function ModuleResources({ resources, onDownload }) {
    return (
        <div className="bg-[var(--card-bg)] rounded-[2rem] p-8 space-y-6 shadow-[6px_6px_20px_rgba(168,145,116,0.3),-4px_-4px_12px_rgba(255,255,255,0.5)]">
            <h3 className="text-xl font-black text-[#582c19] uppercase tracking-tight flex items-center gap-3">
                <div className="w-2 h-8 bg-[#8f032a] rounded-full"></div>
                Recursos Adicionales
            </h3>
            {resources && resources.length > 0 ? (
                <div className="space-y-3">
                    {resources.map((resource) => (
                        <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onDownload(resource)}
                            className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-color)] border border-[#582c19]/10 hover:border-[#582c19]/30 hover:shadow-[4px_4px_10px_rgba(168,145,116,0.2),-2px_-2px_6px_rgba(255,255,255,0.4)] transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all 
                                    ${resource.resource_type === 'drive'
                                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                        : 'bg-[#8f032a]/10 border-[#8f032a]/20 text-[#8f032a]'}`}>
                                    {resource.resource_type === 'drive' ? (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 transition-transform group-hover:scale-110" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.71 3.502L1.15 14.782L4.44 20.492L11 9.212L7.71 3.502Z" fill="#FFC107" />
                                            <path d="M22.85 14.782L19.56 20.492H6.44L9.73 14.782H22.85Z" fill="#4CAF50" />
                                            <path d="M16.2 3.502H9.71L6.42 9.212L12.91 9.212L16.2 3.502Z" fill="#2196F3" />
                                        </svg>
                                    ) : (
                                        <FileText className="w-5 h-5" />
                                    )}
                                </div>
                                <div className={`text-sm font-bold transition-colors uppercase tracking-tight 
                                    ${resource.resource_type === 'drive' ? 'text-[#582c19] group-hover:text-blue-500' : 'text-[#582c19] group-hover:text-[#8f032a]'}`}>
                                    {resource.title}
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-[#582c19]/40 group-hover:text-[#8f032a] transition-colors" />
                        </a>
                    ))}
                </div>
            ) : (
                <p className="text-[#582c19]/60 text-sm font-medium italic">No hay recursos adicionales para este módulo.</p>
            )}
        </div>
    );
}
