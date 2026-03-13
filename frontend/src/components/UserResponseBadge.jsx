import { AlertTriangle, CheckCircle2, Clock, Info } from 'lucide-react'

/**
 * Reusable User Response Badge component.
 * Displays how a user responded to a fraud alert.
 */
export default function UserResponseBadge({ value }) {
    const cfg = {
        'Disputed': { cls: 'text-red-400 bg-red-500/10 border-red-500/25', icon: AlertTriangle },
        'Confirmed Legitimate': { cls: 'text-green-400 bg-green-500/10 border-green-500/25', icon: CheckCircle2 },
        'No Response': { cls: 'text-slate-400 bg-slate-500/10 border-slate-500/25', icon: Clock },
    }[value] ?? { cls: 'text-slate-400 bg-slate-500/10 border-slate-500/25', icon: Info }

    const Icon = cfg.icon

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${cfg.cls}`}>
            <Icon size={10} /> {value}
        </span>
    )
}
