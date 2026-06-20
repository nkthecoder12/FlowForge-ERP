'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Package,
  ClipboardList,
  Warehouse,
  ShoppingCart,
  BookOpen,
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'product_manager', 'sales', 'inventory'] },
  { name: 'Products', path: '/products', icon: Package, roles: ['admin', 'product_manager', 'sales', 'inventory'] },
  { name: 'Bill of Materials', path: '/bom', icon: ClipboardList, roles: ['admin', 'product_manager'] },
  { name: 'Inventory', path: '/inventory', icon: Warehouse, roles: ['admin', 'inventory'] },
  { name: 'Stock Ledger', path: '/inventory/ledger', icon: BookOpen, roles: ['admin', 'inventory'] },
  { name: 'Sales Orders', path: '/sales', icon: ShoppingCart, roles: ['admin', 'sales'] },
  { name: 'Users', path: '/users', icon: Users, roles: ['admin'] },
  { name: 'Audit Logs', path: '/audit', icon: ShieldAlert, roles: ['admin'] },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role || 'sales';
  const visibleItems = MENU_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={`${isOpen ? 'w-60' : 'w-[68px]'} bg-surface-sidebar text-text-inverse transition-all duration-200 relative flex flex-col z-20 shrink-0`}
    >
      <div className="h-14 flex items-center border-b border-white/10 px-4 relative">
        <div className={`flex items-center gap-2.5 w-full ${!isOpen && 'justify-center'}`}>
          <div className="w-8 h-8 rounded bg-brand-highlight flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">SF</span>
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-white leading-tight truncate">Shiv Furniture</p>
              <p className="text-[10px] text-slate-400 truncate">Works ERP</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-4 bg-white border border-surface-border rounded-full p-0.5 text-text-muted hover:text-brand-primary shadow-sm z-30"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {isOpen && (
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Modules
          </div>
        )}
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-3 py-2 rounded-md transition-colors text-sm ${
                isActive
                  ? 'bg-brand-highlight text-white font-medium'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={!isOpen ? item.name : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {isOpen && <span className="ml-3 truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-xs font-medium text-white">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {isOpen && (
            <div className="overflow-hidden min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
