import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

export default function ComplianceCharts({ chartType, onTypeChange, data }) {
    const yDataKey = chartType === 'departments' ? 'department' : 'title';
    
    // Dynamic height based on data length (min 400px, max 1000px)
    const chartHeight = Math.max(400, Math.min(data.length * 40, 1000));
    
    const getColorForName = (name) => {
        if (!name) return '#cbd5e1';
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return `hsl(${Math.abs(hash) % 360}, 70%, 60%)`;
    };

    return (
        <div className="card p-8 space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4 text-left">
                <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-primary-400" />
                    {chartType === 'departments' ? 'Cumplimiento por Unidad' : 'Cumplimiento por Módulo'}
                </h3>
                <select
                    value={chartType}
                    onChange={(e) => onTypeChange(e.target.value)}
                    className="bg-slate-900 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none focus:border-primary-500/50"
                >
                    <option value="departments">Por Unidad Administrativa</option>
                    <option value="modules">Por Módulo Educativo</option>
                </select>
            </div>
            <div style={{ height: `${chartHeight}px` }} className="w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={data}
                        margin={{ top: 5, right: 60, left: -20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis
                            dataKey={yDataKey}
                            type="category"
                            width={180}
                            tick={{ fill: '#94a3b8', fontSize: 9, width: 170 }}
                            interval={0}
                        />
                        <Tooltip
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', color: '#fff' }}
                        />
                        <Bar dataKey="avg_completion" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={getColorForName(entry[yDataKey])}
                                />
                            ))}
                            <LabelList 
                                dataKey="avg_completion" 
                                position="right" 
                                formatter={(val) => `${val}%`}
                                style={{ fill: '#ffffff60', fontSize: '10px', fontWeight: 'bold' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
