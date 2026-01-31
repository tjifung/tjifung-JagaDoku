
import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';

interface DashboardProps {
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions }) => {
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(val);
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">Saldo Total</p>
          <h3 className={`text-2xl font-bold mt-1 ${stats.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
            {formatIDR(stats.balance)}
          </h3>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
            <span className="text-emerald-500 font-bold">↑</span> Pemasukan
          </p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatIDR(stats.income)}</h3>
          <p className="text-xs text-slate-400 mt-2">Akumulasi total</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium flex items-center gap-1">
            <span className="text-red-500 font-bold">↓</span> Pengeluaran
          </p>
          <h3 className="text-2xl font-bold text-red-600 mt-1">{formatIDR(stats.expenses)}</h3>
          <p className="text-xs text-slate-400 mt-2">Akumulasi total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-6">Analisis Biaya (Bar)</h4>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} fontSize={11} tick={{ fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(val: number) => formatIDR(val)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">
                <span className="text-4xl mb-2">📉</span>
                Belum ada data pengeluaran
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-semibold text-slate-800 mb-6">Distribusi Pengeluaran</h4>
          <div className="h-[300px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => formatIDR(val)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle" 
                    fontSize={11}
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">
                <span className="text-4xl mb-2">🍕</span>
                Data visualisasi pai akan muncul di sini
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Full Width */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-semibold text-slate-800">Aktivitas Terkini</h4>
          <button className="text-emerald-600 text-sm font-medium hover:underline">Lihat Semua</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.slice(0, 6).map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {t.type === 'INCOME' ? '💵' : '🛒'}
                </div>
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{t.description}</p>
                  <p className="text-xs text-slate-400 font-medium">{t.category} • {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
              <p className={`font-bold text-lg ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                {t.type === 'INCOME' ? '+' : '-'}{formatIDR(t.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="col-span-2 text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              Mulai catat transaksi pertama Anda hari ini!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
