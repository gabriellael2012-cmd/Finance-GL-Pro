import React, { useState } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign,
  Trophy,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext';
import { Goal } from '../../types';
import { formatBRL, formatDate } from '../../utils/formatters';

export const GoalsView: React.FC = () => {
  const { sheetGoals, addGoal, updateGoal, deleteGoal } = useFinance();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form states
  const [title, setTitle] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentAmount, setCurrentAmount] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [category, setCategory] = useState<string>('Reserva de Emergência');
  const [color, setColor] = useState<string>('#3B82F6');

  // Deposit modal
  const [depositGoal, setDepositGoal] = useState<Goal | null>(null);
  const [depositValue, setDepositValue] = useState<string>('');

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setCategory('Reserva de Emergência');
    setColor('#3B82F6');
    setModalOpen(true);
  };

  const handleOpenEdit = (g: Goal) => {
    setEditingGoal(g);
    setTitle(g.title);
    setTargetAmount(String(g.targetAmount));
    setCurrentAmount(String(g.currentAmount));
    setDeadline(g.deadline);
    setCategory(g.category);
    setColor(g.color || '#3B82F6');
    setModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;

    const targetVal = parseFloat(targetAmount) || 0;
    const currentVal = parseFloat(currentAmount) || 0;

    if (editingGoal) {
      updateGoal({
        ...editingGoal,
        title: title.trim(),
        targetAmount: targetVal,
        currentAmount: currentVal,
        deadline: deadline || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category,
        color,
      });
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: targetVal,
        currentAmount: currentVal,
        deadline: deadline || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        category,
        color,
      });
    }
    setModalOpen(false);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal || !depositValue) return;

    const added = parseFloat(depositValue) || 0;
    const newTotal = depositGoal.currentAmount + added;

    updateGoal({
      ...depositGoal,
      currentAmount: newTotal,
    });

    if (newTotal >= depositGoal.targetAmount) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    setDepositGoal(null);
    setDepositValue('');
  };

  return (
    <div id="goals-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Metas e Objetivos Financeiros
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Defina sonhos, reservas financeiras, aquisições e acompanhe o progresso de conquista
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Meta</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sheetGoals.map((g) => {
          const percent = Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100);
          const remaining = Math.max(g.targetAmount - g.currentAmount, 0);
          const isCompleted = g.currentAmount >= g.targetAmount;

          return (
            <div
              key={g.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              {isCompleted && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-bl-xl shadow-xs flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  <span>Meta Conquistada!</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                    {g.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1 rounded text-slate-500 hover:text-blue-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white">{g.title}</h3>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Acumulado</span>
                    <span className="font-display font-bold text-xl text-white font-mono">
                      {formatBRL(g.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Objetivo</span>
                    <span className="font-mono text-sm text-slate-300 font-semibold">
                      {formatBRL(g.targetAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-400 font-mono">{percent}%</span>
                    <span className="text-slate-400 text-[11px]">
                      Faltam <span className="font-mono text-slate-200">{formatBRL(remaining)}</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Prazo: {formatDate(g.deadline)}
                  </span>
                </div>
              </div>

              {/* Deposit Button */}
              <button
                onClick={() => {
                  setDepositGoal(g);
                  setDepositValue('');
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Aporte / Depósito</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Goal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-base text-white pb-2 border-b border-slate-800">
              {editingGoal ? 'Editar Meta Financeira' : 'Nova Meta Financeira'}
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Meta / Sonho
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva de Emergência 6 Meses, Viagem, Carro..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Valor Desejado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0,00"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Já Acumulado (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="Reserva de Emergência">Reserva de Emergência</option>
                    <option value="Viagem & Lazer">Viagem & Lazer</option>
                    <option value="Bens & Veículos">Bens & Veículos</option>
                    <option value="Imóvel / Casa Própria">Imóvel / Casa Própria</option>
                    <option value="Educação & Cursos">Educação & Cursos</option>
                    <option value="Investimentos & Futuro">Investimentos & Futuro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Data Limite
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
                >
                  Salvar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Contribution Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-base text-white">
              Aporte na Meta: {depositGoal.title}
            </h3>
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Valor do Depósito (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  placeholder="0,00"
                  value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-blue-500 focus:outline-hidden font-mono font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
                >
                  Confirmar Aporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
