import React, { useMemo, useState } from 'react';
import {
  Layers,
  Plus,
  Copy,
  Trash2,
  Edit3,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Search,
  ArrowUpDown,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  User,
  Users,
  Target,
  FileSpreadsheet,
  Coins,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FinancialSheet, SheetControlType } from '../../types';
import { formatBRL, formatDate } from '../../utils/formatters';

type SortOption = 'recent' | 'oldest' | 'highest_balance' | 'lowest_balance' | 'name_asc' | 'name_desc';

export const SavedSheetsView: React.FC = () => {
  const {
    sheets,
    activeSheetId,
    setActiveSheetId,
    createSheet,
    duplicateSheet,
    updateSheet,
    deleteSheet,
    setActiveTab,
    transactions,
    accounts,
  } = useFinance();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [filterType, setFilterType] = useState<string>('all');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newSheetName, setNewSheetName] = useState<string>('');
  const [newSheetDesc, setNewSheetDesc] = useState<string>('');
  const [newControlType, setNewControlType] = useState<SheetControlType>('personal');
  const [newCurrency, setNewCurrency] = useState<string>('BRL');
  const [newInitialBalance, setNewInitialBalance] = useState<string>('0');

  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingSheet, setEditingSheet] = useState<FinancialSheet | null>(null);
  const [editSheetName, setEditSheetName] = useState<string>('');
  const [editSheetDesc, setEditSheetDesc] = useState<string>('');
  const [editControlType, setEditControlType] = useState<SheetControlType>('personal');
  const [editCurrency, setEditCurrency] = useState<string>('BRL');

  const [duplicateModalOpen, setDuplicateModalOpen] = useState<boolean>(false);
  const [duplicateTargetId, setDuplicateTargetId] = useState<string | null>(null);
  const [duplicateNewName, setDuplicateNewName] = useState<string>('');

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Helper to calculate sheet balance
  const getSheetBalance = (sheetId: string) => {
    const sheetAccs = accounts.filter((a) => a.sheetId === sheetId);
    const initialSum = sheetAccs.reduce((acc, a) => acc + (a.initialBalance || 0), 0);
    const sheetTxs = transactions.filter((t) => t.sheetId === sheetId && t.status === 'completed');
    const income = sheetTxs.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = sheetTxs.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return initialSum + income - expense;
  };

  const getSheetTxCount = (sheetId: string) => {
    return transactions.filter((t) => t.sheetId === sheetId).length;
  };

  const getControlTypeLabel = (type?: SheetControlType) => {
    switch (type) {
      case 'business':
        return { label: 'Empresarial', icon: Briefcase, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' };
      case 'family':
        return { label: 'Familiar', icon: Users, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'project':
        return { label: 'Projeto', icon: Target, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' };
      case 'other':
        return { label: 'Outro', icon: FileSpreadsheet, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
      case 'personal':
      default:
        return { label: 'Pessoal', icon: User, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
  };

  // Filtered & Sorted sheets
  const processedSheets = useMemo(() => {
    let list = [...sheets];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.controlType && s.controlType.toLowerCase().includes(q))
      );
    }

    if (filterType !== 'all') {
      list = list.filter((s) => (s.controlType || 'personal') === filterType);
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest_balance':
          return getSheetBalance(b.id) - getSheetBalance(a.id);
        case 'lowest_balance':
          return getSheetBalance(a.id) - getSheetBalance(b.id);
        case 'name_asc':
          return a.name.localeCompare(b.name, 'pt-BR');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'pt-BR');
        default:
          return 0;
      }
    });

    return list;
  }, [sheets, searchQuery, sortBy, filterType, accounts, transactions]);

  // Create handler
  const handleCreateSheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSheetName.trim()) return;

    const parsedBalance = parseFloat(newInitialBalance.replace(',', '.')) || 0;

    createSheet(newSheetName.trim(), newSheetDesc.trim(), {
      controlType: newControlType,
      currency: newCurrency,
      initialBalance: parsedBalance,
      populateDefaultCategories: true,
    });

    setCreateModalOpen(false);
    setNewSheetName('');
    setNewSheetDesc('');
    setNewControlType('personal');
    setNewCurrency('BRL');
    setNewInitialBalance('0');
  };

  // Edit open handler
  const handleOpenEdit = (sheet: FinancialSheet) => {
    setEditingSheet(sheet);
    setEditSheetName(sheet.name);
    setEditSheetDesc(sheet.description || '');
    setEditControlType(sheet.controlType || 'personal');
    setEditCurrency(sheet.currency || 'BRL');
    setEditModalOpen(true);
  };

  // Edit save handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSheet || !editSheetName.trim()) return;

    updateSheet({
      ...editingSheet,
      name: editSheetName.trim(),
      description: editSheetDesc.trim(),
      controlType: editControlType,
      currency: editCurrency,
    });

    setEditModalOpen(false);
    setEditingSheet(null);
  };

  // Duplicate open handler
  const handleOpenDuplicate = (sheet: FinancialSheet) => {
    setDuplicateTargetId(sheet.id);
    setDuplicateNewName(`${sheet.name} (Cópia)`);
    setDuplicateModalOpen(true);
  };

  const handleSaveDuplicate = (e: React.FormEvent) => {
    e.preventDefault();
    if (duplicateTargetId && duplicateNewName.trim()) {
      duplicateSheet(duplicateTargetId, duplicateNewName.trim());
      setDuplicateModalOpen(false);
      setDuplicateTargetId(null);
      setDuplicateNewName('');
    }
  };

  return (
    <div id="minhas-planilhas-view" className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Minhas Planilhas
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Organize seus controles financeiros em um só lugar.
              </p>
            </div>
          </div>
        </div>

        <button
          id="btn-add-planilha"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Adicionar Planilha</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        {/* Search input */}
        <div className="sm:col-span-6 lg:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar minhas planilhas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden transition-colors"
          />
        </div>

        {/* Filter Type */}
        <div className="sm:col-span-3 lg:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label="Filtrar por tipo de controle"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="all">Todos os Tipos</option>
            <option value="personal">Pessoal</option>
            <option value="family">Familiar</option>
            <option value="business">Empresarial</option>
            <option value="project">Projeto</option>
            <option value="other">Outro</option>
          </select>
        </div>

        {/* Sort dropdown */}
        <div className="sm:col-span-3 lg:col-span-3 relative">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Ordenar planilhas"
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="highest_balance">Maior saldo</option>
            <option value="lowest_balance">Menor saldo</option>
            <option value="name_asc">Nome A-Z</option>
            <option value="name_desc">Nome Z-A</option>
          </select>
        </div>
      </div>

      {/* Sheets Cards Grid */}
      {processedSheets.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Nenhuma planilha encontrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? 'Tente buscar com outro termo ou limpe os filtros para ver todas as suas planilhas.'
              : 'Clique no botão acima para adicionar sua primeira planilha financeira.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedSheets.map((sheet) => {
            const isActive = sheet.id === activeSheetId;
            const balance = getSheetBalance(sheet.id);
            const txCount = getSheetTxCount(sheet.id);
            const typeConfig = getControlTypeLabel(sheet.controlType);
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={sheet.id}
                id={`sheet-card-${sheet.id}`}
                className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-5 relative overflow-hidden group ${
                  isActive
                    ? 'bg-gradient-to-b from-slate-900 via-blue-950/25 to-slate-950 border-blue-500/80 shadow-2xl shadow-blue-950/40 ring-1 ring-blue-500/30'
                    : 'bg-slate-900/90 border-slate-800/80 hover:border-slate-700 hover:shadow-xl'
                }`}
              >
                {/* Top active badge */}
                {isActive && (
                  <div className="absolute top-0 right-0 px-3.5 py-1 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-bl-xl shadow-md flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>Em Uso</span>
                  </div>
                )}

                {/* Card Top Information */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-slate-800 text-slate-300 group-hover:text-white'
                      }`}
                    >
                      <Layers className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1 pr-12">
                      <h3 className="font-display font-bold text-base text-white truncate group-hover:text-blue-400 transition-colors">
                        {sheet.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${typeConfig.color}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          <span>{typeConfig.label}</span>
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-slate-500" />
                          <span>{sheet.currency || 'BRL'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                    {sheet.description || 'Controle financeiro e lançamentos organizados.'}
                  </p>

                  {/* Saldo & Lançamentos metrics box */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Saldo Atual
                      </span>
                      <span
                        className={`text-sm font-extrabold tracking-tight block ${
                          balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatBRL(balance)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Lançamentos
                      </span>
                      <span className="text-sm font-bold text-slate-200 block">
                        {txCount} {txCount === 1 ? 'registro' : 'registros'}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Criada: {formatDate(sheet.createdAt)}
                    </span>
                    <span>Atualizada: {formatDate(sheet.updatedAt || sheet.createdAt)}</span>
                  </div>
                </div>

                {/* Card Action Buttons: ABRIR, EDITAR, DUPLICAR, EXCLUIR */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sheet)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                      title="Editar planilha"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDuplicate(sheet)}
                      className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Duplicar planilha"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {sheets.length > 1 && (
                      <button
                        onClick={() => setDeleteConfirmId(sheet.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Excluir planilha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {!isActive ? (
                    <button
                      onClick={() => {
                        setActiveSheetId(sheet.id);
                        setActiveTab('dashboard');
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-all"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Visualizando</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: + Adicionar Planilha */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Criar Nova Planilha</h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSheet} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Planilha <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Finanças Pessoais, Minha Empresa, Casa 2026..."
                  value={newSheetName}
                  onChange={(e) => setNewSheetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Descrição / Sugestões Rápidas */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sobre o que é esta planilha? (Descrição)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Controle mensal de despesas, fluxo de caixa e metas..."
                  value={newSheetDesc}
                  onChange={(e) => setNewSheetDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Sugestões:</span>
                  {[
                    'Finanças pessoais',
                    'Minha empresa',
                    'Orçamento familiar',
                    'Viagem',
                    'Projeto',
                    'Pequeno negócio',
                    'Controle mensal',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setNewSheetDesc(sug);
                        if (!newSheetName) setNewSheetName(sug);
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de Controle */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tipo de Controle
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'personal', label: 'Pessoal', icon: User },
                    { id: 'family', label: 'Familiar', icon: Users },
                    { id: 'business', label: 'Empresarial', icon: Briefcase },
                    { id: 'project', label: 'Projeto', icon: Target },
                    { id: 'other', label: 'Outro', icon: FileSpreadsheet },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = newControlType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNewControlType(item.id as SheetControlType)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600/20 border-blue-500 text-white font-semibold shadow-xs'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Moeda e Saldo Inicial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Moeda
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">Libra Esterlina (£)</option>
                    <option value="OTHER">Outra Moeda</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Saldo Inicial (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
                >
                  Criar Planilha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Planilha */}
      {editModalOpen && editingSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Editar Planilha</h3>
              </div>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Planilha <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editSheetName}
                  onChange={(e) => setEditSheetName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={editSheetDesc}
                  onChange={(e) => setEditSheetDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Controle
                  </label>
                  <select
                    value={editControlType}
                    onChange={(e) => setEditControlType(e.target.value as SheetControlType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="personal">Pessoal</option>
                    <option value="family">Familiar</option>
                    <option value="business">Empresarial</option>
                    <option value="project">Projeto</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Moeda
                  </label>
                  <select
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">Libra Esterlina (£)</option>
                    <option value="OTHER">Outra Moeda</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300">
                💡 Ao editar, todos os seus lançamentos e contas existentes permanecem intactos.
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Duplicar Planilha */}
      {duplicateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Copy className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-base text-white">Duplicar Planilha</h3>
            </div>
            <form onSubmit={handleSaveDuplicate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Nova Cópia
                </label>
                <input
                  type="text"
                  required
                  value={duplicateNewName}
                  onChange={(e) => setDuplicateNewName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Uma cópia idêntica contendo as contas, categorias, transações e metas será criada com total isolamento de dados.
              </p>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDuplicateModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30"
                >
                  Confirmar Duplicação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Excluir Planilha (Destaque Vermelho com Confirmação) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-600/40 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 ring-1 ring-rose-500/30">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-display font-bold text-lg text-white">
                Tem certeza que deseja excluir esta planilha?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todos os dados financeiros relacionados a esta planilha poderão ser excluídos. Essa ação não poderá ser desfeita.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSheet(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/60 transition-colors"
              >
                Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
