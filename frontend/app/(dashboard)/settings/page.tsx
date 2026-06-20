'use client';

import { useForm } from 'react-hook-form';
import { Save, Building2, Palette, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      companyName: 'FlowForge Corp',
      currency: 'USD',
      timezone: 'UTC',
      theme: 'dark',
      notifications: true,
    }
  });

  const onSubmit = (data: any) => {
    // In a real app, this would hit a settings endpoint
    toast.success('Settings saved successfully');
    console.log('Saved settings:', data);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Manage global application preferences</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Info */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-surface-border flex items-center gap-2 bg-surface-card/50">
            <Building2 size={18} className="text-brand" />
            <h2 className="font-semibold text-slate-100">Company Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Company Name</label>
              <input {...register('companyName')} className="input-field" />
            </div>
            
            <div className="space-y-1.5 md:row-span-2">
              <label className="block text-sm font-medium text-slate-300">Company Logo</label>
              <div className="border-2 border-dashed border-surface-border rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-brand-500/50 transition-colors h-32">
                <div className="w-12 h-12 rounded bg-gradient-brand flex items-center justify-center mb-2">
                  <span className="text-white font-bold tracking-tight">FF</span>
                </div>
                <p className="text-xs text-slate-500">Click to upload new logo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-surface-border flex items-center gap-2 bg-surface-card/50">
            <Globe size={18} className="text-emerald-400" />
            <h2 className="font-semibold text-slate-100">Localization</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">System Currency</label>
              <select {...register('currency')} className="input-field appearance-none">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Default Timezone</label>
              <select {...register('timezone')} className="input-field appearance-none">
                <option value="UTC">UTC (Universal Time)</option>
                <option value="EST">EST (Eastern Standard)</option>
                <option value="PST">PST (Pacific Standard)</option>
                <option value="IST">IST (Indian Standard)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance & Preferences */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-surface-border flex items-center gap-2 bg-surface-card/50">
            <Palette size={18} className="text-purple-400" />
            <h2 className="font-semibold text-slate-100">Appearance & Preferences</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-200">Default Theme</h3>
                <p className="text-sm text-slate-500">Select the default interface theme</p>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register('theme')} value="dark" className="text-brand focus:ring-brand" />
                  <span className="text-sm text-slate-300">Dark</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer opacity-50" title="Coming soon">
                  <input type="radio" {...register('theme')} value="light" disabled className="text-brand focus:ring-brand" />
                  <span className="text-sm text-slate-500">Light</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-surface-border">
              <div>
                <h3 className="font-medium text-slate-200">System Notifications</h3>
                <p className="text-sm text-slate-500">Enable in-app notifications for alerts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" {...register('notifications')} className="sr-only peer" />
                <div className="w-11 h-6 bg-surface-input peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" className="btn-ghost">Reset Defaults</button>
          <button type="submit" className="btn-primary"><Save size={20} /> Save Changes</button>
        </div>
      </form>
    </div>
  );
}
