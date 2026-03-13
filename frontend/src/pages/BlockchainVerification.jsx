import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
    ShieldCheck,
    ShieldAlert,
    Hash,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye,
} from 'lucide-react'
import { getHighRiskTransactions, verifyTransactionOnBlockchain } from '../services/blockchainService'

export default function BlockchainVerification() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState({})
    const [verificationResults, setVerificationResults] = useState({})
    const { searchQuery = '' } = useOutletContext()

    // Fetch transactions on mount
    useEffect(() => {
        loadTransactions()
    }, [])

    const loadTransactions = async () => {
        setLoading(true)
        const txns = await getHighRiskTransactions()
        setTransactions(txns)
        setLoading(false)
    }

    const handleVerify = async (transactionId) => {
        setVerifying((prev) => ({ ...prev, [transactionId]: true }))

        const result = await verifyTransactionOnBlockchain(transactionId)
        setVerificationResults((prev) => ({
            ...prev,
            [transactionId]: result,
        }))

        setVerifying((prev) => ({ ...prev, [transactionId]: false }))
    }

    // Filter transactions by search query
    const filteredTransactions = transactions.filter((tx) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            tx.transaction_id.toLowerCase().includes(searchLower) ||
            tx.risk_level.toLowerCase().includes(searchLower) ||
            String(tx.risk_score).includes(searchLower)
        )
    })

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Blockchain Verification</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                    Verify the cryptographic integrity of high-risk fraud verdicts on the blockchain.
                </p>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="glass-card p-12 flex items-center justify-center gap-3">
                    <Loader2 size={20} className="text-primary-400 animate-spin" />
                    <span className="text-slate-300">Loading high-risk transactions...</span>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredTransactions.length === 0 && (
                <div className="glass-card p-12 text-center">
                    <ShieldCheck size={48} className="mx-auto text-slate-500 mb-4 opacity-50" />
                    <p className="text-slate-300 font-medium">
                        {searchQuery ? `No transactions found for "${searchQuery}"` : 'No high-risk transactions to verify'}
                    </p>
                    <p className="text-slate-400 text-sm mt-2">
                        HIGH risk transactions with blockchain records will appear here.
                    </p>
                </div>
            )}

            {/* Transactions Table */}
            {!loading && filteredTransactions.length > 0 && (
                <div className="glass-card overflow-hidden">
                    {/* Table Header */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Transaction ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Risk Score
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Blockchain Hash
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {filteredTransactions.map((tx) => {
                                    const verification = verificationResults[tx.transaction_id]
                                    const isVerifying = verifying[tx.transaction_id]
                                    const isVerified = verification?.status === 'VERIFIED'
                                    const isTampered = verification?.status === 'TAMPERED'
                                    const notLogged = verification?.status === 'NOT_LOGGED'

                                    const blockchainHash = verification?.blockchain_hash ||
                                        tx.blockchain_record?.transaction_hash ||
                                        tx.blockchain_log?.transaction_hash

                                    return (
                                        <tr
                                            key={tx.transaction_id}
                                            className="hover:bg-white/5 transition-colors"
                                        >
                                            {/* Transaction ID */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Hash size={14} className="text-slate-500" />
                                                    <span className="font-mono text-sm text-slate-200" title={tx.transaction_id}>
                                                        {tx.transaction_id.slice(0, 16)}...
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Risk Score */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-red-400">
                                                        {tx.risk_score?.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-slate-400">(HIGH)</span>
                                                </div>
                                            </td>

                                            {/* Blockchain Hash */}
                                            <td className="px-6 py-4">
                                                {blockchainHash ? (
                                                    <span
                                                        className="font-mono text-xs text-slate-300 cursor-help"
                                                        title={blockchainHash}
                                                    >
                                                        {blockchainHash.slice(0, 20)}...
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-500">Not available</span>
                                                )}
                                            </td>

                                            {/* Verification Status */}
                                            <td className="px-6 py-4">
                                                {isVerifying ? (
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 size={14} className="text-primary-400 animate-spin" />
                                                        <span className="text-xs text-primary-400">Verifying...</span>
                                                    </div>
                                                ) : isVerified ? (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 size={14} className="text-success-400" />
                                                        <span className="text-xs font-semibold text-success-400">
                                                            Blockchain Verified
                                                        </span>
                                                    </div>
                                                ) : isTampered ? (
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle size={14} className="text-red-400" />
                                                        <span className="text-xs font-semibold text-red-400">
                                                            Data Tampered
                                                        </span>
                                                    </div>
                                                ) : notLogged ? (
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck size={14} className="text-slate-500" />
                                                        <span className="text-xs font-semibold text-slate-400">
                                                            Not Logged
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-500">Pending verification</span>
                                                )}
                                            </td>

                                            {/* Action Button */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleVerify(tx.transaction_id)}
                                                    disabled={isVerifying}
                                                    className={`
                                        inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold
                                        uppercase tracking-wider transition-all
                                        ${isVerifying
                                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                            : isVerified
                                                ? 'bg-success-600/20 text-success-400 border border-success-500/30 hover:bg-success-600/30'
                                                : isTampered
                                                    ? 'bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30'
                                                    : 'bg-primary-600/20 text-primary-400 border border-primary-500/30 hover:bg-primary-600/30'
                                        }
                                    `}
                                                >
                                                    {isVerifying ? (
                                                        <>
                                                            <Loader2 size={12} className="animate-spin" />
                                                            Verifying
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Eye size={12} />
                                                            Verify
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Verification Details Modal (if any transaction verified) */}
            {Object.values(verificationResults).some((r) => r && r.status !== 'NOT_LOGGED') && (
                <div className="glass-card p-6 space-y-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-primary-400" />
                        Verification Details
                    </h2>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {Object.entries(verificationResults)
                            .filter(([_, result]) => result && result.status !== 'NOT_LOGGED')
                            .map(([txId, result]) => (
                                <div
                                    key={txId}
                                    className={`
                        p-4 rounded-lg border
                        ${result.status === 'VERIFIED'
                            ? 'bg-success-500/10 border-success-500/20'
                            : result.status === 'TAMPERED'
                                ? 'bg-red-500/10 border-red-500/20'
                                : 'bg-slate-500/10 border-slate-500/20'
                        }
                    `}
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {result.status === 'VERIFIED' ? (
                                                <CheckCircle2 size={16} className="text-success-400 shrink-0" />
                                            ) : result.status === 'TAMPERED' ? (
                                                <AlertCircle size={16} className="text-red-400 shrink-0" />
                                            ) : null}
                                            <span className="font-mono text-xs text-slate-300 truncate">
                                                {txId.slice(0, 20)}...
                                            </span>
                                        </div>
                                        <span
                                            className={`
                            text-xs font-bold uppercase tracking-wider whitespace-nowrap
                            ${result.status === 'VERIFIED' ? 'text-success-400' : 'text-red-400'}
                        `}
                                        >
                                            {result.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                                        <div>
                                            <p className="text-slate-500 mb-1">Local Hash</p>
                                            <p
                                                className="font-mono text-slate-300 truncate"
                                                title={result.local_hash}
                                            >
                                                {result.local_hash?.slice(0, 24)}...
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 mb-1">Blockchain Hash</p>
                                            <p
                                                className="font-mono text-slate-300 truncate"
                                                title={result.blockchain_hash}
                                            >
                                                {result.blockchain_hash?.slice(0, 24)}...
                                            </p>
                                        </div>
                                    </div>

                                    {result.timestamp && (
                                        <p className="text-[10px] text-slate-500 mt-2">
                                            {new Date(result.timestamp).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}
