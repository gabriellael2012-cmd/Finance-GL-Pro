import { Account, Category, FinancialSheet, Goal, Transaction, UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Usuário',
  email: '',
  objective: 'Gestão financeira com precisão e controle de patrimônio',
  financialGoal: 'Organização e controle financeiro',
  avatarUrl: undefined,
  monthlyIncomeTarget: 0,
  monthlyExpenseLimit: 0,
  onboardingCompleted: false,
};

export const INITIAL_SHEETS: FinancialSheet[] = [
  {
    id: 'sheet-default',
    name: 'Minhas Finanças',
    description: 'Planilha principal de controle financeiro',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDefault: true,
    currency: 'BRL',
  },
];

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc-default',
    sheetId: 'sheet-default',
    name: 'Conta Principal',
    type: 'checking',
    initialBalance: 0,
    currentBalance: 0,
    color: '#3B82F6',
    isBankConnected: false,
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Categorias padrão de Receita
  { id: 'cat-inc-salario', sheetId: 'sheet-default', name: 'Salário & Remuneração', type: 'income', icon: 'Briefcase', color: '#3B82F6' },
  { id: 'cat-inc-servicos', sheetId: 'sheet-default', name: 'Prestação de Serviços', type: 'income', icon: 'Wrench', color: '#10B981' },
  { id: 'cat-inc-vendas', sheetId: 'sheet-default', name: 'Vendas & Comércio', type: 'income', icon: 'ShoppingBag', color: '#8B5CF6' },
  { id: 'cat-inc-freelance', sheetId: 'sheet-default', name: 'Freelance & Consultoria', type: 'income', icon: 'Laptop', color: '#06B6D4' },
  { id: 'cat-inc-investimentos', sheetId: 'sheet-default', name: 'Rendimentos & Investimentos', type: 'income', icon: 'TrendingUp', color: '#EC4899' },
  { id: 'cat-inc-outros', sheetId: 'sheet-default', name: 'Outras Receitas', type: 'income', icon: 'PlusCircle', color: '#64748B' },

  // Categorias padrão de Despesa
  { id: 'cat-exp-alimentacao', sheetId: 'sheet-default', name: 'Alimentação & Mercado', type: 'expense', icon: 'Utensils', color: '#EF4444' },
  { id: 'cat-exp-moradia', sheetId: 'sheet-default', name: 'Moradia & Habitação', type: 'expense', icon: 'Home', color: '#F97316' },
  { id: 'cat-exp-transporte', sheetId: 'sheet-default', name: 'Transporte & Veículos', type: 'expense', icon: 'Car', color: '#F59E0B' },
  { id: 'cat-exp-saude', sheetId: 'sheet-default', name: 'Saúde & Bem-estar', type: 'expense', icon: 'HeartPulse', color: '#10B981' },
  { id: 'cat-exp-educacao', sheetId: 'sheet-default', name: 'Educação & Estudos', type: 'expense', icon: 'GraduationCap', color: '#3B82F6' },
  { id: 'cat-exp-lazer', sheetId: 'sheet-default', name: 'Lazer & Viagens', type: 'expense', icon: 'Sparkles', color: '#8B5CF6' },
  { id: 'cat-exp-assinaturas', sheetId: 'sheet-default', name: 'Assinaturas & Serviços', type: 'expense', icon: 'Tv', color: '#06B6D4' },
  { id: 'cat-exp-impostos', sheetId: 'sheet-default', name: 'Impostos & Tributos', type: 'expense', icon: 'FileText', color: '#64748B' },
  { id: 'cat-exp-outros', sheetId: 'sheet-default', name: 'Outras Despesas', type: 'expense', icon: 'Tag', color: '#94A3B8' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_GOALS: Goal[] = [];
