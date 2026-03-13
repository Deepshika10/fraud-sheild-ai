import { useEffect, useState } from 'react'
import {
    ShieldAlert,
    AlertTriangle,
    DollarSign,
    TrendingUp,
    CheckCircle2,
    Flag,
    X,
    Siren,
} from 'lucide-react'

/**
 * FraudAlertPanel
 *
 * Props:
 *   open              {boolean}    whether the panel is visible
 *   amount            {string|number}
 *   riskScore         {number}
 *   reasons           {string[]}
 *   txId              {string}
 *   onConfirm         {() => void} called when user confirms the transaction
 *   onReportFraud     {() => void} called when user reports fraud
 *   onClose           {() => void} called when the backdrop / X is clicked
 */
export default function FraudAlertPanel({
    open,
    amount,
    riskScore,
    reasons = [],
    txId,
    onConfirm,
    onReportFraud,
    onClose,
}) {
    // Animate in/out
    const [visible, setVisible] = useState(false)
    const [confirmed, setConfirmed] = useState(null) // 'confirm' | 'report' | null

    useEffect(() => {
        if (open) {
            setConfirmed(null)
            // tiny delay so CSS transition fires after mount
            const t = setTimeout(() => setVisible(true), 20)
            return () => clearTimeout(t)
        } else {
            setVisible(false)
        }
    }, [open])

    if (!open) return null

    const handleConfirm = () => {
        setConfirmed('confirm')
        setTimeout(() => onConfirm?.(), 900)
    }

    const handleReport = () => {
        setConfirmed('report')
        setTimeout(() => onReportFraud?.(), 900)
    }

    return (
        /* ── Backdrop ── */
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: 'rgba(0,0,0,0.72)',
                backdropFilter: 'blur(6px)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.25s ease',
            }}
            onClick={e => e.target === e.currentTarget && onClose?.()}
        >
            {/* ── Panel ── */}
            <div
                className="relative w-full max-w-lg rounded-2xl border border-red-500/30 overflow-hidden"
                style={{
                    background: 'linear-gradient(160deg, rgba(23,8,8,0.98) 0%, rgba(15,5,5,0.98) 100%)',
                    boxShadow: '0 0 0 1px rgba(239,68,68,0.15) inset, 0 8px 48px rgba(239,68,68,0.2), 0 32px 64px rgba(0,0,0,0.6)',
                    transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
                    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                }}
            >
                {/* Top red glow strip */}
                <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.8), transparent)' }}
                />
                {/* Ambient red glow top-left */}
                <div
                    className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)' }}
                />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-all"
                >
                    <X size={16} />
                </button>

                {/* ── Header ── */}
                <div className="px-6 pt-6 pb-5 border-b border-red-500/15">
                    <div className="flex items-center gap-3 mb-1">
                        {/* Pulsing icon */}
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
                            <div className="relative p-2.5 rounded-full bg-red-500/15 border border-red-500/40">
                                <Siren size={20} className="text-red-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-base font-extrabold text-red-400 tracking-tight">
                                Suspicious Transaction Detected
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Immediate review required — do not proceed without verification
                            </p>
                        </div>
                    </div>

                    {txId && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                            <AlertTriangle size={10} className="text-red-400" />
                            <span className="text-[10px] font-mono text-red-400">{txId}</span>
                        </div>
                    )}
                </div>

                {/* ── Stats row ── */}
                <div className="grid grid-cols-2 divide-x divide-white/8 border-b border-red-500/15">
                    <div className="flex flex-col items-center py-4 gap-0.5">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <DollarSign size={12} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Amount</span>
                        </div>
                        <span className="text-2xl font-extrabold font-mono text-white">
                            ${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex flex-col items-center py-4 gap-0.5">
                        <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                            <TrendingUp size={12} />
                            <span className="text-[10px] font-semibold uppercase tracking-widest">Risk Score</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold font-mono text-red-400">{riskScore}</span>
                            <span className="text-slate-500 text-sm">/100</span>
                        </div>
                        {/* Mini score bar */}
                        <div className="w-24 h-1.5 bg-white/8 rounded-full overflow-hidden mt-1.5">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600"
                                style={{ width: `${riskScore}%`, boxShadow: '0 0 6px rgba(239,68,68,0.6)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* ── Fraud reasons ── */}
                <div className="px-6 py-4 space-y-2 border-b border-red-500/15 max-h-44 overflow-y-auto">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                        Fraud Indicators
                    </p>
                    {reasons.map((reason, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2.5 text-sm"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <AlertTriangle size={13} className="text-red-400 mt-0.5 shrink-0" />
                            <span className="text-slate-300 leading-relaxed">{reason}</span>
                        </div>
                    ))}
                </div>

                {/* ── Action buttons ── */}
                <div className="px-6 py-5 space-y-3">
                    {confirmed === null && (
                        <>
                            {/* Report Fraud — primary destructive */}
                            <button
                                onClick={handleReport}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200"
                                style={{
                                    background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                                    boxShadow: '0 0 0 1px rgba(239,68,68,0.4) inset, 0 4px 20px rgba(239,68,68,0.3)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(239,68,68,0.6) inset, 0 4px 28px rgba(239,68,68,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(239,68,68,0.4) inset, 0 4px 20px rgba(239,68,68,0.3)'}
                            >
                                <Flag size={15} />
                                Report Fraud
                            </button>

                            {/* Confirm Transaction — secondary ghost */}
                            <button
                                onClick={handleConfirm}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-slate-300 border border-white/12 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-200"
                            >
                                <CheckCircle2 size={15} />
                                Confirm Transaction
                            </button>

                            <p className="text-center text-[10px] text-slate-600 pt-1">
                                All actions are logged and auditable · FraudShield-AI v2.1
                            </p>
                        </>
                    )}

                    {/* Confirmed state */}
                    {confirmed === 'report' && (
                        <div className="flex flex-col items-center gap-2 py-2 animate-fade-in">
                            <div className="p-3 rounded-full bg-red-500/15 border border-red-500/30">
                                <Flag size={22} className="text-red-400" />
                            </div>
                            <p className="text-sm font-bold text-red-400">Fraud Report Submitted</p>
                            <p className="text-xs text-slate-500 text-center">
                                This transaction has been escalated to the security team.
                            </p>
                        </div>
                    )}

                    {confirmed === 'confirm' && (
                        <div className="flex flex-col items-center gap-2 py-2 animate-fade-in">
                            <div className="p-3 rounded-full bg-green-500/12 border border-green-500/25">
                                <CheckCircle2 size={22} className="text-green-400" />
                            </div>
                            <p className="text-sm font-bold text-green-400">Transaction Confirmed</p>
                            <p className="text-xs text-slate-500 text-center">
                                Transaction approved — proceeding with authorisation.
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom red glow strip */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)' }}
                />
            </div>
        </div>
    )
}
