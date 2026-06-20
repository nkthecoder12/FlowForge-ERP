'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSales } from '@/hooks/useSales';
import { 
  Package, Loader2, Calendar, User, Phone, Mail, 
  AlertTriangle, ArrowLeft, CheckCircle, Clock 
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

export default function SalesOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { useGet, confirm: confirmOrder, deliver, cancel, isConfirming, isDelivering, isCancelling } = useSales();
  const { data: order, isLoading, isError } = useGet(id);

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col justify-center items-center min-h-[400px] space-y-4">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
        <p className="text-text-secondary text-sm">Loading order details...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full inline-block">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-brand-primary">Order Not Found</h2>
        <p className="text-sm text-text-secondary">The sales order you are looking for does not exist or has been deleted.</p>
        <Link href="/sales" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Sales Orders
        </Link>
      </div>
    );
  }

  const handleConfirmAction = async () => {
    try {
      await confirmOrder(id);
    } catch {
      // Handled by toast
    }
  };

  const handleDeliverAction = async () => {
    try {
      await deliver(id);
    } catch {
      // Handled by toast
    }
  };

  const handleCancelAction = async () => {
    if (!window.confirm('Cancel this sales order? Reserved stock will be released.')) return;
    try {
      await cancel(id);
    } catch {
      // Handled by toast
    }
  };

  // Shortage parser helper
  const parseShortageAnalysis = (notes: string | null | undefined) => {
    if (!notes) return null;
    const delimiter = '\n\n[Shortage Analysis]\n';
    const parts = notes.split(delimiter);
    if (parts.length < 2) return null;
    try {
      return JSON.parse(parts[1]);
    } catch {
      return null;
    }
  };

  const getOriginalNotes = (notes: string | null | undefined) => {
    if (!notes) return '';
    const delimiter = '\n\n[Shortage Analysis]\n';
    return notes.split(delimiter)[0];
  };

  const shortageReport = parseShortageAnalysis(order.notes);
  const originalNotes = getOriginalNotes(order.notes);

  return (
    <div className="space-y-6">
      {/* Back & Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-hover mb-2 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Sales
          </button>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Sales Order: {order.orderNumber}</h1>
            <Badge
              variant={
                order.status === 'draft' ? 'gray' :
                order.status === 'confirmed' ? 'blue' :
                order.status === 'shortage_detected' ? 'red' :
                order.status === 'ready' ? 'amber' : 'green'
              }
            >
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="page-subtitle">Detailed allocation breakdown and delivery dispatch control</p>
        </div>

        <div className="flex items-center gap-2">
          {(order.status === 'draft' || order.status === 'shortage_detected') && (
            <Button type="button" onClick={handleConfirmAction} isLoading={isConfirming}>
              Confirm & Check Stock
            </Button>
          )}
          {order.status === 'ready' && (
            <Button type="button" className="bg-emerald-600 hover:bg-emerald-700 border-0" onClick={handleDeliverAction} isLoading={isDelivering}>
              Deliver Order
            </Button>
          )}
          {!['delivered', 'cancelled'].includes(order.status) && (
            <Button type="button" variant="danger" onClick={handleCancelAction} isLoading={isCancelling}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered items */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-brand-primary flex items-center gap-2">
              <Package size={18} />
              Ordered Items Recipe
            </h3>
            
            <div className="border border-surface-border rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-card/30 text-text-secondary uppercase">
                  <tr>
                    <th className="p-4">Product Details</th>
                    <th className="p-4 text-right">Quantity</th>
                    <th className="p-4 text-right">Unit Price</th>
                    <th className="p-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border bg-surface-input">
                  {order.items.map((item: any) => (
                    <tr key={item.id}>
                      <td className="p-4">
                        <p className="font-semibold text-text-primary text-sm">{item.product.name}</p>
                        <p className="text-xs text-text-muted">SKU: {item.product.sku}</p>
                      </td>
                      <td className="p-4 text-right font-medium text-sm">
                        {Number(item.quantityOrdered)} {item.product.unitOfMeasure}
                      </td>
                      <td className="p-4 text-right text-sm">
                        INR {Number(item.unitPrice).toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-bold text-brand-primary text-sm">
                        INR {Number(item.subtotal || (Number(item.quantityOrdered) * Number(item.unitPrice))).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-right pr-4 pt-2 border-t border-surface-border flex justify-end items-center gap-4">
              <span className="text-sm text-text-secondary">Grand Total Amount:</span>
              <span className="font-bold text-brand-primary text-xl">INR {Number(order.totalAmount).toLocaleString()}</span>
            </div>
          </div>

          {/* Shortage report details */}
          {order.status === 'shortage_detected' && shortageReport && (
            <div className="glass-card p-6 space-y-4 border-rose-500/20">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle size={18} />
                Shortage Components Explosion Analysis
              </h3>
              
              <Alert variant="danger">
                Insufficient finished goods in stock. Review components shortage exploded below to clear manufacturing bottlenecks.
              </Alert>

              <div className="space-y-4">
                {shortageReport.shortages.map((sh: any, sIdx: number) => (
                  <div key={sIdx} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-rose-500/10 pb-2">
                      <span className="font-bold text-rose-500">{sh.productName} ({sh.sku})</span>
                      <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded text-xs font-bold">
                        Shortage: {sh.shortage} pcs
                      </span>
                    </div>

                    {sh.hasBom ? (
                      <div className="space-y-2">
                        <p className="text-xs text-text-secondary italic">Exploding BOM recipe: {sh.bomName}</p>
                        <div className="space-y-1.5">
                          {sh.materialsNeeded.map((mat: any, mIdx: number) => {
                            const isMissing = mat.shortage > 0;
                            return (
                              <div key={mIdx} className="flex justify-between items-center text-xs p-2.5 rounded bg-surface-input border border-surface-border/50">
                                <span className="text-text-primary font-semibold">{mat.productName || mat.product}</span>
                                <div className="flex items-center gap-4">
                                  <span className="text-text-secondary text-xs">
                                    Needed: {mat.required} | Free: {mat.available}
                                  </span>
                                  {isMissing ? (
                                    <span className="text-rose-500 font-bold bg-rose-500/10 px-2 py-0.5 rounded text-xs">
                                      Missing: {mat.shortage} {mat.unitOfMeasure}
                                    </span>
                                  ) : (
                                    <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                                      Available
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-rose-500 pl-2">No active BoM recipe found to explode components!</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.status === 'ready' && (
            <div className="glass-card p-6 border-emerald-500/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                  <CheckCircle size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-emerald-400">All Materials Reserved & Ready</h3>
                  <p className="text-sm text-text-secondary">
                    Every finished good line item on this sales order is fully allocated and locked in stock. You can safely ship this order.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-6">
          {/* Customer Panel */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-brand-primary flex items-center gap-2">
              <User size={18} />
              Customer Details
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <span className="text-text-muted w-16">Name:</span>
                <span className="font-semibold text-text-primary">{order.customerName}</span>
              </div>
              
              {order.customerPhone && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="text-text-muted w-16">Phone:</span>
                  <span>{order.customerPhone}</span>
                </div>
              )}
              
              {order.customerEmail && (
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="text-text-muted w-16">Email:</span>
                  <a href={`mailto:${order.customerEmail}`} className="text-brand-primary hover:underline">{order.customerEmail}</a>
                </div>
              )}
            </div>
          </div>

          {/* Timeline / Metadata Panel */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-base font-bold text-brand-primary flex items-center gap-2">
              <Clock size={18} />
              Order Timeline
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-text-muted w-24">Date Created:</span>
                <span className="text-text-secondary font-medium">
                  {format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}
                </span>
              </div>

              {order.confirmedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted w-24">Date Confirmed:</span>
                  <span className="text-text-secondary font-medium">
                    {format(new Date(order.confirmedAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
              )}

              {order.deliveredAt && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted w-24">Date Shipped:</span>
                  <span className="text-text-secondary font-medium">
                    {format(new Date(order.deliveredAt), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Notes Panel */}
          {originalNotes && (
            <div className="glass-card p-6 space-y-3">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Internal Notes</h3>
              <p className="text-xs p-3.5 bg-surface-input rounded-xl border border-surface-border text-text-secondary leading-relaxed">
                {originalNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
