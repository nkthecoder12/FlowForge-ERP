'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Settings, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'sales', 'purchase', 'inventory', 'product_manager'] },
  { name: 'Users', path: '/users', icon: Users, roles: ['admin'] },
  { name: 'Audit Logs', path: '/audit', icon: ShieldAlert, roles: ['admin'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const userRole = user?.role || 'sales';
  const visibleItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <aside 
      className={`${isOpen ? 'w-64' : 'w-20'} bg-surface-card border-r border-surface-border transition-all duration-300 relative flex flex-col shadow-card z-20`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-surface-border relative px-4">
        <div className={`flex items-center gap-3 w-full ${!isOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">FF</span>
          </div>
          {isOpen && <span className="font-bold text-brand-primary tracking-tight truncate">FlowForge</span>}
        </div>
        
        {/* Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-5 bg-surface-input border border-surface-border rounded-full p-1 text-text-muted hover:text-brand-primary hover:bg-surface-hover transition-colors z-30"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
        <div className={`text-xs font-semibold text-text-muted uppercase tracking-wider mb-4 px-3 ${!isOpen && 'text-center'}`}>
          {isOpen ? 'Core Modules' : 'Core'}
        </div>
        
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-brand-highlight/10 text-brand-primary font-medium' 
                  : 'text-text-secondary hover:bg-surface-hover hover:text-brand-primary'
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <Icon size={20} className={`shrink-0 ${isActive ? 'text-brand-highlight' : 'text-text-muted group-hover:text-brand-primary'}`} />
              
              <span className={`ml-3 whitespace-nowrap transition-opacity duration-300 ${
                isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'
              }`}>
                {item.name}
              </span>
              
              {isActive && isOpen && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shadow-glow-brand" />
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* User Area - Collapsed */}
      <div className="p-4 border-t border-surface-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-input border border-surface-border flex items-center justify-center shrink-0 text-xs font-medium text-brand-primary">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
