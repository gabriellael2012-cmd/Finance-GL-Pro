import React, { useState } from 'react';
import {
  TrendingUp,
  Target,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Save,
  DollarSign,
  PieChart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { MonthlyRevenueGoal } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { CompactYearSelector } from '../common/CompactYearSelector';

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

export const RevenueGoalsView: React.FC = () => {
  const {
    sheetTransactions,
    sheetRevenueGoals,
    saveMonthlyRevenueGoal,
    selectedYear,
    setSelectedYear,
    showToast,
    setActiveTab,
  } = useFinance();

  const [editingMonth, setEditingMonth] = useState<number | null>(null);
  const [formProducts, setFormProducts] = useState<string>('0');
  const [formServices, setFormServices] = useState<string>('0');
  const [formOther, setFormOther] = useState<string>('0');
  const [formFinancial, setFormFinancial] = useState<string>('0');

  // Compute actual completed revenue for each month of the selected year
  const getMonthActualRevenue = (monthIndex: number) => {
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const startPrefix = `${selectedYear}-${monthStr}`;

    const monthTxs = sheetTransactions.filter(
      (tx) =>
        tx.type === 'income' &&
        tx.status === 'completed' &&
        tx.date.startsWith(startPrefix)
    );

    return monthTxs.reduce((sum, tx) => sum + tx.amount, 0);
  };

  const handleOpenEdit = (monthIndex: number) => {
    const existing = sheetRevenueGoals.find((g) => g.month === monthIndex + 1);
    setEditingMonth(monthIndex + 1);
    setFormProducts(String(existing?.productsBudget || 0));
    setFormServices(String(existing?.servicesBudget || 0));
    setFormOther(String(existing?.otherBudget || 0));
    setFormFinancial(String(existing?.financialBudget || 0));
  };

  const handleSaveGoal = (month: number) => {
    const p = parseFloat(formProducts.replace(',', '.')) || 0;
    const s = parseFloat(formServices.replace(',', '.')) || 0;
    const o = parseFloat(formOther.replace(',', '.')) || 0;
    const f = parseFloat(formFinancial.replace(',', '.')) || 0;

    saveMonthlyRevenueGoal({
      year: selectedYear,
      month,
      productsBudget: p,
      servicesBudget: s,
      otherBudget: o,
      financialBudget: f,
    });

    setEditingMonth(null);
    showToast(
      'Meta de Receita Salva',
      `Orçamento de ${MONTH_NAMES[month - 1]} atualizado com sucesso.`,
      'success'
    );
  };

  // Summary KPIs for whole year
  let totalYearTarget = 0;
  let totalYearActual = 0;

  for (let m = 1; m <= 12; m++) {
    const g = sheetRevenueGoals.find((item) => item.month === m);
    const target = g
      ? g.productsBudget + g.servicesBudget + g.otherBudget + g.financialBudget
      : 0;
    totalYearTarget += target;
    totalYearActual += getMonthActualRevenue(m - 1);
  }

  const overallProgress =
    totalYearTarget > 0 ? Math.min(100, Math.round((totalYearActual / totalYearTarget) * 100)) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Faturamento Planejado
              </span>
              <span className="text-xs text-slate-400">
                Exercício Fiscal: <strong className="text-slate-200">{selectedYear}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
              Metas de Receitas ({selectedYear})
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Defina seu faturamento desejado mês a mês (Produtos, Serviços, etc.) e acompanhe em tempo real o valor <strong>REALIZADO</strong> calculado automaticamente a partir dos lançamentos efetivados.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Year Switcher */}
            <CompactYearSelector variant="inline" />

            <button
              onClick={() => setActiveTab('expense_goals')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
            >
              <span>Metas de Gastos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Meta Total do Ano</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-1">
            {formatCurrency(totalYearTarget)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Soma das metas de Jan a Dez</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Receita Realizada no Ano</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-cyan-400 mt-1">
            {formatCurrency(totalYearActual)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Extraído dos lançamentos concluídos de {selectedYear}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Atingimento Global</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-white">{overallProgress}%</span>
            <span className="text-xs text-slate-400">da meta anual</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-2 mt-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Month by Month Grid */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Planejamento Mensal de Receitas — {selectedYear}
            </h2>
            <p className="text-xs text-slate-400">
              Clique em &quot;Configurar Meta&quot; no mês desejado para ajustar o orçamento de vendas e serviços.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MONTH_NAMES.map((monthName, idx) => {
            const monthNum = idx + 1;
            const goal = sheetRevenueGoals.find((g) => g.month === monthNum);
            const target = goal
              ? goal.productsBudget +
                goal.servicesBudget +
                goal.otherBudget +
                goal.financialBudget
              : 0;
            const actual = getMonthActualRevenue(idx);
            const diff = actual - target;
            const isEditing = editingMonth === monthNum;
            const pct = target > 0 ? Math.round((actual / target) * 100) : 0;
            const isBatida = target > 0 && actual >= target;

            return (
              <div
                key={monthName}
                className={`p-4 rounded-xl border transition-all ${
                  isBatida
                    ? 'bg-slate-950 border-emerald-500/40'
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

                  {target > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isBatida
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {isBatida ? '🟢 Meta Atingida' : `🟡 ${pct}%`}
                    </span>
                  )}
                </div>

                {isEditing ? (
                  /* Inline Editing Form for Month */
                  <div className="mt-3 space-y-2.5 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        Meta Produtos (R$)
                      </label>
                      <input
                        type="text"
                        value={formProducts}
                        onChange={(e) => setFormProducts(e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        Meta Serviços (R$)
                      </label>
                      <input
                        type="text"
                        value={formServices}
                        onChange={(e) => setFormServices(e.target.value)}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">
                        Outras / Financeiras (R$)
                      </label>
                      <input
                        type="text"
                        value={formOther}
                        onChange={(e) => setFormOther(e.target.value)}
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
                        className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Save className="w-3 h-3" />
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Display Card */
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Meta Planejada:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {formatCurrency(target)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Realizado no Mês:</span>
                      <span className="font-mono font-extrabold text-cyan-400">
                        {formatCurrency(actual)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Diferença / Saldo:</span>
                      <span
                        className={`font-mono font-semibold ${
                          diff >= 0 ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {diff >= 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          isBatida ? 'bg-emerald-500' : 'bg-cyan-500'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <button
                      onClick={() => handleOpenEdit(idx)}
                      className="w-full mt-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Configurar Meta de {monthName}
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
