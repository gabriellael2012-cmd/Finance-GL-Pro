import React, { useState } from 'react';
import {
  TrendingDown,
  Target,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Save,
  DollarSign,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/formatters';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const ExpenseGoalsView: React.FC = () => {
  const {
    sheetTransactions,
    sheetExpenseGoals,
    saveMonthlyExpenseGoal,
    selectedYear,
    setSelectedYear,
    showToast,
    setActiveTab,
  } = useFinance();

  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [formCosts, setFormCosts] = useState<string>('0');
  const [formExpenses, setFormExpenses] = useState<string>('0');

  // Compute actual completed expenses for each month of the selected year
  const getMonthActualExpenses = (monthIndex: number) => {
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const startPrefix = `${selectedYear}-${monthStr}`;

    const monthTxs = sheetTransactions.filter(
      (tx) =>
        tx.type === 'expense' &&
        tx.status === 'completed' &&
        tx.date.startsWith(startPrefix)
    );

    return monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
  };

  const handleOpenEdit = (monthIndex: number) => {
    const existing = sheetExpenseGoals.find((g) => g.month === monthIndex + 1);
    setEditingMonth(monthIndex + 1);
    setFormCosts(String(existing?.costsBudget || 0));
    setFormExpenses(String(existing?.expensesBudget || 0));
  };

  const handleSaveGoal = (month: number) => {
    const c = parseFloat(formCosts.replace(',', '.')) || 0;
    const e = parseFloat(formExpenses.replace(',', '.')) || 0;

    saveMonthlyExpenseGoal({
      year: selectedYear,
      month,
      costsBudget: c,
      expensesBudget: e,
    });

    setEditingMonth(null);
    showToast(
      'Teto de Gastos Salvo',
      `Orçamento de despesas de ${MONTH_NAMES[month - 1]} atualizado com sucesso.`,
      'success'
    );
  };

  // Summary KPIs for whole year
  let totalYearLimit = 0;
  let totalYearActual = 0;

  for (let m = 1; m <= 12; m++) {
    const g = sheetExpenseGoals.find((item) => item.month === m);
    const limit = g ? g.costsBudget + g.expensesBudget : 0;
    totalYearLimit += limit;
    totalYearActual += getMonthActualExpenses(m - 1);
  }

  const netSavings = totalYearLimit - totalYearActual;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Controle de Gastos & Orçamento
              </span>
              <span className="text-xs text-slate-400">
                Exercício Fiscal: <strong className="text-slate-200">{selectedYear}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-rose-400" />
              Metas de Gastos & Teto Orçamentário ({selectedYear})
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Estabeleça o teto máximo de saídas (custos variáveis + despesas fixas) mês a mês e acompanhe o valor <strong>REALIZADO</strong> com alertas visuais imediatos se o teto for respeitado ou excedido.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Year Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              {[2025, 2026, 2027].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedYear === yr
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('revenue_goals')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
            >
              <span>Metas de Receitas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Teto Orçado Total</span>
            <Target className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-1">
            {formatCurrency(totalYearLimit)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Limite orçamentário anual Jan-Dez</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Total Gasto Realizado</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">
            {formatCurrency(totalYearActual)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Saídas efetivadas registradas no sistema
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Economia Orçamentária</span>
            {netSavings >= 0 ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl font-extrabold ${
                netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {netSavings >= 0 ? '+' : ''}
              {formatCurrency(netSavings)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {netSavings >= 0
              ? '🟢 Gastos dentro do limite estipulado!'
              : '🔴 Despesas acima do teto estipulado!'}
          </p>
        </div>
      </div>

      {/* Month by Month Grid */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" />
              Teto de Gastos Mensal — {selectedYear}
            </h2>
            <p className="text-xs text-slate-400">
              Configure os tetos de custos variáveis e despesas fixas para cada mês de {selectedYear}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONTH_NAMES.map((monthName, idx) => {
            const monthNum = idx + 1;
            const goal = sheetExpenseGoals.find((g) => g.month === monthNum);
            const limit = goal ? goal.costsBudget + goal.expensesBudget : 0;
            const actual = getMonthActualExpenses(idx);
            const balance = limit - actual; // positive means savings, negative means overspent
            const isEditing = editingMonth === monthNum;
            const isWithinBudget = limit > 0 && actual <= limit;
            const isOverspent = limit > 0 && actual > limit;
            const pct = limit > 0 ? Math.round((actual / limit) * 100) : 0;

            return (
              <div
                key={monthName}
                className={`p-4 rounded-xl border transition-all ${
                  isOverspent
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : isWithinBudget
                    ? 'bg-slate-950 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {String(monthNum).padStart(2, '0')}.
                    </span>
                    <h3 className="font-bold text-white text-sm">{monthName}</h3>
                  </div>

                  {limit > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isOverspent
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {isOverspent ? '🔴 Estourou Teto' : `🟢 Dentro (${pct}%)`}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  /* Inline Editing Form for Month */
                  <div className="mt-3 space-y-2.5 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        Teto Custos Variáveis (R$)
                      </label>
                      <input
                        type="text"
                        value={formCosts}
                        onChange={(e) => setFormCosts(e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        Teto Despesas Fixas / Operacionais (R$)
                      </label>
                      <input
                        type="text"
                        value={formExpenses}
                        onChange={(e) => setFormExpenses(e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingMonth(null)}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px]"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveGoal(monthNum)}
                        className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        Salvar Teto
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Display Card */
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Teto Orçado:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {formatCurrency(limit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Gasto Realizado:</span>
                      <span className="font-mono font-extrabold text-amber-400">
                        {formatCurrency(actual)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Economia / Saldo:</span>
                      <span
                        className={`font-mono font-bold ${
                          balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {balance >= 0 ? `+${formatCurrency(balance)}` : formatCurrency(balance)}
                      </span>
                    </div>

                    {/* Progress Bar of Spending */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isOverspent ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <button
                      onClick={() => handleOpenEdit(idx)}
                      className="w-full mt-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Configurar Teto de {monthName}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
