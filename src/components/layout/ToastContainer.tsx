import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useFinance();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-5 fade-in ${
              isSuccess
                ? 'bg-slate-900/95 border-emerald-500/50 text-slate-100 shadow-emerald-950/40'
                : isError
                ? 'bg-slate-900/95 border-rose-500/50 text-slate-100 shadow-rose-950/40'
                : isWarning
                ? 'bg-slate-900/95 border-amber-500/50 text-slate-100 shadow-amber-950/40'
                : 'bg-slate-900/95 border-blue-500/50 text-slate-100 shadow-blue-950/40'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-4 h-4 text-blue-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white leading-tight truncate">
                {toast.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
