import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  Trash2,
  Edit2,
  Download,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionStatus, TransactionType } from '../../types';
import { formatBRL, formatDate, getPaymentMethodLabel, getStatusDetails } from '../../utils/formatters';

interface TransactionsViewProps {
  initialTypeFilter?: 'all' | 'income' | 'expense' | 'transfer';
  title?: string;
  subtitle?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  initialTypeFilter = 'all',
  title = 'Todos os Lançamentos',
  subtitle = 'Gerencie, filtre e visualize todas as movimentações financeiras',
}) => {
  const {
    sheetTransactions,
    sheetCategories,
    sheetAccounts,
    openTransactionModal,
    setTransferModalOpen,
    deleteTransaction,
    updateTransaction,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered & Sorted Transactions
  const filteredList = useMemo(() => {
    return sheetTransactions
      .filter((tx) => {
        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        // Category filter
        if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;
        // Account filter
        if (accountFilter !== 'all' && tx.accountId !== accountFilter && tx.toAccountId !== accountFilter) return false;
        // Status filter
        if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const descMatch = tx.description.toLowerCase().includes(q);
          const notesMatch = tx.notes?.toLowerCase().includes(q);
          const clientMatch = tx.recipientOrClient?.toLowerCase().includes(q);
          return descMatch || notesMatch || clientMatch;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [sheetTransactions, typeFilter, categoryFilter, accountFilter, statusFilter, searchQuery, sortBy]);

  // Statistics for currently filtered view
  const currentTotal = useMemo(() => {
    return filteredList.reduce((sum, tx) => {
      if (tx.type === 'income') return sum + tx.amount;
      if (tx.type === 'expense') return sum - tx.amount;
      return sum;
    }, 0);
  }, [filteredList]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Tipo', 'Descrição', 'Valor (R$)', 'Categoria', 'Conta', 'Status', 'Forma Pagamento', 'Notas'];
    const rows = filteredList.map((tx) => {
      const cat = sheetCategories.find((c) => c.id === tx.categoryId)?.name || 'Geral';
      const acc = sheetAccounts.find((a) => a.id === tx.accountId)?.name || 'Conta';
      return [
        tx.date,
        tx.type,
        `"${tx.description.replace(/"/g, '""')}"`,
        tx.amount.toFixed(2),
        `"${cat}"`,
        `"${acc}"`,
        tx.status,
        tx.paymentMethod,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinanceGLPro_Lancamentos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div id="transactions-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-semibold transition-all"
            title="Exportar dados para planilha Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={() => openTransactionModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Receita</span>
          </button>
          <button
            onClick={() => openTransactionModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar lançamento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filtrar por Tipo"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="all">Todos os Tipos</option>
              <option value="income">Receitas (+)</option>
              <option value="expense">Despesas (−)</option>
              <option value="transfer">Transferências (⇄)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrar por Categoria"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="all">Todas as Categorias</option>
              {sheetCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === 'income' ? 'Receita' : 'Despesa'})
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter */}
          <div>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              aria-label="Filtrar por Conta"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="all">Todas as Contas</option>
              {sheetAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Ordenar por"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 focus:outline-hidden"
            >
              <option value="date_desc">Mais Recentes</option>
              <option value="date_asc">Mais Antigos</option>
              <option value="amount_desc">Maior Valor</option>
              <option value="amount_asc">Menor Valor</option>
            </select>
          </div>
        </div>

        {/* Filter stats pill */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
          <span>{filteredList.length} lançamento(s) encontrado(s)</span>
          <span className="font-semibold text-slate-200">
            Total filtrado: <span className="font-mono text-blue-400">{formatBRL(currentTotal)}</span>
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            Nenhum lançamento correspondente aos filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Descrição</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3 hidden sm:table-cell">Categoria</th>
                  <th className="pb-3 hidden md:table-cell">Conta</th>
                  <th className="pb-3 hidden lg:table-cell">Forma Pagto</th>
                  <th className="pb-3 text-right">Valor</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredList.map((tx) => {
                  const status = getStatusDetails(tx.status, tx.type);
                  const category = sheetCategories.find((c) => c.id === tx.categoryId);
                  const account = sheetAccounts.find((a) => a.id === tx.accountId);
                  const toAccount = tx.toAccountId
                    ? sheetAccounts.find((a) => a.id === tx.toAccountId)
                    : null;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Data */}
                      <td className="py-3 text-slate-400 font-mono">{formatDate(tx.date)}</td>

                      {/* Descrição */}
                      <td className="py-3 font-medium text-slate-200">
                        <div className="flex flex-col">
                          <span className="truncate max-w-[180px] sm:max-w-[240px]">
                            {tx.description}
                          </span>
                          {tx.recipientOrClient && (
                            <span className="text-[10px] text-slate-400">
                              Origem/Destino: {tx.recipientOrClient}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tipo */}
                      <td className="py-3">
                        {tx.type === 'income' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Receita
                          </span>
                        )}
                        {tx.type === 'expense' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Despesa
                          </span>
                        )}
                        {tx.type === 'transfer' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400">
                            <ArrowLeftRight className="w-3.5 h-3.5" /> Transf.
                          </span>
                        )}
                      </td>

                      {/* Categoria */}
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

                      {/* Conta */}
                      <td className="py-3 hidden md:table-cell text-slate-300">
                        <div className="truncate max-w-[140px]">
                          {account?.name || 'Conta'}
                          {toAccount && ` ➔ ${toAccount.name}`}
                        </div>
                      </td>

                      {/* Forma Pagto */}
                      <td className="py-3 hidden lg:table-cell text-slate-400">
                        {getPaymentMethodLabel(tx.paymentMethod)}
                      </td>

                      {/* Valor */}
                      <td
                        className={`py-3 text-right font-semibold font-mono text-sm ${
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

                      {/* Status */}
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${status.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              if (tx.type === 'transfer') {
                                setTransferModalOpen(true);
                              } else {
                                openTransactionModal(tx.type as any, tx);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Editar lançamento"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(tx.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal as specified in Prompt Section 11 & 27 */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-bold text-lg text-white">
                Excluir Lançamento
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tem certeza que deseja excluir este lançamento? Esta ação recalculará todos os saldos e relatórios automaticamente.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTransaction(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
