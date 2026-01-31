
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface TransactionFormProps {
  onAdd: (transaction: Transaction) => void;
}

const CATEGORIES = {
  INCOME: ['Gaji', 'Bonus', 'Investasi', 'Lainnya'],
  EXPENSE: ['Makanan', 'Transportasi', 'Belanja', 'Kesehatan', 'Hiburan', 'Tagihan', 'Pendidikan', 'Lainnya']
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd }) => {
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.EXPENSE[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    onAdd({
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      type,
      category,
      description,
      date,
    });

    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">Tambah Transaksi</h3>
      
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => { setType('EXPENSE'); setCategory(CATEGORIES.EXPENSE[0]); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => { setType('INCOME'); setCategory(CATEGORIES.INCOME[0]); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
        >
          Pemasukan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (IDR)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Contoh: 50000"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {CATEGORIES[type].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="Nasi Padang siang hari"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-200"
      >
        Simpan Transaksi
      </button>
    </form>
  );
};

export default TransactionForm;
