import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  Category,
  FinancialSheet,
  Goal,
  NavigationTab,
  NotificationItem,
  PeriodFilter,
  PriceAnalysisRecord,
  SheetControlType,
  Transaction,
  UserProfile,
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CATEGORIES,
  INITIAL_GOALS,
  INITIAL_SHEETS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER_PROFILE,
} from '../utils/demoData';
import { getPeriodDates } from '../utils/formatters';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface FinanceContextType {
  // State
  sheets: FinancialSheet[];
  activeSheetId: string;
  activeSheet: FinancialSheet;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  priceAnalyses: PriceAnalysisRecord[];
  userProfile: UserProfile;
  activeTab: NavigationTab;
  periodFilter: PeriodFilter;
  customStartDate: string;
  customEndDate: string;
  isDemoMode: boolean;
  isBankSyncing: boolean;
  lastBankSyncTime: string | null;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  toasts: ToastMessage[];
  globalSearchOpen: boolean;
  transactionModalOpen: boolean;
  transactionModalType: 'income' | 'expense';
  editingTransaction: Transaction | null;
  transferModalOpen: boolean;
  isOnboardingOpen: boolean;
  onboardingOpen: boolean;

  // Setters & Nav
  setActiveTab: (tab: NavigationTab) => void;
  setPeriodFilter: (filter: PeriodFilter) => void;
  setCustomDateRange: (start: string, end: string) => void;
  setActiveSheetId: (sheetId: string) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setTransferModalOpen: (open: boolean) => void;
  setOnboardingOpen: (open: boolean) => void;
  openTransactionModal: (type: 'income' | 'expense', tx?: Transaction) => void;
  closeTransactionModal: () => void;
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'sheetId'>) => Transaction;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  quickPayBill: (id: string) => void;
  quickReceiveBill: (id: string) => void;

  addAccount: (acc: Omit<Account, 'id' | 'currentBalance' | 'sheetId'>) => Account;
  updateAccount: (acc: Account) => void;
  deleteAccount: (id: string) => void;
  transferBetweenAccounts: (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    date: string,
    paymentMethod: string,
    notes?: string
  ) => void;
  syncBankAccounts: () => Promise<void>;

  addCategory: (cat: Omit<Category, 'id' | 'sheetId'>) => Category;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'sheetId'>) => Goal;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  addGoalProgress: (goalId: string, amount: number) => void;

  addSheet: (name: string, description?: string) => FinancialSheet;
  createSheet: (
    name: string,
    description?: string,
    options?:
      | {
          controlType?: SheetControlType;
          currency?: string;
          initialBalance?: number;
          populateDefaultCategories?: boolean;
        }
      | boolean
  ) => FinancialSheet;
  duplicateSheet: (sheetId: string, newName?: string) => FinancialSheet;
  updateSheet: (sheet: FinancialSheet) => void;
  renameSheet: (sheetId: string, newName: string) => void;
  deleteSheet: (sheetId: string) => void;

  // Price AI actions
  savePriceAnalysis: (analysis: Omit<PriceAnalysisRecord, 'id' | 'createdAt' | 'sheetId'>) => PriceAnalysisRecord;
  deletePriceAnalysis: (id: string) => void;
  clearPriceAnalyses: () => void;

  startMySheet: (name: string, initialAccountName: string, initialBalance: number, objective: string) => void;
  setupUserAccount: (config: {
    userName: string;
    userEmail: string;
    sheetName: string;
    accountName: string;
    initialBalance: number;
    financialGoal?: string;
  }) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  exportDatabaseBackup: () => void;
  exportAllDataJSON: () => string;
  importDatabaseBackup: (jsonString: string) => boolean;
  importDataJSON: (jsonString: string) => boolean;

  // Computed Values for Current Period & Sheet
  sheetTransactions: Transaction[];
  filteredTransactions: Transaction[];
  sheetAccounts: Account[];
  sheetCategories: Category[];
  sheetGoals: Goal[];
  sheetPriceAnalyses: PriceAnalysisRecord[];
  totalBalance: number;
  totalPeriodIncome: number;
  totalPeriodExpense: number;
  netPeriodResult: number;
  prevPeriodIncome: number;
  prevPeriodExpense: number;
  incomeGrowthPercent: number;
  expenseGrowthPercent: number;
  resultGrowthPercent: number;
  periodDateRange: { start: string; end: string; prevStart: string; prevEnd: string; label: string };
  upcomingPayables: Transaction[];
  overduePayables: Transaction[];
  pendingReceivables: Transaction[];
}

const STORAGE_KEYS = {
  SHEETS: 'finance_gl_pro_sheets_v2',
  ACTIVE_SHEET_ID: 'finance_gl_pro_active_sheet_id_v2',
  ACCOUNTS: 'finance_gl_pro_accounts_v2',
  CATEGORIES: 'finance_gl_pro_categories_v2',
  TRANSACTIONS: 'finance_gl_pro_transactions_v2',
  GOALS: 'finance_gl_pro_goals_v2',
  USER_PROFILE: 'finance_gl_pro_user_profile_v2',
  PRICE_ANALYSES: 'finance_gl_pro_price_analyses_v2',
  IS_DEMO: 'finance_gl_pro_is_demo_v2',
  LAST_SYNC: 'finance_gl_pro_last_sync_v2',
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Persistence state loaders
  const [sheets, setSheets] = useState<FinancialSheet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHEETS);
    return saved ? JSON.parse(saved) : INITIAL_SHEETS;
  });

  const [activeSheetId, setActiveSheetIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SHEET_ID);
    return saved || 'sheet-default';
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  const [priceAnalyses, setPriceAnalyses] = useState<PriceAnalysisRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICE_ANALYSES);
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.IS_DEMO);
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [lastBankSyncTime, setLastBankSyncTime] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || null;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('this_month');
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  const [customStartDate, setCustomStartDate] = useState<string>(firstDay);
  const [customEndDate, setCustomEndDate] = useState<string>(lastDay);
  const [isBankSyncing, setIsBankSyncing] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [globalSearchOpen, setGlobalSearchOpen] = useState<boolean>(false);
  const [transactionModalOpen, setTransactionModalOpen] = useState<boolean>(false);
  const [transactionModalType, setTransactionModalType] = useState<'income' | 'expense'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => {
    const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!savedProfile) return true; // Show welcoming setup on very first visit
    try {
      const parsed = JSON.parse(savedProfile);
      return !parsed.onboardingCompleted;
    } catch {
      return false;
    }
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHEETS, JSON.stringify(sheets));
  }, [sheets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SHEET_ID, activeSheetId);
  }, [activeSheetId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICE_ANALYSES, JSON.stringify(priceAnalyses));
  }, [priceAnalyses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, JSON.stringify(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    if (lastBankSyncTime) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastBankSyncTime);
    }
  }, [lastBankSyncTime]);

  const showToast = (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activeSheet = useMemo(() => {
    return sheets.find((s) => s.id === activeSheetId) || sheets[0] || INITIAL_SHEETS[0];
  }, [sheets, activeSheetId]);

  const setActiveSheetId = (id: string) => {
    setActiveSheetIdState(id);
    const target = sheets.find((s) => s.id === id);
    if (target) {
      showToast('Planilha Selecionada', `Alternado para "${target.name}" com sucesso.`, 'info');
    }
  };

  const setCustomDateRange = (start: string, end: string) => {
    setCustomStartDate(start);
    setCustomEndDate(end);
    setPeriodFilter('custom');
  };

  // Filtered dataset for active sheet
  const sheetTransactions = useMemo(() => {
    return transactions.filter((t) => t.sheetId === activeSheetId);
  }, [transactions, activeSheetId]);

  const sheetAccounts = useMemo(() => {
    return accounts.filter((a) => a.sheetId === activeSheetId);
  }, [accounts, activeSheetId]);

  const sheetCategories = useMemo(() => {
    return categories.filter((c) => c.sheetId === activeSheetId);
  }, [categories, activeSheetId]);

  const sheetGoals = useMemo(() => {
    return goals.filter((g) => g.sheetId === activeSheetId);
  }, [goals, activeSheetId]);

  const sheetPriceAnalyses = useMemo(() => {
    return priceAnalyses.filter((p) => p.sheetId === activeSheetId);
  }, [priceAnalyses, activeSheetId]);

  const periodDateRange = useMemo(() => {
    return getPeriodDates(periodFilter, customStartDate, customEndDate);
  }, [periodFilter, customStartDate, customEndDate]);

  // Filtered transactions for the selected period
  const filteredTransactions = useMemo(() => {
    return sheetTransactions.filter((tx) => {
      const txDate = tx.date;
      return txDate >= periodDateRange.start && txDate <= periodDateRange.end;
    });
  }, [sheetTransactions, periodDateRange]);

  // Previous period transactions for trend comparison
  const prevPeriodTransactions = useMemo(() => {
    return sheetTransactions.filter((tx) => {
      const txDate = tx.date;
      return txDate >= periodDateRange.prevStart && txDate <= periodDateRange.prevEnd;
    });
  }, [sheetTransactions, periodDateRange]);

  // Recalculate Accounts Current Balances dynamically from Transactions + InitialBalance
  const totalBalance = useMemo(() => {
    return sheetAccounts.reduce((acc, account) => {
      const completedTxs = sheetTransactions.filter((tx) => tx.status === 'completed');
      const incomeSum = completedTxs
        .filter((tx) => tx.type === 'income' && tx.accountId === account.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expenseSum = completedTxs
        .filter((tx) => tx.type === 'expense' && tx.accountId === account.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const transferIn = completedTxs
        .filter((tx) => tx.type === 'transfer' && tx.toAccountId === account.id)
        .reduce((sum, tx) => sum + tx.amount, 0);
      const transferOut = completedTxs
        .filter((tx) => tx.type === 'transfer' && tx.accountId === account.id)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const calculatedBalance =
        account.initialBalance + incomeSum - expenseSum + transferIn - transferOut;

      return acc + calculatedBalance;
    }, 0);
  }, [sheetAccounts, sheetTransactions]);

  // Totals for current period
  const totalPeriodIncome = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'income' && tx.status !== 'overdue')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const totalPeriodExpense = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'expense' && tx.status !== 'overdue')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const netPeriodResult = useMemo(() => {
    return totalPeriodIncome - totalPeriodExpense;
  }, [totalPeriodIncome, totalPeriodExpense]);

  // Previous period totals for comparison
  const prevPeriodIncome = useMemo(() => {
    return prevPeriodTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [prevPeriodTransactions]);

  const prevPeriodExpense = useMemo(() => {
    return prevPeriodTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [prevPeriodTransactions]);

  const prevNetResult = useMemo(() => {
    return prevPeriodIncome - prevPeriodExpense;
  }, [prevPeriodIncome, prevPeriodExpense]);

  const incomeGrowthPercent = useMemo(() => {
    if (prevPeriodIncome === 0) return 0;
    return ((totalPeriodIncome - prevPeriodIncome) / prevPeriodIncome) * 100;
  }, [totalPeriodIncome, prevPeriodIncome]);

  const expenseGrowthPercent = useMemo(() => {
    if (prevPeriodExpense === 0) return 0;
    return ((totalPeriodExpense - prevPeriodExpense) / prevPeriodExpense) * 100;
  }, [totalPeriodExpense, prevPeriodExpense]);

  const resultGrowthPercent = useMemo(() => {
    if (prevNetResult === 0) return 0;
    return ((netPeriodResult - prevNetResult) / Math.abs(prevNetResult)) * 100;
  }, [netPeriodResult, prevNetResult]);

  // Payables & Receivables lists
  const upcomingPayables = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    return sheetTransactions.filter(
      (tx) =>
        tx.type === 'expense' &&
        (tx.status === 'pending' || tx.status === 'scheduled') &&
        (tx.dueDate || tx.date) >= todayStr &&
        (tx.dueDate || tx.date) <= in7days
    );
  }, [sheetTransactions]);

  const overduePayables = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    return sheetTransactions.filter(
      (tx) =>
        tx.type === 'expense' &&
        (tx.status === 'overdue' || (tx.status === 'pending' && (tx.dueDate || tx.date) < todayStr))
    );
  }, [sheetTransactions]);

  const pendingReceivables = useMemo(() => {
    return sheetTransactions.filter((tx) => tx.type === 'income' && tx.status !== 'completed');
  }, [sheetTransactions]);

  // Notifications calculation
  useEffect(() => {
    const alerts: NotificationItem[] = [];

    if (overduePayables.length > 0) {
      alerts.push({
        id: 'notif-overdue',
        type: 'alert',
        title: 'Contas Vencidas',
        message: `Você possui ${overduePayables.length} conta(s) com pagamento em atraso.`,
        date: new Date().toISOString(),
        read: false,
        actionTab: 'payables',
      });
    }

    if (upcomingPayables.length > 0) {
      const totalUpcoming = upcomingPayables.reduce((s, t) => s + t.amount, 0);
      alerts.push({
        id: 'notif-upcoming-7d',
        type: 'warning',
        title: 'Contas nos Próximos 7 Dias',
        message: `${upcomingPayables.length} conta(s) vencendo esta semana (Total: R$ ${totalUpcoming.toFixed(2).replace('.', ',')}).`,
        date: new Date().toISOString(),
        read: false,
        actionTab: 'payables',
      });
    }

    if (pendingReceivables.length > 0) {
      const totalReceivable = pendingReceivables.reduce((s, t) => s + t.amount, 0);
      alerts.push({
        id: 'notif-receivables',
        type: 'info',
        title: 'Recebimentos Pendentes',
        message: `R$ ${totalReceivable.toFixed(2).replace('.', ',')} a receber aguardando confirmação.`,
        date: new Date().toISOString(),
        read: false,
        actionTab: 'receivables',
      });
    }

    setNotifications(alerts);
  }, [overduePayables, upcomingPayables, pendingReceivables, sheetGoals]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const openTransactionModal = (type: 'income' | 'expense', tx?: Transaction) => {
    setTransactionModalType(type);
    setEditingTransaction(tx || null);
    setTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setTransactionModalOpen(false);
    setEditingTransaction(null);
  };

  // Transaction CRUD
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt' | 'sheetId'>): Transaction => {
    const newTx: Transaction = {
      ...txData,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      sheetId: activeSheetId,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [newTx, ...prev]);

    const isIncome = newTx.type === 'income';
    showToast(
      isIncome ? 'Receita Registrada!' : 'Despesa Registrada!',
      `${newTx.description} (R$ ${newTx.amount.toFixed(2).replace('.', ',')}) salvo com sucesso.`,
      'success'
    );

    return newTx;
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
    showToast('Lançamento Atualizado', `${updatedTx.description} foi atualizado com sucesso.`, 'info');
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Lançamento Excluído', tx ? `${tx.description} foi removido.` : 'Removido com sucesso.', 'warning');
  };

  const quickPayBill = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t))
    );
    showToast('Conta Paga!', 'Status alterado para Pago e saldo recalculado.', 'success');
  };

  const quickReceiveBill = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t))
    );
    showToast('Recebimento Confirmado!', 'Status alterado para Recebido e saldo adicionado.', 'success');
  };

  // Transfer action
  const transferBetweenAccounts = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    description: string,
    date: string,
    paymentMethod: string,
    notes?: string
  ) => {
    const transferTx: Transaction = {
      id: 'tx-trans-' + Date.now(),
      sheetId: activeSheetId,
      type: 'transfer',
      description: description || 'Transferência entre contas',
      amount,
      date,
      categoryId: sheetCategories[0]?.id || 'cat-transfer',
      accountId: fromAccountId,
      toAccountId,
      paymentMethod: paymentMethod || 'bank_transfer',
      status: 'completed',
      notes,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [transferTx, ...prev]);

    const fromAcc = accounts.find((a) => a.id === fromAccountId)?.name || 'Conta Origem';
    const toAcc = accounts.find((a) => a.id === toAccountId)?.name || 'Conta Destino';

    showToast(
      'Transferência Concluída',
      `R$ ${amount.toFixed(2).replace('.', ',')} transferidos de "${fromAcc}" para "${toAcc}".`,
      'success'
    );
  };

  // Bank real-time Open Finance sync
  const syncBankAccounts = async () => {
    setIsBankSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const syncDate = new Date().toISOString();
    setLastBankSyncTime(syncDate);

    setAccounts((prev) =>
      prev.map((acc) =>
        acc.sheetId === activeSheetId && acc.isBankConnected
          ? { ...acc, lastSyncAt: syncDate }
          : acc
      )
    );

    setIsBankSyncing(false);
    showToast(
      'Open Finance Sincronizado',
      'Contas bancárias conectadas atualizadas com sucesso.',
      'success'
    );
  };

  // Account CRUD
  const addAccount = (accData: Omit<Account, 'id' | 'currentBalance' | 'sheetId'>): Account => {
    const newAcc: Account = {
      ...accData,
      id: 'acc-' + Date.now(),
      sheetId: activeSheetId,
      currentBalance: accData.initialBalance,
      lastSyncAt: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    showToast('Conta Criada', `Conta "${newAcc.name}" cadastrada com sucesso.`, 'success');
    return newAcc;
  };

  const updateAccount = (acc: Account) => {
    setAccounts((prev) => prev.map((a) => (a.id === acc.id ? acc : a)));
    showToast('Conta Atualizada', `"${acc.name}" atualizada com sucesso.`, 'info');
  };

  const deleteAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    showToast('Conta Removida', acc ? `"${acc.name}" foi excluída.` : 'Conta excluída.', 'warning');
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id' | 'sheetId'>): Category => {
    const newCat: Category = {
      ...catData,
      id: 'cat-' + Date.now(),
      sheetId: activeSheetId,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast('Categoria Criada', `Categoria "${newCat.name}" adicionada ao Plano de Contas.`, 'success');
    return newCat;
  };

  const updateCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    showToast('Categoria Atualizada', `Categoria "${cat.name}" atualizada.`, 'info');
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Categoria Excluída', cat ? `"${cat.name}" foi excluída.` : 'Categoria excluída.', 'warning');
  };

  // Goal CRUD
  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt' | 'sheetId'>): Goal => {
    const newGoal: Goal = {
      ...goalData,
      id: 'goal-' + Date.now(),
      sheetId: activeSheetId,
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => [...prev, newGoal]);
    showToast('Meta Criada!', `Meta "${newGoal.title}" cadastrada com sucesso.`, 'success');
    return newGoal;
  };

  const updateGoal = (goal: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? goal : g)));
    showToast('Meta Atualizada', `Meta "${goal.title}" atualizada.`, 'info');
  };

  const deleteGoal = (id: string) => {
    const g = goals.find((item) => item.id === id);
    setGoals((prev) => prev.filter((item) => item.id !== id));
    showToast('Meta Excluída', g ? `Meta "${g.title}" foi excluída.` : 'Meta excluída.', 'warning');
  };

  const addGoalProgress = (goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g
      )
    );
    showToast('Aporte Realizado!', `R$ ${amount.toFixed(2).replace('.', ',')} adicionados à meta.`, 'success');
  };

  // Sheets CRUD
  const addSheet = (name: string, description?: string): FinancialSheet => {
    const newSheetId = 'sheet-' + Date.now();
    const newSheet: FinancialSheet = {
      id: newSheetId,
      name,
      description: description || 'Conjunto de dados financeiros',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currency: 'BRL',
    };

    // Populate initial categories for this sheet
    const initialCats = INITIAL_CATEGORIES.map((c) => ({
      ...c,
      id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sheetId: newSheetId,
    }));

    // Create a default clean account for this sheet
    const defaultAcc: Account = {
      id: `acc-${Date.now()}`,
      sheetId: newSheetId,
      name: 'Conta Principal',
      type: 'checking',
      initialBalance: 0,
      currentBalance: 0,
      color: '#3B82F6',
    };

    setSheets((prev) => [...prev, newSheet]);
    setCategories((prev) => [...prev, ...initialCats]);
    setAccounts((prev) => [...prev, defaultAcc]);
    setActiveSheetIdState(newSheet.id);
    showToast('Nova Planilha Criada', `Planilha "${name}" criada e ativada.`, 'success');
    return newSheet;
  };

  const createSheet = (
    name: string,
    description?: string,
    options?:
      | {
          controlType?: SheetControlType;
          currency?: string;
          initialBalance?: number;
          populateDefaultCategories?: boolean;
        }
      | boolean
  ): FinancialSheet => {
    const newSheetId = 'sheet-' + Date.now();
    const isOptionsObj = typeof options === 'object' && options !== null;
    const populateDefaultCategories =
      typeof options === 'boolean'
        ? options
        : isOptionsObj
        ? options.populateDefaultCategories ?? true
        : true;
    const controlType = isOptionsObj ? options.controlType || 'personal' : 'personal';
    const currency = isOptionsObj ? options.currency || 'BRL' : 'BRL';
    const initialBalance = isOptionsObj ? options.initialBalance || 0 : 0;

    const newSheet: FinancialSheet = {
      id: newSheetId,
      name,
      description: description || 'Conjunto de dados financeiros',
      controlType,
      currency,
      initialBalance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (populateDefaultCategories) {
      const initialCats = INITIAL_CATEGORIES.map((c) => ({
        ...c,
        id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        sheetId: newSheetId,
      }));
      setCategories((prev) => [...prev, ...initialCats]);
    }

    const defaultAcc: Account = {
      id: `acc-${Date.now()}`,
      sheetId: newSheetId,
      name: 'Conta Principal',
      type: 'checking',
      initialBalance: initialBalance,
      currentBalance: initialBalance,
      color: '#3B82F6',
    };

    setSheets((prev) => [...prev, newSheet]);
    setAccounts((prev) => [...prev, defaultAcc]);
    setActiveSheetIdState(newSheet.id);
    showToast('Nova Planilha Criada', `Planilha "${name}" criada e ativada.`, 'success');
    return newSheet;
  };

  const duplicateSheet = (sheetId: string, newName?: string): FinancialSheet => {
    const sourceSheet = sheets.find((s) => s.id === sheetId);
    const newSheetId = 'sheet-' + Date.now();
    const newSheet: FinancialSheet = {
      id: newSheetId,
      name: newName || `${sourceSheet?.name || 'Planilha'} (Cópia)`,
      description: sourceSheet?.description,
      controlType: sourceSheet?.controlType,
      currency: sourceSheet?.currency || 'BRL',
      initialBalance: sourceSheet?.initialBalance,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Duplicate accounts
    const sourceAccounts = accounts.filter((a) => a.sheetId === sheetId);
    const accountIdMap: Record<string, string> = {};
    const newAccounts = sourceAccounts.map((a) => {
      const newAccId = 'acc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
      accountIdMap[a.id] = newAccId;
      return { ...a, id: newAccId, sheetId: newSheetId };
    });

    // Duplicate categories
    const sourceCategories = categories.filter((c) => c.sheetId === sheetId);
    const categoryIdMap: Record<string, string> = {};
    const newCategories = sourceCategories.map((c) => {
      const newCatId = 'cat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
      categoryIdMap[c.id] = newCatId;
      return { ...c, id: newCatId, sheetId: newSheetId };
    });

    // Duplicate transactions
    const sourceTransactions = transactions.filter((t) => t.sheetId === sheetId);
    const newTransactions = sourceTransactions.map((t) => ({
      ...t,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      sheetId: newSheetId,
      accountId: accountIdMap[t.accountId] || t.accountId,
      toAccountId: t.toAccountId ? accountIdMap[t.toAccountId] || t.toAccountId : undefined,
      categoryId: categoryIdMap[t.categoryId] || t.categoryId,
    }));

    // Duplicate goals
    const sourceGoals = goals.filter((g) => g.sheetId === sheetId);
    const newGoals = sourceGoals.map((g) => ({
      ...g,
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      sheetId: newSheetId,
    }));

    // Duplicate price analyses
    const sourcePriceAnalyses = priceAnalyses.filter((p) => p.sheetId === sheetId);
    const newPriceAnalyses = sourcePriceAnalyses.map((p) => ({
      ...p,
      id: 'pa-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      sheetId: newSheetId,
    }));

    setSheets((prev) => [...prev, newSheet]);
    setAccounts((prev) => [...prev, ...newAccounts]);
    setCategories((prev) => [...prev, ...newCategories]);
    setTransactions((prev) => [...prev, ...newTransactions]);
    setGoals((prev) => [...prev, ...newGoals]);
    setPriceAnalyses((prev) => [...prev, ...newPriceAnalyses]);
    setActiveSheetIdState(newSheetId);

    showToast('Planilha Duplicada', `"${newSheet.name}" foi duplicada com sucesso.`, 'success');
    return newSheet;
  };

  const updateSheet = (sheet: FinancialSheet) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === sheet.id ? { ...s, ...sheet, updatedAt: new Date().toISOString() } : s))
    );
    showToast('Planilha Atualizada', `"${sheet.name}" salva com sucesso.`, 'info');
  };

  const renameSheet = (sheetId: string, newName: string) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === sheetId ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s))
    );
    showToast('Planilha Renomeada', `Renomeada para "${newName}".`, 'info');
  };

  const deleteSheet = (sheetId: string) => {
    if (sheets.length <= 1) {
      showToast('Ação Não Permitida', 'Você deve manter pelo menos uma planilha ativa.', 'error');
      return;
    }
    const target = sheets.find((s) => s.id === sheetId);
    const remainingSheets = sheets.filter((s) => s.id !== sheetId);
    setSheets(remainingSheets);

    // Clean up orphans
    setAccounts((prev) => prev.filter((a) => a.sheetId !== sheetId));
    setCategories((prev) => prev.filter((c) => c.sheetId !== sheetId));
    setTransactions((prev) => prev.filter((t) => t.sheetId !== sheetId));
    setGoals((prev) => prev.filter((g) => g.sheetId !== sheetId));
    setPriceAnalyses((prev) => prev.filter((p) => p.sheetId !== sheetId));

    if (activeSheetId === sheetId) {
      setActiveSheetIdState(remainingSheets[0].id);
    }
    showToast('Planilha Excluída', target ? `"${target.name}" foi removida.` : 'Excluída com sucesso.', 'warning');
  };

  // Price Analysis CRUD
  const savePriceAnalysis = (
    analysisData: Omit<PriceAnalysisRecord, 'id' | 'createdAt' | 'sheetId'>
  ): PriceAnalysisRecord => {
    const newRecord: PriceAnalysisRecord = {
      ...analysisData,
      id: 'pa-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      sheetId: activeSheetId,
      createdAt: new Date().toISOString(),
    };
    setPriceAnalyses((prev) => [newRecord, ...prev]);
    showToast(
      'Análise de Preço Salva',
      `Análise de "${newRecord.productName}" guardada com sucesso.`,
      'success'
    );
    return newRecord;
  };

  const deletePriceAnalysis = (id: string) => {
    setPriceAnalyses((prev) => prev.filter((p) => p.id !== id));
    showToast('Análise Excluída', 'Registro removido do histórico.', 'info');
  };

  const clearPriceAnalyses = () => {
    setPriceAnalyses((prev) => prev.filter((p) => p.sheetId !== activeSheetId));
    showToast('Histórico Limpo', 'Todas as análises desta planilha foram removidas.', 'info');
  };

  // Setup user account from Onboarding / Welcome modal
  const setupUserAccount = (config: {
    userName: string;
    userEmail: string;
    sheetName: string;
    accountName: string;
    initialBalance: number;
    financialGoal?: string;
  }) => {
    const sheetId = 'sheet-user-1';
    const cleanSheet: FinancialSheet = {
      id: sheetId,
      name: config.sheetName.trim() || 'Minhas Finanças',
      description: 'Planilha principal do usuário',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true,
      currency: 'BRL',
    };

    const mainAccount: Account = {
      id: 'acc-user-1',
      sheetId,
      name: config.accountName.trim() || 'Conta Principal',
      type: 'checking',
      initialBalance: config.initialBalance || 0,
      currentBalance: config.initialBalance || 0,
      color: '#3B82F6',
      isBankConnected: false,
    };

    const userCategories: Category[] = INITIAL_CATEGORIES.map((c, i) => ({
      ...c,
      id: `cat-u-${i}`,
      sheetId,
    }));

    setSheets([cleanSheet]);
    setActiveSheetIdState(sheetId);
    setAccounts([mainAccount]);
    setCategories(userCategories);
    setTransactions([]);
    setGoals([]);
    setPriceAnalyses([]);
    setIsDemoMode(false);
    setUserProfile({
      name: config.userName.trim() || 'Usuário',
      email: config.userEmail.trim(),
      objective: 'Gestão financeira e controle de gastos',
      financialGoal: config.financialGoal?.trim() || 'Organização e controle financeiro',
      monthlyIncomeTarget: 0,
      monthlyExpenseLimit: 0,
      onboardingCompleted: true,
    });
    setOnboardingOpen(false);
    setActiveTab('dashboard');

    showToast(
      'Bem-vindo ao Finance GL Pro!',
      'Sua conta foi configurada com sucesso. Seu ambiente financeiro está pronto.',
      'success'
    );
  };

  const startMySheet = (
    name: string,
    initialAccountName: string,
    initialBalance: number,
    objective: string
  ) => {
    setupUserAccount({
      userName: userProfile.name || 'Usuário',
      userEmail: userProfile.email || '',
      sheetName: name || 'Minhas Finanças',
      accountName: initialAccountName || 'Conta Principal',
      initialBalance: initialBalance || 0,
      financialGoal: objective || 'Organização e controle financeiro',
    });
  };

  const resetToDemoData = () => {
    clearAllData();
  };

  const clearAllData = () => {
    const emptySheet: FinancialSheet = {
      id: 'sheet-default',
      name: 'Minhas Finanças',
      description: 'Planilha principal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault: true,
      currency: 'BRL',
    };
    const emptyAccount: Account = {
      id: 'acc-default',
      sheetId: 'sheet-default',
      name: 'Conta Principal',
      type: 'checking',
      initialBalance: 0,
      currentBalance: 0,
      color: '#3B82F6',
      isBankConnected: false,
    };
    setSheets([emptySheet]);
    setActiveSheetIdState('sheet-default');
    setAccounts([emptyAccount]);
    setCategories(INITIAL_CATEGORIES.map((c) => ({ ...c, sheetId: 'sheet-default' })));
    setTransactions([]);
    setGoals([]);
    setPriceAnalyses([]);
    setIsDemoMode(false);
    setUserProfile({
      name: 'Usuário',
      email: '',
      objective: 'Gestão financeira pessoal e empresarial',
      financialGoal: 'Organização e controle financeiro',
      monthlyIncomeTarget: 0,
      monthlyExpenseLimit: 0,
      onboardingCompleted: true,
    });
    showToast('Planilha Reiniciada', 'Todos os lançamentos foram limpos. Ambiente zerado com sucesso.', 'info');
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...profile }));
    showToast('Perfil Salvo', 'Informações atualizadas com sucesso.', 'success');
  };

  const exportAllDataJSON = (): string => {
    const backupData = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'Finance GL Pro',
      vendor: 'GL Studios',
      userProfile,
      sheets,
      accounts,
      categories,
      transactions,
      goals,
      priceAnalyses,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const exportDatabaseBackup = () => {
    const jsonStr = exportAllDataJSON();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FinanceGLPro_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Backup Exportado!', 'Arquivo JSON salvo com sucesso.', 'success');
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.sheets || !parsed.accounts) {
        throw new Error('Formato de backup inválido.');
      }
      setSheets(parsed.sheets);
      setAccounts(parsed.accounts);
      setCategories(parsed.categories || INITIAL_CATEGORIES);
      setTransactions(parsed.transactions || []);
      setGoals(parsed.goals || []);
      setPriceAnalyses(parsed.priceAnalyses || []);
      if (parsed.userProfile) setUserProfile(parsed.userProfile);
      if (parsed.sheets[0]) setActiveSheetIdState(parsed.sheets[0].id);
      setIsDemoMode(false);

      showToast('Backup Restaurado!', 'Todos os dados foram importados com sucesso.', 'success');
      return true;
    } catch {
      showToast('Falha na Importação', 'O arquivo JSON selecionado não é um backup válido do Finance GL Pro.', 'error');
      return false;
    }
  };

  const importDatabaseBackup = (jsonString: string): boolean => {
    return importDataJSON(jsonString);
  };

  return (
    <FinanceContext.Provider
      value={{
        sheets,
        activeSheetId,
        activeSheet,
        accounts,
        categories,
        transactions,
        goals,
        priceAnalyses,
        userProfile,
        activeTab,
        periodFilter,
        customStartDate,
        customEndDate,
        isDemoMode,
        isBankSyncing,
        lastBankSyncTime,
        notifications,
        unreadNotificationCount,
        toasts,
        globalSearchOpen,
        transactionModalOpen,
        transactionModalType,
        editingTransaction,
        transferModalOpen,
        isOnboardingOpen: onboardingOpen,
        onboardingOpen,

        setActiveTab,
        setPeriodFilter,
        setCustomDateRange,
        setActiveSheetId,
        setGlobalSearchOpen,
        setTransferModalOpen,
        setOnboardingOpen,
        openTransactionModal,
        closeTransactionModal,
        dismissToast,
        showToast,
        markNotificationRead,
        markAllNotificationsRead,

        addTransaction,
        updateTransaction,
        deleteTransaction,
        quickPayBill,
        quickReceiveBill,

        addAccount,
        updateAccount,
        deleteAccount,
        transferBetweenAccounts,
        syncBankAccounts,

        addCategory,
        updateCategory,
        deleteCategory,

        addGoal,
        updateGoal,
        deleteGoal,
        addGoalProgress,

        addSheet,
        createSheet,
        duplicateSheet,
        updateSheet,
        renameSheet,
        deleteSheet,

        savePriceAnalysis,
        deletePriceAnalysis,
        clearPriceAnalyses,

        startMySheet,
        setupUserAccount,
        resetToDemoData,
        clearAllData,
        updateUserProfile,
        exportDatabaseBackup,
        exportAllDataJSON,
        importDatabaseBackup,
        importDataJSON,

        sheetTransactions,
        filteredTransactions,
        sheetAccounts,
        sheetCategories,
        sheetGoals,
        sheetPriceAnalyses,
        totalBalance,
        totalPeriodIncome,
        totalPeriodExpense,
        netPeriodResult,
        prevPeriodIncome,
        prevPeriodExpense,
        incomeGrowthPercent,
        expenseGrowthPercent,
        resultGrowthPercent,
        periodDateRange,
        upcomingPayables,
        overduePayables,
        pendingReceivables,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
