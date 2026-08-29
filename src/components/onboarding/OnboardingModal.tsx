import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Wallet,
  Building2,
  Target,
  ShieldCheck,
  X,
  User,
  Mail,
  DollarSign,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Logo } from '../layout/Logo';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setOnboardingOpen, setupUserAccount, userProfile } = useFinance();
  const [step, setStep] = useState<number>(1);

  // Form fields for setup
  const [userName, setUserName] = useState<string>(userProfile.name !== 'Usuário' ? userProfile.name : '');
  const [userEmail, setUserEmail] = useState<string>(userProfile.email || '');
  const [sheetName, setSheetName] = useState<string>('Minhas Finanças');
  const [accountName, setAccountName] = useState<string>('Conta Principal');
  const [initialBalance, setInitialBalance] = useState<string>('0,00');
  const [financialGoal, setFinancialGoal] = useState<string>('Organização e controle financeiro');

  if (!isOnboardingOpen) return null;

  const handleFinish = () => {
    const rawBal = parseFloat(initialBalance.replace(/\./g, '').replace(',', '.')) || 0;
    setupUserAccount({
      userName: userName.trim() || 'Usuário',
      userEmail: userEmail.trim(),
      sheetName: sheetName.trim() || 'Minhas Finanças',
      accountName: accountName.trim() || 'Conta Principal',
      initialBalance: rawBal,
      financialGoal: financialGoal.trim() || 'Organização e controle financeiro',
    });
  };

  const handleSkip = () => {
    setupUserAccount({
      userName: 'Usuário',
      userEmail: '',
      sheetName: 'Minhas Finanças',
      accountName: 'Conta Principal',
      initialBalance: 0,
      financialGoal: 'Organização e controle financeiro',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <button
            onClick={handleSkip}
            className="text-xs text-slate-400 hover:text-slate-200 p-1 flex items-center gap-1"
          >
            <span>Iniciar com padrão</span>
            <X className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        {/* Step 1: Bem-vindo ao Finance GL Pro */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Bem-vindo ao Finance GL Pro
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Uma experiência de gestão financeira universal, inteligente e descomplicada desenvolvida pela <strong className="text-slate-200">GL Studios</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-blue-400 mx-auto" />
                <span className="text-xs font-bold text-slate-200 block">100% Privado</span>
                <span className="text-[10px] text-slate-500 block">Seus dados salvos apenas no seu ambiente</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center space-y-1">
                <Wallet className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-xs font-bold text-slate-200 block">Sem Planilhas</span>
                <span className="text-[10px] text-slate-500 block">Controle visual e intuitivo sem complicação</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center space-y-1">
                <Building2 className="w-5 h-5 text-indigo-400 mx-auto" />
                <span className="text-xs font-bold text-slate-200 block">Multi-Planilhas</span>
                <span className="text-[10px] text-slate-500 block">Pessoa física, PJ ou projetos separados</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-800/30 text-xs text-blue-300 text-center">
              Você está iniciando com uma planilha totalmente limpa e pronta para receber seus lançamentos reais.
            </div>
          </div>
        )}

        {/* Step 2: Vamos configurar sua conta */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                Configuração Inicial
              </span>
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
                Vamos configurar sua conta
              </h2>
              <p className="text-xs text-slate-400">
                Personalize seu ambiente com as informações básicas. Você poderá editar tudo depois.
              </p>
            </div>

            <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>Seu Nome ou Como prefere ser chamado</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ex: Seu Nome ou Sua Empresa"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Seu E-mail <span className="text-slate-500 text-[10px] font-normal">(opcional)</span></span>
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Nome da Planilha & Conta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nome da Planilha
                  </label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    placeholder="Ex: Minhas Finanças"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Conta Bancária ou Carteira
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Ex: Conta Corrente Principal"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Saldo Inicial e Moeda */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saldo Inicial da Conta</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      R$
                    </span>
                    <input
                      type="text"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-bold focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Moeda Padrão
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Real Brasileiro (R$ - BRL)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Objetivo Financeiro */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Principal Objetivo Financeiro</span>
                </label>
                <select
                  value={financialGoal}
                  onChange={(e) => setFinancialGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="Organização e controle financeiro">Organização e controle de gastos</option>
                  <option value="Construção de Reserva de Emergência">Construção de Reserva de Emergência</option>
                  <option value="Quitação de Dívidas e Contas">Quitação de Dívidas e Contas</option>
                  <option value="Investimentos e Aumento de Patrimônio">Investimentos e Aumento de Patrimônio</option>
                  <option value="Gestão Financeira Empresarial / PJ">Gestão Financeira Empresarial / PJ</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Conclusão */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">
                Tudo Pronto para Começar!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                Sua planilha <strong className="text-slate-200">"{sheetName || 'Minhas Finanças'}"</strong> está configurada e pronta para registrar suas receitas, despesas, contas e metas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Usuário:</span>
                <span className="font-semibold text-white">{userName || 'Usuário'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Planilha:</span>
                <span className="font-semibold text-white">{sheetName || 'Minhas Finanças'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Conta Inicial:</span>
                <span className="font-semibold text-white">{accountName || 'Conta Principal'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">Saldo Inicial:</span>
                <span className="font-semibold text-emerald-400 font-mono">R$ {initialBalance}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stepper Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {/* Back button or step indicator */}
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    step === i ? 'w-6 bg-blue-500' : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all ml-auto"
            >
              <span>{step === 1 ? 'Vamos Configurar' : 'Avançar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all ml-auto"
            >
              <span>Acessar o Finance GL Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
