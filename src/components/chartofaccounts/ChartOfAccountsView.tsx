import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Edit2,
  Trash2,
  Tag,
  Check,
  X,
  Layers,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Category, TransactionType } from '../../types';
import { formatBRL } from '../../utils/formatters';

const PRESET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4', '#14B8A6', '#64748B', '#F97316'
];

export const ChartOfAccountsView: React.FC = () => {
  const { sheetCategories, sheetTransactions, addCategory, updateCategory, deleteCategory } = useFinance();

  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Form states
  const [catName, setCatName] = useState<string>('');
  const [catType, setCatType] = useState<TransactionType>('expense');
  const [catColor, setCatColor] = useState<string>(PRESET_COLORS[0]);
  const [catBudget, setCatBudget] = useState<string>('');

  const incomeCategories = sheetCategories.filter((c) => c.type === 'income');
  const expenseCategories = sheetCategories.filter((c) => c.type === 'expense');

  const handleOpenAdd = (type: TransactionType) => {
    setEditingCat(null);
    setCatName('');
    setCatType(type);
    setCatColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setCatBudget('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatColor(cat.color || PRESET_COLORS[0]);
    setCatBudget(cat.monthlyBudget ? String(cat.monthlyBudget) : '');
    setModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    if (editingCat) {
      updateCategory({
        ...editingCat,
        name: catName.trim(),
        type: catType,
        color: catColor,
        monthlyBudget: catBudget ? parseFloat(catBudget) : undefined,
      });
    } else {
      addCategory({
        name: catName.trim(),
        type: catType,
        color: catColor,
        icon: 'Tag',
        monthlyBudget: catBudget ? parseFloat(catBudget) : undefined,
      });
    }
    setModalOpen(false);
  };

  return (
    <div id="chart-of-accounts-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            Plano de Contas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Estruture e personalize as categorias de receitas e despesas da sua organização financeira
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd(activeTab)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nova Categoria</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'expense'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Categorias de Despesas ({expenseCategories.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'income'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Categorias de Receitas ({incomeCategories.length})</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeTab === 'expense' ? expenseCategories : incomeCategories).map((cat) => {
          // Calculate spent or received in this category
          const categoryTotal = sheetTransactions
            .filter((t) => t.categoryId === cat.id && t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0);

          const budgetPercent = cat.monthlyBudget
            ? Math.min(Math.round((categoryTotal / cat.monthlyBudget) * 100), 100)
            : null;

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 shadow-xl transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                  >
                    <Tag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{cat.name}</h3>
                    <span className="text-[11px] text-slate-400">
                      {cat.type === 'expense' ? 'Despesa' : 'Receita'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                    title="Editar categoria"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Accumulated stats & budget */}
              <div className="pt-2 border-t border-slate-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total movimentado:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {formatBRL(categoryTotal)}
                  </span>
                </div>

                {cat.monthlyBudget && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Meta/Teto Mensal:</span>
                      <span className="font-mono font-semibold text-slate-300">
                        {formatBRL(cat.monthlyBudget)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (budgetPercent || 0) > 90 ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${budgetPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-display font-bold text-base text-white">
                {editingCat ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Categoria
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alimentação, Vendas, Software..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tipo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCatType('expense')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      catType === 'expense'
                        ? 'bg-rose-950/40 border-rose-600 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Despesa (−)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCatType('income')}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      catType === 'income'
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Receita (+)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cor de Destaque
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCatColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        catColor === c ? 'scale-110 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {catType === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Orçamento / Teto Mensal Estimado (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={catBudget}
                    onChange={(e) => setCatBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
