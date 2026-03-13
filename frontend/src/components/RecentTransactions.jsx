const transactions = [
    { id: 'TXN-009841', amount: '$4,200.00', risk: 87, status: 'Fraudulent', merchant: 'Online Store XYZ', method: 'Card' },
    { id: 'TXN-009840', amount: '$132.50', risk: 12, status: 'Approved', merchant: 'Starbucks Coffee', method: 'NFC' },
    { id: 'TXN-009839', amount: '$8,950.00', risk: 72, status: 'Under Review', merchant: 'Travel Agency Pro', method: 'Wire' },
    { id: 'TXN-009838', amount: '$29.99', risk: 4, status: 'Approved', merchant: 'Netflix Inc.', method: 'Card' },
    { id: 'TXN-009837', amount: '$1,750.00', risk: 55, status: 'Under Review', merchant: 'Electronics Hub', method: 'Card' },
    { id: 'TXN-009836', amount: '$340.00', risk: 23, status: 'Approved', merchant: 'Grocery Market', method: 'NFC' },
    { id: 'TXN-009835', amount: '$12,400.00', risk: 94, status: 'Fraudulent', merchant: 'Unknown Merchant', method: 'Wire' },
    { id: 'TXN-009834', amount: '$65.00', risk: 8, status: 'Approved', merchant: 'Uber Eats', method: 'Card' },
    { id: 'TXN-009833', amount: '$3,200.00', risk: 61, status: 'Under Review', merchant: 'Luxury Goods Ltd.', method: 'Card' },
    { id: 'TXN-009832', amount: '$19.99', risk: 3, status: 'Approved', merchant: 'Spotify AB', method: 'Card' },
]

const statusConfig = {
    'Approved': { cls: 'bg-success-500/15 text-success-400 border-success-500/25', dot: 'bg-success-400' },
    'Fraudulent': { cls: 'bg-danger-500/15 text-danger-400 border-danger-500/25', dot: 'bg-danger-400' },
    'Under Review': { cls: 'bg-warning-400/15 text-warning-400 border-warning-400/25', dot: 'bg-warning-400' },
}

function RiskBar({ score }) {
    const color = score >= 70 ? 'bg-danger-500' : score >= 40 ? 'bg-warning-400' : 'bg-success-400'
    return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
            </div>
            <span className={`font-mono text-xs font-semibold ${score >= 70 ? 'text-danger-400' : score >= 40 ? 'text-warning-400' : 'text-success-400'
                }`}>{score}</span>
        </div>
    )
}

export default function RecentTransactions() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-white/8">
                        {['Transaction ID', 'Amount', 'Risk Score', 'Merchant', 'Method', 'Status'].map(h => (
                            <th key={h} className="text-left py-2.5 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx, i) => {
                        const sc = statusConfig[tx.status]
                        return (
                            <tr key={tx.id} className="table-row-hover border-b border-white/5 last:border-0 cursor-pointer">
                                <td className="py-3 px-3">
                                    <span className="font-mono text-xs text-primary-300 font-semibold">{tx.id}</span>
                                </td>
                                <td className="py-3 px-3">
                                    <span className="font-mono text-sm text-white font-semibold">{tx.amount}</span>
                                </td>
                                <td className="py-3 px-3">
                                    <RiskBar score={tx.risk} />
                                </td>
                                <td className="py-3 px-3">
                                    <span className="text-slate-300 text-xs truncate max-w-[150px] block">{tx.merchant}</span>
                                </td>
                                <td className="py-3 px-3">
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/8">{tx.method}</span>
                                </td>
                                <td className="py-3 px-3">
                                    <span className={`status-badge border ${sc.cls} flex items-center gap-1.5 w-fit`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} inline-block`} />
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
