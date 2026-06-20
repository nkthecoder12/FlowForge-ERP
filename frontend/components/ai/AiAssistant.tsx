'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Lightbulb, AlertTriangle, ArrowRight, MessageSquare, Send } from 'lucide-react';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Generate context recommendations based on route path
  const getContextInsights = () => {
    if (pathname.startsWith('/dashboard')) {
      return {
        title: 'Operations Overview Insights',
        summary: 'System health looks positive overall. We detected a slight inventory turnover lag in Finished Goods (WDT-001) due to delayed raw materials receipt.',
        recommendations: [
          { text: 'Pre-order 100 boxes of Wood Screws to cover next week\'s projected manufacturing orders.', savings: 'Expected savings: ₹2,400 (Bulk discount)' },
          { text: 'Adjust Wooden Dining Table minimum stock level to 8 units to release ₹30,000 locked capital.', savings: 'Expected savings: ₹15,000 (Holding costs)' },
        ],
        alerts: [
          { type: 'warning', text: '3 purchase orders are nearing vendor delivery threshold with no status updates.' }
        ]
      };
    } else if (pathname.startsWith('/products')) {
      return {
        title: 'Catalog & Margin Insights',
        summary: 'Your catalog contains 3 finished assemblies and 9 raw materials. Teak wood cost has risen by 4% this quarter, impacting standard BoM margins.',
        recommendations: [
          { text: 'Review markup on Wooden Bookshelf (WBS-001) as raw component costs have increased by 8% overall.', savings: 'Expected profit gain: +₹400/pcs' },
          { text: 'Mark inactive SKUs as disabled to optimize inventory filters.', savings: 'Improves dashboard search speed by 15%' },
        ],
        alerts: [
          { type: 'info', text: 'All products currently have valid SKU codes mapped.' }
        ]
      };
    } else if (pathname.startsWith('/inventory')) {
      return {
        title: 'Inventory Forecasting',
        summary: 'Average stock holding value is ₹2.4 Lakhs. Standard reorder triggers are set to automatic MTS (Make-to-Stock) cycles.',
        recommendations: [
          { text: 'Reorder raw teak panels immediately. Current usage suggests a run-out in 12 days.', savings: 'Prevents 3 days of assembly halt' },
          { text: 'Free reserved inventory for draft orders older than 48 hours to fulfill active sales orders.', savings: 'Expected savings: Fulfill ₹45,000 pending revenue' },
        ],
        alerts: [
          { type: 'critical', text: 'Low stock detected for Wooden Leg (RM-WL-001). Under safety minimum of 50 units.' }
        ]
      };
    } else if (pathname.startsWith('/bom')) {
      return {
        title: 'Bill of Materials Analysis',
        summary: 'Teak wood dining tables account for 65% of raw material consumption. Wood finish varnish (RM-WF-001) utilization has increased by 10% per run.',
        recommendations: [
          { text: 'Optimize the cutting grid for Wooden Chair back panels to decrease sheet wastage by 5%.', savings: 'Expected savings: ₹1,200 per batch' },
          { text: 'Update dining chair standard recipe yield rate from 1.0 to 1.1 based on batch production efficiency.', savings: 'Refined standard costing accuracy' },
        ],
        alerts: [
          { type: 'warning', text: 'Wooden Chair BoM has not been audited since March 2026.' }
        ]
      };
    }

    return {
      title: 'General ERP Insights',
      summary: 'Welcome to FlowForge ERP Command Center. Select any module to display context-aware optimization insights.',
      recommendations: [
        { text: 'Check the operations dashboard for daily sales order velocity checks.', savings: '' },
        { text: 'Keep minimum stock levels up to date based on seasonal demand.', savings: '' }
      ],
      alerts: []
    };
  };

  const insights = getContextInsights();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = query;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setQuery('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let reply = 'I am analyzing that. Let me look up your real-time SQL ledger values.';
      if (pathname.includes('inventory') && userMsg.toLowerCase().includes('stock')) {
        reply = 'We have 40 Wooden Legs on hand, but 0 are reserved. However, we have a minimum stock level of 50 units, which creates a deficit of 10 units. I recommend initiating a purchase order for 100 units to secure vendor discounts.';
      } else if (pathname.includes('bom') && userMsg.toLowerCase().includes('cost')) {
        reply = 'The Wooden Dining Table recipe costs ₹8,500 to produce. The table top panel (RM-WT-001) represents the largest cost component at ₹1,200 (or 14% of materials).';
      } else {
        reply = `Based on your current workspace context (${pathname}), our recommendation is to ensure all raw stock levels are kept above safety limits and pending manufacturing runs are scheduled during low load times.`;
      }
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/10 z-40 backdrop-blur-[1px] transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l border-surface-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-brand text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-accent animate-pulse" />
            <h2 className="font-bold text-sm tracking-wider uppercase">FlowForge Copilot</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-surface-hover/30 border border-brand-accent/20">
            <h3 className="font-bold text-xs text-brand-primary uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-brand-accent" />
              {insights.title}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">{insights.summary}</p>
          </div>

          {/* Critical Alerts */}
          {insights.alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Alerts & Risks</h4>
              {insights.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-xs flex gap-2.5 items-start ${
                    alert.type === 'critical'
                      ? 'bg-rose-50 border-rose-200/50 text-rose-800'
                      : alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-200/50 text-amber-800'
                      : 'bg-blue-50 border-blue-200/50 text-blue-800'
                  }`}
                >
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <p>{alert.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">AI Recommendations</h4>
            <div className="space-y-2.5">
              {insights.recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 border border-surface-border rounded-xl bg-slate-50/50 space-y-1 hover:border-brand-accent/30 transition-all">
                  <div className="flex gap-2 items-start">
                    <ArrowRight size={14} className="text-brand-accent shrink-0 mt-0.5" />
                    <p className="text-xs text-text-primary font-medium">{rec.text}</p>
                  </div>
                  {rec.savings && (
                    <span className="text-[10px] font-semibold text-emerald-600 pl-5 block">
                      {rec.savings}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dialogue Section */}
          <div className="border-t border-surface-border pt-5 space-y-3">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={14} className="text-brand-accent" />
              Ask Copilot
            </h4>
            
            {/* Conversation Log */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {messages.length === 0 ? (
                <p className="text-[11px] text-text-muted italic text-center py-4">
                  Ask me about product costs, stock forecasts, or how to resolve safety levels.
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                      msg.sender === 'user'
                        ? 'bg-brand-accent/10 border border-brand-accent/20 text-brand-primary ml-auto rounded-tr-none'
                        : 'bg-slate-100 text-text-primary mr-auto rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
              {isTyping && (
                <div className="bg-slate-100 p-2.5 rounded-lg rounded-tl-none mr-auto max-w-[85%] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Form Footer */}
        <form onSubmit={handleSend} className="p-4 border-t border-surface-border bg-slate-50 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI Copilot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-white border border-surface-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand-highlight focus:ring-1 focus:ring-brand-highlight/20"
          />
          <button
            type="submit"
            disabled={isTyping || !query.trim()}
            className="p-2 bg-brand-primary hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </>
  );
};
