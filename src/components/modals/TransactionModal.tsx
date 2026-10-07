import React, { useEffect, useState, useMemo } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Tag,
  Building2,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, TransactionStatus, TransactionType } from '../../types';
import { formatBRL, formatDate } from '../../utils/formatters';

// Fallback categories if none exist in the active sheet
const DEFAULT_INCOME_CATS = [
  { id: 'cat-inc-sal', name: 'Salário', icon: '💼', color: '#10B981', type: 'income' as const },
  { id: 'cat-inc-ven', name: 'Vendas', icon: '🛍️', color: '#3B82F6', type: 'income' as const },
  { id: 'cat-inc-ser', name: 'Serviços', icon: '⚡', color: '#8B5CF6', type: 'income' as const },
  { id: 'cat-inc-fre', name: 'Freelance', icon: '💻', color: '#06B6D4', type: 'income' as const },
  { id: 'cat-inc-inv', name: 'Investimentos', icon: '📈', color: '#F59E0B', type: 'income' as const },
  { id: 'cat-inc-out', name: 'Outros', icon: '📦', color: '#64748B', type: 'income' as const },
];

const DEFAULT_EXPENSE_CATS = [
  { id: 'cat-exp-ali', name: 'Alimentação', icon: '🍽️', color: '#EF4444', type: 'expense' as const },
  { id: 'cat-exp-mor', name: 'Moradia', icon: '🏠', color: '#F97316', type: 'expense' as const },
  { id: 'cat-exp-tra', name: 'Transporte', icon: '🚗', color: '#EAB308', type: 'expense' as const },
  { id: 'cat-exp-sau', name: 'Saúde', icon: '💊', color: '#EC4899', type: 'expense' as const },
  { id: 'cat-exp-edu', name: 'Educação', icon: '📚', color: '#8B5CF6', type: 'expense' as const },
  { id: 'cat-exp-laz', name: 'Lazer', icon: '🎮', color: '#06B6D4', type: 'expense' as const },
  { id: 'cat-exp-ass', name: 'Assinaturas', icon: '📱', color: '#3B82F6', type: 'expense' as const },
  { id: 'cat-exp-com', name: 'Compras', icon: '🛒', color: '#14B8A6', type: 'expense' as const },
  { id: 'cat-exp-out', name: 'Outros', icon: '📦', color: '#64748B', type: 'expense' as const },
];

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    transactionModalType,
    editingTransaction,
    closeTransactionModal,
    addTransaction,
    updateTransaction,
    sheetCategories,
    sheetAccounts,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('income');
  const [description, setDescription] = useState<string>('');
  const [amountRaw, setAmountRaw] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState<string>('');
  const [status, setStatus] = useState<TransactionStatus>('completed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [recipientOrClient, setRecipientOrClient] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Available categories for current type
  const availableCategories = useMemo(() => {
    const fromSheet = sheetCategories.filter((c) => c.type === type);
    if (fromSheet.length > 0) return fromSheet;
    return type === 'income' ? DEFAULT_INCOME_CATS : DEFAULT_EXPENSE_CATS;
  }, [sheetCategories, type]);

  // Available accounts
  const availableAccounts = useMemo(() => {
    if (sheetAccounts.length > 0) return sheetAccounts;
    return [{ id: 'acc-default', name: 'Conta Principal', currentBalance: 0, initialBalance: 0, sheetId: 'default' }];
  }, [sheetAccounts]);

  // Helper to parse Brazilian currency strings
  const parseCurrencyInput = (val: string): number => {
    if (!val) return 0;
    let clean = val.replace(/R\$\s?/g, '').trim();
    if (clean.includes(',') && clean.includes('.')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
      clean = clean.replace(',', '.');
    }
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  // Synchronize state when modal opens or editingTransaction changes
  useEffect(() => {
    if (!isTransactionModalOpen) return;

    setValidationError(null);
    setIsSaving(false);

    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmountRaw(
        editingTransaction.amount
          ? editingTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : ''
      );
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setDate(editingTransaction.date || new Date().toISOString().slice(0, 10));
      setDueDate(editingTransaction.dueDate || '');
      setStatus(editingTransaction.status);
      setPaymentMethod(editingTransaction.paymentMethod || 'pix');
      setRecipientOrClient(editingTransaction.recipientOrClient || '');
      setNotes(editingTransaction.notes || '');
    } else {
      const initialType = transactionModalType || 'income';
      setType(initialType);
      setDescription('');
      setAmountRaw('');

      const cats = initialType === 'income'
        ? (sheetCategories.filter((c) => c.type === 'income').length ? sheetCategories.filter((c) => c.type === 'income') : DEFAULT_INCOME_CATS)
        : (sheetCategories.filter((c) => c.type === 'expense').length ? sheetCategories.filter((c) => c.type === 'expense') : DEFAULT_EXPENSE_CATS);

      setCategoryId(cats[0]?.id || '');
      setAccountId(sheetAccounts[0]?.id || availableAccounts[0]?.id || '');
      setDate(new Date().toISOString().slice(0, 10));
      setDueDate('');
      setStatus('completed');
      setPaymentMethod('pix');
      setRecipientOrClient('');
      setNotes('');
    }
  }, [isTransactionModalOpen, editingTransaction, transactionModalType, sheetCategories, sheetAccounts]);

  // When type changes on a new transaction, update category default if necessary
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const cats = sheetCategories.filter((c) => c.type === newType);
    const fallbackCats = newType === 'income' ? DEFAULT_INCOME_CATS : DEFAULT_EXPENSE_CATS;
    const targetCats = cats.length > 0 ? cats : fallbackCats;
    setCategoryId(targetCats[0]?.id || '');
  };

  if (!isTransactionModalOpen) return null;

  // Title according to specification:
  // Income add: "Adicionar Receita", Income edit: "Editar Receita"
  // Expense add: "Adicionar Despesa", Expense edit: "Editar Despesa"
  const modalTitle = editingTransaction
    ? type === 'income'
      ? 'Editar Receita'
      : 'Editar Despesa'
    : type === 'income'
    ? 'Adicionar Receita'
    : 'Adicionar Despesa';

  const saveButtonLabel = isSaving
    ? 'Salvando...'
    : editingTransaction
    ? 'Salvar Alterações'
    : type === 'income'
    ? 'Salvar Receita'
    : 'Salvar Despesa';

  const descriptionPlaceholder =
    type === 'income'
      ? 'Ex: Salário, Venda de produto, Freelance...'
      : 'Ex: Mercado, Aluguel, Combustível, Internet...';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setValidationError('Por favor, informe a descrição do lançamento.');
      return;
    }

    const numericAmount = parseCurrencyInput(amountRaw);
    if (!numericAmount || numericAmount <= 0) {
      setValidationError('Por favor, informe um valor válido maior que zero (ex: 150,00).');
      return;
    }

    if (!date) {
      setValidationError('Por favor, selecione uma data válida.');
      return;
    }

    const chosenCategoryId = categoryId || availableCategories[0]?.id || 'cat-outros';
    const chosenAccountId = accountId || availableAccounts[0]?.id || 'acc-default';

    setIsSaving(true);

    try {
      if (editingTransaction) {
        updateTransaction({
          ...editingTransaction,
          type,
          description: trimmedDesc,
          amount: numericAmount,
          categoryId: chosenCategoryId,
          accountId: chosenAccountId,
          date,
          dueDate: dueDate || undefined,
          status,
          paymentMethod,
          recipientOrClient: recipientOrClient.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      } else {
        addTransaction({
          type,
          description: trimmedDesc,
          amount: numericAmount,
          categoryId: chosenCategoryId,
          accountId: chosenAccountId,
          date,
          dueDate: dueDate || undefined,
          status,
          paymentMethod,
          recipientOrClient: recipientOrClient.trim() || undefined,
          notes: notes.trim() || undefined,
        });
      }

      // Close modal smoothly
      closeTransactionModal();
    } catch (err) {
      console.error('Error saving transaction:', err);
      setValidationError('Ocorreu um erro ao salvar o lançamento. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="transaction-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) {
          closeTransactionModal();
        }
      }}
    >
      <div
        id="transaction-modal-container"
        className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-4 my-auto animate-in fade-in zoom-in-95"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md ${
                type === 'income'
                  ? 'bg-emerald-600 shadow-emerald-950/40'
                  : 'bg-rose-600 shadow-rose-950/40'
              }`}
            >
              {type === 'income' ? (
                <ArrowDownLeft className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white">
                {modalTitle}
              </h3>
              <p className="text-[11px] text-slate-400">
                {type === 'income'
                  ? 'Registro financeiro de entrada e faturamento'
                  : 'Registro financeiro de saída e despesas'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-transaction-modal"
            type="button"
            disabled={isSaving}
            onClick={closeTransactionModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Fechar formulário"
            aria-label="Fechar formulário"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Type Toggle selector if creating a new transaction */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                id="modal-toggle-income"
                onClick={() => handleTypeChange('income')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>+ Nova Receita</span>
              </button>
              <button
                type="button"
                id="modal-toggle-expense"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>− Nova Despesa</span>
              </button>
            </div>
          )}

          {/* 1. Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descrição <span className="text-rose-400">*</span>
            </label>
            <input
              id="tx-description"
              type="text"
              required
              autoFocus
              placeholder={descriptionPlaceholder}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (validationError) setValidationError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden transition-colors"
            />
          </div>

          {/* 2. Valor & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor (R$) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                  R$
                </span>
                <input
                  id="tx-amount"
                  type="text"
                  required
                  placeholder="0,00"
                  value={amountRaw}
                  onChange={(e) => {
                    setAmountRaw(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-hidden transition-colors ${
                    type === 'income' ? 'focus:border-emerald-500' : 'focus:border-rose-500'
                  } border-slate-800`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data (DD/MM/AAAA) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  id="tx-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3. Categoria & Conta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria <span className="text-rose-400">*</span>
              </label>
              <select
                id="tx-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden transition-colors"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Conta Bancária / Carteira <span className="text-rose-400">*</span>
              </label>
              <select
                id="tx-account"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden transition-colors"
              >
                {availableAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.currentBalance !== undefined ? `(${formatBRL(a.currentBalance)})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Forma de Pagamento/Recebimento & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {type === 'income' ? 'Forma de Recebimento' : 'Forma de Pagamento'}
              </label>
              <select
                id="tx-payment-method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden transition-colors"
              >
                <option value="pix">Pix</option>
                <option value="cash">Dinheiro</option>
                {type === 'expense' && <option value="debit_card">Débito</option>}
                <option value="credit_card">
                  {type === 'income' ? 'Cartão' : 'Cartão de crédito'}
                </option>
                <option value="bank_transfer">Transferência</option>
                <option value="boleto">Boleto</option>
                <option value="other">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status <span className="text-rose-400">*</span>
              </label>
              <select
                id="tx-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden transition-colors"
              >
                <option value="completed">
                  {type === 'income' ? '🟢 Recebido' : '🟢 Pago'}
                </option>
                <option value="pending">🟡 Pendente</option>
                <option value="scheduled">⏱️ Agendado</option>
                <option value="overdue">🔴 Vencido / Atrasado</option>
              </select>
            </div>
          </div>

          {/* 5. Cliente/Origem ou Favorecido (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {type === 'income' ? 'Cliente / Origem do Recebimento' : 'Fornecedor / Favorecido'}{' '}
              <span className="text-slate-500 font-normal">(Opcional)</span>
            </label>
            <input
              id="tx-recipient"
              type="text"
              placeholder={
                type === 'income'
                  ? 'Ex: Cliente VIP, Empresa ABC, Consultoria...'
                  : 'Ex: Supermercado X, Imobiliária, Posto Y...'
              }
              value={recipientOrClient}
              onChange={(e) => setRecipientOrClient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden transition-colors"
            />
          </div>

          {/* 6. Observação (Opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observação <span className="text-slate-500 font-normal">(Opcional)</span>
            </label>
            <textarea
              id="tx-notes"
              rows={2}
              placeholder="Informações adicionais, detalhes ou notas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden resize-none transition-colors"
            />
          </div>

          {/* Action Buttons: Cancelar & Salvar */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              id="btn-cancel-transaction"
              type="button"
              disabled={isSaving}
              onClick={closeTransactionModal}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-transaction"
              type="submit"
              disabled={isSaving}
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
              }`}
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{saveButtonLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
