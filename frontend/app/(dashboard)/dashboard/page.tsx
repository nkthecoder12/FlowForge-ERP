'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';
import { 
  PackageSearch, 
  Users, 
  ShoppingCart, 
  Factory, 
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardApi.getStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-card w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-6 h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 h-96" />
          <div className="glass-card p-6 h-96" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-rose-400">
        Failed to load dashboard statistics.
      </div>
    );
  }

  const { kpis, lowStockProducts, recentActivity } = data;

  const statCards = [
    { title: 'Total Products', value: kpis.totalProducts, icon: PackageSearch, color: 'text-brand-400', bg: 'bg-brand-400/10' },
    { title: 'Active Users', value: kpis.totalUsers, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Sales Orders', value: kpis.salesOrders, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Purchase Orders', value: kpis.purchaseOrders, icon: ShoppingCart, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Manufacturing', value: kpis.manufacturingOrders, icon: Factory, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-5 flex items-center hover:shadow-card-hover transition-all duration-300 group">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-text-secondary">{stat.title}</p>
                <h3 className="text-2xl font-bold text-brand-primary">{stat.value.toLocaleString()}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alerts */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-lg font-bold text-brand-primary">Low Stock Alerts</h2>
            </div>
            <span className="badge badge-red">{kpis.lowStockCount} items</span>
          </div>
          
          <div className="flex-1 overflow-auto">
            {lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <PackageSearch size={40} className="mb-2 opacity-50" />
                <p>All stock levels are optimal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="p-3 rounded-xl bg-surface-input border border-surface-border flex items-center justify-between group hover:border-rose-500/30 transition-colors">
                    <div>
                      <p className="font-medium text-text-primary">{product.name}</p>
                      <p className="text-xs text-text-muted">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-400">
                        {Number(product.onHandQuantity)} <span className="text-xs font-normal text-text-muted">{product.unitOfMeasure}</span>
                      </p>
                      <p className="text-xs text-text-muted">Min: {Number(product.minStockLevel)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Activity size={20} />
              </div>
              <h2 className="text-lg font-bold text-brand-primary">Recent Activity</h2>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
            {recentActivity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <p>No recent activity.</p>
              </div>
            ) : (
              <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-surface-border">
                {recentActivity.map((log, i) => (
                  <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-surface-border bg-surface-card absolute left-2 md:left-1/2 md:-translate-x-1/2 group-hover:border-brand-primary group-hover:shadow-glow-sm transition-colors z-10" />
                    
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl bg-surface-input border border-surface-border group-hover:border-brand-primary/30 transition-colors ml-4 md:ml-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-brand-primary">{log.action.replace(/_/g, ' ').toUpperCase()}</span>
                        <time className="text-xs text-text-muted">{format(new Date(log.createdAt), 'MMM d, HH:mm')}</time>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {log.userName} 
                        {log.entityName && <span className="text-text-muted"> on </span>}
                        {log.entityName && <span className="font-medium text-text-primary">{log.entityName}</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
