import dashboardHero from '../../assets/dashboard-hero.avif';

export default function DashboardBanner({ user, stats }) {
    return (
        <div className="space-y-2 md:space-y-3">

            {/* Master Welcome Banner */}
            <div className="relative rounded-[1.5rem] overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl group transition-colors duration-300">
                <div className="absolute inset-0 z-0">
                    <img
                        src={dashboardHero}
                        alt="Dashboard Hero"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-color)] via-[var(--bg-color)]/60 to-transparent"></div>
                </div>

                <div className="relative z-10 px-4 py-2 md:px-8 md:py-3 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-black text-[var(--text-color)] tracking-tighter leading-none italic uppercase">
                            ¡Hola de nuevo, <span className="text-[#8f032a] not-italic">{user?.firstName}</span>!
                        </h1>

                    </div>

                    {/* Quick Stats Floating in Banner */}
                    <div className="flex gap-4 md:gap-8">
                        <div className="px-6 py-3 bg-[var(--bg-color)] backdrop-blur-xl border border-[var(--card-border)] rounded-2xl text-center min-w-[120px] shadow-xl transition-all duration-300">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-0.5 italic">Puntos</p>
                            <p className="text-2xl font-black text-[#582c19] tracking-tighter">{stats?.points || 0}</p>
                        </div>
                        <div className="px-6 py-3 bg-[var(--bg-color)] backdrop-blur-xl border border-[var(--card-border)] rounded-2xl text-center min-w-[120px] shadow-xl transition-all duration-300">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-0.5 italic">Nivel</p>
                            <p className="text-2xl font-black text-[#8f032a] tracking-tighter">{user?.level || '1'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
