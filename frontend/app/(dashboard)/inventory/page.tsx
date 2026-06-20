'use client';

import { useInventory } from '@/hooks/useInventory';
import InventoryTable from '@/components/tables/InventoryTable';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Loader2, History } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function InventoryPage() {
  const { useBalances, adjustStock, isAdjusting } = useInventory();
  const { data: products, isLoading, isError } = useBalances();

  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset } = useForm<{ quantity: number; notes: string }>({
    defaultValues: {
      quantity: 0,
      notes: 'Manual inventory count adjustment',
    },
  });

  const handleAdjustClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    reset({
      quantity: 0,
      notes: `Stock count adjustment for ${product.name}`,
    });
  };

  const onSubmit = async (data: any) => {
    if (!selectedProduct) return;
    try {
      await adjustStock({
        productId: selectedProduct.id,
        quantity: Number(data.quantity),
        notes: data.notes,
      });
      setIsModalOpen(false);
    } catch {
      // hook handles toast
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="page-title">Inventory Balances</h1>
          <p className="page-subtitle">Real-time stock on hand, reservations, and available free quantities</p>
        </div>
        <Link href="/inventory/ledger" className="btn-primary bg-brand-highlight/10 hover:bg-brand-highlight/20 text-brand-primary border border-brand-highlight/30 hover:border-brand-highlight/50 shadow-none">
          <History size={18} />
          View Stock Ledger
        </Link>
      </div>

      <div className="glass-card flex flex-col min-h-[500px]">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-8 flex justify-center items-center h-full min-h-[300px]">
              <Loader2 className="animate-spin text-brand-primary" size={32} />
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-rose-400">Failed to load stock levels</div>
          ) : !products || products.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">No stock balances found. Create products to display.</div>
          ) : (
            <InventoryTable products={products} onAdjustClick={handleAdjustClick} />
          )}
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Adjust Stock: ${selectedProduct?.name || ''}`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-xs text-text-secondary">
            Current On Hand: <span className="font-bold text-brand-primary">{Number(selectedProduct?.onHandQuantity || 0)} {selectedProduct?.unitOfMeasure}</span>.
            Reserved: <span className="font-bold text-text-muted">{Number(selectedProduct?.reservedQuantity || 0)} {selectedProduct?.unitOfMeasure}</span>.
          </p>

          <Input
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            label="Adjustment Quantity (Use positive to add, negative to subtract)"
            placeholder="e.g. 10 or -5"
            required
          />

          <Input
            {...register('notes')}
            label="Reason for Adjustment"
            placeholder="Stock count, damage, correction..."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-border mt-6">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isAdjusting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isAdjusting}>
              Post Stock Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
