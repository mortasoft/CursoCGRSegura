import { TrendingUp, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProfilePictureUrl } from '../../utils/imageUtils';

export default function DashboardSidebar({ user, stats, onShowBadges, onShowCertificates }) {

    return (
        <div className="space-y-4 flex flex-col h-full animate-fade-in text-center">
            {/* Main Posición Global Card */}
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--card-border)] shadow-2xl flex flex-col items-center transition-colors duration-300">
                {/* Avatar */}
                <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full bg-[var(--bg-color)] p-1">
                        <img
                            src={getProfilePictureUrl(user?.profilePicture, `${user?.firstName} ${user?.lastName}`)}
                            alt="Avatar"
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[#582c19] uppercase tracking-wider mb-2 leading-none">
                    POSICIÓN<br />GLOBAL
                </h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-5">
                    DE {stats?.totalUsers || 0} FUNCIONARIOS
                </p>

                {/* Inner Stats Card */}
                <div className="w-full bg-[var(--card-bg)] rounded-2xl border border-transparent shadow-[6px_6px_16px_rgba(168,145,116,0.25),-2px_-2px_8px_rgba(255,255,255,0.4)] p-4 flex flex-row items-center gap-2 mb-5">
                    <div className="flex-1 flex flex-col items-center justify-center border-r border-[var(--card-border)] pr-2">
                        <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mb-1">INSTITUCIONAL</span>
                        <span className="text-xl font-bold text-[#EF8843] mb-0.5 leading-none">#{stats?.rank || 1}</span>
                        <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest">TOP {Math.max(1, Math.round((stats?.rank / stats?.totalUsers) * 100)) || 1}%</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center pl-2">
                        <span className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mb-1">EN SU ÁREA</span>
                        <span className="text-xl font-bold text-[#36499b] mb-0.5 leading-none">#{stats?.departmentRank || 1}</span>
                        <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest">DE {stats?.totalInDepartment || 0} PERS.</span>
                    </div>
                </div>

                <Link
                    to="/leaderboard"
                    className="group relative w-full py-4 rounded-2xl border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 transition-all duration-300 text-[var(--text-color)] text-[10px] font-black uppercase tracking-normal flex items-center justify-center gap-2 overflow-hidden shadow-lg hover:shadow-primary-500/20 hover:border-primary-500/50 px-4"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <span className="relative z-10 whitespace-nowrap">VER TABLA COMPLETA</span>
                    <TrendingUp className="w-4 h-4 text-[#36499b] relative z-10 transition-all duration-300 group-hover:scale-110 shrink-0" />
                </Link>
            </div>

            {/* Badges / Diplomas Grid */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={onShowBadges}
                    className="bg-[var(--card-bg)] rounded-3xl p-6 border border-transparent shadow-[6px_6px_16px_rgba(168,145,116,0.25),-2px_-2px_8px_rgba(255,255,255,0.4)] hover:shadow-[8px_8px_20px_rgba(168,145,116,0.3),-4px_-4px_12px_rgba(255,255,255,0.5)] hover:-translate-y-1 flex flex-col items-center justify-center gap-3 transition-all w-full"
                >
                    <Award className="w-8 h-8 text-[#EF8843]" />
                    <span className="text-[10px] font-bold text-[var(--text-color)] uppercase tracking-widest">INSIGNIAS</span>
                </button>
                <button
                    onClick={onShowCertificates}
                    className="bg-[var(--card-bg)] rounded-3xl p-6 border-2 border-transparent shadow-[6px_6px_16px_rgba(168,145,116,0.25),-2px_-2px_8px_rgba(255,255,255,0.4)] hover:shadow-[8px_8px_20px_rgba(168,145,116,0.3),-4px_-4px_12px_rgba(255,255,255,0.5)] hover:-translate-y-1 flex flex-col items-center justify-center gap-3 transition-all w-full"
                >
                    <CheckCircle className="w-8 h-8 text-[#36499b]" />
                    <span className="text-[10px] font-bold text-[var(--text-color)] uppercase tracking-widest">CERTIFICADOS</span>
                </button>
            </div>
        </div>
    );
}
