import { Image as ImageIcon, Plus } from 'lucide-react';

export default function FileEditor({ 
    contentType, 
    file, 
    onSetFile, 
    editingItem,
    altText,
    onSetAltText
}) {
    return (
        <div className="space-y-5 text-left">
            <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Archivo de Recurso</label>
                <div className="p-10 bg-[#0a0d18] border-2 border-dashed border-white/5 rounded-3xl hover:border-primary-500/30 transition-all flex flex-col items-center justify-center gap-4 group cursor-pointer relative overflow-hidden">
                    <input
                        type="file"
                        required={!editingItem}
                        id="contentFile"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={e => onSetFile(e.target.files[0])}
                        accept={contentType === 'image' ? 'image/*' : '*/*'}
                    />
                    <div className="flex flex-col items-center gap-3">
                        <div className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${contentType === 'image' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {contentType === 'image' ? <ImageIcon className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
                        </div>
                        <div className="text-center">
                            <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-0.5">
                                {file ? file.name : editingItem?.data?.original_name || 'Seleccionar Archivo'}
                            </p>
                            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Formatos: {contentType === 'image' ? 'JPG, PNG, WEBP' : 'PDF, DOCX, ZIP'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {contentType === 'image' && (
                <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Texto Alternativo (ALT)</label>
                    <input
                        type="text"
                        required
                        placeholder="Descripción de la imagen para lectores de pantalla..."
                        className="w-full bg-[#0a0d18] border border-white/5 focus:border-primary-500/50 rounded-xl py-3.5 px-4 text-white text-sm font-semibold outline-none transition-all hover:border-white/10"
                        value={altText || ''}
                        onChange={e => onSetAltText(e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}
