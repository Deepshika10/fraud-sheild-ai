import { useState, useEffect } from 'react'
import { ShieldAlert, Filter, Clock, DollarSign, RefreshCw } from 'lucide-react'

// Components
import SeverityBadge from '../components/SeverityBadge'

// Services
import { getActiveAlerts, processAlertAction } from '../services/alertService'

export default function FraudAlerts() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')
    const filters = ['All', 'Critical', 'High', 'Medium', 'Low']

    useEffect(() => {
        loadAlerts()
    }, [])

    const loadAlerts = async () => {
        setLoading(true)
        try {
            const data = await getActiveAlerts()
            setAlerts(data)
        } catch (error) {
            console.error("Failed to load alerts:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (alert, action) => {
        try {
            const success = await processAlertAction(alert.txId, action)
            if (success) {
                // Remove the alert from view after processing
                setAlerts(prev => prev.filter(a => a.id !== alert.id))
            }
        } catch (error) {
            console.error("Action failed:", error)
        }
    }

    const shown = filter === 'All' ? alerts : alerts.filter(a => a.severity === filter)

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Fraud Alerts</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{alerts.length} active alerts requiring attention</p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-500" />
                    <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {filters.map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filter === f ? 'bg-primary-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/8'
                                    }`}>{f}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2.5 min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                        <RefreshCw size={24} className="text-primary-400 animate-spin" />
                        <span>Scanning for active threats...</span>
                    </div>
                ) : shown.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-white/2 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-sm font-medium">No alerts matching "{filter}"</p>
                        <p className="text-[11px] mt-1">Systems are functioning within normal parameters.</p>
                    </div>
                ) : (
                    shown.map(a => (
                        <div key={a.id} className="glass-card-hover p-4 flex flex-wrap items-center gap-4 cursor-pointer">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="p-2 rounded-xl bg-danger-500/10 border border-danger-500/20 shrink-0">
                                    <ShieldAlert size={16} className="text-danger-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-sm font-semibold text-white">{a.type}</p>
                                        <SeverityBadge severity={a.severity} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5 font-mono">{a.txId} · {a.id}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs text-slate-400 shrink-0 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <DollarSign size={12} />
                                    <span className="font-mono font-semibold text-white">{a.amount}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} />
                                    <span>{a.time}</span>
                                </div>
                                <span className="text-slate-500">{a.location}</span>
                            </div>

                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => handleAction(a, 'Approve')}
                                    className="px-3 py-1.5 text-xs font-medium bg-success-500/10 text-success-400 border border-success-500/25 rounded-lg hover:bg-success-500/20 transition-colors"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleAction(a, 'Block')}
                                    className="px-3 py-1.5 text-xs font-medium bg-danger-500/10 text-danger-400 border border-danger-500/25 rounded-lg hover:bg-danger-500/20 transition-colors"
                                >
                                    Block
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
