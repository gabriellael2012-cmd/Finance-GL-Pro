import React, { useMemo, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  DollarSign,
  Plus,
  ArrowUpRight,
  Filter,
  Check,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatBRL, formatDate, getStatusDetails } from '../../utils/formatters';

type PayableFilter = 'all' | 'today' | 'next_7_days' | 'next_30_days' | 'overdue';

export const PayablesView: React.FC = () => {
  const {
    sheetTransactions,
    sheetCategories,
    sheetAccounts,
    selectedYear,
    quickPayBill,
    openTransactionModal,
  } = useFinance();

  const [activeFilter, setActiveFilter] = useState<PayableFilter>('all');
  const [yearScope, setYearScope] = useState<'selected' | 'all'>('selected');

  const todayStr = new Date().toISOString().slice(0, 10);
  const next7DaysStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const next30DaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  // Scoped transactions
  const scopedTransactions = useMemo(() => {
    if (yearScope === 'all') return sheetTransactions;
    const yrStr = String(selectedYear);
    return sheetTransactions.filter((t) => (t.dueDate || t.date).startsWith(yrStr));
  }, [sheetTransactions, yearScope, selectedYear]);

  // Filtered Payables
  const payablesList = useMemo(() => {
    return scopedTransactions
      .filter((t) => t.type === 'expense')
      .filter((t) => {
        const due = t.dueDate || t.date;
        const isOverdue = t.status === 'overdue' || (t.status === 'pending' && due < todayStr);

        switch (activeFilter) {
          case 'today':
            return due === todayStr;
          case 'next_7_days':
            return due >= todayStr && due <= next7DaysStr;
          case 'next_30_days':
            return due >= todayStr && due <= next30DaysStr;
          case 'overdue':
            return isOverdue;
          case 'all':
          default:
            return true;
        }
      })
      .sort((a, b) => {
        const dueA = a.dueDate || a.date;
        const dueB = b.dueDate || b.date;
        return dueA.localeCompare(dueB);
      });
  }, [scopedTransactions, activeFilter, todayStr, next7DaysStr, next30DaysStr]);

  // Totals
  const pendingTotal = useMemo(() => {
    return scopedTransactions
      .filter((t) => t.type === 'expense' && (t.status === 'pending' || t.status === 'scheduled'))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [scopedTransactions]);

  const overdueTotal = useMemo(() => {
    return scopedTransactions
      .filter((t) => t.type === 'expense' && (t.status === 'overdue' || (t.status === 'pending' && (t.dueDate || t.date) < todayStr)))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [scopedTransactions, todayStr]);

  const paidTotal = useMemo(() => {
    return scopedTransactions
      .filter((t) => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [scopedTransactions]);

  return (
    <div id="payables-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Contas a Pagar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Controle de compromissos futuros, boletos, faturas e obrigações a vencer
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setYearScope('selected')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                yearScope === 'selected'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ano {selectedYear}
            </button>
            <button
              type="button"
              onClick={() => setYearScope('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                yearScope === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos os Anos
            </button>
          </div>

          <button
            onClick={() => openTransactionModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/40 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nova Despesa / Conta</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Pendente */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              🟡 Total Pendente
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-bold text-xl sm:text-2xl text-amber-400 font-mono">
            {formatBRL(pendingTotal)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Aguardando quitação</span>
        </div>

        {/* Total Vencido */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-rose-800/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              🔴 Total Vencido
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="font-display font-bold text-xl sm:text-2xl text-rose-400 font-mono">
            {formatBRL(overdueTotal)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Pagamento em atraso</span>
        </div>

        {/* Total Pago */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              🟢 Total Já Quitado
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display font-bold text-xl sm:text-2xl text-emerald-400 font-mono">
            {formatBRL(paidTotal)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Contas pagas com sucesso</span>
        </div>
      </div>

      {/* Filter Tabs as specified in Prompt Section 15 */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'today', label: 'Hoje' },
          { id: 'next_7_days', label: 'Próximos 7 dias' },
          { id: 'next_30_days', label: 'Próximos 30 dias' },
          { id: 'overdue', label: '🔴 Vencidas' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeFilter === f.id
                ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Payables List Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4">
        {payablesList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Nenhuma conta a pagar encontrada para o filtro selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Vencimento</th>
                  <th className="pb-3">Descrição / Fornecedor</th>
                  <th className="pb-3 hidden sm:table-cell">Categoria</th>
                  <th className="pb-3 hidden md:table-cell">Conta de Débito</th>
                  <th className="pb-3 text-right">Valor</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {payablesList.map((bill) => {
                  const status = getStatusDetails(bill.status, bill.type);
                  const category = sheetCategories.find((c) => c.id === bill.categoryId);
                  const account = sheetAccounts.find((a) => a.id === bill.accountId);
                  const isPaid = bill.status === 'completed';

                  return (
                    <tr key={bill.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-mono text-slate-300">
                        {formatDate(bill.dueDate || bill.date)}
                      </td>
                      <td className="py-3 font-medium text-slate-200">
                        <div className="flex flex-col">
                          <span>{bill.description}</span>
                          {bill.recipientOrClient && (
                            <span className="text-[10px] text-slate-400">
                              Credor: {bill.recipientOrClient}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell text-slate-400">
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
                      <td className="py-3 hidden md:table-cell text-slate-300">
                        {account?.name || 'Conta Padrão'}
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-rose-400 text-sm">
                        {formatBRL(bill.amount)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${status.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {!isPaid ? (
                          <button
                            onClick={() => quickPayBill(bill.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-all active:scale-95 shadow-sm"
                            title="Marcar como Pago e dar baixa imediata"
                          >
                            <Check className="w-3 h-3" />
                            <span>Pagar</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pago
                          </span>
                        )}
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
  );
};
