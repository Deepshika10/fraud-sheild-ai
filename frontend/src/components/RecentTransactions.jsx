import { useEffect, useState } from 'react'
import { apiClient } from '../services/apiClient'

const statusConfig = {
    'Approved': { cls: 'bg-success-500/15 text-success-400 border-success-500/25', dot: 'bg-success-400' },
    'Fraudulent': { cls: 'bg-danger-500/15 text-danger-400 border-danger-500/25', dot: 'bg-danger-400' },
    'Under Review': { cls: 'bg-warning-400/15 text-warning-400 border-warning-400/25', dot: 'bg-warning-400' },
}

function toUiStatus(status) {
    if (status === 'APPROVED') {
        return 'Approved'
    }
    if (status === 'BLOCKED') {
        return 'Fraudulent'
    }
    return 'Under Review'
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

export default function RecentTransactions({ searchQuery = '' }) {
    const [transactions, setTransactions] = useState([])

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiClient.get('/transactions')
                const mapped = Object.values(data)
                    .map(tx => ({
                        id: tx.transaction_id,
                        amount: Number(tx.features?.amount || 0),
                        risk: Math.round(Number(tx.risk_score || 0) * 100),
                        status: toUiStatus(tx.status),
                        merchant: tx.features?.merchant || 'Unknown Merchant',
                        method: 'Card',
                    }))
                    .slice(-10)
                    .reverse()
                setTransactions(mapped)
            } catch (error) {
                console.error('Failed to load recent transactions:', error)
            }
        }
        load()
    }, [])

    const normalizedQuery = searchQuery.trim().toLowerCase()
    const displayedTransactions = normalizedQuery
        ? transactions.filter((tx) =>
            [tx.id, tx.merchant, tx.method, tx.status].some((value) =>
                String(value).toLowerCase().includes(normalizedQuery)
            )
        )
        : transactions

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
                    {displayedTransactions.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-12 px-3 text-center text-slate-500 text-sm">
                                {normalizedQuery
                                    ? `No transactions found for "${searchQuery}"`
                                    : 'No transactions available yet'}
                            </td>
                        </tr>
                    ) : displayedTransactions.map((tx) => {
                        const sc = statusConfig[tx.status]
                        return (
                            <tr key={tx.id} className="table-row-hover border-b border-white/5 last:border-0 cursor-pointer">
                                <td className="py-3 px-3">
                                    <span className="font-mono text-xs text-primary-300 font-semibold">{tx.id}</span>
                                </td>
                                <td className="py-3 px-3">
                                    <span className="font-mono text-sm text-white font-semibold">${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
