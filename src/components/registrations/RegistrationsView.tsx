import React, { useState } from 'react';
import {
  FolderTree,
  Tag,
  CreditCard,
  Users,
  Truck,
  Briefcase,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  X,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import {
  Client,
  CustomCategoryItem,
  DocumentType,
  FinancialDocument,
  PaymentMethodItem,
  Project,
  Supplier,
} from '../../types';
import { formatCurrency, formatDateBR } from '../../utils/formatters';

type RegistrationSubTab =
  | 'income_types'
  | 'expense_types'
  | 'payment_methods'
  | 'clients'
  | 'suppliers'
  | 'projects_docs';

interface RegistrationsViewProps {
  initialSubTab?: RegistrationSubTab;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  initialSubTab = 'income_types',
}) => {
  const {
    sheetCategoryItems,
    sheetPaymentMethods,
    sheetClients,
    sheetSuppliers,
    sheetProjects,
    sheetDocuments,
    updateCategoryItemName,
    addCategoryItem,
    deleteCategoryItem,
    resetCategoryItemsToDefault,
    updatePaymentMethodName,
    addPaymentMethod,
    deletePaymentMethod,
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
    showToast,
    setActiveTab,
  } = useFinance();

  const [currentSubTab, setCurrentSubTab] = useState<RegistrationSubTab>(initialSubTab);

  // Search filter
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Editing category item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemName, setEditingItemName] = useState<string>('');

  // Modals for Clients
  const [clientModalOpen, setClientModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState({
    code: '',
    name: '',
    type: 'PF' as 'PF' | 'PJ',
    document: '',
    phone1: '',
    phone2: '',
    email: '',
    contactName: '',
    address: '',
    city: '',
    state: '',
    notes: '',
  });

  // Modals for Suppliers
  const [supplierModalOpen, setSupplierModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    code: '',
    name: '',
    type: 'PJ' as 'PF' | 'PJ',
    document: '',
    phone1: '',
    email: '',
    contactName: '',
    address: '',
    city: '',
    state: '',
    notes: '',
  });

  // Modals for Projects
  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    code: '',
    name: '',
    branch: 'Consolidado',
    status: 'in_progress' as 'planning' | 'in_progress' | 'completed' | 'paused',
    startDate: '',
    endDate: '',
    notes: '',
  });

  // Modals for Documents
  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [editingDoc, setEditingDoc] = useState<FinancialDocument | null>(null);
  const [docForm, setDocForm] = useState({
    code: '',
    type: 'boleto' as DocumentType,
    number: '',
    amount: '0',
    date: new Date().toISOString().slice(0, 10),
    status: 'pending' as 'pending' | 'paid' | 'received' | 'cancelled',
    projectId: '',
    clientId: '',
    supplierId: '',
    notes: '',
  });

  // Group definitions for Income
  const INCOME_GROUPS = [
    { key: 'products', title: '1. Receitas com Produtos', desc: 'Produtos 1 a 9' },
    { key: 'services', title: '2. Receitas com Serviços', desc: 'Serviços 1 a 9' },
    { key: 'other_income', title: '3. Outras Receitas Operacionais', desc: 'Outras receitas 1 a 9' },
    { key: 'financial_income', title: '4. Receitas Financeiras', desc: 'Juros, rendimentos e dividendos' },
  ];

  // Group definitions for Expenses
  const EXPENSE_GROUPS = [
    { key: 'variable_costs', title: '1. Custos Variáveis', desc: 'Mercadorias, matéria-prima, fretes (1 a 9)' },
    { key: 'occupancy', title: '2. Ocupação & Instalações', desc: 'Aluguel, luz, água, condomínio, IPTU (1 a 9)' },
    { key: 'services_expense', title: '3. Serviços de Terceiros', desc: 'Contabilidade, publicidade, TI, jurídico (1 a 9)' },
    { key: 'personnel', title: '4. Despesas com Pessoal', desc: 'Salários, pró-labore, benefícios, encargos (1 a 9)' },
    { key: 'sales_deductions', title: '5. Deduções sobre Vendas', desc: 'Impostos e tributos diretos (DAS, ICMS)' },
  ];

  // Handle Category Item Edit
  const handleStartEditItem = (item: CustomCategoryItem) => {
    setEditingItemId(item.id);
    setEditingItemName(item.name);
  };

  const handleSaveItemName = (id: string) => {
    if (editingItemName.trim()) {
      updateCategoryItemName(id, editingItemName.trim());
      showToast('Nome Atualizado', 'Item cadastrado atualizado com sucesso.', 'success');
    }
    setEditingItemId(null);
  };

  // Client handlers
  const handleOpenClientModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setClientForm({
        code: client.code,
        name: client.name,
        type: client.type,
        document: client.document || '',
        phone1: client.phone1 || '',
        phone2: client.phone2 || '',
        email: client.email || '',
        contactName: client.contactName || '',
        address: client.address || '',
        city: client.city || '',
        state: client.state || '',
        notes: client.notes || '',
      });
    } else {
      setEditingClient(null);
      const nextNum = sheetClients.length + 1;
      setClientForm({
        code: `CLI-${String(nextNum).padStart(4, '0')}`,
        name: '',
        type: 'PF',
        document: '',
        phone1: '',
        phone2: '',
        email: '',
        contactName: '',
        address: '',
        city: '',
        state: '',
        notes: '',
      });
    }
    setClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name.trim()) {
      showToast('Nome Obrigatório', 'Informe o nome do cliente.', 'error');
      return;
    }
    if (editingClient) {
      updateClient({
        ...editingClient,
        ...clientForm,
      });
      showToast('Cliente Atualizado', `Cliente "${clientForm.name}" salvo.`, 'success');
    } else {
      addClient(clientForm);
      showToast('Cliente Cadastrado', `Cliente "${clientForm.name}" adicionado.`, 'success');
    }
    setClientModalOpen(false);
  };

  // Supplier handlers
  const handleOpenSupplierModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm({
        code: supplier.code,
        name: supplier.name,
        type: supplier.type,
        document: supplier.document || '',
        phone1: supplier.phone1 || '',
        email: supplier.email || '',
        contactName: supplier.contactName || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        notes: supplier.notes || '',
      });
    } else {
      setEditingSupplier(null);
      const nextNum = sheetSuppliers.length + 1;
      setSupplierForm({
        code: `FOR-${String(nextNum).padStart(4, '0')}`,
        name: '',
        type: 'PJ',
        document: '',
        phone1: '',
        email: '',
        contactName: '',
        address: '',
        city: '',
        state: '',
        notes: '',
      });
    }
    setSupplierModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) {
      showToast('Razão/Nome Obrigatório', 'Informe o nome do fornecedor.', 'error');
      return;
    }
    if (editingSupplier) {
      updateSupplier({
        ...editingSupplier,
        ...supplierForm,
      });
      showToast('Fornecedor Atualizado', `Fornecedor "${supplierForm.name}" salvo.`, 'success');
    } else {
      addSupplier(supplierForm);
      showToast('Fornecedor Cadastrado', `Fornecedor "${supplierForm.name}" adicionado.`, 'success');
    }
    setSupplierModalOpen(false);
  };

  // Project Handlers
  const handleOpenProjectModal = (proj?: Project) => {
    if (proj) {
      setEditingProject(proj);
      setProjectForm({
        code: proj.code,
        name: proj.name,
        branch: proj.branch || 'Consolidado',
        status: proj.status,
        startDate: proj.startDate || '',
        endDate: proj.endDate || '',
        notes: proj.notes || '',
      });
    } else {
      setEditingProject(null);
      const nextNum = sheetProjects.length + 1;
      setProjectForm({
        code: `PRJ-${String(nextNum).padStart(3, '0')}`,
        name: '',
        branch: 'Consolidado',
        status: 'in_progress',
        startDate: new Date().toISOString().slice(0, 10),
        endDate: '',
        notes: '',
      });
    }
    setProjectModalOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.name.trim()) {
      showToast('Nome Obrigatório', 'Informe o nome do projeto.', 'error');
      return;
    }
    if (editingProject) {
      updateProject({
        ...editingProject,
        ...projectForm,
      });
      showToast('Projeto Atualizado', `Projeto "${projectForm.name}" salvo.`, 'success');
    } else {
      addProject(projectForm);
      showToast('Projeto Cadastrado', `Projeto "${projectForm.name}" adicionado.`, 'success');
    }
    setProjectModalOpen(false);
  };

  // Document Handlers
  const handleOpenDocModal = (doc?: FinancialDocument) => {
    if (doc) {
      setEditingDoc(doc);
      setDocForm({
        code: doc.code,
        type: doc.type,
        number: doc.number || '',
        amount: String(doc.amount),
        date: doc.date,
        status: doc.status,
        projectId: doc.projectId || '',
        clientId: doc.clientId || '',
        supplierId: doc.supplierId || '',
        notes: doc.notes || '',
      });
    } else {
      setEditingDoc(null);
      const nextNum = sheetDocuments.length + 1;
      setDocForm({
        code: `DOC-${String(nextNum).padStart(4, '0')}`,
        type: 'boleto',
        number: '',
        amount: '0',
        date: new Date().toISOString().slice(0, 10),
        status: 'pending',
        projectId: '',
        clientId: '',
        supplierId: '',
        notes: '',
      });
    }
    setDocModalOpen(true);
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(docForm.amount.replace(',', '.')) || 0;
    if (editingDoc) {
      updateDocument({
        ...editingDoc,
        ...docForm,
        amount: amountVal,
      });
      showToast('Documento Atualizado', `Documento ${docForm.code} salvo.`, 'success');
    } else {
      addDocument({
        ...docForm,
        amount: amountVal,
      });
      showToast('Documento Cadastrado', `Documento ${docForm.code} adicionado.`, 'success');
    }
    setDocModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Central de Cadastros
              </span>
              <span className="text-xs text-slate-400">Padronização & Governança</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <FolderTree className="w-8 h-8 text-blue-400" />
              Cadastros Gerais do Sistema
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Configure as descrições dos produtos, serviços, despesas, meios de pagamento, clientes, fornecedores, filiais e documentos financeiros vinculados a esta planilha.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('initial_balances')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors border border-slate-700 cursor-pointer"
            >
              ← Saldos Iniciais
            </button>
            <button
              onClick={() => setActiveTab('cash_flow')}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-colors shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Ver Lançamentos →
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        <button
          onClick={() => setCurrentSubTab('income_types')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            currentSubTab === 'income_types'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tipos de Receitas</span>
        </button>

        <button
          onClick={() => setCurrentSubTab('expense_types')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            currentSubTab === 'expense_types'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-rose-400" />
          <span>Tipos de Despesas</span>
        </button>

        <button
          onClick={() => setCurrentSubTab('payment_methods')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            currentSubTab === 'payment_methods'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
          <span>Meios de Pagto / Recebto</span>
        </button>

        <button
          onClick={() => setCurrentSubTab('clients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            currentSubTab === 'clients'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Clientes ({sheetClients.length})</span>
        </button>

        <button
          onClick={() => setCurrentSubTab('suppliers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            currentSubTab === 'suppliers'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span>Fornecedores ({sheetSuppliers.length})</span>
        </button>

        <button
          onClick={() => setCurrentSubTab('projects_docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            currentSubTab === 'projects_docs'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-purple-400" />
          <span>Projetos & Documentos ({sheetProjects.length}/{sheetDocuments.length})</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: TIPOS DE RECEITAS (Produtos, Serviços, etc) */}
      {/* ---------------------------------------------------- */}
      {currentSubTab === 'income_types' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>
              💡 Clique no ícone de lápis ou no nome de qualquer item para renomear e personalizar conforme o seu negócio.
            </span>
            <button
              onClick={resetCategoryItemsToDefault}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline text-[11px]"
            >
              Restaurar Nomes Padrão
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INCOME_GROUPS.map((group) => {
              const items = sheetCategoryItems.filter((i) => i.group === group.key);
              return (
                <div
                  key={group.key}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div>
                      <h3 className="font-bold text-white text-sm">{group.title}</h3>
                      <p className="text-[11px] text-slate-400">{group.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {items.length} itens
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">
                            #{idx + 1}
                          </span>
                          {editingItemId === item.id ? (
                            <input
                              type="text"
                              autoFocus
                              value={editingItemName}
                              onChange={(e) => setEditingItemName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveItemName(item.id);
                                if (e.key === 'Escape') setEditingItemId(null);
                              }}
                              className="w-full px-2 py-1 rounded bg-slate-900 border border-blue-500 text-xs text-white focus:outline-none"
                            />
                          ) : (
                            <span
                              onClick={() => handleStartEditItem(item)}
                              className="text-xs text-slate-200 truncate cursor-pointer hover:text-blue-400 transition-colors"
                            >
                              {item.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {editingItemId === item.id ? (
                            <>
                              <button
                                onClick={() => handleSaveItemName(item.id)}
                                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartEditItem(item)}
                              className="p-1 rounded text-slate-500 hover:text-blue-400 transition-colors cursor-pointer"
                              title="Editar Nome"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: TIPOS DE DESPESAS (Custos, Ocupação, etc) */}
      {/* ---------------------------------------------------- */}
      {currentSubTab === 'expense_types' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>
              💡 Personalize os nomes dos seus custos variáveis, instalações, pessoal e serviços contratados.
            </span>
            <button
              onClick={resetCategoryItemsToDefault}
              className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline text-[11px]"
            >
              Restaurar Nomes Padrão
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {EXPENSE_GROUPS.map((group) => {
              const items = sheetCategoryItems.filter((i) => i.group === group.key);
              return (
                <div
                  key={group.key}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div>
                      <h3 className="font-bold text-white text-sm">{group.title}</h3>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{group.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      {items.length} itens
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 max-h-96 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                          <span className="text-[10px] font-mono text-slate-500 font-bold shrink-0">
                            #{idx + 1}
                          </span>
                          {editingItemId === item.id ? (
                            <input
                              type="text"
                              autoFocus
                              value={editingItemName}
                              onChange={(e) => setEditingItemName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveItemName(item.id);
                                if (e.key === 'Escape') setEditingItemId(null);
                              }}
                              className="w-full px-2 py-1 rounded bg-slate-900 border border-blue-500 text-xs text-white focus:outline-none"
                            />
                          ) : (
                            <span
                              onClick={() => handleStartEditItem(item)}
                              className="text-xs text-slate-200 truncate cursor-pointer hover:text-blue-400 transition-colors"
                            >
                              {item.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {editingItemId === item.id ? (
                            <>
                              <button
                                onClick={() => handleSaveItemName(item.id)}
                                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingItemId(null)}
                                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleStartEditItem(item)}
                              className="p-1 rounded text-slate-500 hover:text-blue-400 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: MEIOS DE PAGAMENTO & RECEBIMENTO          */}
      {/* ---------------------------------------------------- */}
      {currentSubTab === 'payment_methods' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Income Methods */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  Meios de Recebimento
                </h3>
                <p className="text-xs text-slate-400">Como você recebe de seus clientes</p>
              </div>
            </div>

            <div className="space-y-2">
              {sheetPaymentMethods
                .filter((m) => m.type === 'income')
                .map((method, idx) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        0{idx + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-200">{method.name}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Expense Methods */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-rose-400" />
                  Meios de Pagamento
                </h3>
                <p className="text-xs text-slate-400">Como você paga seus custos e contas</p>
              </div>
            </div>

            <div className="space-y-2">
              {sheetPaymentMethods
                .filter((m) => m.type === 'expense')
                .map((method, idx) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500">
                        0{idx + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-200">{method.name}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 4: CLIENTES                                  */}
      {/* ---------------------------------------------------- */}
      {currentSubTab === 'clients' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Base de Clientes Cadastrados ({sheetClients.length})
              </h2>
              <p className="text-xs text-slate-400">
                Pessoas Físicas e Jurídicas para vincular a receitas e contas a receber.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenClientModal()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Cliente</span>
              </button>
            </div>
          </div>

          {sheetClients.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">Nenhum cliente cadastrado nesta planilha.</p>
              <button
                onClick={() => handleOpenClientModal()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                Cadastrar Primeiro Cliente
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Nome / Razão</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3">CPF / CNPJ</th>
                    <th className="py-3 px-3">Telefone</th>
                    <th className="py-3 px-3">E-mail</th>
                    <th className="py-3 px-3">Cidade / UF</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sheetClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-400">{client.code}</td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{client.name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {client.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{client.document || '—'}</td>
                      <td className="py-3 px-3 text-slate-300">{client.phone1 || '—'}</td>
                      <td className="py-3 px-3 text-slate-300">{client.email || '—'}</td>
                      <td className="py-3 px-3 text-slate-400">
                        {client.city ? `${client.city}/${client.state || ''}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenClientModal(client)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir cliente "${client.name}"?`)) {
                                deleteClient(client.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 5: FORNECEDORES                              */}
      {/* ---------------------------------------------------- */}
      {currentSubTab === 'suppliers' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                Base de Fornecedores Cadastrados ({sheetSuppliers.length})
              </h2>
              <p className="text-xs text-slate-400">
                Parceiros e fornecedores para associar a despesas e contas a pagar.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenSupplierModal()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Fornecedor</span>
              </button>
            </div>
          </div>

          {sheetSuppliers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Truck className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">Nenhum fornecedor cadastrado nesta planilha.</p>
              <button
                onClick={() => handleOpenSupplierModal()}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold"
              >
                Cadastrar Primeiro Fornecedor
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Razão / Nome</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3">CNPJ / CPF</th>
                    <th className="py-3 px-3">Telefone</th>
                    <th className="py-3 px-3">E-mail</th>
                    <th className="py-3 px-3">Contato</th>
                    <th className="py-3 px-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sheetSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {supplier.code}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-200">{supplier.name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {supplier.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {supplier.document || '—'}
                      </td>
                      <td className="py-3 px-3 text-slate-300">{supplier.phone1 || '—'}</td>
                      <td className="py-3 px-3 text-slate-300">{supplier.email || '—'}</td>
                      <td className="py-3 px-3 text-slate-400">{supplier.contactName || '—'}</td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenSupplierModal(supplier)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Editar"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir fornecedor "${supplier.name}"?`)) {
                                deleteSupplier(supplier.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 6: PROJETOS, FILIAIS & DOCUMENTOS             */}
      {/* ---------------------------------------------------- */}
      {currentSubTab === 'projects_docs' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Projects & Branches Section */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  Projetos & Filiais / Centros de Custo ({sheetProjects.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Classifique despesas e receitas por projetos, campanhas ou unidades de negócio.
                </p>
              </div>

              <button
                onClick={() => handleOpenProjectModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Projeto</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sheetProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-400">{proj.code}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        proj.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      {proj.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{proj.name}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Filial: {proj.branch || 'Geral'}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenProjectModal(proj)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir projeto "${proj.name}"?`)) deleteProject(proj.id);
                        }}
                        className="text-slate-400 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Documents Section */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Documentos Financeiros Registrados ({sheetDocuments.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Boletos, notas fiscais, contratos e comprovantes vinculados ao financeiro.
                </p>
              </div>

              <button
                onClick={() => handleOpenDocModal()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Novo Documento</span>
              </button>
            </div>

            {sheetDocuments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Nenhum documento financeiro cadastrado ainda.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-2 px-3">Código</th>
                      <th className="py-2 px-3">Tipo</th>
                      <th className="py-2 px-3">Número / Ref</th>
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3 text-right">Valor</th>
                      <th className="py-2 px-3 text-center">Status</th>
                      <th className="py-2 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sheetDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-850/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{doc.code}</td>
                        <td className="py-2.5 px-3 uppercase text-[10px] text-slate-300">{doc.type}</td>
                        <td className="py-2.5 px-3 text-slate-300">{doc.number || '—'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{formatDateBR(doc.date)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          {formatCurrency(doc.amount)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenDocModal(doc)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Excluir documento ${doc.code}?`)) deleteDocument(doc.id);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-400"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Client Form */}
      {clientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Users className="w-5 h-5 text-blue-400" />
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </h3>

            <form onSubmit={handleSaveClient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código</label>
                  <input
                    type="text"
                    value={clientForm.code}
                    onChange={(e) => setClientForm({ ...clientForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo</label>
                  <select
                    value={clientForm.type}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, type: e.target.value as 'PF' | 'PJ' })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  >
                    <option value="PF">Pessoa Física (PF)</option>
                    <option value="PJ">Pessoa Jurídica (PJ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nome Completo / Razão Social *
                </label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  placeholder="Nome do cliente"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">CPF / CNPJ</label>
                  <input
                    type="text"
                    value={clientForm.document}
                    onChange={(e) => setClientForm({ ...clientForm, document: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={clientForm.phone1}
                    onChange={(e) => setClientForm({ ...clientForm, phone1: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={clientForm.city}
                    onChange={(e) => setClientForm({ ...clientForm, city: e.target.value })}
                    placeholder="Ex: São Paulo / SP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={clientForm.notes}
                  onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                  placeholder="Anotações comerciais..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Supplier Form */}
      {supplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-5 h-5 text-amber-400" />
              {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h3>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código</label>
                  <input
                    type="text"
                    value={supplierForm.code}
                    onChange={(e) => setSupplierForm({ ...supplierForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo</label>
                  <select
                    value={supplierForm.type}
                    onChange={(e) =>
                      setSupplierForm({ ...supplierForm, type: e.target.value as 'PF' | 'PJ' })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  >
                    <option value="PJ">Pessoa Jurídica (PJ)</option>
                    <option value="PF">Pessoa Física (PF)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Razão Social / Nome Fantasia *
                </label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  placeholder="Nome do fornecedor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={supplierForm.document}
                    onChange={(e) => setSupplierForm({ ...supplierForm, document: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Telefone</label>
                  <input
                    type="text"
                    value={supplierForm.phone1}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone1: e.target.value })}
                    placeholder="(00) 0000-0000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold"
                >
                  Salvar Fornecedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Project Form */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Briefcase className="w-5 h-5 text-purple-400" />
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </h3>

            <form onSubmit={handleSaveProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Código</label>
                <input
                  type="text"
                  value={projectForm.code}
                  onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nome do Projeto *</label>
                <input
                  type="text"
                  required
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="Ex: Reforma Loja 2, Lançamento Verão"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Filial / Unidade</label>
                  <input
                    type="text"
                    value={projectForm.branch}
                    onChange={(e) => setProjectForm({ ...projectForm, branch: e.target.value })}
                    placeholder="Ex: Filial 1, Matriz"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status</label>
                  <select
                    value={projectForm.status}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        status: e.target.value as 'in_progress' | 'completed',
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  >
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold"
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Document Form */}
      {docModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-5 h-5 text-cyan-400" />
              {editingDoc ? 'Editar Documento' : 'Novo Documento'}
            </h3>

            <form onSubmit={handleSaveDoc} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Código</label>
                  <input
                    type="text"
                    value={docForm.code}
                    onChange={(e) => setDocForm({ ...docForm, code: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tipo</label>
                  <select
                    value={docForm.type}
                    onChange={(e) =>
                      setDocForm({ ...docForm, type: e.target.value as DocumentType })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  >
                    <option value="boleto">Boleto</option>
                    <option value="invoice">Nota Fiscal / Fatura</option>
                    <option value="receipt">Recibo</option>
                    <option value="contract">Contrato</option>
                    <option value="pix">Comprovante PIX</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Número / Ref</label>
                  <input
                    type="text"
                    value={docForm.number}
                    onChange={(e) => setDocForm({ ...docForm, number: e.target.value })}
                    placeholder="Ex: NF 1024"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    value={docForm.amount}
                    onChange={(e) => setDocForm({ ...docForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Data</label>
                <input
                  type="date"
                  value={docForm.date}
                  onChange={(e) => setDocForm({ ...docForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold"
                >
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
