import { Clock, CheckCircle2, XCircle } from 'lucide-react'

/**
 * Reusable Status Badge component.
 * Displays the current status of a transaction with an icon and specific coloring.
 */
export default function StatusBadge({ status }) {
    const map = {
        Pending: { cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25', icon: Clock },
        Approved: { cls: 'text-green-400 bg-green-500/10 border-green-500/25', icon: CheckCircle2 },
        Rejected: { cls: 'text-red-400 bg-red-500/10 border-red-500/25', icon: XCircle },
    }
    const { cls, icon: Icon } = map[status] ?? map.Pending
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${cls}`}>
            <Icon size={11} /> {status}
        </span>
    )
}
