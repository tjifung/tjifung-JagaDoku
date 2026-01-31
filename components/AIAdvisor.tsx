
import React, { useState } from 'react';
import { getFinancialAdvice } from '../services/geminiService';
import { Transaction, SavingsGoal, AIInsight } from '../types';

interface AIAdvisorProps {
  transactions: Transaction[];
  goals: SavingsGoal[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions, goals }) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (transactions.length === 0) {
      setError("Tambahkan beberapa transaksi terlebih dahulu agar AI bisa menganalisis.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getFinancialAdvice(transactions, goals);
      setInsight(result);
    } catch (err) {
      setError("Gagal mendapatkan saran. Pastikan API Key valid dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl shadow-emerald-200/50">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span>🤖</span> Asisten Keuangan AI
        </h3>
        <p className="opacity-90 mb-6">
          Gunakan kekuatan AI Gemini untuk menganalisis kebiasaan belanja Anda dan temukan cara terbaik untuk berinvestasi.
        </p>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-8 py-3 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-emerald-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menganalisis...
            </span>
          ) : 'Dapatkan Analisis Cerdas'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-3">
          <span>⚠️</span> {error}
        </div>
      )}

      {insight && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-3">Ringkasan Keuangan</h4>
            <p className="text-slate-600 leading-relaxed">{insight.summary}</p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Tips Menabung</h4>
            <div className="grid gap-3">
              {insight.savingTips.map((tip, i) => (
                <div key={i} className="flex gap-3 p-3 bg-emerald-50 rounded-xl text-emerald-800">
                  <span className="text-emerald-500 font-bold"># {i + 1}</span>
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Rekomendasi Investasi</h4>
            <div className="space-y-4">
              {insight.investmentAdvice.map((inv, i) => (
                <div key={i} className="border border-slate-100 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-bold text-slate-800">{inv.instrument}</h5>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      inv.riskLevel === 'Low' ? 'bg-green-100 text-green-700' :
                      inv.riskLevel === 'Medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {inv.riskLevel} Risk
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 leading-snug">{inv.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
