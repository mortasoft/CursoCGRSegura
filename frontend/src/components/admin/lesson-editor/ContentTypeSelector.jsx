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
    CheckCircle2,
    Lock,
    CheckSquare,
    Smartphone,
    LayoutGrid,
    Activity,
    MessageSquare,
    ShieldAlert
} from 'lucide-react';

export const CONTENT_TYPES = [
    { type: 'heading', label: 'Título', icon: Type, color: 'text-white' },
    { type: 'text', label: 'Texto', icon: FileText, color: 'text-gray-300' },
    { type: 'file', label: 'Archivo', icon: File, color: 'text-orange-400' },
    { type: 'image', label: 'Imagen', icon: ImageIcon, color: 'text-purple-400' },
    { type: 'video', label: 'Video', icon: Video, color: 'text-blue-400' },
    { type: 'link', label: 'Enlace', icon: LinkIcon, color: 'text-green-400' },
    { type: 'quiz', label: 'Quiz', icon: HelpCircle, color: 'text-red-400' },
    { type: 'survey', label: 'Encuesta', icon: ClipboardList, color: 'text-yellow-400' },
    { type: 'assignment', label: 'Tarea', icon: Upload, color: 'text-pink-400' },
    { type: 'note', label: 'Nota', icon: Shield, color: 'text-primary-400' },
    { type: 'bullets', label: 'Viñetas', icon: List, color: 'text-sky-400' },
    { type: 'confirmation', label: 'Confirmación', icon: CheckCircle2, color: 'text-emerald-400' },
    { type: 'interactive_input', label: 'Input', icon: Type, color: 'text-indigo-400' },
    { type: 'password_tester', label: 'Password', icon: Lock, color: 'text-pink-400' },
    { type: 'multiple_choice', label: 'Opciones', icon: CheckSquare, color: 'text-orange-400' },
    { type: 'mfa_defender', label: 'MFA', icon: Smartphone, color: 'text-indigo-500' },
    { type: 'categorization', label: 'Categorizar', icon: LayoutGrid, color: 'text-emerald-400' },
    { type: 'data_tetris', label: 'Data Tetris', icon: Activity, color: 'text-primary-400' },
    { type: 'forum', label: 'Foro', icon: MessageSquare, color: 'text-teal-400' },
    { type: 'terms_trap', label: 'Términos', icon: ShieldAlert, color: 'text-red-500' },
];

export default function ContentTypeSelector({ onSelect }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-12 gap-3">
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
