import React from 'react';
import { FileText, Download, CheckCircle, Clock, Eye } from 'lucide-react';

import { getFileUrl } from '../../../utils/imageUtils';

export default function FileActivity({ item, data, handleResourceDownload, visitedLinks }) {
    const fileLink = getFileUrl(data.file_url);
    const isDownloaded = visitedLinks?.has(item.id);

    return (
        <a
            href={fileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
            onClick={() => handleResourceDownload(item.id, item.title)}
        >
            <div className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl transition-all duration-500 border ${isDownloaded ? 'bg-green-500/5 border-green-500/30 shadow-lg shadow-green-500/10' : 'bg-slate-800/20 border-white/5 hover:border-green-500/30'}`}>
                <div className={`w-16 h-16 rounded-2xl transition-all duration-500 flex items-center justify-center flex-shrink-0 ${isDownloaded ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-red-500/10 text-red-500 group-hover:scale-110'}`}>
                    <FileText className="w-8 h-8" />
                </div>

                <div className="flex-1 min-w-0 text-center md:text-left">
                    <h4 className={`text-lg font-bold flex items-center justify-center md:justify-start gap-2 transition-colors ${isDownloaded ? 'text-green-400' : 'text-white'}`}>
                        {item.title}
                        {isDownloaded && <CheckCircle className="w-4 h-4 text-green-400 animate-pulse" />}
                    </h4>
                    <p className="text-sm text-gray-500 truncate mt-1">
                        {data.original_name || 'Documento adjunto'}
                        {data.size && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-400 ml-2">{(data.size / 1024 / 1024).toFixed(2)} MB</span>}
                    </p>

                    <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                        {!!item.is_required && !isDownloaded && (
                            <span className="px-3 py-1 rounded-lg bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                <Clock className="w-3.5 h-3.5 mr-1 inline" /> Requerido
                            </span>
                        )}
                        {isDownloaded ? (
                            <span className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-500/30">
                                <CheckCircle className="w-3.5 h-3.5 mr-1 inline" /> Descargado
                            </span>
                        ) : (
                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${item.is_required ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                                <Eye className="w-3.5 h-3.5 mr-1 inline" /> {item.is_required ? 'Pendiente' : 'Opcional'}
                            </span>
                        )}
                    </div>
                </div>

                <div className={`w-12 h-12 rounded-full hidden md:flex items-center justify-center transition-all ${isDownloaded ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 group-hover:bg-green-500 group-hover:text-white'}`}>
                    {isDownloaded ? <CheckCircle className="w-6 h-6" /> : <Download className="w-6 h-6 animate-pulse" />}
                </div>
            </div>
        </a>
    );
}
