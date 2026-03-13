import { useEffect, useRef, useState } from 'react'
import { KeyRound, ShieldCheck, ShieldX, Copy, X, QrCode } from 'lucide-react'

/**
 * GoogleAuthenticatorModal
 *
 * Props:
 *   open       {boolean}
 *   txId       {string}
 *   action     {string}  'USER_VERIFICATION_ONLY' | 'USER_VERIFY_THEN_BANK'
 *   onSuccess  {(nextStep: string) => void}
 *   onFail     {() => void}
 *   onClose    {() => void}
 *   onSetup    {() => Promise<{secret: string, qr_code: string}>}   resolves with secret and QR code
 *   onVerify   {(code: string) => Promise<{next_step?: string, error?: string, attempts_remaining?: number}>}
 */
export default function GoogleAuthenticatorModal({ open, txId, action, onSuccess, onClose, onSetup, onVerify }) {
    // step: 'setup' | 'scan' | 'input' | 'verifying' | 'success' | 'error' | 'locked'
    const [step, setStep] = useState('setup')
    const [visible, setVisible] = useState(false)
    const [qrCode, setQrCode] = useState('')
    const [secret, setSecret] = useState('')
    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const [error, setError] = useState('')
    const [attemptsLeft, setAttemptsLeft] = useState(3)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const inputRefs = useRef([])

    useEffect(() => {
        if (open) {
            setStep('setup')
            setDigits(['', '', '', '', '', ''])
            setQrCode('')
            setSecret('')
            setError('')
            setAttemptsLeft(3)
            setCopied(false)
            const t = setTimeout(() => setVisible(true), 20)
            return () => clearTimeout(t)
        } else {
            setVisible(false)
        }
    }, [open])

    if (!open) return null

    const isCritical = action === 'USER_VERIFY_THEN_BANK'

    const handleSetup = async () => {
        setLoading(true)
        try {
            const res = await onSetup()
            setQrCode(res.qr_code)
            setSecret(res.secret)
            setStep('scan')
        } catch {
            setError('Failed to set up authenticator. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCopySecret = () => {
        navigator.clipboard.writeText(secret)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDigitChange = (idx, val) => {
        if (!/^\d?$/.test(val)) return
        const next = [...digits]
        next[idx] = val
        setDigits(next)
        setError('')
        if (val && idx < 5) {
            inputRefs.current[idx + 1]?.focus()
        }
    }

    const handleDigitKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus()
        }
    }

    const handleVerify = async () => {
        const code = digits.join('')
        if (code.length < 6) {
            setError('Please enter all 6 digits.')
            return
        }
        setStep('verifying')
        try {
            const res = await onVerify(code)
            if (res.error) {
                const remaining = res.attempts_remaining ?? 0
                setAttemptsLeft(remaining)
                setError(res.error)
                setDigits(['', '', '', '', '', ''])
                setStep(remaining <= 0 ? 'locked' : 'input')
                setTimeout(() => inputRefs.current[0]?.focus(), 100)
            } else {
                setStep('success')
                setTimeout(() => onSuccess?.(res.next_step || 'APPROVED'), 2000)
            }
        } catch {
            setError('Verification failed. Please try again.')
            setStep('input')
        }
    }

    const handleSetupNew = async () => {
        setStep('setup')
        setDigits(['', '', '', '', '', ''])
        setQrCode('')
        setSecret('')
        setError('')
        setAttemptsLeft(3)
        setCopied(false)
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{
                background: 'rgba(0,0,0,0.80)',
                backdropFilter: 'blur(8px)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.25s ease',
            }}
        >
            <div
                className="relative w-full max-w-sm rounded-2xl border border-violet-500/30 overflow-hidden"
                style={{
                    background: 'linear-gradient(160deg, rgba(14,10,40,0.99) 0%, rgba(8,6,24,0.99) 100%)',
                    boxShadow: '0 0 0 1px rgba(139,92,246,0.12) inset, 0 8px 48px rgba(139,92,246,0.25), 0 32px 64px rgba(0,0,0,0.7)',
                    transform: visible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
                    transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                }}
            >
                {/* Top glow strip */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)' }} />
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />

                {/* Close button */}
                {(step === 'setup' || step === 'scan' || step === 'input' || step === 'success' || step === 'locked') && (
                    <button onClick={onClose} className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-all z-10">
                        <X size={16} />
                    </button>
                )}

                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b border-violet-500/15">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                            <div className="relative p-2.5 rounded-full bg-violet-500/15 border border-violet-500/40">
                                <QrCode size={20} className="text-violet-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-base font-extrabold text-violet-300 tracking-tight">Google Authenticator</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {isCritical ? 'Critical fraud — 2FA + bank approval required' : 'High-risk — 2FA verification required'}
                            </p>
                        </div>
                    </div>
                    {txId && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20">
                            <span className="text-[10px] font-mono text-violet-400">{txId}</span>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="px-6 py-7 flex flex-col items-center gap-5">

                    {/* SETUP step */}
                    {step === 'setup' && (
                        <>
                            <div className="text-center space-y-1.5">
                                <p className="text-sm font-bold text-white">Set up two-factor authentication</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Download Google Authenticator, scan the QR code, and verify your identity.<br/>
                                    {isCritical
                                        ? 'After verification, the bank will review and approve.'
                                        : 'After verification, the transaction will be approved.'}
                                </p>
                            </div>
                            <button
                                onClick={handleSetup}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                    boxShadow: '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.6) inset, 0 4px 28px rgba(139,92,246,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)'}
                            >
                                {loading ? 'Generating...' : 'Generate QR Code'}
                            </button>
                        </>
                    )}

                    {/* SCAN step */}
                    {step === 'scan' && qrCode && (
                        <>
                            <div className="text-center space-y-1.5">
                                <p className="text-sm font-bold text-white">Scan the QR code</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Use Google Authenticator app to scan this QR code
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white">
                                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-xs text-slate-400">Backup code (if camera unavailable):</p>
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50">
                                    <code className="text-xs font-mono text-violet-300 flex-1 text-left">{secret}</code>
                                    <button
                                        onClick={handleCopySecret}
                                        className="p-1.5 rounded hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
                                    >
                                        <Copy size={14} />
                                    </button>
                                </div>
                                {copied && <p className="text-xs text-green-400">Copied!</p>}
                            </div>
                            <button
                                onClick={() => {
                                    setStep('input')
                                    setTimeout(() => inputRefs.current[0]?.focus(), 100)
                                }}
                                className="w-full px-4 py-3 rounded-xl font-bold text-sm text-white transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                    boxShadow: '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.6) inset, 0 4px 28px rgba(139,92,246,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)'}
                            >
                                Enter 6-digit code
                            </button>
                        </>
                    )}

                    {/* INPUT step */}
                    {step === 'input' && (
                        <>
                            <div className="text-center space-y-1.5">
                                <p className="text-sm font-bold text-white">Enter the 6-digit code</p>
                                <p className="text-xs text-slate-400">From your Google Authenticator app</p>
                            </div>
                            <div className="flex justify-center gap-2.5">
                                {digits.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={el => inputRefs.current[idx] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={e => handleDigitChange(idx, e.target.value)}
                                        onKeyDown={e => handleDigitKeyDown(idx, e)}
                                        className="w-10 h-12 text-center text-lg font-bold rounded-lg border transition-all"
                                        style={{
                                            borderColor: digit ? 'rgba(139,92,246,0.5)' : 'rgba(148,163,184,0.3)',
                                            background: digit ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
                                            color: digit ? '#e0e7ff' : '#94a3b8',
                                        }}
                                    />
                                ))}
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 w-full">
                                    <ShieldX size={16} className="text-red-400 flex-shrink-0" />
                                    <p className="text-xs text-red-300">{error}</p>
                                </div>
                            )}
                            {attemptsLeft > 0 && (
                                <p className="text-xs text-slate-400">Attempts remaining: {attemptsLeft}</p>
                            )}
                            <button
                                onClick={handleVerify}
                                disabled={digits.join('').length < 6}
                                className="w-full px-4 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                    boxShadow: '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)',
                                }}
                                onMouseEnter={e => !digits.join('').length < 6 && (e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.6) inset, 0 4px 28px rgba(139,92,246,0.5)')}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)'}
                            >
                                Verify
                            </button>
                            <button
                                onClick={handleSetupNew}
                                className="w-full px-4 py-2 rounded-xl font-bold text-sm text-slate-300 transition-all hover:bg-slate-700/30"
                            >
                                Use different method
                            </button>
                        </>
                    )}

                    {/* VERIFYING step */}
                    {step === 'verifying' && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                                <div className="relative p-3 rounded-full bg-violet-500/15 border border-violet-500/40">
                                    <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-300">Verifying code...</p>
                        </div>
                    )}

                    {/* SUCCESS step */}
                    {step === 'success' && (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="relative">
                                <div className="p-3 rounded-full bg-green-500/15 border border-green-500/40">
                                    <ShieldCheck size={24} className="text-green-400" />
                                </div>
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-bold text-green-300">Verified!</p>
                                <p className="text-xs text-slate-400">Redirecting...</p>
                            </div>
                        </div>
                    )}

                    {/* LOCKED step */}
                    {step === 'locked' && (
                        <div className="flex flex-col items-center gap-4 py-2">
                            <div className="p-3 rounded-full bg-red-500/15 border border-red-500/40">
                                <ShieldX size={24} className="text-red-400" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-sm font-bold text-red-300">Too many failed attempts</p>
                                <p className="text-xs text-slate-400">This transaction has been blocked for security.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full px-4 py-3 rounded-xl font-bold text-sm text-white transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                    boxShadow: '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.6) inset, 0 4px 28px rgba(139,92,246,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)'}
                            >
                                Close
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
