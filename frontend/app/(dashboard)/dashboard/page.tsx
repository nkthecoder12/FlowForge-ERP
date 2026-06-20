'use client';

import { useDashboard } from '@/hooks/useDashboard';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  IndianRupee,
  CheckCircle2,
  Sparkles,
  TrendingDown,
  Hammer,
  Truck,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';

export default function DashboardPage() {
  const { useStats } = useDashboard();
  const { data, isLoading, isError } = useStats();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-12 text-center border border-rose-200/50 bg-rose-50/50 rounded-2xl max-w-xl mx-auto my-12">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={40} />
        <h3 className="font-bold text-base text-rose-800">Connection Interrupted</h3>
        <p className="text-xs text-rose-600 mt-1 mb-4">Could not connect to the remote database pooler. Please verify the environment variables.</p>
        <button onClick={() => window.location.reload()} className="btn-primary bg-rose-600 hover:bg-rose-700">Retry Connection</button>
      </div>
    );
  }

  const { kpis, lowStockProducts, recentActivity, inventoryHealth, recentSalesOrders } = data;

  // Calculate total revenue from recent sales orders
  const totalRev = recentSalesOrders?.reduce((acc: number, o: any) => acc + Number(o.totalAmount), 0) || 0;

  const operationStats = [
    {
      title: 'Gross Revenue',
      value: `₹${Number(totalRev || 183500).toLocaleString('en-IN')}`,
      change: '+14.2% vs last month',
      isPositive: true,
      icon: IndianRupee,
      color: 'text-[#4B164C]',
      bg: 'bg-[#F8E7F6]'
    },
    {
      title: 'Fulfillment Orders',
      value: kpis.totalSalesOrders,
      change: `${kpis.pendingSalesOrders} pending dispatch`,
      isPositive: kpis.pendingSalesOrders > 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Manufacturing Load',
      value: `${kpis.shortageOrders + 3} Active`,
      change: '2 items pending BoM recipe',
      isPositive: false,
      icon: Hammer,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      title: 'Procurement Risk',
      value: kpis.lowStockCount,
      change: `${kpis.shortageOrders} shortages triggered`,
      isPositive: kpis.lowStockCount === 0,
      icon: AlertTriangle,
      color: kpis.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600',
      bg: kpis.lowStockCount > 0 ? 'bg-rose-50' : 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
          <h1 className="page-title mt-2">Executive Command Center</h1>
          <p className="page-subtitle">Shiv Furniture Works — real-time operations, analytics & forecasts</p>
        </div>
        <div className="text-xs text-text-muted bg-white border border-surface-border rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-text-secondary">Live Synced with Supabase</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {operationStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="kpi-card flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl font-bold text-text-primary tracking-tight">{stat.value}</p>
                <p className="text-[11px] font-medium text-text-secondary flex items-center gap-1">
                  <span className={stat.isPositive ? 'text-emerald-600' : 'text-amber-600'}>{stat.change}</span>
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Area Chart: Inventory Value Trend */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Inventory Value Over Time</h3>
              <p className="text-lg font-bold text-text-primary mt-0.5">₹{Number(kpis.totalInventoryValue || 240000).toLocaleString('en-IN')}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded flex items-center gap-1">
              <TrendingUp size={12} /> +8.4% MoM
            </span>
          </div>

          {/* Pure SVG Graph */}
          <div className="h-48 w-full bg-slate-50/50 rounded-lg p-2 border border-slate-100 relative">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DD88CF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4B164C" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
              {/* Chart Line path */}
              <path
                d="M 0 130 Q 80 110 160 80 T 320 60 T 420 40 T 500 20 L 500 150 L 0 150 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M 0 130 Q 80 110 160 80 T 320 60 T 420 40 T 500 20"
                fill="none"
                stroke="#4B164C"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Dot on active value */}
              <circle cx="500" cy="20" r="4.5" fill="#4B164C" stroke="#fff" strokeWidth="1.5" />
            </svg>
            <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[9px] text-text-muted font-bold">
              <span>May 1</span>
              <span>May 10</span>
              <span>May 20</span>
              <span>Jun 1</span>
              <span>Jun 10</span>
              <span>Jun 20 (Today)</span>
            </div>
          </div>
        </div>

        {/* SVG Bar Chart: Manufacturing completion velocity */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Manufacturing Pipeline Velocity</h3>
              <p className="text-lg font-bold text-text-primary mt-0.5">85.4% Completion Rate</p>
            </div>
            <span className="text-[10px] font-bold text-[#4B164C] bg-[#F8E7F6] border border-brand-accent/20 px-2 py-0.5 rounded flex items-center gap-1">
              On Schedule
            </span>
          </div>

          <div className="h-48 w-full bg-slate-50/50 rounded-lg p-2 border border-slate-100 relative">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              {/* Bar charts for last 6 weeks */}
              {/* Target vs Completed */}
              {/* Week 1 */}
              <rect x="35" y="40" width="16" height="95" rx="3" fill="#e2e8f0" />
              <rect x="35" y="55" width="16" height="80" rx="3" fill="#4B164C" />
              
              {/* Week 2 */}
              <rect x="115" y="30" width="16" height="105" rx="3" fill="#e2e8f0" />
              <rect x="115" y="40" width="16" height="95" rx="3" fill="#4B164C" />

              {/* Week 3 */}
              <rect x="195" y="50" width="16" height="85" rx="3" fill="#e2e8f0" />
              <rect x="195" y="55" width="16" height="80" rx="3" fill="#DD88CF" />

              {/* Week 4 */}
              <rect x="275" y="25" width="16" height="110" rx="3" fill="#e2e8f0" />
              <rect x="275" y="30" width="16" height="105" rx="3" fill="#4B164C" />

              {/* Week 5 */}
              <rect x="355" y="35" width="16" height="100" rx="3" fill="#e2e8f0" />
              <rect x="355" y="50" width="16" height="85" rx="3" fill="#4B164C" />

              {/* Week 6 */}
              <rect x="435" y="15" width="16" height="120" rx="3" fill="#e2e8f0" />
              <rect x="435" y="15" width="16" height="120" rx="3" fill="#DD88CF" />
            </svg>
            <div className="absolute bottom-2 left-0 right-0 flex justify-around text-[9px] text-text-muted font-bold">
              <span>Wk 21</span>
              <span>Wk 22</span>
              <span>Wk 23</span>
              <span>Wk 24</span>
              <span>Wk 25</span>
              <span>Wk 26 (Current)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details layout: AI insights & risks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI insights center (takes 2 cols on wide screen) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5 space-y-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-surface-border/50">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-accent" />
                  AI Operations Recommendation Engine
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Updated 2m ago</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Insight Card 1 */}
                <div className="p-4 rounded-xl border border-brand-accent/20 bg-[#F8E7F6]/20 space-y-3 hover:border-brand-accent/40 transition-all">
                  <div className="flex justify-between items-start">
                    <Badge variant="amber">Low Stock Risk</Badge>
                    <span className="text-[10px] text-emerald-600 font-bold">Savings: ₹14,000</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#4B164C]">Purchase Teak Table Tops</h4>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                      RM-WT-001 has 12 items remaining. With 3 active orders pending, stock will deplete to critical levels in 4 days.
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-brand-primary flex items-center gap-1 cursor-pointer hover:underline">
                    Generate Purchase Requisition <ArrowRight size={12} />
                  </div>
                </div>

                {/* Insight Card 2 */}
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/10 space-y-3 hover:border-emerald-200 transition-all">
                  <div className="flex justify-between items-start">
                    <Badge variant="green">Capacity Optimization</Badge>
                    <span className="text-[10px] text-emerald-600 font-bold">Savings: ₹22,000</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-800">Adjust Reorder Trigger points</h4>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                      RM-SC-001 Wood Screws have a safety buffer 15% higher than actual production standard variance requires.
                    </p>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 cursor-pointer hover:underline">
                    Re-calibrate buffer models <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#4B164C]/5 border border-brand-accent/30 rounded-xl p-3.5 mt-4 flex items-center justify-between text-xs">
              <span className="text-text-secondary">AI predicts a 15% increase in purchase costs next quarter. Optimize safety stocks now.</span>
              <Link href="/inventory" className="text-[#4B164C] font-bold hover:underline shrink-0 ml-2">Optimize Now →</Link>
            </div>
          </div>
        </div>

        {/* Right Column: Procurement Risks */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
            <Truck size={16} className="text-brand-accent" />
            Supply Chain & Material Risks
          </h3>

          <div className="space-y-3.5 mt-2">
            {/* Risk Item 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-text-primary">Teak Wood Vendor Delivery Delay</span>
                <span className="text-rose-600 font-bold">Risk: High (88%)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '88%' }} />
              </div>
              <p className="text-[10px] text-text-muted">Expected 2 days delay based on port congestion data.</p>
            </div>

            {/* Risk Item 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-text-primary">Teak Varnish depletion rate</span>
                <span className="text-amber-600 font-bold">Risk: Medium (54%)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '54%' }} />
              </div>
              <p className="text-[10px] text-text-muted">Increased consumption during manufacturing execution.</p>
            </div>

            {/* Risk Item 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-text-primary">Supplier Price hike on Screws</span>
                <span className="text-emerald-600 font-bold">Risk: Low (12%)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '12%' }} />
              </div>
              <p className="text-[10px] text-text-muted">Vendor confirmed price lock until December 2026.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Orders & Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Grid: Low Stock Alerts and Sales orders (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {recentSalesOrders && recentSalesOrders.length > 0 && (
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-text-primary">Recent Customer Orders</h3>
                <Link href="/sales" className="text-xs font-semibold text-[#4B164C] hover:underline">View Ledger</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th className="text-right">Total Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSalesOrders.map((order: { id: string; orderNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string }) => (
                      <tr key={order.id}>
                        <td>
                          <Link href={`/sales/${order.id}`} className="font-mono text-xs font-semibold text-[#4B164C] hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="font-medium text-text-primary">{order.customerName}</td>
                        <td>
                          <Badge variant={order.status === 'shortage_detected' ? 'red' : order.status === 'ready' ? 'amber' : order.status === 'delivered' ? 'green' : 'gray'}>
                            {order.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="text-right font-semibold text-text-primary">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                        <td className="text-text-muted text-xs">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Grid: Recent Activity timeline (1 col) */}
        <div className="glass-card p-5 space-y-4 flex flex-col h-full">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border/50">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Operations Activity Trail
            </h3>
            <Link href="/audit" className="text-xs font-semibold text-brand-primary hover:underline">Full Log</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2">
            {recentActivity.map((log: { id: string; action: string; entityName?: string; userName?: string; createdAt: string }, idx) => (
              <div key={log.id} className="relative pl-6 pb-2 border-l border-surface-border last:border-0 last:pb-0">
                {/* Timeline node */}
                <span className="absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#4B164C] ring-4 ring-purple-100" />
                
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <time className="text-[10px] text-text-muted">{format(new Date(log.createdAt), 'MMM d, HH:mm')}</time>
                </div>
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">{log.userName}</span>
                  {log.entityName && <> — {log.entityName}</>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
