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

export const CONTENT_TYPES_CONFIG = [
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

export const getIconForType = (type) => {
    const typeData = CONTENT_TYPES_CONFIG.find(t => t.type === type);
    return typeData ? typeData.icon : FileText;
};

export const getColorForType = (type) => {
    const typeData = CONTENT_TYPES_CONFIG.find(t => t.type === type);
    return typeData ? typeData.color : 'text-gray-400';
};

export const getTypeLabel = (type) => {
    const labels = {
        text: 'Texto',
        video: 'Video',
        image: 'Imagen',
        file: 'Archivo',
        link: 'Enlace',
        quiz: 'Cuestionario',
        survey: 'Encuesta',
        assignment: 'Tarea',
        note: 'Nota de Aprendizaje',
        heading: 'Título de Sección',
        bullets: 'Viñetas',
        confirmation: 'Confirmación Interactiva'
    };
    return labels[type] || type;
};
