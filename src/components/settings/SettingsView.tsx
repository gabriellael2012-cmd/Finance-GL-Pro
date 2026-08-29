import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  ShieldCheck,
  DollarSign,
  Sparkles,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const SettingsView: React.FC = () => {
  const { userProfile, setUserProfile } = useFinance();

  const [name, setName] = useState<string>(userProfile.name);
  const [email, setEmail] = useState<string>(userProfile.email);
  const [financialGoal, setFinancialGoal] = useState<string>(userProfile.financialGoal);
  const [savedMsg, setSavedMsg] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile({
      ...userProfile,
      name: name.trim() || 'Usuário',
      email: email.trim(),
      financialGoal: financialGoal.trim() || 'Organização e controle financeiro',
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Personalize seu perfil, moeda, preferências de alertas e segurança da conta
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Configurações atualizadas com sucesso!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="font-display font-bold text-base text-white">Perfil do Usuário</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nome de Exibição
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              E-mail de Notificações <span className="text-slate-500 text-[10px] font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Principal Objetivo Financeiro
          </label>
          <input
            type="text"
            value={financialGoal}
            onChange={(e) => setFinancialGoal(e.target.value)}
            placeholder="Ex: Liberdade Financeira, Lucro Líquido de 30%, Comprar Casa Própria..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {/* Currency & System defaults */}
        <div className="pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Moeda Padrão
            </label>
            <select
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 focus:outline-hidden cursor-not-allowed"
            >
              <option value="BRL">Real Brasileiro (R$ BRL)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fuso Horário
            </label>
            <select
              disabled
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 focus:outline-hidden cursor-not-allowed"
            >
              <option value="BRT">Horário de Brasília (GMT-3)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </form>

      {/* System Information & GL Studios Badge */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-white">Finance GL Pro</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              v2.5 PRO
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Desenvolvido com excelência pela <span className="font-semibold text-slate-200">GL Studios</span>. Todos os direitos reservados.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Criptografia Local Segura</span>
        </div>
      </div>
    </div>
  );
};
