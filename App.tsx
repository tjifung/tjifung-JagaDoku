
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Transaction, SavingsGoal, AppTab, GoogleUser } from './types';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import SavingsManager from './components/SavingsManager';
import AIAdvisor from './components/AIAdvisor';
import { createUserSpreadsheet, syncToGoogleSheets } from './services/sheetService';

// Fix: Add declaration for global 'google' object provided by Google Identity Services
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

  // Filter transactions based on selected date
  const filteredTransactions = useMemo(() => {
    if (!filterDate) return transactions;
    return transactions.filter(t => t.date === filterDate);
  }, [transactions, filterDate]);

  // Persist data
  useEffect(() => {
    localStorage.setItem('cerdas_transactions', JSON.stringify(transactions));
    localStorage.setItem('cerdas_goals', JSON.stringify(goals));
    if (user) localStorage.setItem('cerdas_user', JSON.stringify(user));
    else localStorage.removeItem('cerdas_user');
  }, [transactions, goals, user]);

  const handleLogin = () => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: "800826886908-fp17il9ob94g0l1nc4mc0ifq2bh059t2.apps.googleusercontent.com", 
      scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      callback: async (response: any) => {
        if (response.access_token) {
          // Get basic profile info
          const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${response.access_token}` }
          });
          const profile = await profileRes.json();

          let spreadsheetId = user?.spreadsheetId;
          
          // Jika belum punya spreadsheetId, buat otomatis
          if (!spreadsheetId) {
            try {
              spreadsheetId = await createUserSpreadsheet(response.access_token);
            } catch (err) {
              console.error(err);
              alert("Gagal membuat Google Sheet otomatis.");
            }
          }

          setUser({
            name: profile.name,
            email: profile.email,
            picture: profile.picture,
            accessToken: response.access_token,
            spreadsheetId: spreadsheetId || null
          });
        }
      },
    });
    client.requestAccessToken();
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentTab(AppTab.DASHBOARD);
  };

  const handleSync = async () => {
    if (!user || !user.spreadsheetId) {
      alert("Silakan login dengan Google terlebih dahulu.");
      return;
    }

    setIsSyncing(true);
    try {
      await syncToGoogleSheets(user.accessToken, user.spreadsheetId, { transactions, goals });
      alert("Sinkronisasi Berhasil! Data Anda sekarang ada di Google Sheets.");
    } catch (err) {
      console.error(err);
      alert("Sesi login berakhir atau terjadi kesalahan. Silakan login kembali.");
      handleLogin(); // Refresh token
    } finally {
      setIsSyncing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">
            💎
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">JagaDoku</h1>
            <p className="text-slate-500 mt-2">Kelola keuangan masa depan Anda dengan bantuan AI dan Google Sheets.</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-6 h-6" alt="Google" />
            Masuk dengan Google
          </button>
          <p className="text-[10px] text-slate-400">
            Aplikasi akan membuat satu file Google Sheet baru di Drive Anda untuk menyimpan data transaksi secara aman.
          </p>
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
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800">Riwayat Transaksi</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <input 
                      type="date" 
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full sm:w-48 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                    {filterDate && (
                      <button 
                        onClick={() => setFilterDate('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 text-lg leading-none"
                        title="Hapus Filter"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter Tanggal</span>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTransactions.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
                    <div className="flex gap-4 items-center">
                      <div className={`p-3 rounded-xl ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                         {t.type === 'INCOME' ? '💰' : '🛒'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{t.description}</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-tight mt-1">
                          {t.category} • {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-bold text-lg ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(t.amount)}
                      </p>
                      <button 
                        onClick={() => setTransactions(prev => prev.filter(item => item.id !== t.id))}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all bg-slate-50 rounded-lg"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-slate-500 font-medium">
                      {filterDate 
                        ? `Tidak ada transaksi pada tanggal ${new Date(filterDate).toLocaleDateString('id-ID')}`
                        : 'Belum ada transaksi. Tambahkan sekarang!'}
                    </p>
                    {filterDate && (
                      <button 
                        onClick={() => setFilterDate('')}
                        className="mt-4 text-emerald-600 font-bold hover:underline"
                      >
                        Tampilkan Semua Transaksi
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case AppTab.SAVINGS:
        return (
          <SavingsManager 
            goals={goals} 
            onAddGoal={(g) => setGoals(prev => [...prev, g])} 
            onUpdateGoal={(id, amount) => setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g))} 
          />
        );
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
      onOpenSettings={handleLogin} // Re-auth
      isSyncing={isSyncing}
      onSync={handleSync}
    >
      <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={user.picture} className="w-10 h-10 rounded-full border-2 border-emerald-500" alt="Profile" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
            <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cloud Connected</p>
            <p className="text-xs text-emerald-600 font-mono">{user.spreadsheetId?.substring(0, 12)}...</p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">Logout</button>
        </div>
      </div>
      {renderContent()}
    </Layout>
  );
};

export default App;
