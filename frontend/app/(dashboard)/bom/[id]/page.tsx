'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBom } from '@/hooks/useBom';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Badge from '@/components/ui/Badge';
import { Loader2, AlertTriangle, ArrowLeft, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function BomDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { useGet } = useBom();
  const { data: bom, isLoading, isError } = useGet(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="animate-spin text-brand-highlight" size={32} />
      </div>
    );
  }

  if (isError || !bom) {
    return (
      <div className="text-center py-12 space-y-3">
        <AlertTriangle className="mx-auto text-rose-500" size={32} />
        <p className="font-semibold">BoM not found</p>
        <Link href="/bom" className="btn-secondary inline-flex"><ArrowLeft size={14} /> Back to BoM</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'Bill of Materials', href: '/bom' }, { label: bom.name }]} />
      <div className="flex justify-between items-start gap-4">
        <div>
          <button onClick={() => router.back()} className="text-xs text-brand-highlight hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft size={12} /> Back
          </button>
          <div className="flex items-center gap-2">
            <h1 className="page-title">{bom.name}</h1>
            <Badge variant={bom.isActive ? 'green' : 'gray'}>{bom.isActive ? 'Active' : 'Inactive'}</Badge>
          </div>
          <p className="page-subtitle">
            Finished product: <span className="font-semibold">{bom.product.name}</span> ({bom.product.sku})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
            <ClipboardList size={16} /> Component Recipe
          </h2>
          <p className="text-xs text-text-muted mb-3">
            Yield: <span className="font-semibold text-text-primary">{Number(bom.quantity)} {bom.product.unitOfMeasure}</span> per batch
          </p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>SKU</th>
                <th className="text-right">Qty Required</th>
                <th className="text-right">On Hand</th>
                <th className="text-right">Free</th>
              </tr>
            </thead>
            <tbody>
              {bom.items.map((item) => {
                const onHand = Number(item.component.onHandQuantity);
                const reserved = Number(item.component.reservedQuantity);
                const free = onHand - reserved;
                return (
                  <tr key={item.id}>
                    <td className="font-medium">{item.component.name}</td>
                    <td className="font-mono text-xs text-text-muted">{item.component.sku}</td>
                    <td className="text-right font-semibold">
                      {Number(item.quantity)} {item.unitOfMeasure}
                    </td>
                    <td className="text-right">{onHand}</td>
                    <td className={`text-right font-medium ${free <= Number(item.component.minStockLevel) ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {free}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4 space-y-2 text-sm">
            <h3 className="font-bold text-text-primary text-sm">BoM Details</h3>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Created</span>
              <span>{format(new Date(bom.createdAt), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Components</span>
              <span className="font-semibold">{bom.items.length}</span>
            </div>
          </div>
          {bom.notes && (
            <div className="glass-card p-4">
              <h3 className="text-xs font-bold text-text-muted uppercase mb-2">Notes</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{bom.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
