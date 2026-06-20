'use client';

import { useAuth } from '@/hooks/useAuth';
import { Menu, Bell, Search, LogOut } from 'lucide-react';

export default function Topbar({ 
  sidebarOpen, 
  setSidebarOpen 
}: { 
  sidebarOpen: boolean; 
  setSidebarOpen: (val: boolean) => void 
}) {
  const { logout, isLoggingOut } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => logout();

  return (
    <header className="h-16 bg-bg-primary/80 backdrop-blur-md border-b border-surface-border flex items-center justify-between px-6 z-10">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Toggle (visible only on small screens if we add responsive classes) */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-text-muted hover:text-brand-primary"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-surface-input border border-surface-border rounded-full pl-9 pr-4 py-1.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-brand-highlight focus:ring-1 focus:ring-brand-highlight transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-text-muted hover:text-brand-primary transition-colors rounded-full hover:bg-surface-hover">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-surface-DEFAULT"></span>
        </button>

        <div className="h-5 w-px bg-surface-border mx-1"></div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-rose-500 transition-colors disabled:opacity-50"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
}
