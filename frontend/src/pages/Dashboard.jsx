import { useEffect, useState } from 'react'
import MetricCard from '../components/MetricCard'
import RecentTransactions from '../components/RecentTransactions'
import RiskChart from '../components/RiskChart'
import { apiClient } from '../services/apiClient'
import {
    ArrowUpRight,
    Shield,
    Activity,
    Database,
    TrendingUp,
} from 'lucide-react'

export default function Dashboard() {
    const [analytics, setAnalytics] = useState({
        total_transactions: 0,
        high_risk_transactions: 0,
        approved_transactions: 0,
        blocked_transactions: 0,
        blockchain_logged_transactions: 0,
    })

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiClient.get('/fraud_analytics')
                setAnalytics(data)
            } catch (error) {
                console.error('Failed to load analytics:', error)
            }
        }
        load()
    }, [])

    const avgRisk = analytics.total_transactions > 0
        ? Math.round((analytics.high_risk_transactions / analytics.total_transactions) * 100)
        : 0

    const metrics = [
        {
            id: 'total',
            label: 'Total Transactions',
            value: analytics.total_transactions.toLocaleString(),
            change: '+0.0%',
            changeDir: 'up',
            icon: Activity,
            color: 'blue',
            sub: 'Live backend data',
        },
        {
            id: 'fraud',
            label: 'Fraud Detected',
            value: analytics.high_risk_transactions.toLocaleString(),
            change: '+0.0%',
            changeDir: 'up',
            icon: Shield,
            color: 'red',
            sub: 'High-risk transactions',
        },
        {
            id: 'risk',
            label: 'Avg Risk Score',
            value: String(avgRisk),
            change: '+0.0%',
            changeDir: 'up',
            icon: TrendingUp,
            color: 'purple',
            sub: 'Estimated from high-risk ratio',
        },
        {
            id: 'blockchain',
            label: 'Blockchain Records',
            value: analytics.blockchain_logged_transactions.toLocaleString(),
            change: '+0.0%',
            changeDir: 'up',
            icon: Database,
            color: 'green',
            sub: 'Verified on-chain',
        },
    ]

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Overview</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Real-time fraud intelligence dashboard</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <ArrowUpRight size={14} />
                    Export Report
                </button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <MetricCard key={m.id} {...m} delay={i * 100} />
                ))}
            </div>

            {/* Chart + top risk */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 glass-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-sm font-semibold text-white">Risk Score Trend</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Daily average risk scores — last 14 days</p>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-300 border border-primary-500/20">14d</span>
                    </div>
                    <RiskChart />
                </div>

                {/* Alert summary */}
                <div className="glass-card p-5">
                    <h2 className="text-sm font-semibold text-white mb-4">Alert Summary</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Critical', count: 12, pct: 12, color: 'bg-danger-500' },
                            { label: 'High', count: 89, pct: 42, color: 'bg-warning-400' },
                            { label: 'Medium', count: 234, pct: 68, color: 'bg-primary-400' },
                            { label: 'Low', count: 512, pct: 85, color: 'bg-success-400' },
                        ].map(item => (
                            <div key={item.label}>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-slate-300 font-medium">{item.label}</span>
                                    <span className="text-slate-400 font-mono">{item.count}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/6">
                        <p className="text-xs text-slate-500 mb-3">Fraud by Category</p>
                        <div className="space-y-2">
                            {[
                                { label: 'Card Not Present', pct: 38 },
                                { label: 'Account Takeover', pct: 27 },
                                { label: 'Identity Theft', pct: 19 },
                                { label: 'Other', pct: 16 },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3 text-xs">
                                    <span className="text-slate-400 flex-1 truncate">{item.label}</span>
                                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                            style={{ width: `${item.pct}%` }}
                                        />
                                    </div>
                                    <span className="text-slate-400 w-7 text-right font-mono">{item.pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent transactions */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Latest activity across all channels</p>
                    </div>
                    <button className="text-xs text-primary-400 hover:text-primary-300 transition-colors font-medium">
                        View all →
                    </button>
                </div>
                <RecentTransactions />
            </div>
        </div>
    )
}
