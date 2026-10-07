import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  Account,
  Category,
  Client,
  CustomCategoryItem,
  FinancialDocument,
  FinancialSheet,
  Goal,
  MonthlyExpenseGoal,
  MonthlyRevenueGoal,
  NavigationTab,
  NotificationItem,
  PaymentMethodItem,
  PeriodFilter,
  PriceAnalysisRecord,
  Project,
  SheetControlType,
  Supplier,
  Transaction,
  UserProfile,
} from '../types';
import {
  DEFAULT_EXPENSE_ITEMS,
  DEFAULT_EXPENSE_METHODS,
  DEFAULT_INCOME_ITEMS,
  DEFAULT_INCOME_METHODS,
  DEFAULT_PROJECTS,
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
  clients: Client[];
  suppliers: Supplier[];
  projects: Project[];
  documents: FinancialDocument[];
  customCategoryItems: CustomCategoryItem[];
  paymentMethodItems: PaymentMethodItem[];
  revenueGoals: MonthlyRevenueGoal[];
  expenseGoals: MonthlyExpenseGoal[];
  selectedYear: number;
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
  isGlobalSearchOpen: boolean;
  transactionModalOpen: boolean;
  isTransactionModalOpen: boolean;
  transactionModalType: 'income' | 'expense';
  editingTransaction: Transaction | null;
  transferModalOpen: boolean;
  isTransferModalOpen: boolean;
  isOnboardingOpen: boolean;
  onboardingOpen: boolean;

  // Setters & Nav
  setActiveTab: (tab: NavigationTab) => void;
  setPeriodFilter: (filter: PeriodFilter) => void;
  setCustomDateRange: (start: string, end: string) => void;
  setActiveSheetId: (sheetId: string) => void;
  setSelectedYear: (year: number) => void;
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
    arg4: string,
    arg5?: string,
    paymentMethod?: string,
    notes?: string
  ) => void;
  syncBankAccounts: () => Promise<void>;

  addCategory: (cat: Omit<Category, 'id' | 'sheetId'>) => Category;
  updateCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'sheetId'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;

  // Suppliers
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'sheetId'>) => Supplier;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;

  // Projects
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'sheetId'>) => Project;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;

  // Documents
  addDocument: (doc: Omit<FinancialDocument, 'id' | 'createdAt' | 'sheetId'>) => FinancialDocument;
  updateDocument: (doc: FinancialDocument) => void;
  deleteDocument: (id: string) => void;

  // Custom Category Items (Produtos 1-9, Serviços 1-9...)
  updateCategoryItemName: (id: string, name: string) => void;
  addCategoryItem: (group: string, name: string) => CustomCategoryItem;
  deleteCategoryItem: (id: string) => void;
  resetCategoryItemsToDefault: () => void;

  // Payment Methods
  updatePaymentMethodName: (id: string, name: string) => void;
  addPaymentMethod: (type: 'income' | 'expense', name: string) => PaymentMethodItem;
  deletePaymentMethod: (id: string) => void;

  // Revenue & Expense Goals
  saveMonthlyRevenueGoal: (goal: Omit<MonthlyRevenueGoal, 'id' | 'sheetId'>) => void;
  saveMonthlyExpenseGoal: (goal: Omit<MonthlyExpenseGoal, 'id' | 'sheetId'>) => void;
  updateSheetStartDate: (sheetId: string, startDate: string) => void;

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
          startDate?: string;
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
  sheetClients: Client[];
  sheetSuppliers: Supplier[];
  sheetProjects: Project[];
  sheetDocuments: FinancialDocument[];
  sheetCategoryItems: CustomCategoryItem[];
  sheetPaymentMethods: PaymentMethodItem[];
  sheetRevenueGoals: MonthlyRevenueGoal[];
  sheetExpenseGoals: MonthlyExpenseGoal[];
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
  CLIENTS: 'finance_gl_pro_clients_v2',
  SUPPLIERS: 'finance_gl_pro_suppliers_v2',
  PROJECTS: 'finance_gl_pro_projects_v2',
  DOCUMENTS: 'finance_gl_pro_documents_v2',
  CUSTOM_ITEMS: 'finance_gl_pro_custom_items_v2',
  PAYMENT_METHODS: 'finance_gl_pro_payment_methods_v2',
  REVENUE_GOALS: 'finance_gl_pro_revenue_goals_v2',
  EXPENSE_GOALS: 'finance_gl_pro_expense_goals_v2',
  SELECTED_YEAR: 'finance_gl_pro_selected_year_v2',
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

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (saved) return JSON.parse(saved);
    return DEFAULT_PROJECTS.map((p) => ({
      ...p,
      sheetId: 'sheet-default',
      createdAt: new Date().toISOString(),
    }));
  });

  const [documents, setDocuments] = useState<FinancialDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [customCategoryItems, setCustomCategoryItems] = useState<CustomCategoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_ITEMS);
    if (saved) return JSON.parse(saved);
    return [
      ...DEFAULT_INCOME_ITEMS.map((item) => ({ ...item, sheetId: 'sheet-default' })),
      ...DEFAULT_EXPENSE_ITEMS.map((item) => ({ ...item, sheetId: 'sheet-default' })),
    ];
  });

  const [paymentMethodItems, setPaymentMethodItems] = useState<PaymentMethodItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
    if (saved) return JSON.parse(saved);
    return [
      ...DEFAULT_INCOME_METHODS.map((name, i) => ({
        id: `pmi-inc-${i}`,
        sheetId: 'sheet-default',
        type: 'income' as const,
        name,
      })),
      ...DEFAULT_EXPENSE_METHODS.map((name, i) => ({
        id: `pmi-exp-${i}`,
        sheetId: 'sheet-default',
        type: 'expense' as const,
        name,
      })),
    ];
  });

  const [revenueGoals, setRevenueGoals] = useState<MonthlyRevenueGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REVENUE_GOALS);
    return saved ? JSON.parse(saved) : [];
  });

  const [expenseGoals, setExpenseGoals] = useState<MonthlyExpenseGoal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSE_GOALS);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedYear, setSelectedYearState] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_YEAR);
    return saved ? parseInt(saved, 10) : new Date().getFullYear();
  });

  const setSelectedYear = (yr: number) => {
    setSelectedYearState(yr);
    localStorage.setItem(STORAGE_KEYS.SELECTED_YEAR, String(yr));
  };

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
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ITEMS, JSON.stringify(customCategoryItems));
  }, [customCategoryItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethodItems));
  }, [paymentMethodItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REVENUE_GOALS, JSON.stringify(revenueGoals));
  }, [revenueGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSE_GOALS, JSON.stringify(expenseGoals));
  }, [expenseGoals]);

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
    const completedTxs = transactions.filter(
      (tx) => tx.sheetId === activeSheetId && tx.status === 'completed'
    );
    return accounts
      .filter((a) => a.sheetId === activeSheetId)
      .map((account) => {
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

        return {
          ...account,
          currentBalance: calculatedBalance,
        };
      });
  }, [accounts, transactions, activeSheetId]);

  const sheetCategories = useMemo(() => {
    return categories.filter((c) => c.sheetId === activeSheetId);
  }, [categories, activeSheetId]);

  const sheetGoals = useMemo(() => {
    return goals.filter((g) => g.sheetId === activeSheetId);
  }, [goals, activeSheetId]);

  const sheetPriceAnalyses = useMemo(() => {
    return priceAnalyses.filter((p) => p.sheetId === activeSheetId);
  }, [priceAnalyses, activeSheetId]);

  const sheetClients = useMemo(() => {
    return clients.filter((c) => c.sheetId === activeSheetId);
  }, [clients, activeSheetId]);

  const sheetSuppliers = useMemo(() => {
    return suppliers.filter((s) => s.sheetId === activeSheetId);
  }, [suppliers, activeSheetId]);

  const sheetProjects = useMemo(() => {
    return projects.filter((p) => p.sheetId === activeSheetId);
  }, [projects, activeSheetId]);

  const sheetDocuments = useMemo(() => {
    return documents.filter((d) => d.sheetId === activeSheetId);
  }, [documents, activeSheetId]);

  const sheetCategoryItems = useMemo(() => {
    return customCategoryItems.filter((i) => i.sheetId === activeSheetId);
  }, [customCategoryItems, activeSheetId]);

  const sheetPaymentMethods = useMemo(() => {
    return paymentMethodItems.filter((m) => m.sheetId === activeSheetId);
  }, [paymentMethodItems, activeSheetId]);

  const sheetRevenueGoals = useMemo(() => {
    return revenueGoals.filter((g) => g.sheetId === activeSheetId && g.year === selectedYear);
  }, [revenueGoals, activeSheetId, selectedYear]);

  const sheetExpenseGoals = useMemo(() => {
    return expenseGoals.filter((g) => g.sheetId === activeSheetId && g.year === selectedYear);
  }, [expenseGoals, activeSheetId, selectedYear]);

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
    return sheetAccounts.reduce((acc, account) => acc + account.currentBalance, 0);
  }, [sheetAccounts]);

  // Totals for current period (Realized / Efetivado)
  const totalPeriodIncome = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'income' && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const totalPeriodExpense = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'expense' && tx.status === 'completed')
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
      isIncome ? 'Receita Adicionada' : 'Despesa Adicionada',
      isIncome ? 'Receita adicionada com sucesso.' : 'Despesa adicionada com sucesso.',
      'success'
    );

    return newTx;
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updatedTx.id ? updatedTx : t)));
    const isIncome = updatedTx.type === 'income';
    showToast(
      'Lançamento Atualizado',
      isIncome ? 'Receita atualizada com sucesso.' : 'Despesa atualizada com sucesso.',
      'info'
    );
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast(
      'Lançamento Excluído',
      tx?.type === 'income' ? 'Receita excluída com sucesso.' : 'Despesa excluída com sucesso.',
      'warning'
    );
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
    arg4: string,
    arg5?: string,
    paymentMethod?: string,
    notes?: string
  ) => {
    const isDate = (s?: string) => Boolean(s && /^\d{4}-\d{2}-\d{2}$/.test(s));
    const date = isDate(arg4)
      ? arg4
      : isDate(arg5)
      ? arg5!
      : new Date().toISOString().slice(0, 10);
    const description = isDate(arg4)
      ? (arg5 || 'Transferência entre contas')
      : (arg4 || 'Transferência entre contas');
    const method = paymentMethod || 'transfer';

    const transferTx: Transaction = {
      id: 'tx-trans-' + Date.now(),
      sheetId: activeSheetId,
      type: 'transfer',
      description,
      amount,
      date,
      categoryId: sheetCategories[0]?.id || 'cat-transfer',
      accountId: fromAccountId,
      toAccountId,
      paymentMethod: method,
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

  // Client CRUD
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'sheetId'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: 'cli-' + Date.now(),
      sheetId: activeSheetId,
      code: clientData.code || `CLI-${String(sheetClients.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    showToast('Cliente Cadastrado', `Cliente "${newClient.name}" adicionado com sucesso.`, 'success');
    return newClient;
  };

  const updateClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    showToast('Cliente Atualizado', `Cliente "${client.name}" atualizado.`, 'info');
  };

  const deleteClient = (id: string) => {
    const cl = clients.find((c) => c.id === id);
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('Cliente Removido', cl ? `"${cl.name}" foi removido.` : 'Cliente removido.', 'warning');
  };

  // Supplier CRUD
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'sheetId'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'sup-' + Date.now(),
      sheetId: activeSheetId,
      code: supplierData.code || `FOR-${String(sheetSuppliers.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    showToast('Fornecedor Cadastrado', `Fornecedor "${newSupplier.name}" adicionado com sucesso.`, 'success');
    return newSupplier;
  };

  const updateSupplier = (supplier: Supplier) => {
    setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? supplier : s)));
    showToast('Fornecedor Atualizado', `Fornecedor "${supplier.name}" atualizado.`, 'info');
  };

  const deleteSupplier = (id: string) => {
    const s = suppliers.find((item) => item.id === id);
    setSuppliers((prev) => prev.filter((item) => item.id !== id));
    showToast('Fornecedor Removido', s ? `"${s.name}" foi removido.` : 'Fornecedor removido.', 'warning');
  };

  // Project CRUD
  const addProject = (projectData: Omit<Project, 'id' | 'createdAt' | 'sheetId'>): Project => {
    const newProject: Project = {
      ...projectData,
      id: 'prj-' + Date.now(),
      sheetId: activeSheetId,
      code: projectData.code || `PRJ-${String(sheetProjects.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    showToast('Projeto Criado', `Projeto "${newProject.name}" cadastrado.`, 'success');
    return newProject;
  };

  const updateProject = (project: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
    showToast('Projeto Atualizado', `Projeto "${project.name}" atualizado.`, 'info');
  };

  const deleteProject = (id: string) => {
    const p = projects.find((item) => item.id === id);
    setProjects((prev) => prev.filter((item) => item.id !== id));
    showToast('Projeto Removido', p ? `"${p.name}" foi removido.` : 'Projeto removido.', 'warning');
  };

  // Document CRUD
  const addDocument = (docData: Omit<FinancialDocument, 'id' | 'createdAt' | 'sheetId'>): FinancialDocument => {
    const newDoc: FinancialDocument = {
      ...docData,
      id: 'doc-' + Date.now(),
      sheetId: activeSheetId,
      code: docData.code || `DOC-${String(sheetDocuments.length + 1).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    showToast('Documento Registrado', `Documento "${newDoc.code}" cadastrado com sucesso.`, 'success');
    return newDoc;
  };

  const updateDocument = (doc: FinancialDocument) => {
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
    showToast('Documento Atualizado', `Documento "${doc.code}" atualizado.`, 'info');
  };

  const deleteDocument = (id: string) => {
    const d = documents.find((item) => item.id === id);
    setDocuments((prev) => prev.filter((item) => item.id !== id));
    showToast('Documento Removido', d ? `"${d.code}" foi removido.` : 'Documento removido.', 'warning');
  };

  // Custom Category Items CRUD
  const updateCategoryItemName = (id: string, name: string) => {
    setCustomCategoryItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
    showToast('Item Salvo', `Atualizado para "${name}".`, 'success');
  };

  const addCategoryItem = (group: string, name: string): CustomCategoryItem => {
    const newItem: CustomCategoryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sheetId: activeSheetId,
      group,
      name,
    };
    setCustomCategoryItems((prev) => [...prev, newItem]);
    showToast('Item Adicionado', `"${name}" adicionado com sucesso.`, 'success');
    return newItem;
  };

  const deleteCategoryItem = (id: string) => {
    setCustomCategoryItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item Removido', 'Item excluído.', 'info');
  };

  const resetCategoryItemsToDefault = () => {
    const defaults: CustomCategoryItem[] = [
      ...DEFAULT_INCOME_ITEMS.map((item) => ({ ...item, sheetId: activeSheetId })),
      ...DEFAULT_EXPENSE_ITEMS.map((item) => ({ ...item, sheetId: activeSheetId })),
    ];
    setCustomCategoryItems((prev) => [
      ...prev.filter((i) => i.sheetId !== activeSheetId),
      ...defaults,
    ]);
    showToast('Sugestões Restauradas', 'As opções padrões foram redefinidas.', 'info');
  };

  // Payment Methods CRUD
  const updatePaymentMethodName = (id: string, name: string) => {
    setPaymentMethodItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name } : m))
    );
    showToast('Método Atualizado', `Atualizado para "${name}".`, 'success');
  };

  const addPaymentMethod = (type: 'income' | 'expense', name: string): PaymentMethodItem => {
    const newMethod: PaymentMethodItem = {
      id: `pmi-${Date.now()}`,
      sheetId: activeSheetId,
      type,
      name,
    };
    setPaymentMethodItems((prev) => [...prev, newMethod]);
    showToast('Método Adicionado', `"${name}" cadastrado com sucesso.`, 'success');
    return newMethod;
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethodItems((prev) => prev.filter((m) => m.id !== id));
    showToast('Método Removido', 'Forma de pagamento removida.', 'info');
  };

  // Revenue Goals CRUD
  const saveMonthlyRevenueGoal = (goalData: Omit<MonthlyRevenueGoal, 'id' | 'sheetId'>) => {
    setRevenueGoals((prev) => {
      const existingIdx = prev.findIndex(
        (g) => g.sheetId === activeSheetId && g.year === goalData.year && g.month === goalData.month
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...goalData,
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...goalData,
          id: `rev-goal-${Date.now()}`,
          sheetId: activeSheetId,
        },
      ];
    });
    showToast('Meta de Receita Salva', 'Valores orçados atualizados com sucesso.', 'success');
  };

  // Expense Goals CRUD
  const saveMonthlyExpenseGoal = (goalData: Omit<MonthlyExpenseGoal, 'id' | 'sheetId'>) => {
    setExpenseGoals((prev) => {
      const existingIdx = prev.findIndex(
        (g) => g.sheetId === activeSheetId && g.year === goalData.year && g.month === goalData.month
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...goalData,
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...goalData,
          id: `exp-goal-${Date.now()}`,
          sheetId: activeSheetId,
        },
      ];
    });
    showToast('Meta de Gastos Salva', 'Valores orçados atualizados com sucesso.', 'success');
  };

  // Sheet Start Date
  const updateSheetStartDate = (sheetId: string, startDate: string) => {
    setSheets((prev) =>
      prev.map((s) => (s.id === sheetId ? { ...s, startDate, updatedAt: new Date().toISOString() } : s))
    );
    showToast('Data Inicial Salva', `Controle iniciado em ${startDate}.`, 'success');
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

    // Duplicate clients, suppliers, projects, documents, custom items, payment methods, revenue & expense goals
    const newClients = clients
      .filter((c) => c.sheetId === sheetId)
      .map((c) => ({ ...c, id: 'cli-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5), sheetId: newSheetId }));

    const newSuppliers = suppliers
      .filter((s) => s.sheetId === sheetId)
      .map((s) => ({ ...s, id: 'sup-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5), sheetId: newSheetId }));

    const newProjects = projects
      .filter((p) => p.sheetId === sheetId)
      .map((p) => ({ ...p, id: 'prj-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5), sheetId: newSheetId }));

    const newDocuments = documents
      .filter((d) => d.sheetId === sheetId)
      .map((d) => ({ ...d, id: 'doc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5), sheetId: newSheetId }));

    const newCustomItems = customCategoryItems
      .filter((ci) => ci.sheetId === sheetId)
      .map((ci) => ({ ...ci, id: 'ci-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5), sheetId: newSheetId }));

    const newPaymentMethods = paymentMethodItems
      .filter((pm) => pm.sheetId === sheetId)
      .map((pm) => ({ ...pm, id: 'pm-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5), sheetId: newSheetId }));

    const newRevGoals = revenueGoals
      .filter((rg) => rg.sheetId === sheetId)
      .map((rg) => ({ ...rg, id: 'rg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5), sheetId: newSheetId }));

    const newExpGoals = expenseGoals
      .filter((eg) => eg.sheetId === sheetId)
      .map((eg) => ({ ...eg, id: 'eg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5), sheetId: newSheetId }));

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
    setClients((prev) => [...prev, ...newClients]);
    setSuppliers((prev) => [...prev, ...newSuppliers]);
    setProjects((prev) => [...prev, ...newProjects]);
    setDocuments((prev) => [...prev, ...newDocuments]);
    setCustomCategoryItems((prev) => [...prev, ...newCustomItems]);
    setPaymentMethodItems((prev) => [...prev, ...newPaymentMethods]);
    setRevenueGoals((prev) => [...prev, ...newRevGoals]);
    setExpenseGoals((prev) => [...prev, ...newExpGoals]);
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
    setClients((prev) => prev.filter((c) => c.sheetId !== sheetId));
    setSuppliers((prev) => prev.filter((s) => s.sheetId !== sheetId));
    setProjects((prev) => prev.filter((p) => p.sheetId !== sheetId));
    setDocuments((prev) => prev.filter((d) => d.sheetId !== sheetId));
    setCustomCategoryItems((prev) => prev.filter((i) => i.sheetId !== sheetId));
    setPaymentMethodItems((prev) => prev.filter((m) => m.sheetId !== sheetId));
    setRevenueGoals((prev) => prev.filter((rg) => rg.sheetId !== sheetId));
    setExpenseGoals((prev) => prev.filter((eg) => eg.sheetId !== sheetId));
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
      version: '3.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'Finance GL Pro',
      vendor: 'GL Studios',
      userProfile,
      sheets,
      accounts,
      categories,
      transactions,
      goals,
      clients,
      suppliers,
      projects,
      documents,
      customCategoryItems,
      paymentMethodItems,
      revenueGoals,
      expenseGoals,
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
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.documents) setDocuments(parsed.documents);
      if (parsed.customCategoryItems) setCustomCategoryItems(parsed.customCategoryItems);
      if (parsed.paymentMethodItems) setPaymentMethodItems(parsed.paymentMethodItems);
      if (parsed.revenueGoals) setRevenueGoals(parsed.revenueGoals);
      if (parsed.expenseGoals) setExpenseGoals(parsed.expenseGoals);
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
        clients,
        suppliers,
        projects,
        documents,
        customCategoryItems,
        paymentMethodItems,
        revenueGoals,
        expenseGoals,
        selectedYear,
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
        isGlobalSearchOpen: globalSearchOpen,
        transactionModalOpen,
        isTransactionModalOpen: transactionModalOpen,
        transactionModalType,
        editingTransaction,
        transferModalOpen,
        isTransferModalOpen: transferModalOpen,
        isOnboardingOpen: onboardingOpen,
        onboardingOpen,

        setActiveTab,
        setPeriodFilter,
        setCustomDateRange,
        setActiveSheetId,
        setSelectedYear,
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

        addClient,
        updateClient,
        deleteClient,

        addSupplier,
        updateSupplier,
        deleteSupplier,

        addProject,
        updateProject,
        deleteProject,

        addDocument,
        updateDocument,
        deleteDocument,

        updateCategoryItemName,
        addCategoryItem,
        deleteCategoryItem,
        resetCategoryItemsToDefault,

        updatePaymentMethodName,
        addPaymentMethod,
        deletePaymentMethod,

        saveMonthlyRevenueGoal,
        saveMonthlyExpenseGoal,
        updateSheetStartDate,

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
        sheetClients,
        sheetSuppliers,
        sheetProjects,
        sheetDocuments,
        sheetCategoryItems,
        sheetPaymentMethods,
        sheetRevenueGoals,
        sheetExpenseGoals,
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
