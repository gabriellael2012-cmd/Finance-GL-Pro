import React, { useMemo, useState } from 'react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatBRL, formatDate, formatPercent } from '../../utils/formatters';
import { CompactYearSelector } from '../common/CompactYearSelector';

type ReportType =
  | 'monthly'
  | 'annual'
  | 'income_category'
  | 'expense_category'
  | 'cash_flow_statement'
  | 'payables_receivables'
  | 'period_comparison';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#EF4444', '#14B8A6'];

export const ReportsView: React.FC = () => {
  const {
    sheetTransactions,
    sheetCategories,
    sheetAccounts,
    activeSheet,
    selectedYear,
    openTransactionModal,
  } = useFinance();

  const [selectedReport, setSelectedReport] = useState<ReportType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => String(new Date().getMonth() + 1).padStart(2, '0'));

  // Month dataset
  const monthTransactions = useMemo(() => {
    const prefix = `${selectedYear}-${selectedMonth}`;
    return sheetTransactions.filter((t) => t.date.startsWith(prefix));
  }, [sheetTransactions, selectedYear, selectedMonth]);

  // Year dataset
  const yearTransactions = useMemo(() => {
    return sheetTransactions.filter((t) => t.date.startsWith(selectedYear));
  }, [sheetTransactions, selectedYear]);

  // Monthly stats
  const monthIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthResult = monthIncome - monthExpense;

  // Category breakdowns for selected month
  const categoryIncomeData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        const cat = sheetCategories.find((c) => c.id === t.categoryId)?.name || 'Outras';
        map[cat] = (map[cat] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [monthTransactions, sheetCategories]);

  const categoryExpenseData = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const cat = sheetCategories.find((c) => c.id === t.categoryId)?.name || 'Outras';
        map[cat] = (map[cat] || 0) + t.amount;
      });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions, sheetCategories]);

  // Annual monthly chart data
  const annualMonthlyData = useMemo(() => {
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    return months.map((m, idx) => {
      const prefix = `${selectedYear}-${m}`;
      const txs = sheetTransactions.filter((t) => t.date.startsWith(prefix) && t.status === 'completed');
      const inc = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return {
        month: names[idx],
        income: inc,
        expense: exp,
        net: inc - exp,
      };
    });
  }, [sheetTransactions, selectedYear]);

  // Export report handler
  const handleExportReport = () => {
    let reportTitle = `FinanceGLPro_Relatorio_${selectedReport}_${selectedYear}_${selectedMonth}.csv`;
    let headers = ['Item', 'Categoria', 'Valor (R$)', 'Data', 'Status'];
    let rows: string[][] = [];

    if (selectedReport === 'monthly') {
      rows = monthTransactions.map((t) => [
        `"${t.description}"`,
        `"${sheetCategories.find((c) => c.id === t.categoryId)?.name || ''}"`,
        t.amount.toFixed(2),
        t.date,
        t.status,
      ]);
    } else {
      rows = yearTransactions.map((t) => [
        `"${t.description}"`,
        `"${sheetCategories.find((c) => c.id === t.categoryId)?.name || ''}"`,
        t.amount.toFixed(2),
        t.date,
        t.status,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', reportTitle);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="reports-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Relatórios Financeiros
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Demonstrativos detalhados, balanços por categoria, fluxo anual e comparativos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Transaction Actions */}
          <button
            id="btn-report-add-income"
            onClick={() => openTransactionModal('income')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/30 transition-all active:scale-95"
            title="Adicionar Receita"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Adicionar Receita</span>
          </button>

          <button
            id="btn-report-add-expense"
            onClick={() => openTransactionModal('expense')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/30 transition-all active:scale-95"
            title="Adicionar Despesa"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>− Adicionar Despesa</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimir PDF</span>
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
            title="Exportar dados do relatório"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {/* Report Type Navigator & Date Selectors */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'monthly', label: 'Mensal' },
            { id: 'annual', label: 'Anual' },
            { id: 'expense_category', label: 'Despesas por Categoria' },
            { id: 'income_category', label: 'Receitas por Categoria' },
            { id: 'cash_flow_statement', label: 'Resultado Acumulado' },
          ].map((rep) => (
            <button
              key={rep.id}
              onClick={() => setSelectedReport(rep.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedReport === rep.id
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {rep.label}
            </button>
          ))}
        </div>

        {/* Year and Month Pickers */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            aria-label="Selecionar Mês"
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
          >
            <option value="01">Janeiro</option>
            <option value="02">Fevereiro</option>
            <option value="03">Março</option>
            <option value="04">Abril</option>
            <option value="05">Maio</option>
            <option value="06">Junho</option>
            <option value="07">Julho</option>
            <option value="08">Agosto</option>
            <option value="09">Setembro</option>
            <option value="10">Outubro</option>
            <option value="11">Novembro</option>
            <option value="12">Dezembro</option>
          </select>

          <CompactYearSelector variant="inline" />
        </div>
      </div>

      {/* Main Report View Container */}
      {selectedReport === 'monthly' && (
        <div className="space-y-6">
          {/* Monthly KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-800/30">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Receitas do Mês
              </span>
              <div className="font-display font-bold text-2xl text-emerald-400 font-mono">
                {formatBRL(monthIncome)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-800/30">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
                Despesas do Mês
              </span>
              <div className="font-display font-bold text-2xl text-rose-400 font-mono">
                {formatBRL(monthExpense)}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-blue-800/30">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-1">
                Resultado Líquido do Mês
              </span>
              <div
                className={`font-display font-bold text-2xl font-mono ${
                  monthResult >= 0 ? 'text-blue-400' : 'text-rose-400'
                }`}
              >
                {formatBRL(monthResult)}
              </div>
            </div>
          </div>

          {/* Monthly breakdown table */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              Lançamentos do Mês ({selectedMonth}/{selectedYear})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3">Data</th>
                    <th className="pb-3">Descrição</th>
                    <th className="pb-3">Categoria</th>
                    <th className="pb-3">Conta</th>
                    <th className="pb-3 text-right">Valor</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {monthTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 text-slate-400 font-mono">{formatDate(tx.date)}</td>
                      <td className="py-2.5 font-medium text-slate-200">{tx.description}</td>
                      <td className="py-2.5 text-slate-400">
                        {sheetCategories.find((c) => c.id === tx.categoryId)?.name || 'Geral'}
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {sheetAccounts.find((a) => a.id === tx.accountId)?.name || 'Conta'}
                      </td>
                      <td
                        className={`py-2.5 text-right font-mono font-semibold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '−'} {formatBRL(tx.amount)}
                      </td>
                      <td className="py-2.5 text-center text-[10px] text-slate-400 uppercase">
                        {tx.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'annual' && (
        <div className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-base text-white">
              Evolução Anual Comparativa ({selectedYear})
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annualMonthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val)), '']}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Receitas (+)" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Despesas (−)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="net" name="Resultado" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {(selectedReport === 'expense_category' || selectedReport === 'income_category') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl flex flex-col justify-between">
            <h3 className="font-display font-bold text-base text-white mb-4">
              Distribuição por Categoria ({selectedMonth}/{selectedYear})
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={selectedReport === 'expense_category' ? categoryExpenseData : categoryIncomeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {(selectedReport === 'expense_category' ? categoryExpenseData : categoryIncomeData).map(
                      (entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatBRL(Number(val)), 'Total']}
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
            <h3 className="font-display font-bold text-base text-white">Detalhamento dos Valores</h3>
            <div className="space-y-2">
              {(selectedReport === 'expense_category' ? categoryExpenseData : categoryIncomeData).map(
                (item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-semibold text-xs text-slate-200">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-white">
                      {formatBRL(item.value)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'cash_flow_statement' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="font-display font-bold text-base text-white">Demonstrativo de Resultado Acumulado ({selectedYear})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Mês</th>
                  <th className="pb-3 text-right text-emerald-400">Receitas Totais</th>
                  <th className="pb-3 text-right text-rose-400">Despesas Totais</th>
                  <th className="pb-3 text-right text-blue-400">Margem / Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {annualMonthlyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-semibold text-slate-200">{row.month}</td>
                    <td className="py-3 text-right text-emerald-400 font-mono">{formatBRL(row.income)}</td>
                    <td className="py-3 text-right text-rose-400 font-mono">{formatBRL(row.expense)}</td>
                    <td
                      className={`py-3 text-right font-mono font-bold ${
                        row.net >= 0 ? 'text-blue-400' : 'text-rose-400'
                      }`}
                    >
                      {formatBRL(row.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
