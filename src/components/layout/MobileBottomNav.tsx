import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  Menu as MenuIcon,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavigationTab } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openTransactionModal } = useFinance();

  // Helper to check active category
  const isHomeActive = activeTab === 'dashboard';
  const isTransactionsActive = [
    'income',
    'expenses',
    'transfers',
    'payables',
    'receivables',
    'mobile_transactions',
  ].includes(activeTab);
  const isChartsActive = [
    'cash_flow',
    'reports',
    'mobile_charts',
  ].includes(activeTab);
  const isSheetsActive = activeTab === 'sheets';
  const isMenuActive = activeTab === 'mobile_menu';

  const handleNav = (target: NavigationTab) => {
    setActiveTab(target);
    // Smooth scroll to top when changing section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Navegação Principal Móvel"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl shadow-2xl select-none pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {/* 1. Início (Dashboard) */}
        <button
          type="button"
          onClick={() => handleNav('dashboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all cursor-pointer ${
            isHomeActive
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Início"
          aria-label="Início"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isHomeActive ? 'bg-blue-600/20 shadow-xs ring-1 ring-blue-500/40' : ''
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Início</span>
        </button>

        {/* 2. Lançamentos */}
        <button
          type="button"
          onClick={() => handleNav('income')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all cursor-pointer ${
            isTransactionsActive
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Lançamentos"
          aria-label="Lançamentos"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isTransactionsActive ? 'bg-blue-600/20 shadow-xs ring-1 ring-blue-500/40' : ''
            }`}
          >
            <Receipt className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Lançamentos</span>
        </button>

        {/* 3. Gráficos */}
        <button
          type="button"
          onClick={() => handleNav('cash_flow')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all cursor-pointer ${
            isChartsActive
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Gráficos"
          aria-label="Gráficos"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isChartsActive ? 'bg-blue-600/20 shadow-xs ring-1 ring-blue-500/40' : ''
            }`}
          >
            <BarChart3 className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Gráficos</span>
        </button>

        {/* 4. Planilhas */}
        <button
          type="button"
          onClick={() => handleNav('sheets')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all cursor-pointer ${
            isSheetsActive
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Planilhas"
          aria-label="Planilhas"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isSheetsActive ? 'bg-blue-600/20 shadow-xs ring-1 ring-blue-500/40' : ''
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Planilhas</span>
        </button>

        {/* 5. Menu */}
        <button
          type="button"
          onClick={() => handleNav('mobile_menu')}
          className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all cursor-pointer ${
            isMenuActive
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Mais Opções"
          aria-label="Mais Opções"
        >
          <div
            className={`p-1 rounded-xl transition-all ${
              isMenuActive ? 'bg-blue-600/20 shadow-xs ring-1 ring-blue-500/40' : ''
            }`}
          >
            <MenuIcon className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
};
