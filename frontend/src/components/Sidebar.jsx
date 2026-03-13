import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Zap,
    ShieldAlert,
    Building2,
    Link2,
    ShieldCheck,
    X,
} from 'lucide-react'

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
    { icon: Zap, label: 'Simulate Transaction', to: '/simulate' },
    { icon: ShieldAlert, label: 'Fraud Alerts', to: '/alerts' },
    { icon: Building2, label: 'Bank Approval', to: '/approval' },
    { icon: Link2, label: 'Blockchain Verification', to: '/blockchain' },
]

export default function Sidebar({ onClose }) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow-blue">
                        <ShieldCheck size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-none">FraudShield</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">AI-Powered Security</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 mb-3">
                    Navigation
                </p>
                {navItems.map(({ icon: Icon, label, to }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <Icon size={17} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom section */}
            <div className="px-4 py-4 border-t border-white/6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-xs font-bold text-white">
                        KD
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">Kdeepshika</p>
                        <p className="text-[10px] text-slate-400 truncate">Admin</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse-slow" />
                </div>
            </div>
        </div>
    )
}
