import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  FolderTree,
  Users,
  Truck,
  BarChart3,
  Calculator,
  Database,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavigationTab } from '../../types';
import { Logo } from '../layout/Logo';

export const MobileMenuView: React.FC = () => {
  const { setActiveTab, authUser, userProfile, logout, sheets, activeSheet } = useFinance();

  const handleNavigate = (tab: NavigationTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="mobile-menu-view" className="space-y-5 pb-20 max-w-lg mx-auto">
      {/* User Header Profile Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-display font-extrabold text-base flex items-center justify-center shrink-0 shadow-md shadow-blue-900/40">
            {((authUser?.name || userProfile.name || 'US').slice(0, 2)).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">
              {authUser?.name || userProfile.name || 'Usuário'}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              {authUser?.email || userProfile.email || 'Acesso GL PRO'}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">Sessão Segura</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleNavigate('settings')}
          className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold shrink-0 cursor-pointer"
          title="Configurações do Perfil"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Planilha Ativa Indicador */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Planilha em Uso
            </span>
            <span className="font-semibold text-white truncate block">
              {activeSheet?.name || 'Minhas Finanças'}
            </span>
          </div>
        </div>
        <button
          onClick={() => handleNavigate('sheets')}
          className="text-xs text-blue-400 font-bold hover:underline shrink-0 pl-2 cursor-pointer"
        >
          Trocar ({sheets.length})
        </button>
      </div>

      {/* Grupo 1: Gestão Diária & Movimentações */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Movimentações & Contas
        </h3>
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => handleNavigate('accounts')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Contas Bancárias & Caixas</span>
                <span className="text-[10px] text-slate-400">Saldos e extratos por instituição</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('payables')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Contas a Pagar</span>
                <span className="text-[10px] text-slate-400">Boletos, vencimentos e pendências</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('receivables')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Contas a Receber</span>
                <span className="text-[10px] text-slate-400">Faturamento previsto e contratos</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('transfers')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Transferências Entre Contas</span>
                <span className="text-[10px] text-slate-400">Movimentações internas</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* Grupo 2: Metas & Planejamento Anual */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Metas & Planejamento
        </h3>
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => handleNavigate('revenue_goals')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Metas de Receitas</span>
                <span className="text-[10px] text-slate-400">Planejamento mensal vs. realizado</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('expense_goals')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Metas de Gastos</span>
                <span className="text-[10px] text-slate-400">Teto orçamentário mensal</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('goals')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Objetivos Financeiros Globais</span>
                <span className="text-[10px] text-slate-400">Reservas, patrimônio e conquistas</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('initial_balances')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Saldos Iniciais do Exercício</span>
                <span className="text-[10px] text-slate-400">Configuração de abertura por conta</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* Grupo 3: Cadastros & Estrutura */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Cadastros & Estrutura
        </h3>
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => handleNavigate('registrations')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <FolderTree className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Central de Cadastros</span>
                <span className="text-[10px] text-slate-400">Categorias, tipos e formas de pagamento</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('clients')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Clientes</span>
                <span className="text-[10px] text-slate-400">Contatos e faturamento por cliente</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('suppliers')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Fornecedores</span>
                <span className="text-[10px] text-slate-400">Parceiros e histórico de compras</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* Grupo 4: Ferramentas & Relatórios */}
      <div className="space-y-2">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Análises & Ferramentas
        </h3>
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => handleNavigate('reports')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Relatórios Financeiros</span>
                <span className="text-[10px] text-slate-400">DRE, demonstrativos e comparativos</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('price_ai')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Assistente de Preços</span>
                <span className="text-[10px] text-slate-400">Simulação de markup e margens</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('database')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Banco de Dados & Backups</span>
                <span className="text-[10px] text-slate-400">Exportar e restaurar dados</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('help')}
            className="w-full min-h-[50px] px-4 py-3 flex items-center justify-between text-left text-xs font-medium text-slate-200 hover:bg-slate-850 active:bg-slate-800 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-400 flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-white font-semibold block">Central de Ajuda</span>
                <span className="text-[10px] text-slate-400">Dicas e boas práticas financeiras</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={logout}
          className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-rose-950/40 active:scale-98 border border-slate-800 hover:border-rose-800/40 text-slate-300 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-400" />
          <span>Sair da Minha Conta</span>
        </button>
      </div>
    </div>
  );
};
