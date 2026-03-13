import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

const data = [
    { day: 'Mar 1', risk: 28 },
    { day: 'Mar 2', risk: 32 },
    { day: 'Mar 3', risk: 22 },
    { day: 'Mar 4', risk: 41 },
    { day: 'Mar 5', risk: 35 },
    { day: 'Mar 6', risk: 19 },
    { day: 'Mar 7', risk: 24 },
    { day: 'Mar 8', risk: 38 },
    { day: 'Mar 9', risk: 29 },
    { day: 'Mar 10', risk: 18 },
    { day: 'Mar 11', risk: 45 },
    { day: 'Mar 12', risk: 31 },
    { day: 'Mar 13', risk: 23 },
    { day: 'Mar 14', risk: 27 },
]

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-800 border border-white/10 rounded-xl px-3 py-2 shadow-card">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-primary-300">
                    Risk: <span className="font-mono">{payload[0].value}</span>
                </p>
            </div>
        )
    }
    return null
}

export default function RiskChart() {
    return (
        <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                    dataKey="day"
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                />
                <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="risk"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#riskGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#818cf8', stroke: '#312e81', strokeWidth: 2 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}
