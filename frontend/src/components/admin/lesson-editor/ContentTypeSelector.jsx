import { 
    FileText, 
    Video, 
    Image as ImageIcon, 
    Link as LinkIcon, 
    HelpCircle, 
    ClipboardList, 
    Upload, 
    Shield, 
    Type, 
    List,
    File,
    CheckCircle2
} from 'lucide-react';

export const CONTENT_TYPES = [
    { type: 'text', label: 'Texto', icon: FileText, color: 'text-gray-300' },
    { type: 'file', label: 'Archivo', icon: File, color: 'text-orange-400' },
    { type: 'image', label: 'Imagen', icon: ImageIcon, color: 'text-purple-400' },
    { type: 'video', label: 'Video', icon: Video, color: 'text-blue-400' },
    { type: 'link', label: 'Enlace', icon: LinkIcon, color: 'text-green-400' },
    { type: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-red-400' },
    { type: 'survey', label: 'Encuesta', icon: ClipboardList, color: 'text-yellow-400' },
    { type: 'assignment', label: 'Tarea', icon: Upload, color: 'text-pink-400' },
    { type: 'note', label: 'Nota', icon: Shield, color: 'text-primary-400' },
    { type: 'heading', label: 'Título', icon: Type, color: 'text-white' },
    { type: 'bullets', label: 'Viñetas', icon: List, color: 'text-sky-400' },
    { type: 'confirmation', label: 'Confirmación', icon: CheckCircle2, color: 'text-emerald-400' },
];

export default function ContentTypeSelector({ onSelect }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-3">
            {CONTENT_TYPES.map((action) => (
                <button
                    key={action.type}
                    onClick={() => onSelect(action.type)}
                    title={action.label}
                    className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-primary-500/30 rounded-2xl transition-all group shadow-sm"
                >
                    <action.icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-500 group-hover:text-white text-center line-clamp-1">{action.label}</span>
                </button>
            ))}
        </div>
    );
}
