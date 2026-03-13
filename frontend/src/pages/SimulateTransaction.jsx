import { useState } from 'react'
import {
    Zap,
    User,
    DollarSign,
    MapPin,
    Smartphone,
    Store,
    Clock,
    Siren,
    KeyRound,
} from 'lucide-react'
import RiskResultCard from '../components/RiskResultCard'
import FraudAlertPanel from '../components/FraudAlertPanel'
import GoogleAuthenticatorModal from '../components/GoogleAuthenticatorModal'
import { simulateAnalysisApi } from '../services/riskService'
import { confirmUserTransaction } from '../services/transactionService'
import { setupAuthenticator, verifyAuthenticator } from '../services/otpService'

// ─── Field component ──────────────────────────────────────────────────────────
function FormField({ label, name, icon: Icon, type = 'text', placeholder, value, onChange }) {
    return (
        <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                {label}
            </label>
            <div className="relative">
                <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50 focus:bg-white/8 transition-all"
                />
            </div>
        </div>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const INITIAL_FORM = { userId: '', amount: '', location: '', deviceId: '', merchant: '', txTime: '' }

export default function SimulateTransaction() {
    const [form, setForm] = useState(INITIAL_FORM)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [alertOpen, setAlertOpen] = useState(false)
    const [otpOpen, setOtpOpen] = useState(false)
    const [otpCompleted, setOtpCompleted] = useState(null) // 'APPROVED' | 'BANK_APPROVAL' | null

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleAnalyze = async () => {
        setLoading(true)
        setResult(null)
        setAlertOpen(false)
        setOtpOpen(false)
        setOtpCompleted(null)

        try {
            const next = await simulateAnalysisApi(form)
            setResult(next)

            // CRITICAL FRAUD (HIGH): show FraudAlertPanel first
            if (next.action === 'USER_VERIFY_THEN_BANK') {
                setTimeout(() => setAlertOpen(true), 400)
            }
            // HIGH RISK (MEDIUM): go straight to OTP modal
            else if (next.action === 'USER_VERIFICATION_ONLY') {
                setTimeout(() => setOtpOpen(true), 400)
            }
        } catch (error) {
            console.error('Analysis failed:', error)
        } finally {
            setLoading(false)
        }
    }

    // FraudAlertPanel: user confirms legit → call backend to mark, then open OTP
    const handleFraudConfirm = async () => {
        setAlertOpen(false)
        if (result?.txId) {
            try {
                await confirmUserTransaction(result.txId, 'approve')
            } catch (err) {
                console.error('Failed to confirm transaction:', err)
            }
        }
        setTimeout(() => setOtpOpen(true), 300)
    }

    // FraudAlertPanel: user reports fraud → block & close
    const handleReportFraud = async () => {
        if (result?.txId) {
            try {
                await confirmUserTransaction(result.txId, 'reject')
            } catch (err) {
                console.error('Failed to report fraud:', err)
            }
        }
        setTimeout(() => setAlertOpen(false), 1200)
    }

    // Google Authenticator modal: set up authenticator via backend
    const handleSetupAuthenticator = async () => {
        const res = await setupAuthenticator(result.txId)
        if (res.error) throw new Error(res.error)
        return res
    }

    // Google Authenticator modal: verify code via backend
    const handleVerifyAuthenticator = async (code) => {
        return verifyAuthenticator(result.txId, code)
    }

    // OTP modal success
    const handleOtpSuccess = (nextStep) => {
        setOtpOpen(false)
        setOtpCompleted(nextStep === 'BANK_APPROVAL' ? 'BANK_APPROVAL' : 'APPROVED')
    }

    const isCritical = result?.action === 'USER_VERIFY_THEN_BANK'

    return (
        <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Transaction Simulator</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                    Enter transaction details to get an AI-powered fraud risk assessment
                </p>
            </div>

            {/* Form card */}
            <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b border-white/6">
                    <Zap size={15} className="text-primary-400" />
                    <h2 className="text-sm font-semibold text-white">Transaction Details</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="User ID" name="userId" icon={User} placeholder="e.g. USR-00482" value={form.userId} onChange={handleChange} />
                    <FormField label="Transaction Amount ($)" name="amount" icon={DollarSign} type="number" placeholder="0.00" value={form.amount} onChange={handleChange} />
                    <FormField label="Location" name="location" icon={MapPin} placeholder="City, Country" value={form.location} onChange={handleChange} />
                    <FormField label="Device ID" name="deviceId" icon={Smartphone} placeholder="e.g. DEV-iPhone15" value={form.deviceId} onChange={handleChange} />
                    <FormField label="Merchant" name="merchant" icon={Store} placeholder="Merchant name" value={form.merchant} onChange={handleChange} />

                    <div>
                        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                            Transaction Time
                        </label>
                        <div className="relative">
                            <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            <input
                                name="txTime"
                                type="datetime-local"
                                value={form.txTime}
                                onChange={handleChange}
                                className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500/50 focus:bg-white/8 transition-all [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="btn-primary w-full mt-2 flex items-center justify-center gap-2 py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing Transaction…
                        </>
                    ) : (
                        <>
                            <Zap size={16} />
                            Analyze Transaction
                        </>
                    )}
                </button>
            </div>

            {/* Re-open banners */}
            {result?.action === 'USER_VERIFY_THEN_BANK' && !otpCompleted && (
                <button
                    onClick={() => setAlertOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-sm font-semibold hover:bg-red-500/15 transition-all"
                >
                    <Siren size={15} />
                    Review Security Alert
                </button>
            )}
            {result?.action === 'USER_VERIFICATION_ONLY' && !otpCompleted && (
                <button
                    onClick={() => setOtpOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-violet-500/30 bg-violet-500/8 text-violet-400 text-sm font-semibold hover:bg-violet-500/15 transition-all"
                >
                    <KeyRound size={15} />
                    Complete 2FA Verification
                </button>
            )}

            {/* 2FA completion status */}
            {otpCompleted === 'APPROVED' && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-green-500/30 bg-green-500/8">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-sm font-semibold text-green-400">Transaction Approved — 2FA verified successfully.</p>
                </div>
            )}
            {otpCompleted === 'BANK_APPROVAL' && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-violet-500/30 bg-violet-500/8">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                    <p className="text-sm font-semibold text-violet-300">2FA Verified — Transaction forwarded to Bank Approval dashboard.</p>
                </div>
            )}

            {/* Result card */}
            {result && (
                <RiskResultCard
                    riskScore={result.riskScore}
                    riskLevel={result.riskLevel}
                    reasons={result.reasons}
                    txId={result.txId}
                    timestamp={result.timestamp}
                />
            )}

            {/* CRITICAL FRAUD: Fraud Alert Panel */}
            <FraudAlertPanel
                open={alertOpen}
                amount={form.amount}
                riskScore={result?.riskScore}
                reasons={result?.reasons ?? []}
                txId={result?.txId}
                onConfirm={handleFraudConfirm}
                onReportFraud={handleReportFraud}
                onClose={() => setAlertOpen(false)}
            />

            {/* Google Authenticator Modal — for both HIGH RISK and CRITICAL FRAUD */}
            <GoogleAuthenticatorModal
                open={otpOpen}
                txId={result?.txId}
                action={result?.action}
                onSuccess={handleOtpSuccess}
                onFail={() => setOtpOpen(false)}
                onClose={() => setOtpOpen(false)}
                onSetup={handleSetupAuthenticator}
                onVerify={handleVerifyAuthenticator}
            />
        </div>
    )
}
