'use client';

import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-purple/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md p-6 z-10 animate-fade-in">
        <div className="glass-card p-8 md:p-10 shadow-card">
          {/* Logo placeholder */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-brand transform rotate-12 hover:rotate-0 transition-transform duration-300 cursor-pointer">
              <span className="text-white font-bold text-2xl tracking-tighter -rotate-12 hover:rotate-0 transition-transform duration-300">FF</span>
            </div>
          </div>
          
          {children}
        </div>
        
        <p className="text-center text-xs text-slate-500 mt-8 font-mono">
          © {new Date().getFullYear()} FlowForge Core System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
