import React, { useState } from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { CashFlowView } from './components/finance/CashFlowView';
import { TransactionsView } from './components/finance/TransactionsView';
import { PayablesView } from './components/finance/PayablesView';
import { ReceivablesView } from './components/finance/ReceivablesView';
import { ReportsView } from './components/reports/ReportsView';
import { ChartOfAccountsView } from './components/chartofaccounts/ChartOfAccountsView';
import { AccountsView } from './components/accounts/AccountsView';
import { SavedSheetsView } from './components/sheets/SavedSheetsView';
import { GoalsView } from './components/goals/GoalsView';
import { DatabaseView } from './components/database/DatabaseView';
import { HelpCenterView } from './components/help/HelpCenterView';
import { SettingsView } from './components/settings/SettingsView';
import { PricingAssistantView } from './components/pricing/PricingAssistantView';
import { TransactionModal } from './components/modals/TransactionModal';
import { TransferModal } from './components/modals/TransferModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

const AppContent: React.FC = () => {
  const { activeTab } = useFinance();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'cash_flow':
        return <CashFlowView />;
      case 'income':
        return (
          <TransactionsView
            initialTypeFilter="income"
            title="Lançamentos de Receitas"
            subtitle="Extrato completo de recebimentos, faturamento e créditos"
          />
        );
      case 'expenses':
        return (
          <TransactionsView
            initialTypeFilter="expense"
            title="Lançamentos de Despesas"
            subtitle="Extrato detalhado de saídas, compras e pagamentos"
          />
        );
      case 'transfers':
        return (
          <TransactionsView
            initialTypeFilter="transfer"
            title="Transferências Entre Contas"
            subtitle="Histórico de movimentações internas e transferências"
          />
        );
      case 'payables':
        return <PayablesView />;
      case 'receivables':
        return <ReceivablesView />;
      case 'reports':
        return <ReportsView />;
      case 'chart_of_accounts':
        return <ChartOfAccountsView />;
      case 'accounts':
        return <AccountsView />;
      case 'sheets':
        return <SavedSheetsView />;
      case 'price_ai':
        return <PricingAssistantView />;
      case 'goals':
        return <GoalsView />;
      case 'database':
        return <DatabaseView />;
      case 'help':
        return <HelpCenterView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-blue-500 selection:text-white">
      {/* Slide-in Sidebar Drawer (Auto-closes on tab selection, reopened via 3 dots) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Full-Width Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full min-h-screen">
        <Header
          onToggleMenu={() => setSidebarOpen((prev) => !prev)}
          isMenuOpen={sidebarOpen}
        />

        <main className="flex-1 p-3 sm:p-5 lg:p-7 w-full max-w-7xl mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals Container */}
      <TransactionModal />
      <TransferModal />
      <GlobalSearchModal />
      <OnboardingModal />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
