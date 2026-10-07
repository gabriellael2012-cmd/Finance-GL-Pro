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

export const INITIAL_CLIENTS: any[] = [];
export const INITIAL_SUPPLIERS: any[] = [];
export const INITIAL_DOCUMENTS: any[] = [];

export const DEFAULT_INCOME_ITEMS = [
  // Vendas de produtos (sugestões editáveis 1 a 9)
  { id: 'item-prod-1', group: 'products', name: 'Produto 1' },
  { id: 'item-prod-2', group: 'products', name: 'Produto 2' },
  { id: 'item-prod-3', group: 'products', name: 'Produto 3' },
  { id: 'item-prod-4', group: 'products', name: 'Produto 4' },
  { id: 'item-prod-5', group: 'products', name: 'Produto 5' },
  { id: 'item-prod-6', group: 'products', name: 'Produto 6' },
  { id: 'item-prod-7', group: 'products', name: 'Produto 7' },
  { id: 'item-prod-8', group: 'products', name: 'Produto 8' },
  { id: 'item-prod-9', group: 'products', name: 'Produto 9' },

  // Serviços (sugestões editáveis 1 a 9)
  { id: 'item-serv-1', group: 'services', name: 'Serviço 1' },
  { id: 'item-serv-2', group: 'services', name: 'Serviço 2' },
  { id: 'item-serv-3', group: 'services', name: 'Serviço 3' },
  { id: 'item-serv-4', group: 'services', name: 'Serviço 4' },
  { id: 'item-serv-5', group: 'services', name: 'Serviço 5' },
  { id: 'item-serv-6', group: 'services', name: 'Serviço 6' },
  { id: 'item-serv-7', group: 'services', name: 'Serviço 7' },
  { id: 'item-serv-8', group: 'services', name: 'Serviço 8' },
  { id: 'item-serv-9', group: 'services', name: 'Serviço 9' },

  // Outras receitas (sugestões editáveis 1 a 9)
  { id: 'item-out-1', group: 'other_income', name: 'Outras receitas 1' },
  { id: 'item-out-2', group: 'other_income', name: 'Outras receitas 2' },
  { id: 'item-out-3', group: 'other_income', name: 'Outras receitas 3' },
  { id: 'item-out-4', group: 'other_income', name: 'Outras receitas 4' },
  { id: 'item-out-5', group: 'other_income', name: 'Outras receitas 5' },
  { id: 'item-out-6', group: 'other_income', name: 'Outras receitas 6' },
  { id: 'item-out-7', group: 'other_income', name: 'Outras receitas 7' },
  { id: 'item-out-8', group: 'other_income', name: 'Outras receitas 8' },
  { id: 'item-out-9', group: 'other_income', name: 'Outras receitas 9' },

  // Receitas financeiras
  { id: 'item-fin-1', group: 'financial_income', name: 'Juros de aplicações' },
  { id: 'item-fin-2', group: 'financial_income', name: 'Rendimentos' },
  { id: 'item-fin-3', group: 'financial_income', name: 'Juros recebidos' },
  { id: 'item-fin-4', group: 'financial_income', name: 'Rendimentos de investimentos' },
  { id: 'item-fin-5', group: 'financial_income', name: 'Dividendos & Proventos' },
  { id: 'item-fin-6', group: 'financial_income', name: 'Variação cambial positiva' },
  { id: 'item-fin-7', group: 'financial_income', name: 'Bonificações financeiras' },
  { id: 'item-fin-8', group: 'financial_income', name: 'Resgates com lucro' },
  { id: 'item-fin-9', group: 'financial_income', name: 'Outras receitas financeiras' },
];

export const DEFAULT_EXPENSE_ITEMS = [
  // Custos variáveis
  { id: 'item-cv-1', group: 'variable_costs', name: 'Mercadoria para revenda' },
  { id: 'item-cv-2', group: 'variable_costs', name: 'Matéria-prima' },
  { id: 'item-cv-3', group: 'variable_costs', name: 'Insumos' },
  { id: 'item-cv-4', group: 'variable_costs', name: 'Embalagens' },
  { id: 'item-cv-5', group: 'variable_costs', name: 'Fretes' },
  { id: 'item-cv-6', group: 'variable_costs', name: 'Comissões de vendas' },
  { id: 'item-cv-7', group: 'variable_costs', name: 'Taxas de marketplaces' },
  { id: 'item-cv-8', group: 'variable_costs', name: 'Terceirização de produção' },
  { id: 'item-cv-9', group: 'variable_costs', name: 'Outros custos variáveis' },

  // Ocupação
  { id: 'item-oc-1', group: 'occupancy', name: 'Aluguel' },
  { id: 'item-oc-2', group: 'occupancy', name: 'Água' },
  { id: 'item-oc-3', group: 'occupancy', name: 'Condomínio' },
  { id: 'item-oc-4', group: 'occupancy', name: 'IPTU' },
  { id: 'item-oc-5', group: 'occupancy', name: 'Energia elétrica' },
  { id: 'item-oc-6', group: 'occupancy', name: 'Internet & Telefonia' },
  { id: 'item-oc-7', group: 'occupancy', name: 'Limpeza & Higiene' },
  { id: 'item-oc-8', group: 'occupancy', name: 'Segurança & Monitoramento' },
  { id: 'item-oc-9', group: 'occupancy', name: 'Manutenção predial' },

  // Serviços
  { id: 'item-se-1', group: 'services_expense', name: 'Contabilidade' },
  { id: 'item-se-2', group: 'services_expense', name: 'Publicidade' },
  { id: 'item-se-3', group: 'services_expense', name: 'Propaganda' },
  { id: 'item-se-4', group: 'services_expense', name: 'Serviços jurídicos' },
  { id: 'item-se-5', group: 'services_expense', name: 'Web Design' },
  { id: 'item-se-6', group: 'services_expense', name: 'Design gráfico' },
  { id: 'item-se-7', group: 'services_expense', name: 'Serviços de TI & Hospedagem' },
  { id: 'item-se-8', group: 'services_expense', name: 'Consultoria empresarial' },
  { id: 'item-se-9', group: 'services_expense', name: 'Outros serviços' },

  // Pessoal
  { id: 'item-pe-1', group: 'personnel', name: 'Pró-labore' },
  { id: 'item-pe-2', group: 'personnel', name: 'Folha de pagamento (Salários)' },
  { id: 'item-pe-3', group: 'personnel', name: 'Vale-transporte' },
  { id: 'item-pe-4', group: 'personnel', name: 'Vale-refeição / Alimentação' },
  { id: 'item-pe-5', group: 'personnel', name: 'Assistência médica' },
  { id: 'item-pe-6', group: 'personnel', name: 'Assistência odontológica' },
  { id: 'item-pe-7', group: 'personnel', name: 'INSS' },
  { id: 'item-pe-8', group: 'personnel', name: 'FGTS' },
  { id: 'item-pe-9', group: 'personnel', name: 'Outros benefícios' },

  // Deduções sobre Vendas
  { id: 'item-dv-1', group: 'sales_deductions', name: 'DAS (Simples Nacional)' },
  { id: 'item-dv-2', group: 'sales_deductions', name: 'PIS sobre vendas' },
  { id: 'item-dv-3', group: 'sales_deductions', name: 'COFINS sobre vendas' },
  { id: 'item-dv-4', group: 'sales_deductions', name: 'ISS sobre serviços' },
  { id: 'item-dv-5', group: 'sales_deductions', name: 'ICMS sobre vendas' },
  { id: 'item-dv-6', group: 'sales_deductions', name: 'IPI' },
  { id: 'item-dv-7', group: 'sales_deductions', name: 'Devoluções de mercadorias' },
  { id: 'item-dv-8', group: 'sales_deductions', name: 'Descontos concedidos' },
  { id: 'item-dv-9', group: 'sales_deductions', name: 'Outras deduções' },

  // Impostos
  { id: 'item-im-1', group: 'taxes', name: 'IRPJ' },
  { id: 'item-im-2', group: 'taxes', name: 'CSLL' },
  { id: 'item-im-3', group: 'taxes', name: 'Taxas governamentais & Alvarás' },
  { id: 'item-im-4', group: 'taxes', name: 'Taxa de fiscalização' },
  { id: 'item-im-5', group: 'taxes', name: 'IPVA' },
  { id: 'item-im-6', group: 'taxes', name: 'Certidões & Cartórios' },
  { id: 'item-im-7', group: 'taxes', name: 'Taxa de incêndio' },
  { id: 'item-im-8', group: 'taxes', name: 'Multas fiscais' },
  { id: 'item-im-9', group: 'taxes', name: 'Outros tributos e taxas' },

  // Outras despesas
  { id: 'item-od-1', group: 'other_expense', name: 'Material de escritório' },
  { id: 'item-od-2', group: 'other_expense', name: 'Viagens & Hospedagem' },
  { id: 'item-od-3', group: 'other_expense', name: 'Alimentação & Refeições' },
  { id: 'item-od-4', group: 'other_expense', name: 'Transporte & Combustível' },
  { id: 'item-od-5', group: 'other_expense', name: 'Manutenção de equipamentos' },
  { id: 'item-od-6', group: 'other_expense', name: 'Assinaturas de software' },
  { id: 'item-od-7', group: 'other_expense', name: 'Cursos & Treinamentos' },
  { id: 'item-od-8', group: 'other_expense', name: 'Brindes & Eventos' },
  { id: 'item-od-9', group: 'other_expense', name: 'Outras despesas gerais' },

  // Despesas financeiras
  { id: 'item-df-1', group: 'financial_expense', name: 'Taxas bancárias de conta' },
  { id: 'item-df-2', group: 'financial_expense', name: 'Taxa DOC / TED' },
  { id: 'item-df-3', group: 'financial_expense', name: 'Tarifas de cartão / Maquininha' },
  { id: 'item-df-4', group: 'financial_expense', name: 'Juros por atraso' },
  { id: 'item-df-5', group: 'financial_expense', name: 'Taxas de antecipação de recebíveis' },
  { id: 'item-df-6', group: 'financial_expense', name: 'IOF' },
  { id: 'item-df-7', group: 'financial_expense', name: 'Multas de mora' },
  { id: 'item-df-8', group: 'financial_expense', name: 'Emissão de boletos' },
  { id: 'item-df-9', group: 'financial_expense', name: 'Outras despesas financeiras' },

  // Investimentos
  { id: 'item-inv-1', group: 'investments', name: 'Aplicações financeiras' },
  { id: 'item-inv-2', group: 'investments', name: 'Equipamentos novos' },
  { id: 'item-inv-3', group: 'investments', name: 'Máquinas & Ferramentas' },
  { id: 'item-inv-4', group: 'investments', name: 'Estrutura & Reformas' },
  { id: 'item-inv-5', group: 'investments', name: 'Tecnologia & Softwares' },
  { id: 'item-inv-6', group: 'investments', name: 'Expansão da empresa' },
  { id: 'item-inv-7', group: 'investments', name: 'Veículos' },
  { id: 'item-inv-8', group: 'investments', name: 'Mobiliário & Instalações' },
  { id: 'item-inv-9', group: 'investments', name: 'Outros investimentos patrimoniais' },
];

export const DEFAULT_INCOME_METHODS = [
  'Pix',
  'Dinheiro',
  'Transferência',
  'Cartão de crédito',
  'Cartão de débito',
  'Boleto',
  'TED',
  'Outro',
];

export const DEFAULT_EXPENSE_METHODS = [
  'Pix',
  'Dinheiro',
  'Débito',
  'Crédito',
  'Boleto',
  'Transferência',
  'Débito automático',
  'Outro',
];

export const DEFAULT_PROJECTS = [
  { id: 'prj-1', code: 'PRJ-001', name: 'Projeto 1', branch: 'Filial 1', status: 'in_progress' as const, description: 'Projeto operacional' },
  { id: 'prj-2', code: 'PRJ-002', name: 'Projeto 2', branch: 'Filial 1', status: 'in_progress' as const, description: 'Projeto de vendas' },
  { id: 'prj-3', code: 'PRJ-003', name: 'Projeto 3', branch: 'Filial 2', status: 'planning' as const, description: 'Desenvolvimento' },
];
