import React, { useEffect, useState } from 'react';
import {
  Search,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Building2,
  Tag,
  Target,
  FileText,
  HelpCircle,
  TrendingUp,
  CornerDownLeft,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatBRL, formatDate } from '../../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setGlobalSearchOpen,
    sheetTransactions,
    sheetAccounts,
    sheetCategories,
    sheetGoals,
    setActiveTab,
    openTransactionModal,
  } = useFinance();

  const [query, setQuery] = useState<string>('');

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(!isGlobalSearchOpen);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  // Matched transactions
  const matchedTransactions = q
    ? sheetTransactions
        .filter(
          (t) =>
            t.description.toLowerCase().includes(q) ||
            (t.recipientOrClient && t.recipientOrClient.toLowerCase().includes(q)) ||
            (t.notes && t.notes.toLowerCase().includes(q))
        )
        .slice(0, 5)
    : [];

  // Matched categories
  const matchedCategories = q
    ? sheetCategories.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  // Matched accounts
  const matchedAccounts = q
    ? sheetAccounts.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 3)
    : [];

  // Matched goals
  const matchedGoals = q
    ? sheetGoals.filter((g) => g.title.toLowerCase().includes(q)).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Digite para buscar lançamentos, contas, categorias ou comandos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden"
          />
          <button
            onClick={() => setGlobalSearchOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-4">
          {/* Quick shortcuts if no search */}
          {!q && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                Atalhos Rápidos
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    openTransactionModal('income');
                    setGlobalSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-600/50 flex items-center gap-2.5 text-xs text-slate-200 transition-all text-left"
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                  <span>+ Cadastrar Receita</span>
                </button>
                <button
                  onClick={() => {
                    openTransactionModal('expense');
                    setGlobalSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-600/50 flex items-center gap-2.5 text-xs text-slate-200 transition-all text-left"
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-400" />
                  <span>− Cadastrar Despesa</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('cash_flow');
                    setGlobalSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-600/50 flex items-center gap-2.5 text-xs text-slate-200 transition-all text-left"
                >
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span>Fluxo de Caixa</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setGlobalSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-600/50 flex items-center gap-2.5 text-xs text-slate-200 transition-all text-left"
                >
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>Relatórios Financeiros</span>
                </button>
              </div>
            </div>
          )}

          {/* Matched Transactions */}
          {matchedTransactions.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                Lançamentos Encontrados ({matchedTransactions.length})
              </span>
              <div className="space-y-1.5">
                {matchedTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      openTransactionModal(tx.type as any, tx);
                      setGlobalSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800/80 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-200">{tx.description}</span>
                        <span className="text-[10px] text-slate-500 ml-2 font-mono">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatBRL(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Categories */}
          {matchedCategories.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                Categorias
              </span>
              <div className="grid grid-cols-2 gap-2">
                {matchedCategories.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setActiveTab('chart_of_accounts');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 flex items-center gap-2 text-xs text-slate-200 cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Accounts */}
          {matchedAccounts.length > 0 && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">
                Contas Bancárias
              </span>
              <div className="space-y-1.5">
                {matchedAccounts.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      setActiveTab('accounts');
                      setGlobalSearchOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-slate-200">{a.name}</span>
                    </div>
                    <span className="font-mono text-slate-300 font-bold">{formatBRL(a.currentBalance)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {q && matchedTransactions.length === 0 && matchedCategories.length === 0 && matchedAccounts.length === 0 && (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhum item encontrado para "<span className="text-slate-300">{query}</span>"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Pressione ESC para fechar</span>
          <span className="flex items-center gap-1 font-mono">
            <CornerDownLeft className="w-3 h-3" /> para selecionar
          </span>
        </div>
      </div>
    </div>
  );
};
