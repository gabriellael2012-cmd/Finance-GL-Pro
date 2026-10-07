export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionStatus = 'completed' | 'pending' | 'scheduled' | 'overdue';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'bank_slip' | 'transfer' | 'cash' | 'other' | string;

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
  clientId?: string;
  supplierId?: string;
  projectId?: string;
  documentId?: string;
  branch?: string;
  dueDate?: string; // For payables/receivables
  createdAt: string;
}

export type AccountType = 'checking' | 'savings' | 'investment' | 'wallet' | 'digital' | 'credit_card' | 'cash' | 'caixinha' | 'other';

export interface Account {
  id: string;
  sheetId: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  initialBalanceDate?: string;
  bankName?: string;
  bankLogo?: string;
  color?: string;
  isBankConnected?: boolean;
  lastSyncAt?: string;
  accountNumber?: string;
  notes?: string;
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
  group?: string; // 'products', 'services', 'occupancy', etc.
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
  startDate?: string; // Data em que o usuário começou o controle financeiro
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
  | 'initial_balances'
  | 'registrations'
  | 'income_types'
  | 'expense_types'
  | 'income_methods'
  | 'expense_methods'
  | 'clients'
  | 'suppliers'
  | 'projects_docs'
  | 'revenue_goals'
  | 'expense_goals'
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
  | 'get_started'
  | 'help'
  | 'settings';

export interface Client {
  id: string;
  sheetId: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  contactName?: string;
  type: 'PF' | 'PJ';
  document?: string; // CPF ou CNPJ
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  sheetId: string;
  code: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone1?: string;
  email?: string;
  contactName?: string;
  type: 'PF' | 'PJ';
  document?: string; // CNPJ ou CPF
  notes?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  sheetId: string;
  code: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'paused';
  branch?: string; // Filial 1, Filial 2, etc. ou Consolidado
  startDate?: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
}

export type DocumentType = 
  | 'boleto'
  | 'invoice'
  | 'tax_invoice'
  | 'transfer'
  | 'direct_debit'
  | 'pix'
  | 'receipt'
  | 'contract'
  | 'other';

export interface FinancialDocument {
  id: string;
  sheetId: string;
  code: string; // DOC-0001
  type: DocumentType;
  number?: string;
  projectId?: string;
  clientId?: string;
  supplierId?: string;
  date: string;
  amount: number;
  accountId?: string;
  status: 'pending' | 'paid' | 'received' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface CustomCategoryItem {
  id: string;
  sheetId: string;
  group: string; // 'products', 'services', 'other_income', 'financial_income', 'variable_costs', etc.
  name: string;
  code?: string;
}

export interface PaymentMethodItem {
  id: string;
  sheetId: string;
  type: 'income' | 'expense';
  name: string;
  code?: string;
}

export interface MonthlyRevenueGoal {
  id: string;
  sheetId: string;
  year: number;
  month: number; // 1 a 12
  productsBudget: number;
  servicesBudget: number;
  otherBudget: number;
  financialBudget: number;
}

export interface MonthlyExpenseGoal {
  id: string;
  sheetId: string;
  year: number;
  month: number; // 1 a 12
  costsBudget: number;
  expensesBudget: number;
}

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
