export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'scheduled' | 'overdue';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'bank_slip' | 'transfer' | 'cash' | 'other';

export interface Transaction {
  id: string;
  sheetId: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  accountId: string; // From account
  toAccountId?: string; // For transfers
  paymentMethod: string;
  status: TransactionStatus;
  notes?: string;
  recipientOrClient?: string;
  dueDate?: string; // For payables/receivables
  createdAt: string;
}

export type AccountType = 'checking' | 'savings' | 'investment' | 'wallet' | 'digital' | 'credit_card' | 'cash';

export interface Account {
  id: string;
  sheetId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  bankName?: string;
  bankLogo?: string;
  color?: string;
  isBankConnected?: boolean;
  lastSyncAt?: string;
  accountNumber?: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  sheetId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  monthlyBudget?: number;
  budgetLimit?: number;
}

export interface Goal {
  id: string;
  sheetId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  notes?: string;
  color?: string;
  createdAt?: string;
}

export type SheetControlType = 'personal' | 'family' | 'business' | 'project' | 'other';

export interface FinancialSheet {
  id: string;
  name: string;
  description?: string;
  controlType?: SheetControlType;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  currency: string; // 'BRL' | 'USD' | 'EUR' | etc.
  initialBalance?: number;
}

export interface UserProfile {
  name: string;
  email: string;
  objective?: string;
  financialGoal: string;
  avatarUrl?: string;
  monthlyIncomeTarget?: number;
  monthlyExpenseLimit?: number;
  onboardingCompleted: boolean;
}

export type PeriodFilter = 
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'prev_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom';

export type NavigationTab = 
  | 'dashboard'
  | 'cash_flow'
  | 'income'
  | 'expenses'
  | 'transfers'
  | 'payables'
  | 'receivables'
  | 'reports'
  | 'chart_of_accounts'
  | 'accounts'
  | 'sheets'
  | 'goals'
  | 'price_ai'
  | 'database'
  | 'help'
  | 'settings';

export type PricingObjective = 
  | 'quick_sale' 
  | 'high_margin' 
  | 'competitive' 
  | 'balanced' 
  | 'customer_acquisition';

export type PriceStatus = 'adequate' | 'adjust';

export interface PriceAnalysisRecord {
  id: string;
  sheetId: string;
  productName: string;
  currentPrice: number;
  referencePrice: number;
  objective: PricingObjective | string;
  status: PriceStatus;
  recommendedPrice: number;
  difference: number;
  explanation: string;
  cost?: number;
  targetMargin?: number;
  maxDiscount?: number;
  notes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'alert';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionTab?: NavigationTab;
}
