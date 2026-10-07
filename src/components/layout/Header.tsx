import React, { useState } from 'react';
import {
  Menu,
  Search,
  Plus,
  Minus,
  ArrowLeftRight,
  FileText,
  RefreshCw,
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Logo } from './Logo';

interface HeaderProps {
  onToggleMenu: () => void;
  isMenuOpen?: boolean;
}

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  initial_balances: 'Saldos Iniciais',
  cash_flow: 'Fluxo de Caixa',
  income: 'Receitas',
  expenses: 'Despesas',
  transfers: 'Transferências',
  payables: 'Contas a Pagar',
  receivables: 'Contas a Receber',
  registrations: 'Central de Cadastros',
  income_types: 'Tipos de Receitas',
  expense_types: 'Tipos de Despesas',
  income_methods: 'Meios de Pagamento & Recebimento',
  expense_methods: 'Meios de Pagamento & Recebimento',
  clients: 'Cadastro de Clientes',
  suppliers: 'Cadastro de Fornecedores',
  projects_docs: 'Projetos & Documentos',
  revenue_goals: 'Metas de Receitas',
  expense_goals: 'Metas de Gastos',
  reports: 'Relatórios',
  chart_of_accounts: 'Plano de Contas',
  accounts: 'Contas & Bancos',
  sheets: 'Minhas Planilhas',
  price_ai: 'Assistente de Preços',
  goals: 'Metas Financeiras',
  database: 'Base de Dados',
  help: 'Ajuda & Tutorial',
  settings: 'Configurações',
};

export const Header: React.FC<HeaderProps> = ({ onToggleMenu, isMenuOpen = false }) => {
  const {
    activeTab,
    openTransactionModal,
    setTransferModalOpen,
    setActiveTab,
    setGlobalSearchOpen,
    syncBankAccounts,
    isBankSyncing,
    lastBankSyncTime,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    userProfile,
    sheets,
    activeSheetId,
    setActiveSheetId,
    selectedYear,
    setSelectedYear,
  } = useFinance();

  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [sheetMenuOpen, setSheetMenuOpen] = useState<boolean>(false);

  const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

  const formatSyncTime = (iso?: string | null) => {
    if (!iso) return 'Nunca sincronizado';
    try {
      const d = new Date(iso);
      return `Sincronizado ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return 'Sincronizado';
    }
  };

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 bg-slate-950/95 border-b border-slate-800/80 backdrop-blur-md transition-colors shadow-lg shadow-black/20"
    >
      {/* ------------------------------------------------------------- */}
      {/* DESKTOP VIEW (lg and above): Spacious, distinct 3-zone layout */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden lg:flex h-18 px-6 lg:px-8 items-center justify-between gap-6">
        {/* Left Zone: ☰ Menu + Logo + Global Search */}
        <div className="flex items-center gap-4 xl:gap-5 shrink-0">
          <button
            id="btn-sidebar-menu-toggle-desktop"
            onClick={onToggleMenu}
            className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center shrink-0 active:scale-95 focus:outline-hidden ${
              isMenuOpen
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 shadow-md shadow-blue-950/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-850 border-slate-800 hover:border-slate-700'
            }`}
            title="Abrir Menu de Navegação (☰)"
            aria-label="Abrir Menu de Navegação (☰)"
          >
            <Menu className="w-5 h-5 text-blue-400 group-hover:text-white" />
          </button>

          <div id="header-desktop-logo" className="shrink-0">
            <Logo size="md" showProductTag={true} />
          </div>

          <div className="hidden xl:flex items-center pl-3 border-l border-slate-800">
            <span className="text-xs font-bold text-slate-200 tracking-wide font-display">
              {TAB_TITLES[activeTab] || 'Dashboard'}
            </span>
          </div>

          <button
            id="global-search-trigger-desktop"
            onClick={() => setGlobalSearchOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all hover:border-slate-700 w-36 xl:w-44"
          >
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">Pesquisar...</span>
            <kbd className="ml-auto inline-flex items-center gap-0.5 font-mono text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Center Zone: Independent "Planilha atual" Switcher Pill & Ano Fiscal */}
        <div className="relative shrink-0 flex items-center justify-center gap-2">
          {/* Quick Year Selector Pill */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs shadow-xs">
            {[2025, 2026, 2027].map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Exercício Fiscal ${yr}`}
              >
                {yr}
              </button>
            ))}
          </div>

          <button
            id="btn-active-sheet-desktop"
            onClick={() => setSheetMenuOpen(!sheetMenuOpen)}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 shadow-xs text-xs font-medium transition-all"
            title="Planilha ativa no momento"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex flex-col text-left max-w-[140px] xl:max-w-[200px]">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                Planilha atual
              </span>
              <span className="text-white font-semibold truncate text-xs">
                {activeSheet?.name || 'Minhas Finanças'}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 shrink-0 ${
                sheetMenuOpen ? 'rotate-180 text-blue-400' : ''
              }`}
            />
          </button>

          {/* Desktop Sheet Dropdown Popover */}
          {sheetMenuOpen && (
            <div
              id="desktop-sheet-popover"
              className="absolute top-full mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                <span>Alternar Planilha</span>
                <span className="text-blue-400 font-normal">{sheets.length} total</span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1 py-1">
                {sheets.map((s) => {
                  const isCurrent = s.id === activeSheetId;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSheetId(s.id);
                        setSheetMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                        isCurrent
                          ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-2">{s.name}</span>
                      {isCurrent && <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 mt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab('sheets');
                    setSheetMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Gerenciar Minhas Planilhas</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Zone: Action Buttons, Sync, Notifications & Profile */}
        <div className="flex items-center gap-2.5 xl:gap-3.5 shrink-0">
          <button
            id="btn-quick-income-desktop"
            onClick={() => openTransactionModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
            title="Lançar Nova Receita"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Receita</span>
          </button>

          <button
            id="btn-quick-expense-desktop"
            onClick={() => openTransactionModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/40 transition-all active:scale-95 cursor-pointer"
            title="Lançar Nova Despesa"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>− Despesa</span>
          </button>

          <button
            id="btn-quick-transfer-desktop"
            onClick={() => setTransferModalOpen(true)}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Transferir Entre Contas"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-400" />
            <span>Transferir</span>
          </button>

          <button
            id="btn-quick-reports-desktop"
            onClick={() => setActiveTab('reports')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
            title="Abrir Relatórios"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Relatórios</span>
          </button>

          {/* Live Bank Sync Status */}
          <button
            id="btn-bank-sync-desktop"
            onClick={() => syncBankAccounts()}
            disabled={isBankSyncing}
            className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-xs font-medium transition-all cursor-pointer group"
            title="Sincronizar contas bancárias via Open Finance em tempo real"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-cyan-400 ${
                isBankSyncing ? 'animate-spin text-cyan-300' : 'group-hover:rotate-180 transition-transform duration-500'
              }`}
            />
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                {isBankSyncing ? 'Sincronizando...' : 'Open Finance'}
              </span>
              <span className="text-[9px] text-slate-400 truncate">
                {formatSyncTime(lastBankSyncTime)}
              </span>
            </div>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              id="btn-notifications-desktop"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                id="notifications-popover-desktop"
                className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-white">Notificações</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {notifications.length}
                    </span>
                  </div>
                  {unreadNotificationCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Marcar todas como lidas</span>
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      Nenhum alerta financeiro no momento. Tudo organizado!
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.actionTab) {
                            setActiveTab(n.actionTab);
                            setNotificationsOpen(false);
                          }
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          n.read
                            ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                            : n.type === 'alert'
                            ? 'bg-rose-950/20 border-rose-800/40 text-slate-200 hover:bg-rose-950/30'
                            : n.type === 'warning'
                            ? 'bg-amber-950/20 border-amber-800/40 text-slate-200 hover:bg-amber-950/30'
                            : 'bg-blue-950/20 border-blue-800/40 text-slate-200 hover:bg-blue-950/30'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {n.type === 'alert' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                          {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-slate-100 truncate">{n.title}</span>
                              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                            </div>
                            <p className="mt-0.5 text-slate-400 leading-relaxed text-[11px]">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-2.5 pl-1.5 py-1 pr-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(userProfile.name || 'US').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                {userProfile.name || 'Usuário'}
              </span>
              <span className="text-[10px] text-blue-400 font-mono">GL PRO</span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* MOBILE / TABLET VIEW (< lg): Dedicated 2-tier layout (ZERO OVERLAPPING)   */}
      {/* -------------------------------------------------------------------------- */}
      <div className="flex lg:hidden flex-col">
        {/* Tier 1: ☰ Menu + GL Studios Logo + (Search + Notifications + Profile) */}
        <div className="h-14 sm:h-16 px-3 sm:px-5 flex items-center justify-between gap-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              id="btn-sidebar-menu-toggle-mobile"
              onClick={onToggleMenu}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center shrink-0 active:scale-95 focus:outline-hidden ${
                isMenuOpen
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/50'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-800'
              }`}
              title="Abrir Menu de Navegação (☰)"
              aria-label="Abrir Menu de Navegação (☰)"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </button>

            <div id="header-mobile-logo" className="shrink-0">
              <Logo size="sm" showProductTag={true} />
            </div>

            <div className="hidden sm:flex items-center pl-2 border-l border-slate-800 truncate">
              <span className="text-xs font-semibold text-slate-200 truncate">
                {TAB_TITLES[activeTab] || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Search Trigger */}
            <button
              id="btn-mobile-search-tier1"
              onClick={() => setGlobalSearchOpen(true)}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white"
              aria-label="Pesquisar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                id="btn-notifications-mobile"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-white"
                aria-label="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  id="notifications-popover-mobile"
                  className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold text-white">Notificações</span>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[10px] text-blue-400 hover:underline"
                      >
                        Marcar lidas
                      </button>
                    )}
                  </div>
                  <div className="mt-2 space-y-1.5 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center py-4 text-slate-500 text-xs">Nenhuma notificação.</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationRead(n.id);
                            if (n.actionTab) {
                              setActiveTab(n.actionTab);
                              setNotificationsOpen(false);
                            }
                          }}
                          className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 text-[11px] text-slate-300 cursor-pointer"
                        >
                          <div className="font-semibold text-white truncate">{n.title}</div>
                          <div className="text-slate-400 text-[10px] line-clamp-2">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <button
              onClick={() => setActiveTab('settings')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs"
              title="Configurações e Perfil"
            >
              {(userProfile.name || 'US').slice(0, 2).toUpperCase()}
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Row for Planilha Atual (Left) + Quick Actions (+ Receita / − Despesa) (Right) */}
        <div className="h-12 px-3 sm:px-5 flex items-center justify-between gap-3 bg-slate-950/80">
          {/* Planilha Atual Selector */}
          <div className="relative min-w-0 max-w-[55%] sm:max-w-[60%]">
            <button
              id="btn-active-sheet-mobile"
              onClick={() => setSheetMenuOpen(!sheetMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/90 text-xs transition-all w-full"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-[7px] sm:text-[8px] text-slate-400 uppercase tracking-wider font-bold leading-none">
                  Planilha
                </span>
                <span className="text-white font-semibold truncate text-[11px] leading-tight">
                  {activeSheet?.name || 'Minhas Finanças'}
                </span>
              </div>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${
                  sheetMenuOpen ? 'rotate-180 text-blue-400' : ''
                }`}
              />
            </button>

            {/* Mobile Sheet Popover */}
            {sheetMenuOpen && (
              <div
                id="mobile-sheet-popover"
                className="absolute left-0 top-full mt-1.5 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1 flex items-center justify-between">
                  <span>Alternar Planilha</span>
                  <span className="text-blue-400">{sheets.length} total</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 py-1">
                  {sheets.map((s) => {
                    const isCurrent = s.id === activeSheetId;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveSheetId(s.id);
                          setSheetMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all text-left ${
                          isCurrent
                            ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="truncate pr-2">{s.name}</span>
                        {isCurrent && <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-1.5 mt-1 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setActiveTab('sheets');
                      setSheetMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold transition-all"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Gerenciar Planilhas</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Transaction Action Buttons (Completely isolated on the right side) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="btn-quick-income-mobile"
              onClick={() => openTransactionModal('income')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-semibold shadow-md shadow-emerald-950/40 active:scale-95"
              title="Lançar Receita"
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>+ Receita</span>
            </button>

            <button
              id="btn-quick-expense-mobile"
              onClick={() => openTransactionModal('expense')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] sm:text-xs font-semibold shadow-md shadow-rose-950/40 active:scale-95"
              title="Lançar Despesa"
            >
              <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>− Despesa</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
