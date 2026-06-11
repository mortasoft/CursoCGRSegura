import { ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LeaderboardControls({
    view,
    setView,
    levels,
    filterLevel,
    setFilterLevel,
    isFilterOpen,
    setIsFilterOpen,
    searchTerm,
    setSearchTerm
}) {
    const currentLevel = levels.find(l => l.id === filterLevel) || levels[0];

    const handleViewChange = (newView, label) => {
        setView(newView);
        toast.success(`${label} seleccionado`, { id: 'leaderboard-view-change' });
    };

    const handleLevelSelect = (level) => {
        setFilterLevel(level.id);
        setIsFilterOpen(false);
        toast.success(`${level.name} seleccionado`, { id: 'leaderboard-filter-change' });
    };

    return (
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-6 items-center justify-between">
            <div className="flex flex-col lg:flex-row w-full xl:w-auto gap-4">
                {/* View Switcher Tabs */}
                <div className="flex flex-col sm:flex-row w-full flex-1 p-1 bg-[#582c19] rounded-xl border border-white/5 items-stretch gap-1 sm:gap-0 h-[58px] shadow-2xl">
                    <button
                        onClick={() => handleViewChange('global', 'Institucional')}
                        className={`flex-1 px-4 lg:px-6 h-full rounded-lg text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${view === 'global' ? 'bg-[#e8dbbe] text-[#582c19] font-black shadow-[0_0_15px_rgba(232,219,190,0.3)]' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    >
                        Institucional
                    </button>
                    <button
                        onClick={() => handleViewChange('area', 'Mi Área')}
                        className={`flex-1 px-4 lg:px-6 h-full rounded-lg text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${view === 'area' ? 'bg-[#e8dbbe] text-[#582c19] font-black shadow-[0_0_15px_rgba(232,219,190,0.3)]' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    >
                        Mi Área
                    </button>
                    <button
                        onClick={() => handleViewChange('strategic', 'Por Áreas')}
                        className={`flex-1 px-4 lg:px-6 h-full rounded-lg text-[10px] whitespace-nowrap font-black uppercase tracking-widest transition-all ${view === 'strategic' ? 'bg-[#e8dbbe] text-[#582c19] font-black shadow-[0_0_15px_rgba(232,219,190,0.3)]' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
                    >
                        Por Áreas
                    </button>
                </div>

                {/* Level Filter Dropdown */}
                {view !== 'strategic' && (
                    <div className="relative w-full lg:w-64">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md group ${currentLevel.id === 'all' ? 'bg-[#e8dbbe] text-[#582c19] border border-[#582c19] shadow-[0_0_15px_rgba(88,44,25,0.22)]' : 'bg-[#582c19] text-white border border-white/5 hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className="flex items-center gap-3">
                                <currentLevel.icon className={`w-4 h-4 ${currentLevel.id === 'all' ? 'text-[#582c19]' : 'text-[#e8dbbe]'}`} />
                                <span>{currentLevel.name}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${currentLevel.id === 'all' ? 'text-[#582c19]' : 'text-white/40'} transition-transform duration-300 ${isFilterOpen ? '-rotate-90' : 'rotate-90'}`} />
                        </button>

                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)}></div>
                                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#582c19] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="max-h-80 overflow-y-auto custom-scrollbar p-1">
                                        {levels.map((level) => (
                                            <button
                                                key={level.id}
                                                onClick={() => handleLevelSelect(level)}
                                                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterLevel === level.id ? 'bg-[#e8dbbe] text-[#582c19] shadow-[0_0_15px_rgba(232,219,190,0.3)]' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                <level.icon className={`w-4 h-4 ${filterLevel === level.id ? 'text-[#582c19]' : 'text-white/40'}`} />
                                                {level.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Search Input */}
            <div className="relative w-full xl:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-hover:text-[#e8dbbe] transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-[#582c19] border border-white/5 rounded-2xl text-white font-medium placeholder:text-white/30 focus:outline-none focus:border-[#e8dbbe]/50 transition-all shadow-md"
                />
            </div>
        </div>
    );
}
