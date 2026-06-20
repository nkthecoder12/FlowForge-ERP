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
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

export default function DashboardPage() {
  const { useStats } = useDashboard();
  const { data, isLoading, isError } = useStats();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 w-48 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="kpi-card h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-rose-600 font-medium">
        Failed to load dashboard. Check database connection.
      </div>
    );
  }

  const { kpis, lowStockProducts, recentActivity, inventoryHealth, recentSalesOrders } = data;

  const statCards = [
    { title: 'Products', value: kpis.totalProducts, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Sales Orders', value: kpis.totalSalesOrders, icon: ShoppingCart, color: 'text-slate-700', bg: 'bg-slate-100' },
    { title: 'Pending', value: kpis.pendingSalesOrders, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Shortages', value: kpis.shortageOrders, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Low Stock', value: kpis.lowStockCount, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
    {
      title: 'Inventory Value',
      value: `₹${Number(kpis.totalInventoryValue || 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      isText: true,
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <div>
        <h1 className="page-title">Operations Dashboard</h1>
        <p className="page-subtitle">Shiv Furniture Works — real-time manufacturing & sales overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="kpi-card flex items-center gap-3">
              <div className={`p-2 rounded-md ${stat.bg} ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wide truncate">{stat.title}</p>
                <p className={`font-bold text-text-primary truncate ${stat.isText ? 'text-base' : 'text-xl'}`}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {inventoryHealth && (
        <div className="glass-card p-4">
          <h2 className="text-sm font-bold text-text-primary mb-3">Inventory Health Summary</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-md bg-emerald-50 border border-emerald-100">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <div>
                <p className="text-lg font-bold text-emerald-700">{inventoryHealth.healthy}</p>
                <p className="text-[10px] text-emerald-600 uppercase font-semibold">Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-100">
              <AlertTriangle size={18} className="text-amber-600" />
              <div>
                <p className="text-lg font-bold text-amber-700">{inventoryHealth.lowStock}</p>
                <p className="text-[10px] text-amber-600 uppercase font-semibold">Low Stock</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-md bg-rose-50 border border-rose-100">
              <AlertTriangle size={18} className="text-rose-600" />
              <div>
                <p className="text-lg font-bold text-rose-700">{inventoryHealth.critical}</p>
                <p className="text-[10px] text-rose-600 uppercase font-semibold">Critical</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4 flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <AlertTriangle size={16} className="text-rose-500" />
              Low Stock Alerts
            </h2>
            <Link href="/inventory" className="text-xs font-semibold text-brand-highlight hover:underline flex items-center gap-1">
              View Inventory <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-8">All stock levels healthy.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Free Qty</th>
                    <th className="text-right">Min</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((product: { id: string; name: string; sku: string; freeQuantity: number; minStockLevel: number; unitOfMeasure: string }) => (
                    <tr key={product.id}>
                      <td>
                        <p className="font-medium text-text-primary">{product.name}</p>
                        <p className="text-[10px] text-text-muted">{product.sku}</p>
                      </td>
                      <td className="text-right font-semibold text-rose-600">
                        {Number(product.freeQuantity)} {product.unitOfMeasure}
                      </td>
                      <td className="text-right text-text-muted">{Number(product.minStockLevel)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col min-h-[360px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              Recent Activity
            </h2>
            <Link href="/audit" className="text-xs font-semibold text-brand-highlight hover:underline flex items-center gap-1">
              Audit Logs <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {recentActivity.map((log: { id: string; action: string; entityName?: string; userName?: string; createdAt: string }) => (
              <div key={log.id} className="p-2.5 rounded-md bg-slate-50 border border-surface-border text-xs">
                <div className="flex justify-between mb-0.5">
                  <span className="font-semibold text-brand-highlight uppercase text-[10px]">
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <time className="text-text-muted">{format(new Date(log.createdAt), 'MMM d, HH:mm')}</time>
                </div>
                <p className="text-text-secondary">
                  <span className="font-medium text-text-primary">{log.userName}</span>
                  {log.entityName && <> — {log.entityName}</>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {recentSalesOrders && recentSalesOrders.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-text-primary">Recent Sales Orders</h2>
            <Link href="/sales" className="text-xs font-semibold text-brand-highlight hover:underline">View All</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentSalesOrders.map((order: { id: string; orderNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string }) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/sales/${order.id}`} className="font-mono text-xs font-semibold text-brand-highlight hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td>{order.customerName}</td>
                  <td>
                    <Badge variant={order.status === 'shortage_detected' ? 'red' : order.status === 'ready' ? 'amber' : order.status === 'delivered' ? 'green' : 'gray'}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="text-right font-medium">₹{Number(order.totalAmount).toLocaleString('en-IN')}</td>
                  <td className="text-text-muted">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
