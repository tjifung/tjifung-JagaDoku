
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const InvestmentSimulator: React.FC = () => {
  const [initialAmount, setInitialAmount] = useState<number>(1000000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500000);
  const [annualReturn, setAnnualReturn] = useState<number>(10);
  const [years, setYears] = useState<number>(10);

  const projectionData = useMemo(() => {
    let data = [];
    let currentBalance = initialAmount;
    const monthlyRate = annualReturn / 100 / 12;

    for (let year = 0; year <= years; year++) {
      data.push({
        year: `Thn ${year}`,
        balance: Math.round(currentBalance),
      });

      for (let month = 1; month <= 12; month++) {
        currentBalance = (currentBalance + monthlyContribution) * (1 + monthlyRate);
      }
    }
    return data;
  }, [initialAmount, monthlyContribution, annualReturn, years]);

  const finalBalance = projectionData[projectionData.length - 1].balance;
  const totalInvested = initialAmount + (monthlyContribution * 12 * years);
  const totalProfit = finalBalance - totalInvested;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>⚙️</span> Parameter Investasi
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Modal Awal</label>
              <input 
                type="range" min="0" max="100000000" step="1000000"
                value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-emerald-600 font-bold mt-1">{formatIDR(initialAmount)}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Investasi Bulanan</label>
              <input 
                type="range" min="0" max="10000000" step="100000"
                value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-emerald-600 font-bold mt-1">{formatIDR(monthlyContribution)}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Estimasi Return Tahunan (%)</label>
              <input 
                type="range" min="1" max="30" step="1"
                value={annualReturn} onChange={(e) => setAnnualReturn(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-emerald-600 font-bold mt-1">{annualReturn}% per tahun</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Durasi (Tahun)</label>
              <input 
                type="range" min="1" max="40" step="1"
                value={years} onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-emerald-600 font-bold mt-1">{years} Tahun</p>
            </div>
          </div>
        </div>

        {/* Results Visual */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-100">
              <p className="text-emerald-100 text-sm font-medium">Estimasi Hasil Akhir</p>
              <h3 className="text-3xl font-bold mt-1">{formatIDR(finalBalance)}</h3>
              <p className="text-xs text-emerald-200 mt-2">Setelah {years} tahun</p>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <p className="text-slate-400 text-sm font-medium">Estimasi Keuntungan</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatIDR(totalProfit)}</h3>
              <p className="text-xs text-emerald-500 font-bold mt-2">ROI: {((totalProfit / totalInvested) * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[350px]">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Grafik Pertumbuhan Aset</h4>
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  formatter={(val: number) => formatIDR(val)}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start">
        <span className="text-2xl">💡</span>
        <div>
          <h5 className="font-bold text-blue-900">Tips Investasi Masa Depan</h5>
          <p className="text-sm text-blue-700 leading-relaxed mt-1">
            Gunakan surplus bulanan Anda (Pemasukan - Pengeluaran) untuk diinvestasikan secara konsisten. 
            Dalam jangka panjang, efek bunga berbunga (compounding interest) akan bekerja maksimal untuk Anda. 
            Semakin cepat Anda memulai, semakin besar hasil akhirnya!
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSimulator;
