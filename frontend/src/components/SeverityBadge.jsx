/**
 * Reusable Severity Badge component for alerts.
 */
export default function SeverityBadge({ severity }) {
    const sevMap = {
        Critical: 'bg-danger-500/15 text-danger-400 border-danger-500/30',
        High: 'bg-warning-400/15 text-warning-400 border-warning-400/30',
        Medium: 'bg-primary-500/15 text-primary-300 border-primary-500/30',
        Low: 'bg-success-500/15 text-success-400 border-success-500/30',
    }

    return (
        <span className={`status-badge border text-[10px] sm:text-xs ${sevMap[severity] || ''}`}>
            {severity}
        </span>
    )
}
