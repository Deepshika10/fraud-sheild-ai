const colorMap = {
    blue: { bg: 'bg-primary-500/10', border: 'border-primary-500/20', icon: 'text-primary-400', glow: 'shadow-glow-blue' },
    red: { bg: 'bg-danger-500/10', border: 'border-danger-500/20', icon: 'text-danger-400', glow: '' },
    purple: { bg: 'bg-accent-500/10', border: 'border-accent-500/20', icon: 'text-accent-400', glow: 'shadow-glow-purple' },
    green: { bg: 'bg-success-500/10', border: 'border-success-500/20', icon: 'text-success-400', glow: '' },
}

export default function MetricCard({ label, value, change, changeDir, icon: Icon, color, sub, delay = 0 }) {
    const c = colorMap[color] ?? colorMap.blue
    const isUp = changeDir === 'up'
    const isGood = (color === 'red' && !isUp) || (color !== 'red' && isUp)

    return (
        <div
            className="metric-card glass-card-hover animate-fade-in"
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background glow blob */}
            <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 ${c.bg}`} />

            <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${c.bg} border ${c.border}`}>
                    <Icon size={18} className={c.icon} />
                </div>
                <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isGood
                            ? 'bg-success-500/10 text-success-400 border border-success-500/20'
                            : 'bg-danger-500/10 text-danger-400 border border-danger-500/20'
                        }`}
                >
                    {isUp ? '↑' : '↓'} {change}
                </span>
            </div>

            <div>
                <p className="text-2xl font-bold text-white font-mono tracking-tight">{value}</p>
                <p className="text-xs font-medium text-slate-300 mt-0.5">{label}</p>
                <p className="text-[10px] text-slate-500 mt-1">{sub}</p>
            </div>
        </div>
    )
}
