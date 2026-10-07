import React, { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Scale,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  FileText,
  Calendar,
  Sparkles,
  AlertCircle,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  LineChart as LineIcon,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { PeriodFilter } from '../../types';
import { formatBRL, formatPercent, formatDate, getPaymentMethodLabel, getStatusDetails } from '../../utils/formatters';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { GL3DVisualizer } from './GL3DVisualizer';

const PIE_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#64748B', // Slate
  '#F97316', // Orange
];

export const DashboardView: React.FC = () => {
  const {
    totalBalance,
    totalPeriodIncome,
    totalPeriodExpense,
    netPeriodResult,
    incomeGrowthPercent,
    expenseGrowthPercent,
    resultGrowthPercent,
    periodFilter,
    setPeriodFilter,
    periodDateRange,
    customStartDate,
    customEndDate,
    setCustomDateRange,
    filteredTransactions,
    sheetTransactions,
    sheetAccounts,
    sheetCategories,
    upcomingPayables,
    overduePayables,
    openTransactionModal,
    setTransferModalOpen,
    setActiveTab,
    isDemoMode,
    setOnboardingOpen,
  } = useFinance();

  const [activeChartTab, setActiveChartTab] = useState<'income_expense' | 'categories' | 'cash_flow' | 'balance_trend'>('income_expense');
  const [customRangeOpen, setCustomRangeOpen] = useState<boolean>(false);
  const [tempStart, setTempStart] = useState<string>(customStartDate);
  const [tempEnd, setTempEnd] = useState<string>(customEndDate);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'today', label: 'Hoje' },
    { id: 'this_week', label: 'Esta semana' },
    { id: 'this_month', label: 'Este mês' },
    { id: 'prev_month', label: 'Mês anterior' },
    { id: 'last_3_months', label: 'Últimos 3 meses' },
    { id: 'last_6_months', label: 'Últimos 6 meses' },
    { id: 'this_year', label: 'Este ano' },
    { id: 'custom', label: 'Personalizado' },
  ];

  // Prepare monthly aggregated data for charts from all transactions in the current sheet
  const monthlyChartData = useMemo(() => {
    const monthMap: Record<string, { month: string; income: number; expense: number; balance: number; net: number }> = {};
    
    // Sort transactions chronologically
    const sorted = [...sheetTransactions].sort((a, b) => a.date.localeCompare(b.date));
    
    let rollingBalance = sheetAccounts.reduce((acc, a) => acc + a.initialBalance, 0);

    sorted.forEach((tx) => {
      if (tx.status === 'overdue' && tx.type === 'expense') return;
      const monthKey = tx.date.slice(0, 7); // YYYY-MM
      
      if (!monthMap[monthKey]) {
        const [year, monthNum] = monthKey.split('-');
        const dateObj = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const label = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        monthMap[monthKey] = { month: label, income: 0, expense: 0, balance: 0, net: 0 };
      }

      if (tx.type === 'income' && tx.status === 'completed') {
        monthMap[monthKey].income += tx.amount;
        rollingBalance += tx.amount;
      } else if (tx.type === 'expense' && tx.status === 'completed') {
        monthMap[monthKey].expense += tx.amount;
        rollingBalance -= tx.amount;
      }
      monthMap[monthKey].net = monthMap[monthKey].income - monthMap[monthKey].expense;
      monthMap[monthKey].balance = rollingBalance;
    });

    const data = Object.values(monthMap);
    if (data.length > 0) {
      return data;
    }

    // Default neutral months with zero values when no transactions exist yet
    const now = new Date();
    const zeroMonths = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      zeroMonths.push({
        month: label,
        income: 0,
        expense: 0,
        balance: rollingBalance,
        net: 0,
      });
    }
    return zeroMonths;
  }, [sheetTransactions, sheetAccounts]);

  // Expenses Category breakdown data for Pie Chart
  const categoryExpensesData = useMemo(() => {
    const catMap: Record<string, { name: string; value: number; color: string }> = {};

    filteredTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const category = sheetCategories.find((c) => c.id === tx.categoryId);
        const name = category ? category.name : 'Outros';
        const color = category?.color || '#3B82F6';

        if (!catMap[name]) {
          catMap[name] = { name, value: 0, color };
        }
        catMap[name].value += tx.amount;
      });

    return Object.values(catMap).sort((a, b) => b.value - a.value);
  }, [filteredTransactions, sheetCategories]);

  // Recent transactions list
  const recentTransactions = useMemo(() => {
    return [...sheetTransactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
  }, [sheetTransactions]);

  const handleApplyCustomRange = () => {
    if (tempStart && tempEnd) {
      setCustomDateRange(tempStart, tempEnd);
      setCustomRangeOpen(false);
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner if in Demo Mode */}
      {isDemoMode && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-800/40 shadow-lg shadow-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                Modo Demonstração Finance GL Pro
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  GL Studios
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Os valores e relatórios abaixo utilizam dados fictícios de demonstração. Você pode testar todos os recursos livremente.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOnboardingOpen(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <span>Começar minha planilha</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Period Selector & Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Visão Geral Financeira
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Período selecionado:</span>
            <span className="font-semibold text-slate-200">{periodDateRange.label}</span>
            <span className="text-slate-500 text-xs">({formatDate(periodDateRange.start)} até {formatDate(periodDateRange.end)})</span>
          </p>
        </div>

        {/* Period Selector Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
          {periods.map((p) => {
            const isSelected = periodFilter === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (p.id === 'custom') {
                    setCustomRangeOpen(true);
                  } else {
                    setPeriodFilter(p.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Date Range Popover */}
      {customRangeOpen && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-wrap items-end gap-3 max-w-xl animate-in fade-in">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Data Inicial</label>
            <input
              type="date"
              value={tempStart}
              onChange={(e) => setTempStart(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Data Final</label>
            <input
              type="date"
              value={tempEnd}
              onChange={(e) => setTempEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyCustomRange}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              Filtrar
            </button>
            <button
              onClick={() => setCustomRangeOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: SALDO ATUAL */}
        <div
          id="kpi-saldo-atual"
          className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl hover:border-slate-700 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Saldo Atual
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            <AnimatedNumber value={totalBalance} />
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Consolidado em {sheetAccounts.length} contas ativas</span>
          </div>
          {/* Subtle bottom glow line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-transparent opacity-60" />
        </div>

        {/* Card 2: RECEITAS */}
        <div
          id="kpi-receitas"
          className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl hover:border-emerald-800/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Receitas
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            <AnimatedNumber value={totalPeriodIncome} />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
            <span
              className={`flex items-center font-semibold ${
                incomeGrowthPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {incomeGrowthPercent >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {formatPercent(incomeGrowthPercent)}
            </span>
            <span className="text-slate-500">em relação ao período anterior</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent opacity-60" />
        </div>

        {/* Card 3: DESPESAS */}
        <div
          id="kpi-despesas"
          className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl hover:border-rose-800/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Despesas
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight">
            <AnimatedNumber value={totalPeriodExpense} />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
            <span
              className={`flex items-center font-semibold ${
                expenseGrowthPercent <= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {expenseGrowthPercent >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {formatPercent(expenseGrowthPercent)}
            </span>
            <span className="text-slate-500">em relação ao período anterior</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-transparent opacity-60" />
        </div>

        {/* Card 4: RESULTADO (Receitas - Despesas) */}
        <div
          id="kpi-resultado"
          className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 shadow-xl hover:border-blue-800/40 transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resultado Líquido
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`font-display text-2xl sm:text-3xl font-extrabold tracking-tight ${
              netPeriodResult >= 0 ? 'text-blue-400' : 'text-rose-400'
            }`}
          >
            <AnimatedNumber value={netPeriodResult} />
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px]">
            <span
              className={`flex items-center font-semibold ${
                resultGrowthPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {resultGrowthPercent >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {formatPercent(resultGrowthPercent)}
            </span>
            <span className="text-slate-500">vs período anterior</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent opacity-60" />
        </div>
      </div>

      {/* Quick Action Floating Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">Ações Rápidas do Gestor:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openTransactionModal('income')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-600/40 text-emerald-300 hover:text-white text-xs font-semibold transition-all"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>+ Receita</span>
          </button>
          <button
            onClick={() => openTransactionModal('expense')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-600/40 text-rose-300 hover:text-white text-xs font-semibold transition-all"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>− Despesa</span>
          </button>
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-600/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>⇄ Transferência</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 border border-blue-600/40 text-blue-300 hover:text-white text-xs font-semibold transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📄 Relatório</span>
          </button>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Multi-Tab Automated Chart */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Análise Financeira Inteligente
              </h3>
              <p className="text-xs text-slate-400">
                Gráficos gerados automaticamente a partir dos seus lançamentos
              </p>
            </div>

            {/* Chart type selector tabs & quick actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setActiveChartTab('income_expense')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeChartTab === 'income_expense'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Receitas x Despesas
                </button>
                <button
                  onClick={() => setActiveChartTab('cash_flow')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeChartTab === 'cash_flow'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fluxo de Caixa
                </button>
                <button
                  onClick={() => setActiveChartTab('balance_trend')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeChartTab === 'balance_trend'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Evolução do Saldo
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1">
                <button
                  onClick={() => openTransactionModal('income')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                  title="Adicionar Receita"
                >
                  <ArrowDownLeft className="w-3 h-3" />
                  <span>+ Receita</span>
                </button>
                <button
                  onClick={() => openTransactionModal('expense')}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                  title="Adicionar Despesa"
                >
                  <ArrowUpRight className="w-3 h-3" />
                  <span>− Despesa</span>
                </button>
              </div>
            </div>
          </div>

          {/* Chart Display Canvas */}
          <div className="h-72 w-full">
            {activeChartTab === 'income_expense' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val)), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Receitas" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'cash_flow' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val)), '']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Entradas" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Saídas" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Resultado" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChartTab === 'balance_trend' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val)), 'Saldo Consolidado']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Evolução do Saldo"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right Col: Categories Breakdown Donut Chart */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                Para Onde Foi o Dinheiro
              </h3>
              <PieIcon className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-slate-400">
              Distribuição de despesas por categoria no período
            </p>
          </div>

          <div className="h-52 w-full my-2">
            {categoryExpensesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Nenhuma despesa registrada neste período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpensesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryExpensesData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val)), 'Total']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Categories mini list */}
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {categoryExpensesData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/50">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color || PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-300 truncate">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-200 font-mono">
                  {formatBRL(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Accounts Widget & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Accounts & Open Finance Live Feed + 3D Visualizer */}
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white">Minhas Contas</h3>
                <p className="text-xs text-slate-400">Saldos atualizados em tempo real</p>
              </div>
              <button
                onClick={() => setActiveTab('accounts')}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-2.5">
              {sheetAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-8 rounded-md shrink-0"
                      style={{ backgroundColor: acc.color || '#3B82F6' }}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white">{acc.name}</span>
                        {acc.isBankConnected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {acc.bankName || 'Conta Bancária'}
                      </span>
                    </div>
                  </div>
                  <span className="font-display font-bold text-xs text-slate-100 font-mono">
                    {formatBRL(acc.currentBalance)}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Payables Banner if there are any */}
            {(overduePayables.length > 0 || upcomingPayables.length > 0) && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-amber-300">Atenção às contas: </span>
                  {overduePayables.length > 0
                    ? `${overduePayables.length} conta(s) vencida(s)! `
                    : `${upcomingPayables.length} conta(s) vencendo nos próximos 7 dias.`}
                  <button
                    onClick={() => setActiveTab('payables')}
                    className="underline text-amber-400 ml-1 hover:text-amber-200"
                  >
                    Conferir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Abstract 3D GL Node Visualizer (Discrete financial geometry) */}
          <GL3DVisualizer />
        </div>

        {/* Right 2 Cols: Recent Transactions Table */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-white">Últimos Lançamentos</h3>
              <p className="text-xs text-slate-400">Movimentações recentes registradas na planilha</p>
            </div>
            <button
              onClick={() => setActiveTab('income')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver extrato completo
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              Nenhum lançamento registrado ainda. Clique em "+ Receita" ou "- Despesa" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2">Data</th>
                    <th className="pb-2">Descrição</th>
                    <th className="pb-2 hidden sm:table-cell">Categoria</th>
                    <th className="pb-2 hidden md:table-cell">Pagamento</th>
                    <th className="pb-2 text-right">Valor</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentTransactions.map((tx) => {
                    const status = getStatusDetails(tx.status, tx.type);
                    const category = sheetCategories.find((c) => c.id === tx.categoryId);

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 text-slate-400 font-mono">{formatDate(tx.date)}</td>
                        <td className="py-2.5 font-medium text-slate-200">
                          <div className="flex items-center gap-2">
                            {tx.type === 'income' ? (
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : tx.type === 'expense' ? (
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            ) : (
                              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[150px] sm:max-w-[200px]">
                              {tx.description}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 hidden sm:table-cell text-slate-400">
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                            style={{
                              borderColor: `${category?.color || '#3B82F6'}40`,
                              backgroundColor: `${category?.color || '#3B82F6'}15`,
                              color: category?.color || '#93C5FD',
                            }}
                          >
                            {category?.name || 'Geral'}
                          </span>
                        </td>
                        <td className="py-2.5 hidden md:table-cell text-slate-400">
                          {getPaymentMethodLabel(tx.paymentMethod)}
                        </td>
                        <td
                          className={`py-2.5 text-right font-semibold font-mono ${
                            tx.type === 'income'
                              ? 'text-emerald-400'
                              : tx.type === 'expense'
                              ? 'text-rose-400'
                              : 'text-indigo-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : tx.type === 'expense' ? '−' : ''}{' '}
                          {formatBRL(tx.amount)}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
