import { useEffect, useRef, useState } from 'react'
import { KeyRound, ShieldCheck, ShieldX, RefreshCw, X, MessageSquare } from 'lucide-react'

/**
 * OtpModal
 *
 * Props:
 *   open       {boolean}
 *   txId       {string}
 *   action     {string}  'USER_VERIFICATION_ONLY' | 'USER_VERIFY_THEN_BANK'
 *   onSuccess  {(nextStep: string) => void}
 *   onFail     {() => void}
 *   onClose    {() => void}
 *   onGenerate {() => Promise<string>}   resolves with the 6-digit OTP string
 *   onVerify   {(otp: string) => Promise<{next_step?: string, error?: string, attempts_remaining?: number}>}
 */
export default function OtpModal({ open, txId, action, onSuccess, onFail, onClose, onGenerate, onVerify }) {
    // step: 'request' | 'input' | 'verifying' | 'success' | 'error'
    const [step, setStep] = useState('request')
    const [visible, setVisible] = useState(false)
    const [displayedOtp, setDisplayedOtp] = useState('')   // shown to user (simulated delivery)
    const [digits, setDigits] = useState(['', '', '', '', '', ''])
    const [otpError, setOtpError] = useState('')
    const [attemptsLeft, setAttemptsLeft] = useState(3)
    const [generating, setGenerating] = useState(false)
    const [nextStep, setNextStep] = useState('')
    const inputRefs = useRef([])

    useEffect(() => {
        if (open) {
            setStep('request')
            setDigits(['', '', '', '', '', ''])
            setDisplayedOtp('')
            setOtpError('')
            setAttemptsLeft(3)
            setNextStep('')
            const t = setTimeout(() => setVisible(true), 20)
            return () => clearTimeout(t)
        } else {
            setVisible(false)
        }
    }, [open])

    if (!open) return null

    const isCritical = action === 'USER_VERIFY_THEN_BANK'

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const otp = await onGenerate()
            setDisplayedOtp(otp)
            setStep('input')
            setTimeout(() => inputRefs.current[0]?.focus(), 100)
        } catch {
            setOtpError('Failed to generate OTP. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    const handleDigitChange = (idx, val) => {
        if (!/^\d?$/.test(val)) return
        const next = [...digits]
        next[idx] = val
        setDigits(next)
        setOtpError('')
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
        const otp = digits.join('')
        if (otp.length < 6) {
            setOtpError('Please enter all 6 digits.')
            return
        }
        setStep('verifying')
        try {
            const res = await onVerify(otp)
            if (res.error) {
                const remaining = res.attempts_remaining ?? 0
                setAttemptsLeft(remaining)
                setOtpError(res.error)
                setDigits(['', '', '', '', '', ''])
                setStep(remaining <= 0 ? 'locked' : 'input')
                setTimeout(() => inputRefs.current[0]?.focus(), 100)
            } else {
                setNextStep(res.next_step || 'APPROVED')
                setStep('success')
                setTimeout(() => onSuccess?.(res.next_step || 'APPROVED'), 2000)
            }
        } catch {
            setOtpError('Verification failed. Please try again.')
            setStep('input')
        }
    }

    const handleResend = async () => {
        setDigits(['', '', '', '', '', ''])
        setOtpError('')
        setGenerating(true)
        try {
            const otp = await onGenerate()
            setDisplayedOtp(otp)
            setAttemptsLeft(3)
            setTimeout(() => inputRefs.current[0]?.focus(), 100)
        } catch {
            setOtpError('Failed to resend OTP.')
        } finally {
            setGenerating(false)
        }
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
                {(step === 'request' || step === 'input' || step === 'success' || step === 'locked') && (
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
                                <KeyRound size={20} className="text-violet-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-base font-extrabold text-violet-300 tracking-tight">OTP Verification</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                {isCritical ? 'Critical fraud — OTP + bank approval required' : 'High-risk — OTP verification required'}
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

                    {/* REQUEST step */}
                    {step === 'request' && (
                        <>
                            <div className="text-center space-y-1.5">
                                <p className="text-sm font-bold text-white">Verify your identity</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    We'll generate a one-time password for this transaction.<br />
                                    {isCritical
                                        ? 'After verification, the bank will review and approve.'
                                        : 'After verification, the transaction will be approved.'}
                                </p>
                            </div>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                    boxShadow: '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.6) inset, 0 4px 28px rgba(139,92,246,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)'}
                            >
                                {generating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquare size={15} />}
                                {generating ? 'Generating…' : 'Send OTP'}
                            </button>
                        </>
                    )}

                    {/* INPUT step */}
                    {step === 'input' && (
                        <>
                            {displayedOtp && (
                                <div className="w-full px-4 py-3 rounded-xl border border-violet-500/25 bg-violet-500/8 text-center">
                                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-widest">Your OTP (simulated)</p>
                                    <p className="text-2xl font-extrabold font-mono text-violet-300 tracking-[0.25em]">{displayedOtp}</p>
                                </div>
                            )}

                            <div className="text-center">
                                <p className="text-xs text-slate-400">Enter the 6-digit code</p>
                            </div>

                            {/* 6-digit inputs */}
                            <div className="flex gap-2">
                                {digits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={el => (inputRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={d}
                                        onChange={e => handleDigitChange(i, e.target.value)}
                                        onKeyDown={e => handleDigitKeyDown(i, e)}
                                        className="w-11 h-13 text-center text-lg font-bold font-mono rounded-xl border bg-white/5 text-white focus:outline-none focus:ring-2 transition-all"
                                        style={{
                                            borderColor: otpError ? 'rgba(239,68,68,0.5)' : d ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.12)',
                                            boxShadow: d ? '0 0 10px rgba(139,92,246,0.2)' : undefined,
                                            height: '52px',
                                        }}
                                    />
                                ))}
                            </div>

                            {otpError && (
                                <p className="text-xs text-red-400 text-center">
                                    {otpError}{attemptsLeft > 0 && ` (${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left)`}
                                </p>
                            )}

                            <div className="w-full space-y-2.5">
                                <button
                                    onClick={handleVerify}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                        boxShadow: '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.6) inset, 0 4px 28px rgba(139,92,246,0.5)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.4) inset, 0 4px 20px rgba(139,92,246,0.3)'}
                                >
                                    <KeyRound size={15} />
                                    Verify OTP
                                </button>
                                <button
                                    onClick={handleResend}
                                    disabled={generating}
                                    className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-violet-400 transition-colors"
                                >
                                    <RefreshCw size={11} className={generating ? 'animate-spin' : ''} />
                                    Resend OTP
                                </button>
                            </div>
                        </>
                    )}

                    {/* VERIFYING step */}
                    {step === 'verifying' && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <span className="w-12 h-12 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
                            <div className="text-center">
                                <p className="text-sm font-bold text-violet-300">Verifying OTP…</p>
                                <p className="text-xs text-slate-500 mt-1">Please wait</p>
                            </div>
                        </div>
                    )}

                    {/* SUCCESS step */}
                    {step === 'success' && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-green-500/40"
                                style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 100%)', boxShadow: '0 0 28px rgba(34,197,94,0.3)' }}
                            >
                                <ShieldCheck size={30} className="text-green-400" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-base font-extrabold text-green-400">OTP Verified!</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {nextStep === 'BANK_APPROVAL'
                                        ? 'Transaction forwarded to bank for final approval. Check the Bank Approval dashboard.'
                                        : 'Transaction successfully approved.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* LOCKED step */}
                    {step === 'locked' && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-red-500/40"
                                style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.2) 0%, transparent 100%)', boxShadow: '0 0 28px rgba(239,68,68,0.3)' }}
                            >
                                <ShieldX size={30} className="text-red-400" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-base font-extrabold text-red-400">Too Many Attempts</p>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Maximum OTP attempts exceeded. Please contact support if you believe this is an error.
                                </p>
                            </div>
                            <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300 transition-colors mt-1">
                                Close
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom glow strip */}
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent)' }} />
            </div>
        </div>
    )
}
