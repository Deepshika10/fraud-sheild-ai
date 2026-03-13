import { Bell, Search, Menu, Wifi } from 'lucide-react'

export default function TopNavbar({ onMenuClick, searchQuery, onSearchChange }) {
    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

    return (
        <header className="nav-glow h-14 flex items-center px-4 md:px-6 gap-4 shrink-0">
            {/* Mobile menu button */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
                <Menu size={18} />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-sm">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search transactions, alerts..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/8 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary-500/50 focus:bg-white/8 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1" />

            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-success-500/10 border border-success-500/20">
                <Wifi size={12} className="text-success-400" />
                <span className="text-xs font-medium text-success-400">Live</span>
                <div className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse" />
            </div>

            {/* Date/Time */}
            <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-slate-200">{timeStr}</p>
                <p className="text-[10px] text-slate-500">{dateStr}</p>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-white transition-colors">
                <Bell size={17} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-dark-800" />
            </button>
        </header>
    )
}
