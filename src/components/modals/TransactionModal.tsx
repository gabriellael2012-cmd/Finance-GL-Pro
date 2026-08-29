import React, { useEffect, useState } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Tag,
  Building2,
  CreditCard,
  User,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PaymentMethod, TransactionStatus, TransactionType } from '../../types';

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

  const [type, setType] = useState<TransactionType>('expense');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [accountId, setAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState<string>('');
  const [status, setStatus] = useState<TransactionStatus>('completed');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [recipientOrClient, setRecipientOrClient] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Synchronize with active edit target or modal open type
  useEffect(() => {
    if (!isTransactionModalOpen) return;

    if (editingTransaction) {
      setType(editingTransaction.type);
      setDescription(editingTransaction.description);
      setAmount(String(editingTransaction.amount));
      setCategoryId(editingTransaction.categoryId);
      setAccountId(editingTransaction.accountId);
      setDate(editingTransaction.date);
      setDueDate(editingTransaction.dueDate || '');
      setStatus(editingTransaction.status);
      setPaymentMethod(editingTransaction.paymentMethod);
      setRecipientOrClient(editingTransaction.recipientOrClient || '');
      setNotes(editingTransaction.notes || '');
    } else {
      setType(transactionModalType);
      setDescription('');
      setAmount('');
      // Set default category for the type
      const firstCat = sheetCategories.find((c) => c.type === transactionModalType);
      setCategoryId(firstCat ? firstCat.id : sheetCategories[0]?.id || '');
      // Set default account
      setAccountId(sheetAccounts[0]?.id || '');
      setDate(new Date().toISOString().slice(0, 10));
      setDueDate('');
      setStatus('completed');
      setPaymentMethod('pix');
      setRecipientOrClient('');
      setNotes('');
    }
  }, [isTransactionModalOpen, editingTransaction, transactionModalType, sheetCategories, sheetAccounts]);

  if (!isTransactionModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const numAmount = parseFloat(amount) || 0;

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        type,
        description: description.trim(),
        amount: numAmount,
        categoryId: categoryId || sheetCategories[0]?.id || '1',
        accountId: accountId || sheetAccounts[0]?.id || '1',
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
        description: description.trim(),
        amount: numAmount,
        categoryId: categoryId || sheetCategories[0]?.id || '1',
        accountId: accountId || sheetAccounts[0]?.id || '1',
        date,
        dueDate: dueDate || undefined,
        status,
        paymentMethod,
        recipientOrClient: recipientOrClient.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    closeTransactionModal();
  };

  const filteredCats = sheetCategories.filter((c) => c.type === type);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white ${
                type === 'income' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {type === 'income' ? (
                <ArrowDownLeft className="w-4 h-4" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
            </div>
            <h3 className="font-display font-bold text-base sm:text-lg text-white">
              {editingTransaction
                ? 'Editar Lançamento'
                : type === 'income'
                ? 'Nova Receita'
                : 'Nova Despesa'}
            </h3>
          </div>
          <button
            onClick={closeTransactionModal}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle if not locked */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  const firstIncomeCat = sheetCategories.find((c) => c.type === 'income');
                  if (firstIncomeCat) setCategoryId(firstIncomeCat.id);
                }}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>+ Receita</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  const firstExpenseCat = sheetCategories.find((c) => c.type === 'expense');
                  if (firstExpenseCat) setCategoryId(firstExpenseCat.id);
                }}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  type === 'expense'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>− Despesa</span>
              </button>
            </div>
          )}

          {/* Description & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Descrição do Lançamento
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Salário Mensal, Supermercado, Aluguel..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
              >
                {filteredCats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Conta Bancária / Carteira
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
              >
                {sheetAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates (Data do lançamento & Vencimento) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data de Vencimento (Opcional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Payment Method & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="bank_slip">Boleto Bancário</option>
                <option value="transfer">Transferência TED/DOC</option>
                <option value="cash">Dinheiro em Espécie</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status da Operação
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
              >
                <option value="completed">
                  {type === 'income' ? '🟢 Já Recebido (Efetivado)' : '🟢 Já Pago (Efetivado)'}
                </option>
                <option value="pending">
                  {type === 'income' ? '🟡 A Receber (Pendente)' : '🟡 A Pagar (Pendente)'}
                </option>
                <option value="scheduled">⏱️ Agendado</option>
                <option value="overdue">🔴 Vencido / Atrasado</option>
              </select>
            </div>
          </div>

          {/* Client / Supplier (Fornecedor / Cliente) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {type === 'income' ? 'Cliente / Origem da Receita' : 'Fornecedor / Favorecido'} (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Empresa ABC, Mercado X, João Silva..."
              value={recipientOrClient}
              onChange={(e) => setRecipientOrClient(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações / Notas (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Adicione detalhes, número da NF, link de comprovante..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={closeTransactionModal}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
              }`}
            >
              {editingTransaction ? 'Atualizar Lançamento' : 'Confirmar e Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
