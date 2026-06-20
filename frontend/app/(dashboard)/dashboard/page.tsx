'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Activity,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns';
import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { useStats } = useDashboard();
  const { data, isLoading, isError } = useStats();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-card w-48 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
      <div className="p-6 text-center text-rose-500 font-semibold">
        Failed to load dashboard statistics. Ensure environment configuration is complete.
      </div>
    );
  }

  const { kpis, lowStockProducts, recentActivity } = data;

  const statCards = [
    { title: 'Total Products', value: kpis.totalProducts, icon: Package, color: 'text-brand-400', bg: 'bg-brand-400/10' },
    { title: 'Total Sales Orders', value: kpis.totalSalesOrders, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Pending Orders', value: kpis.pendingSalesOrders, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { title: 'Shortage Orders', value: kpis.shortageOrders, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { title: 'Low Stock Products', value: kpis.lowStockCount, icon: FileSpreadsheet, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Welcome to Shiv Furniture Works. Here's your operations status.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
        <div className="glass-card p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-lg font-bold text-brand-primary">Low Stock Alerts</h2>
            </div>
            <Link href="/inventory" className="text-xs font-semibold text-brand-primary hover:text-brand-hover flex items-center gap-1">
              View Inventory <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                <Package size={40} className="mb-2 opacity-50 text-emerald-400" />
                <p className="text-xs">All inventory stock levels are healthy.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product: any) => (
                  <div key={product.id} className="p-3 rounded-xl bg-surface-input border border-surface-border flex items-center justify-between group hover:border-rose-500/30 transition-colors">
                    <div>
                      <p className="font-semibold text-text-primary text-sm">{product.name}</p>
                      <p className="text-[10px] text-text-secondary">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-500 text-sm">
                        Free: {Number(product.freeQuantity)} <span className="text-xs font-normal text-text-muted">{product.unitOfMeasure}</span>
                      </p>
                      <p className="text-[10px] text-text-muted">Min: {Number(product.minStockLevel)} (On Hand: {Number(product.onHandQuantity)})</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card p-6 flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Activity size={20} />
              </div>
              <h2 className="text-lg font-bold text-brand-primary">System Activity Trail</h2>
            </div>
            <Link href="/audit" className="text-xs font-semibold text-brand-primary hover:text-brand-hover flex items-center gap-1">
              View Audit logs <ArrowRight size={12} />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-1">
            {recentActivity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary">
                <p className="text-xs">No logs recorded yet.</p>
              </div>
            ) : (
              <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-1 before:w-0.5 before:bg-surface-border">
                {recentActivity.map((log: any) => (
                  <div key={log.id} className="relative group">
                    <div className="flex items-center justify-center w-2.5 h-2.5 rounded-full border-2 border-surface-border bg-surface-card absolute left-[-1.45rem] top-1.5 group-hover:border-brand-primary transition-colors z-10" />
                    
                    <div className="p-3.5 rounded-xl bg-surface-input border border-surface-border group-hover:border-brand-primary/30 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <time className="text-[10px] text-text-muted">
                          {format(new Date(log.createdAt), 'MMM d, HH:mm')}
                        </time>
                      </div>
                      <p className="text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">{log.userName}</span>
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
