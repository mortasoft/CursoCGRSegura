import { Plus, Trash } from 'lucide-react';

export default function BulletsEditor({ bulletItems, onChange }) {
    const handleUpdate = (idx, field, value) => {
        const newItems = [...bulletItems];
        newItems[idx][field] = value;
        onChange(newItems);
    };

    const handleRemove = (idx) => {
        const newItems = bulletItems.filter((_, i) => i !== idx);
        if (newItems.length === 0) newItems.push({ title: '', text: '' });
        onChange(newItems);
    };

    const handleAdd = () => {
        onChange([...bulletItems, { title: '', text: '' }]);
    };

    return (
        <div className="space-y-4">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Elementos Dinámicos</label>
            {bulletItems.map((bullet, idx) => (
                <div key={idx} className="group relative bg-[#0a0d18] p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Tópico o Título"
                            className="w-full bg-transparent border-0 border-b border-white/5 focus:border-primary-500/50 p-0 pb-2 text-white font-bold tracking-wider outline-none text-[11px] transition-colors"
                            value={bullet.title}
                            onChange={e => handleUpdate(idx, 'title', e.target.value)}
                        />
                        <textarea
                            rows="5"
                            placeholder="Descripción ejecutiva..."
                            className="w-full bg-transparent border-0 p-0 text-gray-400 font-medium outline-none text-sm leading-relaxed resize-y custom-scrollbar"
                            value={bullet.text}
                            onChange={e => handleUpdate(idx, 'text', e.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="absolute -right-2 -top-2 p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-xl opacity-0 group-hover:opacity-100 active:scale-95 z-10"
                    >
                        <Trash className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={handleAdd}
                className="w-full py-3.5 rounded-xl border-2 border-dashed border-white/5 text-gray-600 hover:text-primary-400 hover:border-primary-500/30 hover:bg-primary-500/5 transition-all text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Añadir Pestaña
            </button>
        </div>
    );
}
