import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Scale,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileText,
  Save,
  Trash2,
  RotateCcw,
  ArrowRight,
  Info,
  DollarSign,
  HelpCircle,
  Copy,
  Zap,
  Target,
  ShoppingBag,
  Calculator,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { PriceAnalysisRecord, PriceStatus, PricingObjective } from '../../types';
import { formatBRL, formatDate } from '../../utils/formatters';

interface ObjectiveOption {
  id: PricingObjective;
  title: string;
  subtitle: string;
  icon: string;
}

const OBJECTIVES: ObjectiveOption[] = [
  {
    id: 'balanced',
    title: 'Equilíbrio / Preço Justo',
    subtitle: 'Alinhar com o valor percebido e manter fluxo estável',
    icon: '⚖️',
  },
  {
    id: 'high_margin',
    title: 'Maior Margem de Lucro',
    subtitle: 'Maximizar ganho por unidade vendida',
    icon: '💰',
  },
  {
    id: 'competitive',
    title: 'Preço Competitivo de Mercado',
    subtitle: 'Igualar ou superar a concorrência direta',
    icon: '🎯',
  },
  {
    id: 'quick_sale',
    title: 'Vender Rapidamente (Giro / Liquidação)',
    subtitle: 'Acelerar vendas e converter estoque em caixa',
    icon: '⚡',
  },
  {
    id: 'customer_acquisition',
    title: 'Atrair Novos Clientes (Penetração)',
    subtitle: 'Preço de entrada convidativo para conquistar clientes',
    icon: '🚀',
  },
];

export const PricingAssistantView: React.FC = () => {
  const { sheetPriceAnalyses, savePriceAnalysis, deletePriceAnalysis, clearPriceAnalyses, activeSheet } =
    useFinance();

  // Basic Form State
  const [productName, setProductName] = useState<string>('Consultoria Financeira');
  const [currentPrice, setCurrentPrice] = useState<number>(180);
  const [referencePrice, setReferencePrice] = useState<number>(150);
  const [objective, setObjective] = useState<PricingObjective>('balanced');

  // Advanced Options Toggle & State
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [cost, setCost] = useState<number>(70);
  const [minMarginPercent, setMinMarginPercent] = useState<number>(30);
  const [maxDiscountPercent, setMaxDiscountPercent] = useState<number>(15);
  const [minRange, setMinRange] = useState<number>(120);
  const [maxRange, setMaxRange] = useState<number>(200);

  // Comparator State (Preço 1 vs Preço 2)
  const [compPrice1, setCompPrice1] = useState<number>(150);
  const [compPrice2, setCompPrice2] = useState<number>(195);

  // Smart Notes Scratchpad
  const [smartNotes, setSmartNotes] = useState<string>(
    'Cliente pediu proposta para 5 projetos. Concorrente cobra em média R$ 160. Nosso custo direto é R$ 70 por entrega.'
  );

  // Real-time calculation logic
  const analysis = useMemo(() => {
    let recommended = referencePrice;
    let explanation = '';
    let status: PriceStatus = 'adequate';

    // Objective calculations
    switch (objective) {
      case 'quick_sale':
        // For quick sale, price should be below or at lower boundary of reference
        recommended = Math.round(referencePrice * 0.85);
        if (cost > 0 && recommended < cost * 1.1) {
          recommended = Math.round(cost * 1.15); // Don't sell below minimal cost + safety margin
        }
        if (currentPrice > referencePrice * 0.95) {
          status = 'adjust';
          explanation = `Para vender rapidamente (giro rápido), seu preço atual de ${formatBRL(
            currentPrice
          )} está acima do ideal. Recomendamos reduzir para cerca de ${formatBRL(
            recommended
          )} para atrair compradores imediatos.`;
        } else {
          status = 'adequate';
          explanation = `Seu preço de ${formatBRL(
            currentPrice
          )} está bem posicionado para queima de estoque ou vendas ágeis.`;
        }
        break;

      case 'high_margin':
        recommended = Math.round(Math.max(referencePrice * 1.15, (cost || 0) * 1.6));
        if (currentPrice < referencePrice * 0.95) {
          status = 'adjust';
          explanation = `Seu objetivo é maximizar a margem de lucro, mas você está cobrando ${formatBRL(
            currentPrice
          )}, que está abaixo da referência. Você pode elevar com segurança para ${formatBRL(
            recommended
          )}.`;
        } else if (currentPrice > referencePrice * 1.4) {
          status = 'adjust';
          explanation = `O preço de ${formatBRL(
            currentPrice
          )} pode estar excessivamente alto comparado ao mercado de referência (${formatBRL(
            referencePrice
          )}), o que pode afastar clientes. O ponto de maior margem sustentável é ${formatBRL(
            recommended
          )}.`;
        } else {
          status = 'adequate';
          explanation = `Excelente! O preço atual de ${formatBRL(
            currentPrice
          )} entrega uma margem de lucro sólida e sustentável sem ultrapassar o teto de mercado.`;
        }
        break;

      case 'competitive':
        recommended = Math.round(referencePrice * 0.97); // Slightly below reference
        if (currentPrice > referencePrice * 1.08) {
          status = 'adjust';
          explanation = `Para ser competitivo com o mercado (${formatBRL(
            referencePrice
          )}), o preço de ${formatBRL(
            currentPrice
          )} está elevado. Recomendamos ajustar para ${formatBRL(
            recommended
          )} para ganhar preferência na concorrência.`;
        } else if (currentPrice < referencePrice * 0.85) {
          status = 'adjust';
          explanation = `Seu preço está muito abaixo do mercado (${formatBRL(
            referencePrice
          )}), o que pode passar impressão de menor qualidade. Recomendamos alinhar para ${formatBRL(
            recommended
          )}.`;
        } else {
          status = 'adequate';
          explanation = `Preço competitivo e balanceado com o mercado de referência.`;
        }
        break;

      case 'customer_acquisition':
        recommended = Math.round(referencePrice * 0.88);
        if (currentPrice > referencePrice) {
          status = 'adjust';
          explanation = `Para atrair novos clientes, o preço de ${formatBRL(
            currentPrice
          )} é uma barreira de entrada. Um valor promocional ou de entrada em torno de ${formatBRL(
            recommended
          )} gerará maior conversão.`;
        } else {
          status = 'adequate';
          explanation = `Preço atrativo para novos clientes, facilitando a decisão de compra inicial.`;
        }
        break;

      case 'balanced':
      default:
        recommended = referencePrice;
        const diffPercent = Math.abs(currentPrice - referencePrice) / (referencePrice || 1);
        if (diffPercent > 0.15) {
          status = 'adjust';
          if (currentPrice > referencePrice) {
            explanation = `O preço atual de ${formatBRL(
              currentPrice
            )} está ${Math.round(diffPercent * 100)}% acima do valor de referência (${formatBRL(
              referencePrice
            )}). Considere ajustar para aproximadamente ${formatBRL(recommended)}.`;
          } else {
            explanation = `O preço atual de ${formatBRL(
              currentPrice
            )} está ${Math.round(diffPercent * 100)}% abaixo da referência. Você pode aumentar para ${formatBRL(
              recommended
            )} para não perder receita.`;
          }
        } else {
          status = 'adequate';
          explanation = `O preço de ${formatBRL(
            currentPrice
          )} está equilibrado e perfeitamente compatível com o valor de referência (${formatBRL(
            referencePrice
          )}).`;
        }
        break;
    }

    const difference = currentPrice - recommended;

    // Relative position on scale (0 to 100)
    const minScale = Math.max(1, Math.min(referencePrice * 0.5, currentPrice * 0.7));
    const maxScale = Math.max(referencePrice * 1.5, currentPrice * 1.3);
    const positionPercent = Math.min(
      100,
      Math.max(0, Math.round(((currentPrice - minScale) / (maxScale - minScale)) * 100))
    );

    return {
      status,
      recommendedPrice: recommended,
      difference,
      explanation,
      positionPercent,
      minScale,
      maxScale,
    };
  }, [productName, currentPrice, referencePrice, objective, cost]);

  // Comparator Analysis Logic
  const comparatorResult = useMemo(() => {
    const p1 = compPrice1;
    const p2 = compPrice2;
    const ref = referencePrice || 1;

    const diff1 = Math.abs(p1 - ref) / ref;
    const diff2 = Math.abs(p2 - ref) / ref;

    const status1: PriceStatus = diff1 <= 0.15 ? 'adequate' : 'adjust';
    const status2: PriceStatus = diff2 <= 0.15 ? 'adequate' : 'adjust';

    let verdict = '';
    if (status1 === 'adequate' && status2 === 'adjust') {
      verdict = `O Preço 1 (${formatBRL(p1)}) é o mais indicado para o seu objetivo, mantendo equilíbrio com a referência de mercado.`;
    } else if (status1 === 'adjust' && status2 === 'adequate') {
      verdict = `O Preço 2 (${formatBRL(p2)}) é o mais indicado para o seu objetivo atual.`;
    } else if (status1 === 'adequate' && status2 === 'adequate') {
      verdict = `Ambos os preços estão na faixa aceitável. O Preço 2 (${formatBRL(p2)}) gera mais receita por venda, enquanto o Preço 1 (${formatBRL(p1)}) facilita o fechamento rápido.`;
    } else {
      verdict = `Ambos os preços necessitam de revisão em relação à referência de ${formatBRL(ref)}.`;
    }

    return {
      status1,
      status2,
      verdict,
    };
  }, [compPrice1, compPrice2, referencePrice]);

  // Smart Notes Parser
  const handleApplyNotesContext = () => {
    const text = smartNotes.toLowerCase();
    // Search for numbers with R$ or standalone
    const numbers = smartNotes.match(/R\$\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:reais|unidades|custo|preço)/gi);
    
    // Look for cost keyword
    const costMatch = smartNotes.match(/custo\s*(?:é|de|direto|unitário)?\s*(?:de|é)?\s*R?\$?\s*(\d+(?:[.,]\d+)?)/i);
    if (costMatch && costMatch[1]) {
      const val = parseFloat(costMatch[1].replace(',', '.'));
      if (val > 0) setCost(val);
    }

    // Look for competitor / reference keyword
    const refMatch = smartNotes.match(/(?:concorrente|mercado|média|referência)\s*(?:cobra|é|vende|de)?\s*(?:a|por)?\s*R?\$?\s*(\d+(?:[.,]\d+)?)/i);
    if (refMatch && refMatch[1]) {
      const val = parseFloat(refMatch[1].replace(',', '.'));
      if (val > 0) setReferencePrice(val);
    }
  };

  // Save current analysis
  const handleSaveCurrent = () => {
    savePriceAnalysis({
      productName: productName.trim() || 'Produto / Serviço',
      currentPrice,
      referencePrice,
      objective,
      status: analysis.status,
      recommendedPrice: analysis.recommendedPrice,
      difference: analysis.difference,
      explanation: analysis.explanation,
      cost: showAdvanced ? cost : undefined,
      targetMargin: showAdvanced ? minMarginPercent : undefined,
      maxDiscount: showAdvanced ? maxDiscountPercent : undefined,
      notes: smartNotes,
    });
  };

  return (
    <div id="pricing-assistant-view" className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                Assistente de Preços
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Simule, avalie e descubra o preço ideal para seus produtos e serviços com inteligência prática.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSaveCurrent}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Análise na Planilha</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls & Right Visual Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card: Dados Principais do Produto */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" />
              <span>Dados do Item & Preços</span>
            </h3>

            {/* Nome do Item */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome do Item / Produto / Serviço
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Consultoria Premium, Hambúrguer Artesanal, Camiseta..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden transition-colors"
              />
            </div>

            {/* Preço Atual e Preço Desejado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preço Atual */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Preço Atual</label>
                  <span className="text-[10px] text-blue-400 font-mono font-bold">R$</span>
                </div>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-lg font-bold text-white bg-transparent border-b border-slate-700 pb-1 focus:border-blue-500 focus:outline-hidden"
                />
                {/* Quick adjustment slider */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Ajuste rápido</span>
                    <span className="font-mono text-slate-300">{formatBRL(currentPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.max(1, Math.round(referencePrice * 0.3))}
                    max={Math.round(referencePrice * 2.2)}
                    value={currentPrice}
                    onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
                    aria-label="Ajuste rápido do preço atual"
                    className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Preço Desejado / Referência */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Preço Desejado / Referência
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">MERCADO</span>
                </div>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={referencePrice}
                  onChange={(e) => setReferencePrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-lg font-bold text-white bg-transparent border-b border-slate-700 pb-1 focus:border-blue-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 pt-2 leading-relaxed">
                  Preço cobrado pela concorrência ou valor de referência desejado.
                </p>
              </div>
            </div>

            {/* Objetivo / Necessidade */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Qual é o seu objetivo com este preço?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {OBJECTIVES.map((obj) => {
                  const isSelected = objective === obj.id;
                  return (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => setObjective(obj.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md ring-1 ring-blue-500/30'
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span>{obj.icon}</span>
                        <span className={isSelected ? 'text-blue-300' : 'text-slate-200'}>{obj.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 pl-6 leading-relaxed">
                        {obj.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced Toggle */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full py-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{showAdvanced ? 'Ocultar opções avançadas' : 'Mostrar mais opções (Custos e Margens)'}</span>
                </span>
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Custo Unitário (R$)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cost}
                      onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Margem Mínima (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={minMarginPercent}
                      onChange={(e) => setMinMarginPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Desconto Máximo (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={maxDiscountPercent}
                      onChange={(e) => setMaxDiscountPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Smart Scratchpad Box */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Bloco de Notas Inteligente</span>
              </h3>
              <button
                type="button"
                onClick={handleApplyNotesContext}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white text-[11px] font-semibold transition-all"
              >
                <Zap className="w-3 h-3" />
                <span>Extrair Valores das Notas</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={smartNotes}
              onChange={(e) => setSmartNotes(e.target.value)}
              placeholder="Digite anotações livres como condições negociadas com clientes, preços de fornecedores ou valores da concorrência..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-hidden resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Right Column: Visual Result Card & Scale (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Visual Indicator Card */}
          <div
            className={`p-6 rounded-2xl border transition-all space-y-5 shadow-2xl relative overflow-hidden ${
              analysis.status === 'adequate'
                ? 'bg-gradient-to-b from-slate-900 via-emerald-950/20 to-slate-950 border-emerald-500/60 ring-1 ring-emerald-500/20'
                : 'bg-gradient-to-b from-slate-900 via-rose-950/20 to-slate-950 border-rose-500/60 ring-1 ring-rose-500/20'
            }`}
          >
            {/* Status Big Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resultado da Avaliação
              </span>
              <div
                className={`px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                  analysis.status === 'adequate'
                    ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 animate-pulse'
                    : 'bg-rose-500 text-white shadow-rose-500/20'
                }`}
              >
                {analysis.status === 'adequate' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ADEQUADO</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>AJUSTE</span>
                  </>
                )}
              </div>
            </div>

            {/* Price Comparison Summary */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Preço Atual
                </span>
                <span className="text-xl font-extrabold text-white block mt-0.5">
                  {formatBRL(currentPrice)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Preço Recomendado
                </span>
                <span
                  className={`text-xl font-extrabold block mt-0.5 ${
                    analysis.status === 'adequate' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatBRL(analysis.recommendedPrice)}
                </span>
              </div>
            </div>

            {/* Difference breakdown */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-400">Diferença em relação ao ideal:</span>
              <span
                className={`font-mono font-bold ${
                  analysis.difference === 0
                    ? 'text-emerald-400'
                    : analysis.difference > 0
                    ? 'text-rose-400'
                    : 'text-amber-400'
                }`}
              >
                {analysis.difference > 0 ? `+ ${formatBRL(analysis.difference)}` : analysis.difference < 0 ? `- ${formatBRL(Math.abs(analysis.difference))}` : 'R$ 0,00 (Exato)'}
              </span>
            </div>

            {/* Simple Visual Gauge / Meter Scale */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Baixo</span>
                <span className="text-emerald-400">🟢 Adequado</span>
                <span className="text-rose-400">🔴 Ajuste</span>
              </div>

              <div className="relative h-4 rounded-full bg-slate-950 border border-slate-800 p-0.5 overflow-visible">
                {/* Colored gradient background bar */}
                <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-500 via-emerald-500 via-50% to-rose-500 opacity-80" />

                {/* Pointer indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-slate-950 shadow-xl flex items-center justify-center transition-all duration-200"
                  style={{ left: `${Math.min(95, Math.max(5, analysis.positionPercent))}%` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-1">
                Seu preço ({formatBRL(currentPrice)}) está na posição{' '}
                <strong className="text-white">{analysis.positionPercent}%</strong> da escala simulada.
              </div>
            </div>

            {/* Parecer do Assistente / Explicação sem jargões */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                <span>Parecer do Assistente Financeiro:</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{analysis.explanation}</p>
              <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1 border-t border-slate-800/60">
                <Info className="w-3 h-3 text-slate-500 shrink-0" />
                <span>Estimativa gerada com base nos valores e objetivos que você informou.</span>
              </div>
            </div>
          </div>

          {/* Comparador entre Dois Preços */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>Comparador entre Dois Preços</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Preço 1 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Preço 1</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                      comparatorResult.status1 === 'adequate'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {comparatorResult.status1 === 'adequate' ? '🟢 OK' : '🔴 Ajuste'}
                  </span>
                </div>
                <input
                  type="number"
                  value={compPrice1}
                  onChange={(e) => setCompPrice1(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold text-white bg-transparent border-b border-slate-700 pb-0.5 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Preço 2 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">Preço 2</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase ${
                      comparatorResult.status2 === 'adequate'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {comparatorResult.status2 === 'adequate' ? '🟢 OK' : '🔴 Ajuste'}
                  </span>
                </div>
                <input
                  type="number"
                  value={compPrice2}
                  onChange={(e) => setCompPrice2(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold text-white bg-transparent border-b border-slate-700 pb-0.5 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-300 p-2.5 rounded-lg bg-slate-950 border border-slate-800 leading-relaxed">
              💡 {comparatorResult.verdict}
            </p>
          </div>
        </div>
      </div>

      {/* Histórico de Análises Salvas */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-display font-bold text-base text-white">
              Histórico de Análises da Planilha Atual
            </h3>
            <p className="text-xs text-slate-400">
              Registros guardados em "{activeSheet.name}" com isolamento total de dados.
            </p>
          </div>

          {sheetPriceAnalyses.length > 0 && (
            <button
              onClick={clearPriceAnalyses}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>

        {sheetPriceAnalyses.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Nenhuma análise de preço salva ainda nesta planilha. Clique em "Salvar Análise na Planilha" para guardar simulações.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sheetPriceAnalyses.map((rec) => {
              return (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white">{rec.productName}</h4>
                        <span className="text-[10px] text-slate-500">{formatDate(rec.createdAt)}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          rec.status === 'adequate'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {rec.status === 'adequate' ? 'Adequado' : 'Ajuste'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="text-[9px] text-slate-400 block uppercase">Avaliado</span>
                        <span className="font-bold text-white">{formatBRL(rec.currentPrice)}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80">
                        <span className="text-[9px] text-slate-400 block uppercase">Recomendado</span>
                        <span className="font-bold text-blue-400">{formatBRL(rec.recommendedPrice)}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{rec.explanation}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setProductName(rec.productName);
                        setCurrentPrice(rec.currentPrice);
                        setReferencePrice(rec.referencePrice);
                        setObjective((rec.objective as PricingObjective) || 'balanced');
                        if (rec.cost) {
                          setCost(rec.cost);
                          setShowAdvanced(true);
                        }
                      }}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Recarregar</span>
                    </button>

                    <button
                      onClick={() => deletePriceAnalysis(rec.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Excluir do histórico"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
