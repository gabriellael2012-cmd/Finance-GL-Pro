import React, { useState } from 'react';
import {
  Wallet,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Building2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  DollarSign,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Account, AccountType } from '../../types';
import { formatCurrency, formatDateBR } from '../../utils/formatters';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  investment: 'Investimentos',
  wallet: 'Carteira / Dinheiro',
  digital: 'Banco Digital',
  credit_card: 'Cartão de Crédito',
  cash: 'Caixa Físico',
  caixinha: 'Caixinha / Reserva',
  other: 'Outros',
};

const BANK_PRESETS = [
  { name: 'Caixa Econômica', color: '#0066b3' },
  { name: 'Banco do Brasil', color: '#f7d117' },
  { name: 'Bradesco', color: '#cc092f' },
  { name: 'Itaú Unibanco', color: '#ec7000' },
  { name: 'Santander', color: '#ec0000' },
  { name: 'Nubank', color: '#820ad1' },
  { name: 'Banco Inter', color: '#ff7a00' },
  { name: 'C6 Bank', color: '#242424' },
  { name: 'Sicoob', color: '#003641' },
  { name: 'Sicredi', color: '#00843d' },
  { name: 'Caixa Físico / Gaveta', color: '#10b981' },
  { name: 'Mercado Pago', color: '#009ee3' },
];

export const InitialBalancesView: React.FC = () => {
  const {
    activeSheet,
    sheetAccounts,
    updateSheetStartDate,
    addAccount,
    updateAccount,
    deleteAccount,
    showToast,
    setActiveTab,
  } = useFinance();

  // Sheet start date editing
  const [startDate, setStartDate] = useState<string>(
    activeSheet?.startDate || `${new Date().getFullYear()}-01-01`
  );
  const [isSavingDate, setIsSavingDate] = useState<boolean>(false);

  // New account modal / form
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formType, setFormType] = useState<AccountType>('checking');
  const [formBankName, setFormBankName] = useState<string>('');
  const [formInitialBalance, setFormInitialBalance] = useState<string>('0');
  const [formInitialDate, setFormInitialDate] = useState<string>(
    activeSheet?.startDate || `${new Date().getFullYear()}-01-01`
  );
  const [formNotes, setFormNotes] = useState<string>('');

  // Total Initial Balance across all accounts of the sheet
  const totalInitial = sheetAccounts.reduce((acc, a) => acc + (a.initialBalance || 0), 0);
  const totalCurrent = sheetAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
  const netEvolution = totalCurrent - totalInitial;

  const handleSaveStartDate = () => {
    setIsSavingDate(true);
    updateSheetStartDate(activeSheet.id, startDate);
    setTimeout(() => {
      setIsSavingDate(false);
      showToast(
        'Data Inicial Atualizada',
        `Data de início da planilha gravada como ${formatDateBR(startDate)}.`,
        'success'
      );
    }, 200);
  };

  const handleOpenAddModal = () => {
    if (sheetAccounts.length >= 20) {
      showToast(
        'Limite Máximo de Contas',
        'Você já atingiu o limite de 20 contas para esta planilha.',
        'warning'
      );
      return;
    }
    setEditingAccountId(null);
    setFormName(`Conta ${sheetAccounts.length + 1}`);
    setFormType('checking');
    setFormBankName('');
    setFormInitialBalance('0');
    setFormInitialDate(startDate);
    setFormNotes('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (account: Account) => {
    setEditingAccountId(account.id);
    setFormName(account.name);
    setFormType(account.type);
    setFormBankName(account.bankName || '');
    setFormInitialBalance(String(account.initialBalance));
    setFormInitialDate(account.initialBalanceDate || startDate);
    setFormNotes(account.notes || '');
    setShowAddModal(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balanceNum = parseFloat(formInitialBalance.replace(',', '.')) || 0;

    if (!formName.trim()) {
      showToast('Nome Obrigatório', 'Informe o nome da conta bancária ou caixa.', 'error');
      return;
    }

    if (editingAccountId) {
      const existing = sheetAccounts.find((a) => a.id === editingAccountId);
      if (existing) {
        updateAccount({
          ...existing,
          name: formName.trim(),
          type: formType,
          bankName: formBankName.trim() || undefined,
          initialBalance: balanceNum,
          initialBalanceDate: formInitialDate,
          notes: formNotes.trim() || undefined,
        });
        showToast('Conta Atualizada', `Conta "${formName}" atualizada com sucesso.`, 'success');
      }
    } else {
      addAccount({
        name: formName.trim(),
        type: formType,
        bankName: formBankName.trim() || undefined,
        initialBalance: balanceNum,
        initialBalanceDate: formInitialDate,
        notes: formNotes.trim() || undefined,
      });
      showToast('Conta Adicionada', `Nova conta "${formName}" cadastrada.`, 'success');
    }

    setShowAddModal(false);
  };

  const handleDelete = (account: Account) => {
    if (sheetAccounts.length <= 1) {
      showToast(
        'Operação Não Permitida',
        'Mantenha ao menos uma conta cadastrada para suas movimentações.',
        'warning'
      );
      return;
    }

    if (
      window.confirm(
        `Deseja realmente remover a conta "${account.name}"? Os lançamentos associados precisarão ser revisados.`
      )
    ) {
      deleteAccount(account.id);
      showToast('Conta Removida', `A conta "${account.name}" foi excluída.`, 'info');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Ponto de Partida
              </span>
              <span className="text-xs text-slate-400">
                Planilha: <strong className="text-slate-200">{activeSheet?.name}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-400" />
              Saldos Iniciais
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Defina a data em que começou seu controle e cadastre até 20 contas (bancos, gavetas, carteiras, aplicações) com o saldo real que você tinha no momento inicial.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              disabled={sheetAccounts.length >= 20}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Conta ({sheetAccounts.length}/20)</span>
            </button>
            <button
              onClick={() => setActiveTab('cash_flow')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all border border-slate-700 cursor-pointer"
            >
              <span>Ir para Fluxo de Caixa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Date Configuration & Instructions Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Start Date Configuration */}
        <div className="md:col-span-1 p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>Início do Controle</span>
            </div>
            <p className="text-xs text-slate-400">
              Data oficial em que os saldos abaixo foram apurados (ex: 01/01/2026).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                Data Inicial de Lançamentos
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              onClick={handleSaveStartDate}
              disabled={isSavingDate}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-semibold transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingDate ? 'Salvando...' : 'Salvar Data de Início'}</span>
            </button>
          </div>
        </div>

        {/* Total Initial Balance KPI */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Saldo Inicial Total</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white mt-1">
              {formatCurrency(totalInitial)}
            </p>
            <p className="text-[11px] text-slate-400">
              Soma de todas as {sheetAccounts.length} contas configuradas na data inicial.
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Serve como base para o Fluxo de Caixa contínuo.</span>
          </div>
        </div>

        {/* Calculated Current Balance KPI */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Saldo Atual Calculado</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-extrabold text-cyan-400 mt-1">
              {formatCurrency(totalCurrent)}
            </p>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">Evolução desde o início:</span>
              <span
                className={`font-semibold ${
                  netEvolution >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {netEvolution >= 0 ? '+' : ''}
                {formatCurrency(netEvolution)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inicial + Receitas Realizadas - Despesas Realizadas</span>
          </div>
        </div>
      </div>

      {/* Accounts List (1 to 20 Slots) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Contas Cadastradas ({sheetAccounts.length} de 20 permitidas)
            </h2>
            <p className="text-xs text-slate-400">
              Cada conta representa uma instituição bancária, caixa físico, maquininha ou reserva.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModal}
              disabled={sheetAccounts.length >= 20}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova Conta</span>
            </button>
          </div>
        </div>

        {/* Table of Accounts */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Conta / Banco</th>
                <th className="py-3 px-3">Tipo</th>
                <th className="py-3 px-3 text-right">Saldo Inicial</th>
                <th className="py-3 px-3 text-right">Saldo Atual Real</th>
                <th className="py-3 px-3">Data Inicial</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sheetAccounts.map((account, index) => {
                const diff = (account.currentBalance || 0) - (account.initialBalance || 0);
                return (
                  <tr
                    key={account.id}
                    className="hover:bg-slate-850/50 transition-colors group"
                  >
                    <td className="py-3.5 px-3 font-mono text-slate-500 font-bold">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-xs"
                          style={{
                            backgroundColor: account.color || '#2563eb',
                          }}
                        >
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            {account.name}
                            {account.isBankConnected && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800">
                                Open Finance
                              </span>
                            )}
                          </div>
                          {account.bankName && (
                            <div className="text-[10px] text-slate-400">{account.bankName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                        {ACCOUNT_TYPE_LABELS[account.type] || account.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-semibold text-slate-200">
                      {formatCurrency(account.initialBalance || 0)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold">
                      <span className={account.currentBalance >= 0 ? 'text-cyan-400' : 'text-rose-400'}>
                        {formatCurrency(account.currentBalance || 0)}
                      </span>
                      <div className="text-[10px] text-slate-500">
                        {diff >= 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {formatDateBR(account.initialBalanceDate || startDate)}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(account)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Editar Saldo e Dados"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(account)}
                          disabled={sheetAccounts.length <= 1}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-30"
                          title="Excluir Conta"
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

        {/* Slots remaining helper */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>
              Restam <strong>{20 - sheetAccounts.length}</strong> posições livres para contas adicionais nesta planilha.
            </span>
          </div>
          {sheetAccounts.length < 20 && (
            <button
              onClick={handleOpenAddModal}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
            >
              + Adicionar Próxima Conta
            </button>
          )}
        </div>
      </div>

      {/* Modal for Creating / Editing Account */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-400" />
                {editingAccountId ? 'Editar Conta Bancária' : 'Cadastrar Nova Conta'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nome da Conta / Identificação *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Santander Principal, Gaveta Loja, Nubank PJ"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo da Conta</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  >
                    {Object.entries(ACCOUNT_TYPE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Instituição / Banco</label>
                  <input
                    type="text"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    placeholder="Ex: Itaú, Bradesco..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Quick Bank Presets */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Sugestões Rápidas:</label>
                <div className="flex flex-wrap gap-1.5">
                  {BANK_PRESETS.slice(0, 6).map((preset) => (
                    <button
                      type="button"
                      key={preset.name}
                      onClick={() => {
                        setFormBankName(preset.name);
                        if (!formName || formName.startsWith('Conta ')) {
                          setFormName(preset.name);
                        }
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Saldo Inicial (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formInitialBalance}
                    onChange={(e) => setFormInitialBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-[10px] text-slate-500">Saldo na data de início</span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Data do Saldo Inicial
                  </label>
                  <input
                    type="date"
                    value={formInitialDate}
                    onChange={(e) => setFormInitialDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observações (opcional)</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Número de agência, conta ou finalidade..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
