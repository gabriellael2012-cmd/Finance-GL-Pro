import React, { useState } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  ArrowLeftRight,
  ShieldCheck,
  Zap,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { formatBRL } from '../../utils/formatters';

const POPULAR_BANKS = [
  { name: 'Nubank', logo: '🟣', color: '#8A05BE' },
  { name: 'Itaú Unibanco', logo: '🟧', color: '#EC7000' },
  { name: 'Banco Inter', logo: '🟠', color: '#FF7A00' },
  { name: 'Bradesco', logo: '🔴', color: '#CC092F' },
  { name: 'Santander', logo: '🔴', color: '#EC0000' },
  { name: 'BTG Pactual', logo: '🔵', color: '#001E62' },
  { name: 'Caixa Econômica', logo: '🔷', color: '#005CA9' },
  { name: 'C6 Bank', logo: '⬛', color: '#242424' },
];

export const AccountsView: React.FC = () => {
  const {
    sheetAccounts,
    totalBalance,
    syncBankAccounts,
    isBankSyncing,
    lastBankSyncTime,
    addAccount,
    deleteAccount,
    setTransferModalOpen,
  } = useFinance();

  const [connectModalOpen, setConnectModalOpen] = useState<boolean>(false);
  const [newAccModalOpen, setNewAccModalOpen] = useState<boolean>(false);

  // Manual Account form states
  const [accName, setAccName] = useState<string>('');
  const [accType, setAccType] = useState<AccountType>('checking');
  const [accBankName, setAccBankName] = useState<string>('');
  const [accInitialBalance, setAccInitialBalance] = useState<string>('0');
  const [accColor, setAccColor] = useState<string>('#3B82F6');

  const handleCreateManualAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    addAccount({
      name: accName.trim(),
      type: accType,
      bankName: accBankName || undefined,
      initialBalance: parseFloat(accInitialBalance) || 0,
      currentBalance: parseFloat(accInitialBalance) || 0,
      color: accColor,
      isBankConnected: false,
    });

    setNewAccModalOpen(false);
    setAccName('');
    setAccInitialBalance('0');
  };

  const handleConnectBank = (bank: typeof POPULAR_BANKS[0]) => {
    addAccount({
      name: `${bank.name} Open Finance`,
      type: 'checking',
      bankName: bank.name,
      initialBalance: Math.floor(Math.random() * 8000) + 1200,
      currentBalance: Math.floor(Math.random() * 8000) + 1200,
      color: bank.color,
      isBankConnected: true,
    });
    setConnectModalOpen(false);
  };

  return (
    <div id="accounts-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Contas e Integração Bancária
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Centralize suas contas bancárias, cartões, carteiras e sincronize via Open Finance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 text-xs font-semibold transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transferir Entre Contas</span>
          </button>
          <button
            onClick={() => setConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-950/40 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Conectar Banco (Open Finance)</span>
          </button>
          <button
            onClick={() => setNewAccModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nova Conta Manual</span>
          </button>
        </div>
      </div>

      {/* Open Finance Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-cyan-800/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm sm:text-base text-white">
                Open Finance Seguro & Conexão em Tempo Real
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                SSL 256-bit
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Sincronização bancária direta e segura autorizada pelo Banco Central do Brasil. Seus dados financeiros consolidados sem necessidade de digitação manual de extratos.
            </p>
          </div>
        </div>

        <button
          onClick={() => syncBankAccounts()}
          disabled={isBankSyncing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 border border-cyan-700/50 hover:border-cyan-500 text-cyan-300 text-xs font-semibold transition-all shrink-0 active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 text-cyan-400 ${isBankSyncing ? 'animate-spin' : ''}`} />
          <span>{isBankSyncing ? 'Sincronizando...' : 'Atualizar Todas as Contas'}</span>
        </button>
      </div>

      {/* Total Balance Consolidated Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Saldo Total Consolidado
          </span>
          <div className="font-display font-extrabold text-3xl sm:text-4xl text-white font-mono">
            {formatBRL(totalBalance)}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            Distribuição líquida em {sheetAccounts.length} contas cadastradas
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Contas Bancárias</span>
            <span className="text-base font-bold text-slate-200">
              {sheetAccounts.filter((a) => a.type === 'checking').length}
            </span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Investimentos</span>
            <span className="text-base font-bold text-slate-200">
              {sheetAccounts.filter((a) => a.type === 'investment').length}
            </span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Conectadas Open Finance</span>
            <span className="text-base font-bold text-cyan-400">
              {sheetAccounts.filter((a) => a.isBankConnected).length}
            </span>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sheetAccounts.map((acc) => (
          <div
            key={acc.id}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: acc.color || '#3B82F6' }}
                >
                  {acc.type === 'credit_card' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : acc.type === 'investment' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <Building2 className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm text-white truncate max-w-[150px]">
                      {acc.name}
                    </h3>
                    {acc.isBankConnected && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" title="Sincronizado via Open Finance" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {acc.bankName || 'Conta Financeira'}
                  </span>
                </div>
              </div>

              {sheetAccounts.length > 1 && (
                <button
                  onClick={() => deleteAccount(acc.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Excluir conta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-end justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Saldo Disponível</span>
                <span className="font-display font-extrabold text-xl text-white font-mono">
                  {formatBRL(acc.currentBalance)}
                </span>
              </div>

              {acc.isBankConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" /> Conectado
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">Manual</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connect Bank Modal with Visual Bank List */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">
                  Conectar Instituição Bancária
                </h3>
              </div>
              <button onClick={() => setConnectModalOpen(false)} className="text-slate-400 hover:text-white text-xs">
                Fechar
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Selecione o seu banco para conectar com segurança via protocolo Open Finance:
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {POPULAR_BANKS.map((b) => (
                <button
                  key={b.name}
                  onClick={() => handleConnectBank(b)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 flex items-center gap-3 text-left transition-all group"
                >
                  <span className="text-2xl">{b.logo}</span>
                  <div>
                    <span className="font-semibold text-xs text-slate-200 group-hover:text-white block">
                      {b.name}
                    </span>
                    <span className="text-[10px] text-slate-500">Conexão Instantânea</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Ambiente criptografado com certificação de ponta a ponta.</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Manual Account Modal */}
      {newAccModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-display font-bold text-base text-white pb-2 border-b border-slate-800">
              Nova Conta Manual
            </h3>

            <form onSubmit={handleCreateManualAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Conta
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carteira Pessoal, Poupança Caixa, Cofre..."
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo de Conta
                </label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="investment">Investimentos</option>
                  <option value="cash">Dinheiro em Espécie</option>
                  <option value="credit_card">Cartão de Crédito</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Saldo Inicial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={accInitialBalance}
                  onChange={(e) => setAccInitialBalance(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAccModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  Criar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
