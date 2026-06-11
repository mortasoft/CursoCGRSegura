import { Trophy, Crown } from 'lucide-react';

export default function LeaderboardHero({ currentUser }) {
    return (
        <div className="relative rounded-[2rem] overflow-hidden border border-[#e8dbbe] shadow-xl bg-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="/images/Inicio-opcion-1.jpg" 
                    alt="Hero Background" 
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #e8dbbe 0%, #e8dbbe 70%, #f6efe2 100%)', opacity: 0.5 }}></div>
            </div>

            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="space-y-6 text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-black tracking-widest uppercase italic">
                        <span 
                            className="inline-block bg-clip-text text-transparent py-2"
                            style={{
                                backgroundImage: 'linear-gradient(to right, #8f032a 0%, #8f032a 60%, #e57b3c 100%)'
                            }}
                        >
                            RANKING
                        </span>
                    </h1>
                </div>

                <div className="flex gap-6 items-center">
                    {/* Institutional Rank Card */}
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-[#582c19] rounded-[1.5rem] border border-[#582c19]/80 flex flex-col items-center justify-center shadow-lg relative group">
                        <div className="absolute -top-3.5 p-1.5 bg-white rounded-full border border-[#e8dbbe] shadow-md flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-[#36499b]" />
                        </div>
                        <span className="text-3xl md:text-4xl font-black text-white">#{currentUser?.globalRank || '--'}</span>
                        <span className="text-[9px] font-bold text-white/80 tracking-widest uppercase text-center px-2">Rango CGR</span>
                    </div>

                    {/* Dept Rank Card */}
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-[#e57b3c] rounded-[1.5rem] border border-[#e57b3c]/80 flex flex-col items-center justify-center shadow-lg relative">
                        <div className="absolute -top-3.5 p-1.5 bg-white rounded-full border border-[#e8dbbe] shadow-md flex items-center justify-center">
                            <Crown className="w-4 h-4 text-[#36499b] -rotate-12" />
                        </div>
                        <span className="text-3xl md:text-4xl font-black text-white">#{currentUser?.deptRank || '--'}</span>
                        <span className="text-[9px] font-bold text-white/90 tracking-widest uppercase text-center px-2">Rango Área</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
