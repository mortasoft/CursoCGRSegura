import { Pencil, Plus, Award, Shield, Save, X } from 'lucide-react';
import { getTypeLabel } from './editorUtils.js';
import TextEditor from './editors/TextEditor.jsx';
import LinkEditor from './editors/LinkEditor.jsx';
import VideoEditor from './editors/VideoEditor.jsx';
import FileEditor from './editors/FileEditor.jsx';
import TaskEditor from './editors/TaskEditor.jsx';
import BulletsEditor from './editors/BulletsEditor.jsx';
import ConfirmationEditor from './editors/ConfirmationEditor.jsx';

export default function ContentEditorModal({
    isOpen,
    onClose,
    formData,
    setFormData,
    editingItem,
    onSave
}) {
    if (!isOpen) return null;

    const renderSpecificEditor = () => {
        switch (formData.content_type) {
            case 'text':
                return <TextEditor value={formData.data} onChange={(val) => setFormData({ ...formData, data: val })} />;
            case 'link':
                return <LinkEditor value={formData.data} onChange={(val) => setFormData({ ...formData, data: val })} />;
            case 'video':
                return (
                    <VideoEditor
                        videoSource={formData.video_source}
                        onSetSource={(s) => setFormData({ ...formData, video_source: s })}
                        file={formData.file}
                        onSetFile={(f) => setFormData({ ...formData, file: f })}
                        url={formData.data}
                        onSetUrl={(u) => setFormData({ ...formData, data: u })}
                        editingItem={editingItem}
                    />
                );
            case 'file':
            case 'image':
                return (
                    <FileEditor
                        contentType={formData.content_type}
                        file={formData.file}
                        onSetFile={(f) => setFormData({ ...formData, file: f })}
                        editingItem={editingItem}
                    />
                );
            case 'quiz':
            case 'survey':
            case 'assignment':
            case 'note':
            case 'heading':
                return (
                    <TaskEditor
                        contentType={formData.content_type}
                        value={formData.data}
                        onChange={(v) => setFormData({ ...formData, data: v })}
                    />
                );
            case 'bullets':
                return (
                    <BulletsEditor
                        bulletItems={formData.bulletItems}
                        onChange={(items) => setFormData({ ...formData, bulletItems: items })}
                    />
                );
            case 'confirmation':
                return (
                    <ConfirmationEditor
                        description={formData.data}
                        onChangeDescription={(val) => setFormData({ ...formData, data: val })}
                        option1={formData.option1}
                        onChangeOption1={(val) => setFormData({ ...formData, option1: val })}
                        option2={formData.option2}
                        onChangeOption2={(val) => setFormData({ ...formData, option2: val })}
                        correctOption={formData.correctOption}
                        onChangeCorrectOption={(val) => setFormData({ ...formData, correctOption: val })}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-2xl bg-[#0f121d] rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[95vh]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 rounded-t-3xl"></div>

                {/* Header */}
                <div className="px-8 py-6 border-b border-white/5 bg-slate-950/20 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary-500/10 rounded-xl text-primary-400 border border-primary-500/20">
                                {editingItem ? <Pencil className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {editingItem ? 'Editar' : 'Nuevo'} <span className="text-primary-400">{getTypeLabel(formData.content_type)}</span>
                                </h2>
                                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-medium">Configuración de Bloque Educativo</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={onSave} className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Título del Elemento</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[#0a0d18] border border-white/5 focus:border-primary-500/50 rounded-xl py-3 px-4 text-white text-sm font-semibold outline-none transition-all hover:border-white/10"
                            placeholder="Ej: Análisis de Riesgos Estructurales"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Specific Editor Injection */}
                    <div className="space-y-6">
                        {renderSpecificEditor()}
                    </div>

                    {/* Rewards & Rules */}
                    <div className="grid grid-cols-2 gap-6 bg-slate-950/30 p-6 rounded-2xl border border-white/5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest flex items-center gap-2 mb-1">
                                <Award className="w-4 h-4" /> Puntos
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full bg-[#0a0d18] border border-white/5 focus:border-yellow-500/30 rounded-xl py-3 px-4 text-yellow-400 text-lg font-black outline-none transition-all"
                                    value={formData.points}
                                    onChange={e => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col justify-end space-y-1.5">
                            <label className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4" /> Obligatoriedad
                            </label>
                            <div
                                onClick={() => setFormData({ ...formData, is_required: !formData.is_required })}
                                className="flex items-center justify-between p-3.5 bg-[#0a0d18] rounded-xl border border-white/5 cursor-pointer hover:bg-slate-900 transition-all select-none group"
                            >
                                <span className={`text-[10px] font-bold uppercase transition-colors ${formData.is_required ? 'text-red-400' : 'text-gray-500'}`}>Es obligatorio</span>
                                <div className={`relative w-9 h-5 rounded-full transition-colors duration-200 outline-none ${formData.is_required ? 'bg-red-500' : 'bg-slate-800'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200 shadow-sm ${formData.is_required ? 'left-5' : 'left-1'}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 px-6 bg-transparent hover:bg-white/5 text-gray-500 hover:text-white font-bold uppercase tracking-widest rounded-xl transition-all text-[11px] active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] py-3.5 px-6 bg-primary-600 hover:bg-primary-500 text-white font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-95 text-[11px] flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {editingItem ? 'Finalizar Edición' : 'Implementar Contenido'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
