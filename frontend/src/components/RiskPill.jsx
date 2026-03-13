import { TrendingUp } from 'lucide-react'

/**
 * Reusable Risk Pill component.
 * Displays a color-coded score based on risk levels.
 */
export default function RiskPill({ score }) {
    const [color, bg, border] =
        score >= 80 ? ['text-red-400', 'bg-red-500/12', 'border-red-500/30'] :
            score >= 60 ? ['text-yellow-400', 'bg-yellow-400/12', 'border-yellow-400/30'] :
                ['text-green-400', 'bg-green-500/12', 'border-green-500/30']

    return (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-mono font-bold text-xs ${color} ${bg} ${border}`}>
            <TrendingUp size={10} />
            {score}
        </div>
    )
}
