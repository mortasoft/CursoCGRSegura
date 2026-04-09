import { Building2, Star } from 'lucide-react';

export default function StrategicView({ filteredDepts }) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <div className="col-span-1 text-center">Pos</div>
                    <div className="col-span-4 text-left pl-4">Área / Unidad</div>
                    <div className="col-span-3 italic text-gray-600">Mejor Funcionario (Líder)</div>
                    <div className="col-span-2 text-right uppercase">Promedio</div>
                    <div className="col-span-2 text-right uppercase">Total</div>
                </div>
                {filteredDepts.map((dept, index) => (
                    <div key={index} className="grid grid-cols-12 items-center px-8 py-6 rounded-3xl border bg-slate-800/20 border-white/5 hover:border-primary-500/30 transition-all group cursor-default">
                        <div className="col-span-1 text-center font-black text-lg text-gray-500">{index + 1}</div>
                        <div className="col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary-500/10 flex items-center justify-center text-secondary-500 shadow-lg shadow-secondary-500/10 shrink-0">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 pr-4">
                                <p className="text-sm font-black text-white group-hover:text-secondary-500 transition-colors uppercase tracking-tight leading-tight">{dept.department}</p>
                                <p className="text-[10px] text-gray-300 font-bold uppercase">{dept.staff_count} Funcionarios</p>
                            </div>
                        </div>
                        <div className="col-span-3 flex items-center gap-3 text-left">
                            <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 shrink-0">
                                <Star className="w-4 h-4 fill-primary-400" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-300 uppercase tracking-tight line-clamp-1">{dept.top_performer}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase italic">Líder: {dept.top_points} pts</p>
                            </div>
                        </div>
                        <div className="col-span-2 text-right">
                            <p className="text-xl font-black text-[#EF8843] italic">{parseFloat(dept.average_points || 0).toFixed(1)} PTS</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase">Promedio</p>
                        </div>
                        <div className="col-span-2 text-right opacity-60">
                            <p className="text-sm font-black text-white italic">{dept.total_points.toLocaleString()} PTS</p>
                            <p className="text-[8px] text-gray-600 font-bold uppercase">Total</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
