import React, { useState } from 'react';
import {
  X,
  ArrowLeftRight,
  Calendar,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const TransferModal: React.FC = () => {
  const {
    transferModalOpen,
    isTransferModalOpen,
    setTransferModalOpen,
    sheetAccounts,
    transferBetweenAccounts,
  } = useFinance();

  const isOpen = transferModalOpen ?? isTransferModalOpen ?? false;

  const [fromAccountId, setFromAccountId] = useState<string>(sheetAccounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState<string>(sheetAccounts[1]?.id || sheetAccounts[0]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState<string>('Transferência entre contas');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && sheetAccounts.length > 0) {
      const validFrom = sheetAccounts.some((a) => a.id === fromAccountId)
        ? fromAccountId
        : sheetAccounts[0].id;
      setFromAccountId(validFrom);

      const remaining = sheetAccounts.filter((a) => a.id !== validFrom);
      const validTo = remaining.length > 0 ? remaining[0].id : validFrom;
      setToAccountId(validTo);
    }
  }, [isOpen, sheetAccounts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccountId || !toAccountId || !amount) return;

    if (fromAccountId === toAccountId) {
      setErrorMsg('A conta de origem não pode ser igual à conta de destino.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Informe um valor válido maior que zero.');
      return;
    }

    transferBetweenAccounts(
      fromAccountId,
      toAccountId,
      numAmount,
      date,
      description.trim() || 'Transferência entre contas'
    );

    setTransferModalOpen(false);
    setAmount('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base text-white">
              Transferência Entre Contas
            </h3>
          </div>
          <button
            onClick={() => setTransferModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Conta de Origem (Sai o dinheiro)
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
            >
              {sheetAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Saldo: R$ {a.currentBalance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Conta de Destino (Entra o dinheiro)
            </label>
            <select
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
            >
              {sheetAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Saldo: R$ {a.currentBalance.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Valor da Transferência (R$)
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono font-bold text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data da Transferência
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Descrição / Motivo
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aplicação em CDB, Reserva, Saque..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setTransferModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/40"
            >
              Confirmar Transferência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
