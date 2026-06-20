'use client';

import { useAuth } from '@/hooks/useAuth';
import { Menu, Bell, Search, LogOut, User, Sparkles, ChevronDown, Plus, HelpCircle } from 'lucide-react';
import React, { useState } from 'react';
import Link from 'next/link';

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
  aiOpen,
  setAiOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
  aiOpen: boolean;
  setAiOpen: (val: boolean) => void;
}) {
  const { logout, isLoggingOut, user, login } = useAuth();
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const rolesList = [
    { name: 'Super Admin', email: 'admin@shivfurniture.com', role: 'admin' },
    { name: 'Sales Executive', email: 'priya@shivfurniture.com', role: 'sales' },
    { name: 'Product Manager', email: 'ravi@shivfurniture.com', role: 'product_manager' },
    { name: 'Procurement Mgr', email: 'amit@shivfurniture.com', role: 'purchase' },
    { name: 'Inventory Manager', email: 'neha@shivfurniture.com', role: 'inventory' },
  ];

  const handleSwitchRole = async (email: string) => {
    try {
      await login({ email, password: 'Admin@123' });
      window.location.reload();
    } catch (e) {
      console.error('Failed to switch role', e);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-surface-border flex items-center justify-between px-6 z-10 shrink-0 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-text-secondary hover:text-brand-primary p-1.5 rounded-lg hover:bg-surface-hover/30 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Workspace Selector */}
        <div className="relative">
          <button
            onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-hover/30 text-xs font-semibold text-text-primary border border-surface-border bg-slate-50/50 transition-all"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Shiv Furniture Works (AP-South)</span>
            <ChevronDown size={14} className="text-text-muted" />
          </button>
          
          {showWorkspaceMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowWorkspaceMenu(false)} />
              <div className="absolute left-0 mt-1 w-64 bg-white border border-surface-border rounded-xl shadow-lg z-50 p-1.5 space-y-1 animate-fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Workspaces</div>
                <button className="w-full text-left px-3 py-2 rounded-lg bg-surface-hover text-xs font-medium text-brand-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  AP South Production (Active)
                </button>
                <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-text-secondary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  IN North Warehouse (Transit)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Demo Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-hover/30 text-xs font-bold border border-brand-accent/25 bg-[#F8E7F6]/40 text-[#4B164C] hover:text-brand-hover hover:border-brand-accent transition-all duration-200"
            title="Instant Demo Role Switcher"
          >
            <Sparkles size={13} className="text-brand-accent animate-pulse" />
            <span className="hidden sm:inline">Role:</span>
            <span className="capitalize">{user?.role?.replace('_', ' ')}</span>
            <ChevronDown size={13} className="text-text-muted" />
          </button>
          
          {showRoleMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowRoleMenu(false)} />
              <div className="absolute left-0 mt-1 w-64 bg-white border border-surface-border rounded-xl shadow-lg z-50 p-1.5 space-y-1 animate-fade-in">
                <div className="px-3 py-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-slate-100 pb-1.5 mb-1">
                  Demo Sandbox Role Switcher
                </div>
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      setShowRoleMenu(false);
                      handleSwitchRole(r.email);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-medium flex items-center justify-between transition-colors ${
                      user?.role === r.role ? 'bg-[#F8E7F6]/30 text-[#4B164C] font-semibold' : 'text-text-secondary hover:text-[#4B164C]'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span>{r.name}</span>
                      <span className="text-[9px] text-text-muted">{r.email}</span>
                    </div>
                    {user?.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Global Search */}
        <div className="relative hidden md:block w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search products, orders, SKUs..."
            className="w-full bg-slate-50/50 border border-surface-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:bg-white focus:border-brand-highlight focus:ring-1 focus:ring-brand-highlight/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Action Button */}
        <div className="hidden sm:block">
          <Link href="/products/new" className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-none bg-brand-primary hover:bg-brand-hover">
            <Plus size={14} />
            <span>New Product</span>
          </Link>
        </div>

        {/* AI Assistant Toggle */}
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            aiOpen
              ? 'bg-brand-accent/20 border-brand-accent text-brand-primary font-bold shadow-sm'
              : 'bg-white border-surface-border text-brand-primary hover:bg-brand-accent/10 hover:border-brand-accent'
          }`}
          title="Toggle AI Insight Assistant"
        >
          <Sparkles size={14} className={aiOpen ? 'text-brand-primary' : 'text-brand-accent'} />
          <span className="hidden sm:inline">AI Insights</span>
        </button>

        {/* Notifications */}
        <button className="relative p-1.5 text-text-secondary hover:text-brand-primary rounded-lg hover:bg-surface-hover/30 transition-all">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
        </button>

        <div className="h-6 w-px bg-surface-border" />

        {/* User Info & Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-text-primary">
            <User size={14} className="text-text-muted" />
            <span className="max-w-[100px] truncate">{user?.name}</span>
          </div>
          <button
            onClick={() => logout()}
            disabled={isLoggingOut}
            className="p-1.5 text-text-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
