import { useState, useEffect } from 'react'
import {
    Building2,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    TrendingUp,
    ShieldAlert,
    CheckCheck,
    X,
    Info,
    Filter,
    RefreshCw,
} from 'lucide-react'

// Reusable Components
import RiskPill from '../components/RiskPill'
import StatusBadge from '../components/StatusBadge'
import UserResponseBadge from '../components/UserResponseBadge'

// Services
import { getFlaggedTransactions, updateTransactionStatus } from '../services/transactionService'

// ─── Toast queue component ─────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
    useEffect(() => {
        const t = setTimeout(() => onDismiss(toast.id), 4000)
        return () => clearTimeout(t)
    }, [toast.id, onDismiss])

    const isApproved = toast.decision === 'Approved'
    return (
        <div
            className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm animate-fade-in
        ${isApproved
                    ? 'bg-green-500/12 border-green-500/30 text-green-300'
                    : 'bg-red-500/12 border-red-500/30 text-red-300'}
      `}
            style={{ boxShadow: isApproved ? '0 4px 20px rgba(34,197,94,0.15)' : '0 4px 20px rgba(239,68,68,0.15)' }}
        >
            {isApproved
                ? <CheckCheck size={16} className="text-green-400 mt-0.5 shrink-0" />
                : <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />}
            <div className="flex-1 min-w-0">
                <p className="font-semibold">
                    {isApproved ? 'Transaction Approved' : 'Transaction Rejected'}
                </p>
                <p className="text-[11px] opacity-75 mt-0.5 font-mono">{toast.txId} has been processed.</p>
            </div>
            <button onClick={() => onDismiss(toast.id)} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
                <X size={13} />
            </button>
        </div>
    )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function BankApproval() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [toasts, setToasts] = useState([])
    const [filter, setFilter] = useState('All')
    const [confirmingId, setConfirmingId] = useState(null) // id being decided right now

    // Load transactions on mount
    useEffect(() => {
        loadTransactions()
    }, [])

    const loadTransactions = async () => {
        setLoading(true)
        try {
            const data = await getFlaggedTransactions()
            setTransactions(data)
        } catch (error) {
            console.error("Failed to load transactions:", error)
        } finally {
            setLoading(false)
        }
    }

    const dismissToast = (id) => setToasts(ts => ts.filter(t => t.id !== id))

    const handleDecision = async (txId, decision) => {
        setConfirmingId(txId)
        try {
            const success = await updateTransactionStatus(txId, decision)
            if (success) {
                setTransactions(txs =>
                    txs.map(t => t.id === txId ? { ...t, status: decision } : t)
                )
                setToasts(ts => [
                    { id: Date.now(), txId, decision },
                    ...ts,
                ])
            }
        } catch (error) {
            console.error("Failed to update status:", error)
        } finally {
            setConfirmingId(null)
        }
    }

    const handleReset = () => {
        loadTransactions()
        setToasts([])
        setFilter('All')
    }

    const counts = {
        Pending: transactions.filter(t => t.status === 'Pending').length,
        Approved: transactions.filter(t => t.status === 'Approved').length,
        Rejected: transactions.filter(t => t.status === 'Rejected').length,
    }

    const displayed = filter === 'All' ? transactions : transactions.filter(t => t.status === filter)

    return (
        <div className="space-y-5 animate-fade-in">

            {/* ── Toast stack ── */}
            {toasts.length > 0 && (
                <div className="fixed top-5 right-5 z-50 space-y-2 w-80">
                    {toasts.map(t => (
                        <Toast key={t.id} toast={t} onDismiss={dismissToast} />
                    ))}
                </div>
            )}

            {/* ── Page header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-white">Bank Approval Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {counts.Pending} flagged transaction{counts.Pending !== 1 ? 's' : ''} awaiting a decision
                    </p>
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl border border-white/10 bg-white/4 hover:bg-white/8 transition-all"
                >
                    <RefreshCw size={12} /> Reset
                </button>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Pending Review', key: 'Pending', color: 'text-yellow-400', glow: 'rgba(234,179,8,0.15)', border: 'border-yellow-400/20' },
                    { label: 'Approved', key: 'Approved', color: 'text-green-400', glow: 'rgba(34,197,94,0.15)', border: 'border-green-500/20' },
                    { label: 'Rejected', key: 'Rejected', color: 'text-red-400', glow: 'rgba(239,68,68,0.15)', border: 'border-red-500/20' },
                ].map(({ label, key, color, glow, border }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(f => f === key ? 'All' : key)}
                        className={`glass-card p-4 text-center cursor-pointer transition-all hover:scale-[1.02] border ${filter === key ? border : 'border-white/8'
                            }`}
                        style={{ boxShadow: filter === key ? `0 0 20px ${glow}` : undefined }}
                    >
                        <p className={`text-3xl font-extrabold font-mono ${color}`}>{counts[key]}</p>
                        <p className="text-xs text-slate-400 mt-1.5">{label}</p>
                        {filter === key && (
                            <p className="text-[10px] text-slate-500 mt-1">Click to clear filter</p>
                        )}
                    </button>
                ))}
            </div>

            {/* ── Table card ── */}
            <div className="glass-card overflow-hidden min-h-[400px]">
                {/* Table header bar */}
                <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-primary-400" />
                        <h2 className="text-sm font-semibold text-white">Flagged Transactions</h2>
                        {filter !== 'All' && (
                            <span className="text-[10px] text-slate-400 bg-white/6 border border-white/10 px-2 py-0.5 rounded-full">
                                Showing: {filter}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Filter size={11} />
                        Click a stat card to filter
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/6">
                                {[
                                    'Transaction ID',
                                    'Amount',
                                    'Risk Score',
                                    'User Response',
                                    'Fraud Reason',
                                    'Status',
                                    'Actions',
                                ].map(h => (
                                    <th
                                        key={h}
                                        className="text-left py-3 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-slate-500 text-sm">
                                        <div className="flex flex-col items-center gap-3">
                                            <RefreshCw size={24} className="text-primary-400 animate-spin" />
                                            <span>Loading transactions...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : displayed.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-slate-500 text-sm">
                                        No transactions match the current filter.
                                    </td>
                                </tr>
                            ) : (
                                displayed.map(tx => {
                                    const deciding = confirmingId === tx.id
                                    return (
                                        <tr
                                            key={tx.id}
                                            className={`
                        border-b border-white/5 last:border-0 transition-colors duration-150
                        ${deciding ? 'bg-white/5' : 'hover:bg-white/4'}
                        ${tx.status === 'Approved' ? 'opacity-60' : ''}
                        ${tx.status === 'Rejected' ? 'opacity-50' : ''}
                      `}
                                        >
                                            {/* Transaction ID */}
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono text-xs text-primary-300 font-medium">{tx.id}</span>
                                            </td>

                                            {/* Amount */}
                                            <td className="py-3.5 px-4">
                                                <span className="font-mono text-sm font-bold text-white">
                                                    ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>

                                            {/* Risk Score */}
                                            <td className="py-3.5 px-4">
                                                <RiskPill score={tx.riskScore} />
                                            </td>

                                            {/* User Response */}
                                            <td className="py-3.5 px-4">
                                                <UserResponseBadge value={tx.userResponse} />
                                            </td>

                                            {/* Fraud Reason */}
                                            <td className="py-3.5 px-4 max-w-[220px]">
                                                <span className="text-xs text-slate-400 leading-relaxed line-clamp-2" title={tx.fraudReason}>
                                                    {tx.fraudReason}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                <StatusBadge status={tx.status} />
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4">
                                                {tx.status === 'Pending' ? (
                                                    <div className="flex items-center gap-2">
                                                        {/* Approve */}
                                                        <button
                                                            onClick={() => handleDecision(tx.id, 'Approved')}
                                                            disabled={deciding}
                                                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
                                bg-green-500/10 text-green-400 border-green-500/30
                                hover:bg-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_12px_rgba(34,197,94,0.25)]
                                disabled:opacity-40 disabled:cursor-not-allowed
                              `}
                                                        >
                                                            {deciding ? (
                                                                <span className="w-3 h-3 border border-green-400/40 border-t-green-400 rounded-full animate-spin" />
                                                            ) : (
                                                                <CheckCircle2 size={12} />
                                                            )}
                                                            Approve
                                                        </button>

                                                        {/* Reject */}
                                                        <button
                                                            onClick={() => handleDecision(tx.id, 'Rejected')}
                                                            disabled={deciding}
                                                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
                                bg-red-500/10 text-red-400 border-red-500/30
                                hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_12px_rgba(239,68,68,0.25)]
                                disabled:opacity-40 disabled:cursor-not-allowed
                              `}
                                                        >
                                                            {deciding ? (
                                                                <span className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                                                            ) : (
                                                                <XCircle size={12} />
                                                            )}
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-slate-600 italic">— Processed —</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table footer */}
                <div className="px-5 py-3 border-t border-white/6 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{displayed.length} of {transactions.length} transactions shown</span>
                    <span>
                        All decisions are logged ·{' '}
                        <span className="text-primary-400 font-semibold">FraudShield-AI v2.1</span>
                    </span>
                </div>
            </div>
        </div>
    )
}
