import React, { useMemo, useState } from 'react';
import {
  Zap,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { formatBRL, formatDate, formatMonthYear } from '../../utils/formatters';

export const CashFlowView: React.FC = () => {
  const {
    sheetTransactions,
    sheetAccounts,
    openTransactionModal,
    setTransferModalOpen,
  } = useFinance();

  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Overall cash balance summary
  const initialTotalBalance = useMemo(() => {
    return sheetAccounts.reduce((acc, a) => acc + a.initialBalance, 0);
  }, [sheetAccounts]);

  const totalInflows = useMemo(() => {
    return sheetTransactions
      .filter((t) => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [sheetTransactions]);

  const totalOutflows = useMemo(() => {
    return sheetTransactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [sheetTransactions]);

  const totalTransfers = useMemo(() => {
    return sheetTransactions
      .filter((t) => t.type === 'transfer' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [sheetTransactions]);

  const netCashResult = totalInflows - totalOutflows;
  const finalCalculatedBalance = initialTotalBalance + netCashResult;

  // Granular Cash Flow Aggregation (Daily, Weekly, Monthly)
  const cashFlowTimeline = useMemo(() => {
    const timeMap: Record<string, { period: string; label: string; initial: number; inflows: number; outflows: number; net: number; final: number }> = {};

    // Group sorted transactions
    const sorted = [...sheetTransactions]
      .filter((t) => t.date.startsWith(selectedYear) && t.status === 'completed')
      .sort((a, b) => a.date.localeCompare(b.date));

    if (granularity === 'monthly') {
      const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      months.forEach((m, idx) => {
        const key = `${selectedYear}-${m}`;
        timeMap[key] = {
          period: key,
          label: `${monthNames[idx]}/${selectedYear.slice(2)}`,
          initial: 0,
          inflows: 0,
          outflows: 0,
          net: 0,
          final: 0,
        };
      });

      sorted.forEach((t) => {
        const key = t.date.slice(0, 7);
        if (timeMap[key]) {
          if (t.type === 'income') timeMap[key].inflows += t.amount;
          if (t.type === 'expense') timeMap[key].outflows += t.amount;
        }
      });
    } else if (granularity === 'weekly') {
      // Group by weeks
      sorted.forEach((t) => {
        const d = new Date(t.date);
        const dayOfMonth = d.getDate();
        const weekNum = Math.ceil(dayOfMonth / 7);
        const monthStr = d.toLocaleDateString('pt-BR', { month: 'short' });
        const key = `Sem ${weekNum} (${monthStr})`;

        if (!timeMap[key]) {
          timeMap[key] = {
            period: key,
            label: key,
            initial: 0,
            inflows: 0,
            outflows: 0,
            net: 0,
            final: 0,
          };
        }
        if (t.type === 'income') timeMap[key].inflows += t.amount;
        if (t.type === 'expense') timeMap[key].outflows += t.amount;
      });
    } else {
      // Daily (Last 15 active days)
      sorted.slice(-15).forEach((t) => {
        const key = t.date;
        if (!timeMap[key]) {
          timeMap[key] = {
            period: key,
            label: formatDate(key),
            initial: 0,
            inflows: 0,
            outflows: 0,
            net: 0,
            final: 0,
          };
        }
        if (t.type === 'income') timeMap[key].inflows += t.amount;
        if (t.type === 'expense') timeMap[key].outflows += t.amount;
      });
    }

    let running = initialTotalBalance;
    const result = Object.values(timeMap).map((item) => {
      item.initial = running;
      item.net = item.inflows - item.outflows;
      running = item.initial + item.net;
      item.final = running;
      return item;
    });

    return result;
  }, [sheetTransactions, granularity, selectedYear, initialTotalBalance]);

  return (
    <div id="cash-flow-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Fluxo de Caixa
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Acompanhamento contínuo de liquidez, saldo inicial, entradas, saídas e saldo final
          </p>
        </div>

        {/* Granularity & Year selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                granularity === 'daily' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Diário
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                granularity === 'weekly' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setGranularity('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                granularity === 'monthly' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mensal
            </button>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Selecionar Ano"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Cards as specified in Prompt Section 8 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Saldo Inicial */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Saldo Inicial
          </span>
          <div className="font-display font-bold text-base sm:text-lg text-slate-200 font-mono">
            {formatBRL(initialTotalBalance)}
          </div>
        </div>

        {/* Entradas */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-900/30">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            + Entradas
          </span>
          <div className="font-display font-bold text-base sm:text-lg text-emerald-400 font-mono">
            {formatBRL(totalInflows)}
          </div>
        </div>

        {/* Saídas */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-900/30">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">
            − Saídas
          </span>
          <div className="font-display font-bold text-base sm:text-lg text-rose-400 font-mono">
            {formatBRL(totalOutflows)}
          </div>
        </div>

        {/* Transferências */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-900/30">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">
            ⇄ Transferências
          </span>
          <div className="font-display font-bold text-base sm:text-lg text-indigo-400 font-mono">
            {formatBRL(totalTransfers)}
          </div>
        </div>

        {/* Resultado */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-900/30">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
            Resultado
          </span>
          <div
            className={`font-display font-bold text-base sm:text-lg font-mono ${
              netCashResult >= 0 ? 'text-blue-400' : 'text-rose-400'
            }`}
          >
            {formatBRL(netCashResult)}
          </div>
        </div>

        {/* Saldo Final */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-950/40 to-slate-900/90 border border-blue-600/40">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
            Saldo Final
          </span>
          <div className="font-display font-bold text-base sm:text-lg text-white font-mono">
            {formatBRL(finalCalculatedBalance)}
          </div>
        </div>
      </div>

      {/* Cash Flow Visual Chart */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Demonstrativo Visual do Fluxo
            </h3>
            <p className="text-xs text-slate-400">Entradas vs Saídas vs Resultado por período</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowTimeline} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
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
              <Bar dataKey="inflows" name="Entradas (+)" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflows" name="Saídas (−)" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name="Resultado Líquido" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cash Flow Automated Table Matrix */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
        <h3 className="font-display font-bold text-base text-white">Tabela Consolidada de Fluxo de Caixa</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3">Período</th>
                <th className="pb-3 text-right">Saldo Inicial</th>
                <th className="pb-3 text-right text-emerald-400">Entradas (+)</th>
                <th className="pb-3 text-right text-rose-400">Saídas (−)</th>
                <th className="pb-3 text-right text-blue-400">Resultado Líquido</th>
                <th className="pb-3 text-right text-white">Saldo Final</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {cashFlowTimeline.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-semibold text-slate-200">{row.label}</td>
                  <td className="py-3 text-right text-slate-400 font-mono">{formatBRL(row.initial)}</td>
                  <td className="py-3 text-right text-emerald-400 font-mono font-medium">{formatBRL(row.inflows)}</td>
                  <td className="py-3 text-right text-rose-400 font-mono font-medium">{formatBRL(row.outflows)}</td>
                  <td
                    className={`py-3 text-right font-mono font-semibold ${
                      row.net >= 0 ? 'text-blue-400' : 'text-rose-400'
                    }`}
                  >
                    {formatBRL(row.net)}
                  </td>
                  <td className="py-3 text-right text-white font-mono font-bold">{formatBRL(row.final)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
