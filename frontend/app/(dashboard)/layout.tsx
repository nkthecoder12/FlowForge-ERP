'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import { AiAssistant } from '@/components/ai/AiAssistant';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, useGetMe } = useAuth();
  const router = useRouter();
  const { isLoading, isError } = useGetMe();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || isError) {
      router.push('/login');
    }
  }, [isAuthenticated, isError, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <Loader2 className="animate-spin text-[#4B164C]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F5F5] text-[#1e1b1e]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          aiOpen={aiOpen}
          setAiOpen={setAiOpen}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto page-container">
          {children}
        </main>
        
        {/* Floating AI Panel */}
        <AiAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      </div>
    </div>
  );
}
