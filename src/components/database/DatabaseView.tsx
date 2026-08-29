import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const DatabaseView: React.FC = () => {
  const {
    sheets,
    accounts,
    transactions,
    exportAllDataJSON,
    importDataJSON,
    clearAllData,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState<boolean>(false);

  const handleExport = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinanceGLPro_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatusMsg({ type: 'success', text: 'Backup exportado com sucesso!' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const ok = importDataJSON(content);
        if (ok) {
          setStatusMsg({ type: 'success', text: 'Dados restaurados com sucesso!' });
        } else {
          setStatusMsg({ type: 'error', text: 'Arquivo inválido ou corrompido.' });
        }
      } catch {
        setStatusMsg({ type: 'error', text: 'Erro ao processar arquivo JSON.' });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="database-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Base de Dados & Backup
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Gerenciamento do armazenamento local, exportação de segurança e restauração
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/30 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
            Fechar
          </button>
        </div>
      )}

      {/* Database Statistics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Planilhas Ativas
          </span>
          <div className="font-display font-bold text-2xl text-white font-mono">{sheets.length}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total de Lançamentos
          </span>
          <div className="font-display font-bold text-2xl text-blue-400 font-mono">
            {transactions.length}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Contas Cadastradas
          </span>
          <div className="font-display font-bold text-2xl text-emerald-400 font-mono">
            {accounts.length}
          </div>
        </div>
      </div>

      {/* Backup & Restore Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-white">Exportar Backup Completo</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Faça o download de todos os seus dados reais (planilhas, lançamentos, contas, metas e configurações) em formato JSON seguro para guardar no seu computador ou transferir de dispositivo.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
          >
            <FileJson className="w-4 h-4" />
            <span>Baixar Arquivo de Backup (.json)</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-white">Restaurar Backup</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recupere seus dados a partir de um arquivo JSON previamente exportado. Suas finanças serão carregadas instantaneamente.
            </p>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Selecionar Arquivo de Backup</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Clear all and restart clean */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 shadow-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Reiniciar Base de Dados
            </h3>
            <p className="text-xs text-slate-400">
              Apagar todos os lançamentos atuais e começar uma planilha limpa do zero
            </p>
          </div>
        </div>

        <button
          onClick={() => setClearConfirmOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40 transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Limpar Todos os Lançamentos</span>
        </button>
      </div>

      {/* Clear Confirmation Modal */}
      {clearConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-display font-bold text-lg text-white">
                Limpar Todos os Dados?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Essa ação removerá todos os lançamentos financeiros cadastrados e reiniciará sua planilha com valores zerados (R$ 0,00).
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setClearConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  clearAllData();
                  setClearConfirmOpen(false);
                  setStatusMsg({ type: 'success', text: 'Todos os lançamentos foram limpos. Planilha zerada com sucesso!' });
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
              >
                Confirmar e Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
