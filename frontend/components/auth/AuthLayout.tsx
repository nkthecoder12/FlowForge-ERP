'use client';

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md p-6">
        <div className="bg-white border border-surface-border rounded-lg p-8 shadow-card">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-lg bg-gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-lg">SF</span>
            </div>
          </div>
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-text-primary">Shiv Furniture Works</h2>
            <p className="text-xs text-text-muted mt-1">Manufacturing ERP System</p>
          </div>
          {children}
        </div>
        <p className="text-center text-xs text-text-muted mt-6">
          © {new Date().getFullYear()} Shiv Furniture Works. All rights reserved.
        </p>
      </div>
    </div>
  );
}
