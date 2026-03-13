import { useState, useEffect } from 'react'
import {
    ShieldCheck,
    ShieldAlert,
    Hash,
    Link2,
    Clock,
    Cpu,
    RefreshCw,
    Search,
    CheckCircle2,
    Lock,
} from 'lucide-react'

export default function BlockchainVerification() {
    const [isVerifying, setIsVerifying] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [progress, setProgress] = useState(0)

    // Mock data for the verification card
    const txData = {
        hash: '0x4f3a8b2c9d1e5f7a8b3c9d1e5f7a8b3c9d1e5f7a8b3c9d1e5f7a8b3c9d1e5f7a',
        blockchainId: 'BLK-9284031-TXN-0098',
        timestamp: new Date().toLocaleString(),
        status: isVerified ? 'Verified' : 'Unverified',
    }

    const handleVerify = () => {
        setIsVerifying(true)
        setIsVerified(false)
        setProgress(0)

        // Simulate verification process
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setIsVerifying(false)
                    setIsVerified(true)
                    return 100
                }
                return prev + 2
            })
        }, 40)
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {/* Page Header */}
            <div>
                <h1 className="text-xl font-bold text-white">Blockchain Verification</h1>
                <p className="text-sm text-slate-400 mt-0.5">
                    Verify the cryptographic integrity of fraud verdicts on the immutable ledger.
                </p>
            </div>

            {/* Main Verification Panel */}
            <div className="glass-card relative overflow-hidden p-8 border-primary-500/20">
                {/* Cybersecurity Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Cpu size={120} />
                </div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-500/50 via-accent-500/50 to-primary-500/50" />

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Side: Status & Icon */}
                    <div className="flex flex-col items-center gap-4 shrink-0 w-full md:w-auto">
                        <div className={`
              relative w-32 h-32 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
              ${isVerified ? 'bg-success-500/10 border-success-500/50 shadow-[0_0_30px_rgba(34,197,94,0.2)]' :
                                isVerifying ? 'bg-primary-500/10 border-primary-500/50 animate-pulse' :
                                    'bg-slate-500/10 border-slate-500/30'}
            `}>
                            {isVerified ? (
                                <ShieldCheck size={64} className="text-success-400" />
                            ) : isVerifying ? (
                                <RefreshCw size={64} className="text-primary-400 animate-spin" />
                            ) : (
                                <Lock size={64} className="text-slate-500" />
                            )}

                            {/* Verified Badge overlay */}
                            {isVerified && (
                                <div className="absolute -bottom-2 -right-2 bg-success-500 text-white rounded-full p-1 shadow-lg">
                                    <CheckCircle2 size={24} />
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <p className={`text-xs font-bold uppercase tracking-widest ${isVerified ? 'text-success-400' : 'text-slate-500'}`}>
                                System Status
                            </p>
                            <p className={`text-lg font-mono font-bold ${isVerified ? 'text-white' : 'text-slate-400'}`}>
                                {isVerified ? 'SECURE' : isVerifying ? 'SCANNING...' : 'IDLE'}
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Data Fields */}
                    <div className="flex-1 space-y-6 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DataField
                                label="Transaction Hash"
                                value={txData.hash}
                                icon={Hash}
                                monospace
                                truncate
                            />
                            <DataField
                                label="Blockchain TX ID"
                                value={txData.blockchainId}
                                icon={Link2}
                                monospace
                            />
                            <DataField
                                label="Timestamp"
                                value={txData.timestamp}
                                icon={Clock}
                            />
                            <DataField
                                label="Verification Status"
                                value={txData.status}
                                icon={ShieldCheck}
                                highlight={isVerified}
                            />
                        </div>

                        {/* Verification Button & Progress */}
                        <div className="pt-4 space-y-4">
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying}
                                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-widest transition-all
                  flex items-center justify-center gap-3
                  ${isVerifying ? 'bg-white/5 text-slate-500 cursor-not-allowed' :
                                        isVerified ? 'bg-success-600/20 text-success-400 border border-success-500/30 hover:bg-success-600/30' :
                                            'bg-primary-600 hover:bg-primary-500 text-white shadow-glow-blue border border-primary-400/30'}
                `}
                            >
                                {isVerifying ? (
                                    <>
                                        <RefreshCw size={18} className="animate-spin" />
                                        Analyzing Cryptographic Chain...
                                    </>
                                ) : isVerified ? (
                                    <>
                                        <RefreshCw size={18} />
                                        Re-Verify Integrity
                                    </>
                                ) : (
                                    <>
                                        <Search size={18} />
                                        Verify Integrity
                                    </>
                                )}
                            </button>

                            {/* Progress Bar (Only during verification) */}
                            {isVerifying && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-mono text-primary-400 uppercase">
                                        <span>Checking Merkle Tree...</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-75 ease-out shadow-[0_0_10px_#6366f1]"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {isVerified && !isVerifying && (
                                <div className="bg-success-500/10 border border-success-500/30 p-4 rounded-xl flex items-center gap-3 animate-slide-up">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-success-500/20 flex items-center justify-center">
                                        <CheckCircle2 size={18} className="text-success-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-success-300">Integrity Verified</p>
                                        <p className="text-xs text-success-400/80">Hash matches blockchain record. This verdict is immutable.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Log Stub (Cybersecurity feel) */}
            <div className="glass-card p-6 opacity-60">
                <div className="flex items-center gap-2 mb-4">
                    <Cpu size={16} className="text-slate-400" />
                    <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Node Audit Logs</h2>
                </div>
                <div className="font-mono text-[10px] space-y-1 text-slate-500 overflow-hidden">
                    <p>[{new Date().toISOString()}] NODE_ALPHA: Handshake established with mainnet-v4</p>
                    <p>[{new Date().toISOString()}] NODE_ALPHA: Syncing block headers 19,284,031... OK</p>
                    <p>[{new Date().toISOString()}] SYSTEM: Waiting for integrity request...</p>
                </div>
            </div>
        </div>
    )
}

function DataField({ label, value, icon: Icon, monospace, truncate, highlight }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <Icon size={12} className="text-slate-600" />
                {label}
            </label>
            <div className={`
        p-3 rounded-xl bg-white/5 border border-white/10 transition-colors
        ${highlight ? 'border-success-500/30 bg-success-500/5' : ''}
      `}>
                <span className={`
          text-sm block
          ${monospace ? 'font-mono' : 'font-medium'}
          ${truncate ? 'truncate' : ''}
          ${highlight ? 'text-success-400' : 'text-slate-200'}
        `}
                    title={value}>
                    {value}
                </span>
            </div>
        </div>
    )
}
