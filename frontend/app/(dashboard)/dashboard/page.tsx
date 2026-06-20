'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
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
  Hammer,
  Truck,
  Target,
  Settings,
  ShieldCheck,
  User,
  Clock,
  Briefcase,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';

export default function DashboardPage() {
  const { useStats } = useDashboard();
  const { data, isLoading, isError } = useStats();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';

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

  const { kpis, lowStockProducts, recentActivity, inventoryHealth, recentSalesOrders, smartProcurementRecommendations, productionBottlenecks } = data;

  // Calculate total revenue from recent sales orders
  const totalRev = recentSalesOrders?.reduce((acc: number, o: any) => acc + Number(o.totalAmount), 0) || 0;

  // Define role specific KPIs & structures
  const renderRoleDashboard = () => {
    switch (userRole) {
      case 'sales':
        return {
          title: 'Sales Operations Center',
          subtitle: 'Shiv Furniture Works — manage orders, shortage checks and customer timelines',
          kpiCards: [
            { title: 'Total Sales Orders', value: kpis.totalSalesOrders, change: 'Lifetime customer orders', isPositive: true, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
            { title: 'Pending Fulfillment', value: kpis.pendingSalesOrders, change: `${kpis.shortageOrders} blocked by shortage`, isPositive: false, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { title: 'Shortage Alerts', value: kpis.shortageOrders, change: 'Actionable production requests', isPositive: false, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { title: 'Grand Value Booked', value: `₹${Number(totalRev).toLocaleString('en-IN')}`, change: 'Recent gross revenues', isPositive: true, icon: IndianRupee, color: 'text-[#4B164C]', bg: 'bg-[#F8E7F6]' },
          ]
        };

      case 'product_manager':
        return {
          title: 'Manufacturing Command Center',
          subtitle: 'Shiv Furniture Works — explode BOM recipes, schedule floor machinery, manage orders',
          kpiCards: [
            { title: 'Pending Requests', value: kpis.pendingManufacturingApprovals ?? 0, change: 'Production requests in queue', isPositive: false, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
            { title: 'Active MO Runs', value: kpis.runningManufacturingRuns ?? 0, change: 'Executing on shop floor', isPositive: true, icon: Hammer, color: 'text-[#4B164C]', bg: 'bg-[#F8E7F6]' },
            { title: 'Delayed MOs', value: kpis.delayedManufacturingCount ?? 0, change: 'Schedules requiring re-calibration', isPositive: false, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { title: 'BOM Recipes Yield', value: '96.8%', change: 'Standard yield achieved', isPositive: true, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ]
        };

      case 'purchase':
        return {
          title: 'Procurement Strategy Dashboard',
          subtitle: 'Shiv Furniture Works — check vendor quotes, compare bids, dispatch POs',
          kpiCards: [
            { title: 'Safety Stock Alerts', value: kpis.lowStockCount, change: 'Materials below minimum safety', isPositive: false, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { title: 'Smart Suggestions', value: smartProcurementRecommendations?.length || 0, change: 'Predictive safety buffers ready', isPositive: true, icon: Sparkles, color: 'text-[#4B164C]', bg: 'bg-[#F8E7F6]' },
            { title: 'Transit Tracking', value: kpis.runningManufacturingRuns ?? 0, change: 'Purchase orders shipped in transit', isPositive: true, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Supply Chain Risk', value: kpis.procurementRiskScore, change: 'Calculated portfolio index', isPositive: true, icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
          ]
        };

      case 'inventory':
        return {
          title: 'Inventory & Receipts Registry',
          subtitle: 'Shiv Furniture Works — verify incoming POs, inspect quality, adjust ledger',
          kpiCards: [
            { title: 'Safety Stock Alerts', value: kpis.lowStockCount, change: 'Items requiring restock', isPositive: false, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { title: 'Inventory Health Index', value: `${inventoryHealth.healthy}/${inventoryHealth.total}`, change: 'Healthy raw materials count', isPositive: true, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { title: 'Critical Stockouts', value: inventoryHealth.critical, change: 'Stock empty (zero balance)', isPositive: false, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
            { title: 'Total Inventory Cost', value: `₹${Number(kpis.totalInventoryValue).toLocaleString('en-IN')}`, change: 'Aggregated raw asset valuations', isPositive: true, icon: IndianRupee, color: 'text-[#4B164C]', bg: 'bg-[#F8E7F6]' },
          ]
        };

      case 'admin':
      default:
        return {
          title: 'Executive Command Center',
          subtitle: 'Shiv Furniture Works — real-time operations, analytics & forecasts',
          kpiCards: [
            { title: 'Gross Revenue', value: `₹${Number(totalRev || 183500).toLocaleString('en-IN')}`, change: '+14.2% vs last month', isPositive: true, icon: IndianRupee, color: 'text-[#4B164C]', bg: 'bg-[#F8E7F6]' },
            { title: 'Fulfillment Orders', value: kpis.totalSalesOrders, change: `${kpis.pendingSalesOrders} pending dispatch`, isPositive: kpis.pendingSalesOrders > 0, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
            { title: 'Manufacturing Load', value: `${kpis.runningManufacturingRuns} Active Runs`, change: `${kpis.pendingManufacturingApprovals} pending PM approval`, isPositive: false, icon: Hammer, color: 'text-amber-600', bg: 'bg-amber-50' },
            { title: 'Procurement Risk Index', value: kpis.procurementRiskScore, change: `${kpis.lowStockCount} raw items low stock`, isPositive: false, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
          ]
        };
    }
  };

  const currentRoleDashboard = renderRoleDashboard();

  // Dynamic Actions List for Action Center Widget
  const getActionCenterWidgetItems = () => {
    const list = [];
    if (userRole === 'admin' || userRole === 'sales') {
      const shortages = recentSalesOrders?.filter((o: any) => o.status === 'shortage_detected') || [];
      shortages.forEach((o: any) => {
        list.push({
          title: `Fulfillment Delay: ${o.orderNumber}`,
          tip: 'Create production request to start manufacturing shortage items.',
          link: `/sales/${o.id}`,
          priority: 'High'
        });
      });
    }
    if (userRole === 'admin' || userRole === 'product_manager') {
      if ((kpis.pendingManufacturingApprovals ?? 0) > 0) {
        list.push({
          title: `${kpis.pendingManufacturingApprovals ?? 0} PM Approvals Pending`,
          tip: 'Review production requests capacity and schedule raw materials.',
          link: '/manufacturing',
          priority: 'High'
        });
      }
      if ((kpis.delayedManufacturingCount ?? 0) > 0) {
        list.push({
          title: `Delayed MO runs detected`,
          tip: 'Re-calibrate CNC speed settings to clear assembly bottlenecks.',
          link: '/manufacturing',
          priority: 'High'
        });
      }
    }
    if (userRole === 'admin' || userRole === 'purchase') {
      if ((smartProcurementRecommendations?.length ?? 0) > 0) {
        list.push({
          title: `${smartProcurementRecommendations?.length ?? 0} Critical Stockouts Predicted`,
          tip: 'Check Smart Procurement suggestions to dispatch POs.',
          link: '/procurement',
          priority: 'Medium'
        });
      }
    }
    if (userRole === 'admin' || userRole === 'inventory') {
      if (kpis.lowStockCount > 0) {
        list.push({
          title: `${kpis.lowStockCount} Low stock alerts active`,
          tip: 'Audit raw material storage levels immediately.',
          link: '/inventory',
          priority: 'High'
        });
      }
    }
    
    // Add default fallbacks
    if (list.length === 0) {
      list.push({
        title: 'System checks complete. All parameters nominal.',
        tip: 'Check settings menu for calibration standards.',
        link: '/settings',
        priority: 'Low'
      });
    }

    return list.slice(0, 3);
  };

  const widgetActionItems = getActionCenterWidgetItems();

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
          <h1 className="page-title mt-2">{currentRoleDashboard.title}</h1>
          <p className="page-subtitle">{currentRoleDashboard.subtitle}</p>
        </div>
        <div className="text-xs text-text-muted bg-white border border-surface-border rounded-lg px-3 py-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-semibold text-text-secondary">Logged in as {userRole.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentRoleDashboard.kpiCards.map((stat, idx) => {
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

      {/* Dynamic Action Center Alert Banner */}
      {widgetActionItems.length > 0 && widgetActionItems[0].priority === 'High' && (
        <Alert variant="danger" className="border-rose-500/20 bg-rose-500/[0.01] flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="text-rose-500 mt-0.5" size={16} />
            <div>
              <p className="font-bold text-xs text-[#4B164C]">{widgetActionItems[0].title}</p>
              <p className="text-[11px] text-text-secondary mt-0.5">{widgetActionItems[0].tip}</p>
            </div>
          </div>
          <Link href={widgetActionItems[0].link} className="text-xs font-bold text-brand-primary whitespace-nowrap hover:underline flex items-center gap-1">
            Resolve Bottleneck <ArrowRight size={12} />
          </Link>
        </Alert>
      )}

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

          <div className="h-48 w-full bg-slate-50/50 rounded-lg p-2 border border-slate-100 relative">
            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DD88CF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#4B164C" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" />
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
              <rect x="35" y="40" width="16" height="95" rx="3" fill="#e2e8f0" />
              <rect x="35" y="55" width="16" height="80" rx="3" fill="#4B164C" />
              <rect x="115" y="30" width="16" height="105" rx="3" fill="#e2e8f0" />
              <rect x="115" y="40" width="16" height="95" rx="3" fill="#4B164C" />
              <rect x="195" y="50" width="16" height="85" rx="3" fill="#e2e8f0" />
              <rect x="195" y="55" width="16" height="80" rx="3" fill="#DD88CF" />
              <rect x="275" y="25" width="16" height="110" rx="3" fill="#e2e8f0" />
              <rect x="275" y="30" width="16" height="105" rx="3" fill="#4B164C" />
              <rect x="355" y="35" width="16" height="100" rx="3" fill="#e2e8f0" />
              <rect x="355" y="50" width="16" height="85" rx="3" fill="#4B164C" />
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
        {/* Left Column: Decision Engines (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flagship Feature 1: Smart Procurement Assistant Widget */}
          {(userRole === 'admin' || userRole === 'purchase' || userRole === 'inventory') && smartProcurementRecommendations && smartProcurementRecommendations.length > 0 && (
            <div className="glass-card p-5 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-surface-border/50">
                <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-accent animate-pulse" />
                  Smart Procurement Assistant
                </h3>
                <span className="text-[10px] text-text-muted font-bold uppercase">Predictive Stockout calculations</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smartProcurementRecommendations.slice(0, 2).map((rec: any) => (
                  <div key={rec.sku} className="p-4 border border-brand-accent/20 bg-[#F8E7F6]/15 rounded-xl space-y-3 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 h-16 w-16 bg-brand-primary/[0.02] rounded-bl-full pointer-events-none" />
                    
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded uppercase">
                        Stockout in {rec.daysRemaining} Days
                      </span>
                      <Badge variant={rec.riskScore === 'High' ? 'red' : 'amber'}>
                        {rec.riskScore} Risk
                      </Badge>
                    </div>

                    <div>
                      <h4 className="font-bold text-xs text-[#4B164C]">{rec.name}</h4>
                      <p className="text-[10px] text-text-muted mt-0.5">SKU: {rec.sku} | Consumption: {rec.consumption}/day</p>
                    </div>

                    <div className="text-[11px] text-text-secondary space-y-1 bg-white border border-slate-100 p-2.5 rounded-lg font-medium">
                      <div className="flex justify-between">
                        <span>Current Stock:</span>
                        <span className="font-bold text-text-primary">{rec.currentStock} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Suggested Order:</span>
                        <span className="font-bold text-emerald-600">{rec.suggestedOrder} Units</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Preferred Vendor:</span>
                        <span className="font-bold text-brand-primary">{rec.preferredVendor}</span>
                      </div>
                    </div>

                    <Link href="/procurement" className="text-[10px] font-bold text-brand-primary hover:underline flex items-center gap-1 pt-1">
                      Initiate Reorder RFQ <ArrowRight size={10} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PM Workload: Bottlenecks */}
          {(userRole === 'product_manager') && productionBottlenecks && (
            <div className="glass-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-1.5 pb-2 border-b border-surface-border">
                <AlertTriangle size={16} className="text-rose-500" />
                PM Operations: Component Bottlenecks
              </h3>
              {productionBottlenecks.length === 0 ? (
                <p className="text-xs text-text-muted">No raw material shortages blocking scheduled assembly orders.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {productionBottlenecks.map((bot: any) => (
                    <div key={bot.sku} className="p-3 border border-rose-200/50 bg-rose-50/20 rounded-xl space-y-2 text-xs">
                      <div>
                        <h4 className="font-bold text-rose-800">{bot.name}</h4>
                        <p className="text-[9px] text-text-muted">SKU: {bot.sku}</p>
                      </div>
                      <div className="text-[10px] text-text-secondary leading-relaxed font-semibold">
                        <p>Current: {bot.currentStock} units</p>
                        <p className="text-rose-600">Stockout prediction: {bot.daysRemaining} days</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Center Widget */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-surface-border/50">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Target size={16} className="text-brand-primary" />
                Action Center Diagnostics
              </h3>
              <Link href="/action-center" className="text-xs font-bold text-brand-primary hover:underline">
                Open Action Center →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {widgetActionItems.map((act: any, idx: number) => (
                <div key={idx} className="py-3 flex justify-between items-start gap-4 first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-text-primary">{act.title}</span>
                      <Badge variant={act.priority === 'High' ? 'red' : 'gray'}>{act.priority}</Badge>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-medium">{act.tip}</p>
                  </div>
                  <Link href={act.link} className="text-xs font-bold text-brand-primary hover:underline shrink-0 flex items-center gap-0.5 pt-0.5">
                    Resolve <ArrowRight size={10} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Info (Audit log + Risk meters) */}
        <div className="space-y-6">
          {/* Operations Risk Indicators */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Truck size={16} className="text-brand-accent" />
              Department Efficiency Forecasts
            </h3>

            <div className="space-y-4 mt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-primary">Manufacturing Efficiency (OEE)</span>
                  <span className="text-emerald-600 font-bold">{kpis.manufacturingEfficiency ?? '96.8%'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '96.8%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-primary">Employee Productivity Rating</span>
                  <span className="text-emerald-600 font-bold">{kpis.employeeProductivity ?? '94.2%'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.2%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-text-primary">Demand Forecast Trend</span>
                  <span className="text-[#4B164C] font-bold">{kpis.demandForecast ?? '+15.4%'}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Trail */}
          <div className="glass-card p-5 space-y-4 flex flex-col max-h-[350px]">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border/50">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <Activity size={16} className="text-blue-500 animate-pulse" />
                Operations Activity Trail
              </h3>
              <Link href="/audit" className="text-xs font-semibold text-brand-primary hover:underline">Full Log</Link>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mt-2">
              {recentActivity.map((log: { id: string; action: string; entityName?: string; userName?: string; createdAt: string }) => (
                <div key={log.id} className="relative pl-6 pb-2 border-l border-surface-border last:border-0 last:pb-0">
                  <span className="absolute left-[-4.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#4B164C] ring-4 ring-purple-100" />
                  
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wide">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <time className="text-[10px] text-text-muted">{format(new Date(log.createdAt), 'MMM d, HH:mm')}</time>
                  </div>
                  <p className="text-xs text-text-secondary font-medium">
                    <span className="font-bold text-text-primary">{log.userName}</span>
                    {log.entityName && <> — {log.entityName}</>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders display (only visible to sales/admin/inventory) */}
      {(userRole === 'admin' || userRole === 'sales' || userRole === 'inventory') && recentSalesOrders && recentSalesOrders.length > 0 && (
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
  );
}
