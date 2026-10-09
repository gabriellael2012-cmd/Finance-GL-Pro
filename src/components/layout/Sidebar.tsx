import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  PieChart,
  FolderTree,
  Building2,
  Database,
  FileSpreadsheet,
  Target,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Zap,
  X,
  Users,
  Truck,
  Tag,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Calculator,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavigationTab } from '../../types';
import { Logo } from './Logo';

interface SidebarProps {
  isOpen?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  mobileOpen,
  onClose,
  onCloseMobile,
}) => {
  const isMenuOpen = isOpen ?? mobileOpen ?? false;
  const handleClose = onClose || onCloseMobile || (() => {});

  const {
    activeTab,
    setActiveTab,
    sheets,
    activeSheetId,
    setActiveSheetId,
    overduePayables,
    upcomingPayables,
    setOnboardingOpen,
  } = useFinance();

  const [financeMenuExpanded, setFinanceMenuExpanded] = useState<boolean>(true);
  const [cadastrosMenuExpanded, setCadastrosMenuExpanded] = useState<boolean>(false);
  const [goalsMenuExpanded, setGoalsMenuExpanded] = useState<boolean>(false);
  const [sheetDropdownOpen, setSheetDropdownOpen] = useState<boolean>(false);

  // Close menu with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, handleClose]);

  const isFinanceSubActive = [
    'cash_flow',
    'income',
    'expenses',
    'transfers',
    'payables',
    'receivables',
  ].includes(activeTab);

  const isCadastrosSubActive = [
    'registrations',
    'income_types',
    'expense_types',
    'income_methods',
    'expense_methods',
    'clients',
    'suppliers',
    'projects_docs',
  ].includes(activeTab);

  const isGoalsSubActive = [
    'goals',
    'revenue_goals',
    'expense_goals',
  ].includes(activeTab);

  // When clicking ANY tab, navigate AND immediately close the menu automatically
  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    handleClose();
  };

  const navItemClass = (tab: NavigationTab) => {
    const isActive = activeTab === tab;
    return `group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/30 font-semibold'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
    }`;
  };

  const subNavItemClass = (tab: NavigationTab) => {
    const isActive = activeTab === tab;
    return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer pl-9 ${
      isActive
        ? 'bg-blue-600/20 text-blue-400 font-semibold border-l-2 border-blue-500 pl-8'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
    }`;
  };

  return (
    <>
      {/* Backdrop overlay for all screen sizes */}
      <div
        id="sidebar-backdrop"
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      />

      {/* Slide-in Navigation Drawer */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-slate-950/98 border-r border-slate-800/80 shadow-2xl flex flex-col justify-between transition-transform duration-200 ease-out backdrop-blur-md ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Logo */}
        <div className="flex flex-col">
          <div className="p-4 sm:p-5 pb-4 border-b border-slate-900 flex items-center justify-between">
            <Logo size="md" showProductTag={true} />
            <button
              id="btn-close-sidebar"
              onClick={handleClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Fechar Menu"
              aria-label="Fechar Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Active Sheet Switcher Bar */}
          <div className="px-4 py-3 border-b border-slate-900 relative">
            <button
              id="sidebar-sheet-selector"
              onClick={() => setSheetDropdownOpen(!sheetDropdownOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-xs font-medium text-slate-300 transition-all hover:border-slate-700"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="truncate">
                  {sheets.find((s) => s.id === activeSheetId)?.name || 'Planilha Pessoal'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {sheetDropdownOpen && (
              <div className="absolute top-12 left-4 right-4 z-50 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Minhas Planilhas
                </div>
                {sheets.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => {
                      setActiveSheetId(sheet.id);
                      setSheetDropdownOpen(false);
                      handleClose();
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      sheet.id === activeSheetId
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{sheet.name}</span>
                    {sheet.id === activeSheetId && <Sparkles className="w-3 h-3 text-blue-200 shrink-0" />}
                  </button>
                ))}
                <div className="border-t border-slate-800 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setSheetDropdownOpen(false);
                      handleNavClick('sheets');
                    }}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-blue-400 hover:bg-blue-950/40"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Gerenciar Planilhas</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {/* Dashboard */}
          <button
            id="nav-dashboard"
            onClick={() => handleNavClick('dashboard')}
            className={navItemClass('dashboard')}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </button>

          {/* Saldos Iniciais */}
          <button
            id="nav-initial-balances"
            onClick={() => handleNavClick('initial_balances')}
            className={navItemClass('initial_balances')}
          >
            <div className="flex items-center gap-3">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Saldos Iniciais</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              Início
            </span>
          </button>

          {/* Financeiro (Parent with Submenus) */}
          <div className="pt-1">
            <button
              id="nav-financial-menu"
              onClick={() => setFinanceMenuExpanded(!financeMenuExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isFinanceSubActive
                  ? 'text-blue-400 bg-blue-950/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span>Financeiro</span>
              </div>
              {financeMenuExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Submenus */}
            {financeMenuExpanded && (
              <div className="mt-1 space-y-0.5 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                <button
                  id="nav-cash-flow"
                  onClick={() => handleNavClick('cash_flow')}
                  className={subNavItemClass('cash_flow')}
                >
                  <span>Fluxo de Caixa</span>
                  <Zap className="w-3 h-3 text-slate-500" />
                </button>

                <button
                  id="nav-income"
                  onClick={() => handleNavClick('income')}
                  className={subNavItemClass('income')}
                >
                  <div className="flex items-center gap-1.5">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Receitas</span>
                  </div>
                </button>

                <button
                  id="nav-expenses"
                  onClick={() => handleNavClick('expenses')}
                  className={subNavItemClass('expenses')}
                >
                  <div className="flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                    <span>Despesas</span>
                  </div>
                </button>

                <button
                  id="nav-transfers"
                  onClick={() => handleNavClick('transfers')}
                  className={subNavItemClass('transfers')}
                >
                  <div className="flex items-center gap-1.5">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Transferências</span>
                  </div>
                </button>

                <button
                  id="nav-payables"
                  onClick={() => handleNavClick('payables')}
                  className={subNavItemClass('payables')}
                >
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contas a Pagar</span>
                  </div>
                  {overduePayables.length > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {overduePayables.length}
                    </span>
                  ) : upcomingPayables.length > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {upcomingPayables.length}
                    </span>
                  ) : null}
                </button>

                <button
                  id="nav-receivables"
                  onClick={() => handleNavClick('receivables')}
                  className={subNavItemClass('receivables')}
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Contas a Receber</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Relatórios */}
          <button
            id="nav-reports"
            onClick={() => handleNavClick('reports')}
            className={navItemClass('reports')}
          >
            <div className="flex items-center gap-3">
              <PieChart className="w-4 h-4" />
              <span>Relatórios</span>
            </div>
          </button>

          {/* Plano de Contas */}
          <button
            id="nav-chart-of-accounts"
            onClick={() => handleNavClick('chart_of_accounts')}
            className={navItemClass('chart_of_accounts')}
          >
            <div className="flex items-center gap-3">
              <FolderTree className="w-4 h-4" />
              <span>Plano de Contas</span>
            </div>
          </button>

          {/* Cadastros (Parent with Submenus) */}
          <div className="pt-1">
            <button
              id="nav-cadastros-menu"
              onClick={() => setCadastrosMenuExpanded(!cadastrosMenuExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isCadastrosSubActive
                  ? 'text-blue-400 bg-blue-950/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Cadastros</span>
              </div>
              {cadastrosMenuExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {cadastrosMenuExpanded && (
              <div className="mt-1 space-y-0.5 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                <button
                  onClick={() => handleNavClick('registrations')}
                  className={subNavItemClass('registrations')}
                >
                  <span>Central de Cadastros</span>
                </button>
                <button
                  onClick={() => handleNavClick('income_types')}
                  className={subNavItemClass('income_types')}
                >
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tipos de Receitas</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('expense_types')}
                  className={subNavItemClass('expense_types')}
                >
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-400" />
                    <span>Tipos de Despesas</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('income_methods')}
                  className={subNavItemClass('income_methods')}
                >
                  <span>Meios de Pagto / Recebto</span>
                </button>
                <button
                  onClick={() => handleNavClick('clients')}
                  className={subNavItemClass('clients')}
                >
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>Clientes</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('suppliers')}
                  className={subNavItemClass('suppliers')}
                >
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fornecedores</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('projects_docs')}
                  className={subNavItemClass('projects_docs')}
                >
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                    <span>Projetos & Docs</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Contas & Open Finance */}
          <button
            id="nav-accounts"
            onClick={() => handleNavClick('accounts')}
            className={navItemClass('accounts')}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4" />
              <span>Contas & Bancos</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
              Live
            </span>
          </button>

          {/* Minhas Planilhas */}
          <button
            id="nav-sheets"
            onClick={() => handleNavClick('sheets')}
            className={navItemClass('sheets')}
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Minhas Planilhas</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
              {sheets.length}
            </span>
          </button>

          {/* Assistente Financeiro de Preços */}
          <button
            id="nav-price-assistant"
            onClick={() => handleNavClick('price_ai')}
            className={navItemClass('price_ai')}
          >
            <div className="flex items-center gap-3">
              <Calculator className="w-4 h-4 text-blue-400" />
              <span>Assistente de Preços</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
              PRO
            </span>
          </button>

          {/* Metas (Parent with Submenus) */}
          <div className="pt-1">
            <button
              id="nav-goals-menu"
              onClick={() => setGoalsMenuExpanded(!goalsMenuExpanded)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                isGoalsSubActive
                  ? 'text-emerald-400 bg-emerald-950/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Metas & Orçamentos</span>
              </div>
              {goalsMenuExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {goalsMenuExpanded && (
              <div className="mt-1 space-y-0.5 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                <button
                  onClick={() => handleNavClick('revenue_goals')}
                  className={subNavItemClass('revenue_goals')}
                >
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Metas de Receitas</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('expense_goals')}
                  className={subNavItemClass('expense_goals')}
                >
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <span>Metas de Gastos</span>
                  </div>
                </button>
                <button
                  onClick={() => handleNavClick('goals')}
                  className={subNavItemClass('goals')}
                >
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    <span>Metas Gerais</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Base de Dados */}
          <button
            id="nav-database"
            onClick={() => handleNavClick('database')}
            className={navItemClass('database')}
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4" />
              <span>Base de Dados</span>
            </div>
          </button>

          {/* Divider */}
          <div className="pt-2 pb-1">
            <div className="border-t border-slate-900" />
          </div>

          {/* Ajuda / Tutorial */}
          <button
            id="nav-help"
            onClick={() => handleNavClick('help')}
            className={navItemClass('help')}
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4" />
              <span>Ajuda / Tutorial</span>
            </div>
          </button>

          {/* Configurações */}
          <button
            id="nav-settings"
            onClick={() => handleNavClick('settings')}
            className={navItemClass('settings')}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </div>
          </button>
        </div>

        {/* Bottom Banner: Status do Sistema e Ação Rápida */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/80">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate">Finance GL Pro</span>
                <span className="text-[10px] text-blue-400 font-mono">v2.5 PRO • GL Studios</span>
              </div>
            </div>
            <button
              onClick={() => {
                setOnboardingOpen(true);
                handleClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              title="Configurar Conta & Planilha"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
