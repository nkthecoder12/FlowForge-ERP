'use client';

import { useAuth } from '@/hooks/useAuth';
import { Menu, Bell, Search, LogOut, User } from 'lucide-react';

export default function Topbar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
}) {
  const { logout, isLoggingOut, user } = useAuth();

  return (
    <header className="h-14 bg-surface-card border-b border-surface-border flex items-center justify-between px-4 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-text-muted hover:text-text-primary p-1"
        >
          <Menu size={18} />
        </button>
        <div className="relative hidden md:block w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
          <input
            type="text"
            placeholder="Search products, orders, SKUs..."
            className="w-full bg-slate-50 border border-surface-border rounded-md pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-highlight focus:ring-1 focus:ring-brand-highlight/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden lg:inline text-xs text-text-muted font-medium">
          Shiv Furniture Works
        </span>
        <button className="relative p-1.5 text-text-muted hover:text-text-primary rounded-md hover:bg-slate-50">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>
        <div className="h-5 w-px bg-surface-border" />
        <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
          <User size={16} />
          <span className="font-medium">{user?.name}</span>
        </div>
        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-rose-600 transition-colors disabled:opacity-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">{isLoggingOut ? '...' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
