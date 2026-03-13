import { useEffect, useRef, useState } from 'react'
import {
    ShieldCheck,
    AlertTriangle,
    ShieldAlert,
    CheckCircle2,
    Sparkles,
    Info,
    TrendingUp,
} from 'lucide-react'

// ─── Risk level configuration ─────────────────────────────────────────────────
const RISK_CONFIG = {
    Low: {
        label: 'Low Risk',
        trackColor: '#22c55e',           // green-500
        glowColor: 'rgba(34,197,94,0.4)',
        gradientStart: '#4ade80',        // green-400
        gradientEnd: '#16a34a',          // green-700
        badgeBg: 'bg-green-500/15',
        badgeBorder: 'border-green-500/40',
        badgeText: 'text-green-400',
        cardBorder: 'border-green-500/25',
        cardBg: 'bg-green-500/5',
        textColor: 'text-green-400',
        bulletIcon: CheckCircle2,
        bulletColor: 'text-green-400',
        Icon: ShieldCheck,
        iconBg: 'bg-green-500/15',
        iconBorder: 'border-green-500/30',
        explanationTitle: 'Why this looks safe',
    },
    Medium: {
        label: 'Medium Risk',
        trackColor: '#eab308',           // yellow-500
        glowColor: 'rgba(234,179,8,0.4)',
        gradientStart: '#facc15',        // yellow-400
        gradientEnd: '#ca8a04',          // yellow-600
        badgeBg: 'bg-yellow-400/15',
        badgeBorder: 'border-yellow-400/40',
        badgeText: 'text-yellow-300',
        cardBorder: 'border-yellow-400/25',
        cardBg: 'bg-yellow-400/5',
        textColor: 'text-yellow-400',
        bulletIcon: AlertTriangle,
        bulletColor: 'text-yellow-400',
        Icon: AlertTriangle,
        iconBg: 'bg-yellow-400/15',
        iconBorder: 'border-yellow-400/30',
        explanationTitle: 'Indicators of concern',
    },
    High: {
        label: 'High Risk',
        trackColor: '#ef4444',           // red-500
        glowColor: 'rgba(239,68,68,0.4)',
        gradientStart: '#f87171',        // red-400
        gradientEnd: '#b91c1c',          // red-700
        badgeBg: 'bg-red-500/15',
        badgeBorder: 'border-red-500/40',
        badgeText: 'text-red-400',
        cardBorder: 'border-red-500/25',
        cardBg: 'bg-red-500/5',
        textColor: 'text-red-400',
        bulletIcon: ShieldAlert,
        bulletColor: 'text-red-400',
        Icon: ShieldAlert,
        iconBg: 'bg-red-500/15',
        iconBorder: 'border-red-500/30',
        explanationTitle: 'Fraud signals detected',
    },
}

// ─── Circular gauge (SVG) ─────────────────────────────────────────────────────
function CircularGauge({ score, config, animate }) {
    const SIZE = 180
    const STROKE = 14
    const RADIUS = (SIZE - STROKE) / 2
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS
    // The arc covers 270° (from 135° to 405°), leaving a 90° gap at the bottom
    const ARC_RATIO = 0.75
    const ARC_LENGTH = CIRCUMFERENCE * ARC_RATIO
    const GAP_LENGTH = CIRCUMFERENCE * (1 - ARC_RATIO)

    // offset so the arc starts at bottom-left (135° = 7-o-clock position)
    const dashOffset = ARC_LENGTH - (animate ? (score / 100) * ARC_LENGTH : 0)

    const gaugeId = `gauge-grad-${score}`

    return (
        <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
            <svg
                width={SIZE}
                height={SIZE}
                viewBox={`0 0 ${SIZE} ${SIZE}`}
                style={{ transform: 'rotate(135deg)' }}
            >
                <defs>
                    <linearGradient id={gaugeId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={config.gradientStart} />
                        <stop offset="100%" stopColor={config.gradientEnd} />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id="gauge-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Track (background arc) */}
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={STROKE}
                    strokeDasharray={`${ARC_LENGTH} ${GAP_LENGTH}`}
                    strokeLinecap="round"
                />

                {/* Filled arc */}
                <circle
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={RADIUS}
                    fill="none"
                    stroke={`url(#${gaugeId})`}
                    strokeWidth={STROKE}
                    strokeDasharray={`${ARC_LENGTH} ${GAP_LENGTH}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    filter="url(#gauge-glow)"
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
                />
            </svg>

            {/* Centre content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                    className="text-4xl font-extrabold font-mono leading-none"
                    style={{ color: config.trackColor }}
                >
                    {animate ? score : 0}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 font-semibold uppercase tracking-widest">
                    Risk Score
                </span>
            </div>
        </div>
    )
}

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * RiskResultCard
 *
 * Props:
 *   riskScore   {number}   0–100
 *   riskLevel   {'Low'|'Medium'|'High'}
 *   reasons     {string[]} bullet-point reasons
 *   txId        {string}   optional transaction reference
 *   timestamp   {string}   optional analysis timestamp
 */
export default function RiskResultCard({
    riskScore = 0,
    riskLevel = 'Low',
    reasons = [],
    txId,
    timestamp,
}) {
    const [animated, setAnimated] = useState(false)
    const cfg = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.Low
    const RiskIcon = cfg.Icon
    const BulletIcon = cfg.bulletIcon

    // Trigger gauge animation on mount
    useEffect(() => {
        const t = requestAnimationFrame(() => setAnimated(true))
        return () => cancelAnimationFrame(t)
    }, [riskScore])

    return (
        <div
            className={`
        glass-card border ${cfg.cardBorder} ${cfg.cardBg}
        p-6 space-y-6 animate-fade-in
      `}
            style={{ boxShadow: `0 4px 32px ${cfg.glowColor.replace('0.4', '0.12')}, 0 0 0 1px rgba(255,255,255,0.04) inset` }}
        >
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${cfg.iconBg} ${cfg.iconBorder}`}>
                        <RiskIcon size={20} className={cfg.textColor} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Risk Assessment Result</p>
                        {txId && (
                            <p className="text-[11px] font-mono text-slate-500 mt-0.5">{txId}</p>
                        )}
                    </div>
                </div>

                {/* Risk level badge */}
                <span
                    className={`
            flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
            border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}
          `}
                >
                    <TrendingUp size={11} />
                    {cfg.label}
                </span>
            </div>

            {/* ── Circular gauge + score details ── */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Gauge */}
                <div className="shrink-0">
                    <CircularGauge score={riskScore} config={cfg} animate={animated} />
                </div>

                {/* Score breakdown */}
                <div className="flex-1 space-y-4 w-full">
                    {/* Horizontal bar */}
                    <div>
                        <div className="flex justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
                            <span>0 · Safe</span>
                            <span>50 · Moderate</span>
                            <span>100 · Critical</span>
                        </div>
                        <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                    width: animated ? `${riskScore}%` : '0%',
                                    background: `linear-gradient(90deg, ${cfg.gradientStart}, ${cfg.gradientEnd})`,
                                    boxShadow: `0 0 10px ${cfg.glowColor}`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Stat pills */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Score', value: `${riskScore}/100` },
                            { label: 'Level', value: riskLevel },
                            { label: 'Flags', value: reasons.length },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-white/5 border border-white/8"
                            >
                                <span className={`text-base font-extrabold font-mono ${cfg.textColor}`}>
                                    {value}
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── AI Explanation ── */}
            <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-white/8">
                    <Sparkles size={13} className="text-indigo-400" />
                    <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                        AI Explanation
                    </h3>
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-500">
                        <Info size={10} />
                        {cfg.explanationTitle}
                    </span>
                </div>

                {reasons.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No explanation available.</p>
                ) : (
                    <ul className="space-y-2.5">
                        {reasons.map((reason, i) => (
                            <li
                                key={i}
                                className="flex items-start gap-2.5 text-sm leading-relaxed"
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                <BulletIcon
                                    size={15}
                                    className={`${cfg.bulletColor} mt-0.5 shrink-0`}
                                />
                                <span className="text-slate-300">{reason}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* ── Footer ── */}
            {timestamp && (
                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-white/6">
                    <span>
                        Analyzed at{' '}
                        <span className="text-slate-500 font-mono">{timestamp}</span>
                    </span>
                    <span>
                        Model:{' '}
                        <span className="text-indigo-400 font-semibold">FraudShield-AI v2.1</span>
                    </span>
                </div>
            )}
        </div>
    )
}
