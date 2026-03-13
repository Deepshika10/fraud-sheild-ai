import { AlertTriangle, CheckCircle2, Clock, Info, ShieldCheck, KeyRound } from 'lucide-react'

/**
 * Reusable User Response Badge component.
 * Displays how a user responded to a fraud alert.
 */
export default function UserResponseBadge({ value }) {
    const cfg = {
        'Disputed': { cls: 'text-red-400 bg-red-500/10 border-red-500/25', icon: AlertTriangle },
        'OTP Verified': { cls: 'text-green-400 bg-green-500/10 border-green-500/25', icon: ShieldCheck },
        'Confirmed Legitimate': { cls: 'text-green-400 bg-green-500/10 border-green-500/25', icon: CheckCircle2 },
        'OTP Required': { cls: 'text-violet-400 bg-violet-500/10 border-violet-500/25', icon: KeyRound },
        'OTP Pending': { cls: 'text-amber-400 bg-amber-500/10 border-amber-500/25', icon: Clock },
        'No Response': { cls: 'text-slate-400 bg-slate-500/10 border-slate-500/25', icon: Clock },
    }[value] ?? { cls: 'text-slate-400 bg-slate-500/10 border-slate-500/25', icon: Info }

    const Icon = cfg.icon

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${cfg.cls}`}>
            <Icon size={10} /> {value}
        </span>
    )
}
