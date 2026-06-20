'use client';

import React from 'react';
import Badge from '../ui/Badge';
import { Button } from '../ui/Button';
import { Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface InventoryTableProps {
  products: any[];
  onAdjustClick: (product: any) => void;
}

export default function InventoryTable({ products, onAdjustClick }: InventoryTableProps) {
  const { user } = useAuth();
  const canAdjust = user?.role === 'admin' || user?.role === 'inventory';

  return (
    <table className="erp-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Type</th>
          <th>On Hand Quantity</th>
          <th>Reserved Quantity</th>
          <th>Available Free Quantity</th>
          <th>Minimum stock level</th>
          <th>Status</th>
          {canAdjust && <th className="text-right">Action</th>}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => {
          const onHand = Number(product.onHandQuantity);
          const reserved = Number(product.reservedQuantity);
          const free = onHand - reserved;
          const min = Number(product.minStockLevel);
          const isLowStock = free <= min;

          return (
            <tr key={product.id}>
              <td className="font-mono text-xs font-semibold">{product.sku}</td>
              <td className="font-medium text-text-primary">{product.name}</td>
              <td>
                <Badge variant={product.procurementType === 'manufacture' ? 'purple' : 'blue'}>
                  {product.procurementType === 'manufacture' ? 'Finished Good' : 'Raw Material'}
                </Badge>
              </td>
              <td className="font-semibold text-text-primary">
                {onHand} <span className="text-xs text-text-muted">{product.unitOfMeasure}</span>
              </td>
              <td className="text-text-muted">
                {reserved} <span className="text-xs">{product.unitOfMeasure}</span>
              </td>
              <td>
                <span className={`font-bold text-base ${isLowStock ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {free}
                </span>{' '}
                <span className="text-xs text-text-secondary">{product.unitOfMeasure}</span>
              </td>
              <td className="text-text-muted">
                {min} <span className="text-xs">{product.unitOfMeasure}</span>
              </td>
              <td>
                {isLowStock ? (
                  <span className="text-xs text-rose-500 font-semibold bg-rose-500/10 px-2 py-1 rounded-lg">
                    Low Stock
                  </span>
                ) : (
                  <span className="text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">
                    Healthy
                  </span>
                )}
              </td>
              {canAdjust && (
                <td>
                  <div className="flex items-center justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-2.5 py-1 text-xs h-8 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border-0"
                      onClick={() => onAdjustClick(product)}
                    >
                      <Edit3 size={12} /> Adjust Stock
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
