
import React, { useState } from 'react';
import { SavingsGoal } from '../types';

interface SavingsManagerProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: SavingsGoal) => void;
  onUpdateGoal: (id: string, amount: number) => void;
}

const SavingsManager: React.FC<SavingsManagerProps> = ({ goals, onAddGoal, onUpdateGoal }) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !target || !deadline) return;

    onAddGoal({
      id: crypto.randomUUID(),
      name,
      targetAmount: parseFloat(target),
      currentAmount: 0,
      deadline,
    });
    setName(''); setTarget(''); setDeadline('');
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Target Menabung Baru</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nama Target (Mis: Beli Laptop)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <input
            type="number"
            placeholder="Jumlah Target (IDR)"
            value={target}
            onChange={e => setTarget(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <button type="submit" className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
          Tambah Target
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          return (
            <div key={goal.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-800">{goal.name}</h4>
                  <p className="text-xs text-slate-400">Target: {new Date(goal.deadline).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">{progress.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="relative h-3 w-full bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div 
                  className="absolute h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-500">{formatIDR(goal.currentAmount)}</span>
                <span className="text-slate-800 font-medium">dari {formatIDR(goal.targetAmount)}</span>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const add = prompt('Tambah tabungan (IDR):', '0');
                    if (add) onUpdateGoal(goal.id, parseFloat(add));
                  }}
                  className="flex-1 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Tambah Saldo
                </button>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="col-span-2 text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400">Belum ada target menabung. Mulai rencanakan masa depan Anda!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsManager;
