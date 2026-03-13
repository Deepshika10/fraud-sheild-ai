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
} from 'lucide-react'
import RiskResultCard from '../components/RiskResultCard'
import FraudAlertPanel from '../components/FraudAlertPanel'
import { simulateAnalysisApi } from '../services/riskService'

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

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

    const handleAnalyze = async () => {
        setLoading(true)
        setResult(null)
        setAlertOpen(false)

        try {
            const next = await simulateAnalysisApi(form);
            setResult(next)

            // Auto-open alert panel for high-risk transactions
            if (next.riskLevel === 'High') {
                setTimeout(() => setAlertOpen(true), 400)
            }
        } catch (error) {
            console.error("Analysis failed:", error);
        } finally {
            setLoading(false)
        }
    }

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

            {/* High-risk re-open banner */}
            {result?.riskLevel === 'High' && (
                <button
                    onClick={() => setAlertOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-sm font-semibold hover:bg-red-500/15 transition-all"
                >
                    <Siren size={15} />
                    Review Security Alert
                </button>
            )}

            {/* Result */}
            {result && (
                <RiskResultCard
                    riskScore={result.riskScore}
                    riskLevel={result.riskLevel}
                    reasons={result.reasons}
                    txId={result.txId}
                    timestamp={result.timestamp}
                />
            )}

            {/* Fraud Alert Panel — shown automatically for High risk */}
            <FraudAlertPanel
                open={alertOpen}
                amount={form.amount}
                riskScore={result?.riskScore}
                reasons={result?.reasons ?? []}
                txId={result?.txId}
                onConfirm={() => setAlertOpen(false)}
                onReportFraud={() => setTimeout(() => setAlertOpen(false), 1200)}
                onClose={() => setAlertOpen(false)}
            />
        </div>
    )
}
