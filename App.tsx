
import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, SavingsGoal, AppTab, GoogleUser } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import SavingsManager from './components/SavingsManager';
import AIAdvisor from './components/AIAdvisor';
import InvestmentSimulator from './components/InvestmentSimulator';
import { createUserSpreadsheet, syncToGoogleSheets } from './services/sheetService';

declare const google: any;

const App: React.FC = () => {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    const saved = localStorage.getItem('cerdas_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentTab, setCurrentTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('');
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('cerdas_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('cerdas_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const filteredTransactions = useMemo(() => {
    if (!filterDate) return transactions;
    return transactions.filter(t => t.date === filterDate);
  }, [transactions, filterDate]);

  useEffect(() => {
    localStorage.setItem('cerdas_transactions', JSON.stringify(transactions));
    localStorage.setItem('cerdas_goals', JSON.stringify(goals));
    if (user) localStorage.setItem('cerdas_user', JSON.stringify(user));
    else localStorage.removeItem('cerdas_user');
  }, [transactions, goals, user]);

  const handleLogin = () => {
    if (typeof google === 'undefined' || !google.accounts) {
      alert("Layanan Google sedang dimuat. Silakan tunggu sebentar atau refresh halaman.");
      return;
    }

    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: "800826886908-fp17il9ob94g0l1nc4mc0ifq2bh059t2.apps.googleusercontent.com", 
        scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        callback: async (response: any) => {
          if (response.access_token) {
            const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: { Authorization: `Bearer ${response.access_token}` }
            });
            const profile = await profileRes.json();

            let spreadsheetId = user?.spreadsheetId;
            if (!spreadsheetId) {
              try {
                spreadsheetId = await createUserSpreadsheet(response.access_token);
              } catch (err) {
                console.error(err);
              }
            }

            setUser({
              name: profile.name,
              email: profile.email,
              picture: profile.picture,
              accessToken: response.access_token,
              spreadsheetId: spreadsheetId || null,
              isGuest: false
            });
          }
        },
      });
      client.requestAccessToken();
    } catch (e) {
      console.error("Auth error:", e);
      alert("Terjadi kesalahan saat menghubungkan ke Google. Silakan coba Mode Tamu.");
    }
  };

  const startAsGuest = () => {
    setUser({
      name: "Tamu JagaDoku",
      email: "tamu@local.storage",
      picture: "https://ui-avatars.com/api/?name=Guest&background=10b981&color=fff",
      accessToken: "",
      spreadsheetId: null,
      isGuest: true
    });
  };

  const handleLogout = () => {
    if (confirm("Yakin ingin keluar?")) {
      setUser(null);
      setCurrentTab(AppTab.DASHBOARD);
    }
  };

  const handleSync = async () => {
    if (!user || user.isGuest) return;
    if (!user.spreadsheetId) {
      alert("Spreadsheet ID tidak ditemukan. Coba re-konek Google.");
      return;
    }

    setIsSyncing(true);
    try {
      await syncToGoogleSheets(user.accessToken, user.spreadsheetId, { transactions, goals });
      alert("Sinkronisasi Berhasil ke Google Sheets!");
    } catch (err) {
      alert("Sesi berakhir atau terjadi kesalahan. Silakan login ulang.");
      handleLogin();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[40px] shadow-2xl text-center space-y-8 border border-slate-100">
          <div className="w-24 h-24 bg-emerald-600 text-white rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-2xl rotate-3">
            💎
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">JagaDoku</h1>
            <p className="text-slate-500 mt-3 font-medium px-4">Asisten Finansial AI untuk masa depan yang lebih mapan.</p>
          </div>
          
          <div className="space-y-3">
            <button 
              onClick={handleLogin}
              className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6 bg-white rounded-full p-0.5" alt="Google" />
              Masuk dengan Google
            </button>
            
            <button 
              onClick={startAsGuest}
              className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Mulai sebagai Tamu (Offline)
            </button>
          </div>

          <div className="pt-4 border-t border-slate-50">
             <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
               Data tersimpan lokal di peramban pada mode tamu
             </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case AppTab.DASHBOARD:
        return <Dashboard transactions={transactions} />;
      case AppTab.TRANSACTIONS:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <TransactionForm onAdd={(t) => setTransactions(prev => [t, ...prev])} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800">Riwayat Transaksi</h3>
                <input 
                  type="date" 
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-3">
                {filteredTransactions.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-emerald-200 transition-all">
                    <div className="flex gap-4 items-center">
                      <div className={`p-3 rounded-xl text-xl ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                         {t.type === 'INCOME' ? '💰' : '🛒'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{t.description}</p>
                        <p className="text-xs text-slate-400 font-medium mt-1">
                          {t.category} • {new Date(t.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-bold text-lg ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(t.amount)}
                      </p>
                      <button 
                        onClick={() => setTransactions(prev => prev.filter(item => item.id !== t.id))}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                    Tidak ada transaksi ditemukan.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case AppTab.SAVINGS:
        return <SavingsManager goals={goals} onAddGoal={(g) => setGoals(prev => [...prev, g])} onUpdateGoal={(id, amount) => setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g))} />;
      case AppTab.INVESTMENT:
        return <InvestmentSimulator />;
      case AppTab.AI_ADVISOR:
        return <AIAdvisor transactions={transactions} goals={goals} />;
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <Layout 
      currentTab={currentTab} 
      setCurrentTab={setCurrentTab} 
      onOpenSettings={handleLogin}
      isSyncing={isSyncing}
      onSync={handleSync}
      isGuest={user.isGuest || false}
    >
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <img src={user.picture} className="w-12 h-12 rounded-2xl border-2 border-emerald-100" alt="Profile" />
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{user.isGuest ? 'Mode Offline' : 'Terhubung Cloud'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="px-5 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100">Logout</button>
      </div>
      {renderContent()}
    </Layout>
  );
};

export default App;
