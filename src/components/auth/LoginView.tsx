import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Logo } from '../layout/Logo';

export const LoginView: React.FC = () => {
  const { login, register, resetPassword, authError, clearAuthError } = useFinance();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  // Clean inputs without hardcoded or fictitious credentials
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [localMessage, setLocalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setLocalMessage(null);

    if (mode === 'forgot') {
      if (!email.trim()) {
        setLocalMessage({ text: 'Informe seu e-mail para recuperação.', type: 'error' });
        return;
      }
      setIsSubmitting(true);
      await resetPassword(email.trim());
      setIsSubmitting(false);
      setLocalMessage({
        text: `Instruções de redefinição enviadas para ${email.trim()}.`,
        type: 'success',
      });
      return;
    }

    if (!email.trim() || !password.trim()) {
      setLocalMessage({ text: 'Preencha todos os campos para continuar.', type: 'error' });
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setLocalMessage({ text: 'Informe seu nome completo.', type: 'error' });
        return;
      }
      if (password.length < 4) {
        setLocalMessage({ text: 'A senha deve conter no mínimo 4 caracteres.', type: 'error' });
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setLocalMessage({ text: 'As senhas digitadas não coincidem.', type: 'error' });
        return;
      }
      setIsSubmitting(true);
      const ok = await register(name.trim(), email.trim(), password.trim());
      setIsSubmitting(false);
      if (!ok) {
        setLocalMessage({ text: authError || 'Não foi possível cadastrar a conta.', type: 'error' });
      }
    } else {
      setIsSubmitting(true);
      const ok = await login(email.trim(), password.trim());
      setIsSubmitting(false);
      if (!ok) {
        setLocalMessage({ text: authError || 'E-mail ou senha inválidos.', type: 'error' });
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background radial gradient accent */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))]" />

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="lg" showProductTag={true} className="mb-4" />
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs">
            Sistema de Gestão Financeira Profissional & Controle Orçamentário
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearAuthError();
                setLocalMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearAuthError();
                setLocalMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Feedback messages */}
          {(localMessage || authError) && (
            <div
              className={`mb-5 p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                localMessage?.type === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-800/50 text-emerald-300'
                  : 'bg-rose-950/40 border border-rose-800/50 text-rose-300'
              }`}
            >
              {localMessage?.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span className="leading-snug">{localMessage?.text || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Register Mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome ou Razão Social"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-hidden transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-hidden transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setLocalMessage(null);
                        clearAuthError();
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-hidden transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password Field (Register Mode) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-hidden transition-colors font-mono"
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>
                {isSubmitting
                  ? 'Validando...'
                  : mode === 'login'
                  ? 'Acessar Finance GL Pro'
                  : mode === 'register'
                  ? 'Concluir Cadastro'
                  : 'Enviar Link de Redefinição'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Back to login if in forgot mode */}
            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLocalMessage(null);
                  clearAuthError();
                }}
                className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer text-center block mt-2"
              >
                Voltar para o login
              </button>
            )}
          </form>
        </div>

        {/* Security / Privacy Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Ambiente Seguro • Finance GL Pro</span>
        </div>
      </div>
    </div>
  );
};
