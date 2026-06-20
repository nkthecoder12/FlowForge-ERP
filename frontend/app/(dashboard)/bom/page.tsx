'use client';

import { useBom } from '@/hooks/useBom';
import { Plus, ClipboardList, Loader2 } from 'lucide-react';
import Link from 'next/link';
import EmptyState from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import Badge from '@/components/ui/Badge';
import React from 'react';

export default function BomPage() {
  const { user } = useAuth();
  const { useList } = useBom();
  const { data: boms, isLoading, isError } = useList();

  const isPMOrAdmin = user?.role === 'admin' || user?.role === 'product_manager';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="page-title">Bills of Materials (BoM)</h1>
          <p className="page-subtitle">Define component recipes for finished assembly tables</p>
        </div>
        {isPMOrAdmin && (
          <Link href="/bom/new" className="btn-primary">
            <Plus size={20} />
            Define BoM Recipe
          </Link>
        )}
      </div>

      <div className="glass-card flex flex-col min-h-[500px] overflow-hidden">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center h-full min-h-[300px]">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-400">Failed to load Bills of Materials</div>
          ) : !boms || boms.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="No BoM Recipes Defined"
                description="Create a Bill of Materials recipe linking finished tables to their raw material components (legs, top, screws)."
                icon={ClipboardList}
                action={
                  isPMOrAdmin ? (
                    <Link href="/bom/new" className="btn-primary">
                      <Plus size={16} /> Define BoM Recipe
                    </Link>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {boms.map((bom) => (
                <div key={bom.id} className="bg-surface-card/30 border border-surface-border rounded-2xl p-5 hover:shadow-card-hover transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-brand-primary leading-tight">{bom.name}</h3>
                        <p className="text-xs text-text-secondary mt-1">Product: <span className="font-semibold">{bom.product.name} ({bom.product.sku})</span></p>
                      </div>
                      <Badge variant={bom.isActive ? 'green' : 'gray'}>
                        {bom.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <p className="text-xs text-text-muted mb-4">
                      Yield output rate: <span className="font-bold text-brand-primary">{Number(bom.quantity)} {bom.product.unitOfMeasure}</span> per run.
                    </p>

                    {bom.notes && (
                      <div className="p-3 bg-surface-input/50 rounded-xl text-xs text-text-secondary border border-surface-border/30 mb-4">
                        <span className="font-bold text-text-primary block mb-0.5">Notes:</span>
                        {bom.notes}
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Components:</h4>
                      <div className="divide-y divide-surface-border/30">
                        {bom.items.map((item) => (
                          <div key={item.id} className="py-2 flex items-center justify-between text-xs text-text-secondary">
                            <span>{item.component.name} ({item.component.sku})</span>
                            <span className="font-semibold text-brand-primary">
                              {Number(item.quantity)} {item.unitOfMeasure}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-surface-border/50 pt-3 flex justify-between items-center text-[10px] text-text-muted">
                    <span>Created: {format(new Date(bom.createdAt), 'MMM d, yyyy')}</span>
                    <Link href={`/bom/${bom.id}`} className="text-brand-highlight font-semibold hover:underline text-xs">
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
