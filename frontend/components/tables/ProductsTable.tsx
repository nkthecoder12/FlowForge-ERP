'use client';

import React from 'react';
import Badge from '../ui/Badge';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProductsTableProps {
  products: any[];
  onDelete: (id: string) => void;
}

export default function ProductsTable({ products, onDelete }: ProductsTableProps) {
  const { user } = useAuth();
  const isAdminOrPM = user?.role === 'admin' || user?.role === 'product_manager';

  return (
    <table className="erp-table">
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Type</th>
          <th>Selling Price</th>
          <th>Cost Price</th>
          <th>On Hand</th>
          <th>Reserved</th>
          <th>Free Stock</th>
          <th>Min Level</th>
          {isAdminOrPM && <th className="text-right">Actions</th>}
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
              <td className="font-medium text-text-primary">
                <div>
                  {product.name}
                  {product.category && (
                    <span className="text-[10px] bg-surface-hover px-1.5 py-0.5 rounded ml-2 text-text-secondary">
                      {product.category}
                    </span>
                  )}
                </div>
              </td>
              <td>
                <Badge variant={product.procurementType === 'manufacture' ? 'purple' : 'blue'}>
                  {product.procurementType === 'manufacture' ? 'Finished Good' : 'Raw Material'}
                </Badge>
              </td>
              <td>INR {Number(product.salesPrice).toLocaleString()}</td>
              <td>INR {Number(product.costPrice).toLocaleString()}</td>
              <td className="font-semibold">{onHand}</td>
              <td className="text-text-muted">{reserved}</td>
              <td>
                <span className={`font-bold ${isLowStock ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {free}
                </span>
              </td>
              <td className="text-text-muted">{min}</td>
              {isAdminOrPM && (
                <td>
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="p-1.5 text-slate-400 hover:text-brand-primary hover:bg-surface-hover rounded transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                            onDelete(product.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
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
