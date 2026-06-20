'use client';

import { useProducts } from '@/hooks/useProducts';
import ProductsTable from '@/components/tables/ProductsTable';
import { Plus, Search, Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import EmptyState from '@/components/ui/EmptyState';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const { useList, deleteProduct } = useProducts({ search });
  const { data, isLoading, isError } = useList();

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="page-title">Products Master</h1>
          <p className="page-subtitle">Manage finished goods recipes and raw materials inventory</p>
        </div>
        <Link href="/products/new" className="btn-primary">
          <Plus size={20} />
          Create Product
        </Link>
      </div>

      <div className="glass-card flex flex-col min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search products by Name/SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2 h-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center h-full min-h-[300px]">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-400">Failed to load products</div>
          ) : data?.products.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No Products Found"
                description="Create raw materials (wooden legs, wooden tops, screws) and finished goods (wooden tables) to get started."
                icon={Package}
                action={
                  <Link href="/products/new" className="btn-primary">
                    <Plus size={16} /> Create Product
                  </Link>
                }
              />
            </div>
          ) : (
            <ProductsTable products={data?.products || []} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
}
