'use client';

import React from 'react';
import Badge from '../ui/Badge';
import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProductsTableProps {
  products: any[];
  onDelete: (id: string) => void;
}

export default function ProductsTable({ products, onDelete }: ProductsTableProps) {
  const { user } = useAuth();
  const isAdminOrPM = user?.role === 'admin' || user?.role === 'product_manager';

  return (
    <div className="overflow-x-auto">
      <table className="erp-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Product Details</th>
            <th>Type</th>
            <th>Cost Basis</th>
            <th>Selling Price</th>
            <th className="text-right">On Hand</th>
            <th className="text-right">Reserved</th>
            <th className="text-right">Available Free</th>
            <th className="text-right">Min Level</th>
            {isAdminOrPM && <th className="text-right pr-6">Actions</th>}
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
                <td className="font-mono text-xs font-semibold text-[#4B164C]">{product.sku}</td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-primary text-xs">{product.name}</span>
                    {product.category && (
                      <span className="text-[10px] text-text-muted mt-0.5">
                        Category: {product.category}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <Badge variant={product.procurementType === 'manufacture' ? 'purple' : 'blue'}>
                    {product.procurementType === 'manufacture' ? 'Finished Assembly' : 'Raw Material'}
                  </Badge>
                </td>
                <td className="font-medium text-xs">₹{Number(product.costPrice).toLocaleString('en-IN')}</td>
                <td className="font-medium text-xs">₹{Number(product.salesPrice).toLocaleString('en-IN')}</td>
                <td className="text-right font-medium text-xs">{onHand}</td>
                <td className="text-right text-text-muted text-xs">{reserved}</td>
                <td className="text-right">
                  <span className={`font-bold text-xs ${isLowStock ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {free}
                  </span>
                </td>
                <td className="text-right text-text-muted text-xs">{min}</td>
                {isAdminOrPM && (
                  <td>
                    <div className="flex items-center justify-end gap-2 pr-4">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 text-text-muted hover:text-brand-primary hover:bg-[#F8E7F6] rounded-lg transition-colors"
                        title="Edit Product Details"
                      >
                        <Edit2 size={14} />
                      </Link>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
                              onDelete(product.id);
                            }
                          }}
                          className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
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
    </div>
  );
}
