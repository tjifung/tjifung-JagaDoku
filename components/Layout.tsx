
import React from 'react';
import { AppTab } from '../types';

interface LayoutProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  onOpenSettings: () => void;
  isSyncing: boolean;
  onSync: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentTab, setCurrentTab, onOpenSettings, isSyncing, onSync, children }) => {
  const tabs = [
    { id: AppTab.DASHBOARD, label: 'Dashboard', icon: '📊' },
    { id: AppTab.TRANSACTIONS, label: 'Transaksi', icon: '💸' },
    { id: AppTab.SAVINGS, label: 'Tabungan', icon: '🏦' },
    { id: AppTab.AI_ADVISOR, label: 'AI Advisor', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
            <span>💎</span> JagaDoku
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentTab === tab.id
                  ? 'bg-emerald-50 text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 transition-all text-xs"
          >
            <span>🔄</span> Refresh Koneksi Google
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto pb-20 md:pb-0">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 px-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">
            {currentTab.replace('_', ' ')}
          </h2>
          <div className="flex items-center gap-4">
             <button 
                onClick={onSync}
                disabled={isSyncing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  isSyncing ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200'
                }`}
             >
                <span className={isSyncing ? 'animate-spin' : ''}>{isSyncing ? '⏳' : '🚀'}</span>
                {isSyncing ? 'Menyinkronkan...' : 'Sync ke Cloud'}
             </button>
          </div>
        </header>
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden justify-around items-center p-2 z-20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg ${
              currentTab === tab.id ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;