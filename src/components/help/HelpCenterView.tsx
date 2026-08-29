import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface Guide {
  id: number;
  title: string;
  category: string;
  summary: string;
  steps: string[];
}

const GUIDES: Guide[] = [
  {
    id: 1,
    title: '1. Como começar do zero no Finance GL Pro',
    category: 'Primeiros Passos',
    summary: 'Aprenda os passos fundamentais para configurar suas contas e dar início ao seu controle financeiro.',
    steps: [
      'Acesse a aba "Contas" no menu lateral para verificar ou cadastrar suas contas bancárias e carteiras.',
      'Defina o saldo inicial real de cada uma das suas contas.',
      'Conecte seus bancos via Open Finance para sincronização automática dos saldos.',
      'Personalize suas categorias no "Plano de Contas" conforme seu estilo de vida ou negócio.',
    ],
  },
  {
    id: 2,
    title: '2. Como cadastrar receitas',
    category: 'Lançamentos',
    summary: 'Registre salários, faturamento de vendas, comissões e rendimentos com rapidez.',
    steps: [
      'Clique no botão verde "+ Receita" no cabeçalho ou na barra de ações rápidas.',
      'Informe a descrição (Ex: Salário Mensal, Faturamento Cliente X), valor e a data do recebimento.',
      'Selecione a categoria e a conta bancária de destino.',
      'Defina se o valor já foi creditado (Pago/Concluído) ou se é uma receita futura (Pendente).',
    ],
  },
  {
    id: 3,
    title: '3. Como cadastrar despesas',
    category: 'Lançamentos',
    summary: 'Mantenha o controle de gastos diários, custos fixos e compras no cartão.',
    steps: [
      'Clique no botão vermelho "− Despesa" no cabeçalho.',
      'Digite a descrição do gasto e o valor.',
      'Classifique na categoria correta (Ex: Moradia, Alimentação, Marketing, Impostos).',
      'Defina a conta/cartão de débito e a data de vencimento.',
    ],
  },
  {
    id: 4,
    title: '4. Como controlar contas a pagar',
    category: 'Obrigações',
    summary: 'Evite juros e multas acompanhando boletos e faturas organizados por data de vencimento.',
    steps: [
      'Acesse "Contas a Pagar" no menu lateral.',
      'Utilize os filtros rápidos: "Hoje", "Próximos 7 dias", "Próximos 30 dias" ou "Vencidas".',
      'Quando efetuar o pagamento, basta clicar no botão "Pagar" ao lado da conta para dar baixa imediata e debitar do saldo.',
    ],
  },
  {
    id: 5,
    title: '5. Como acompanhar contas a receber',
    category: 'Faturamento',
    summary: 'Gerencie contratos, notas fiscais e recebíveis de clientes com previsão de caixa.',
    steps: [
      'Acesse "Contas a Receber" no menu lateral.',
      'Identifique quais valores estão previstos para os próximos dias e quais estão atrasados.',
      'Assim que o cliente efetuar o pagamento, clique em "Confirmar" para somar ao seu saldo disponível.',
    ],
  },
  {
    id: 6,
    title: '6. Como entender o Fluxo de Caixa',
    category: 'Análise Financeira',
    summary: 'Entenda a relação entre o saldo inicial, entradas, saídas e o saldo final da sua empresa ou família.',
    steps: [
      'Acesse a tela "Fluxo de Caixa".',
      'Selecione a visão desejada: Diária, Semanal ou Mensal.',
      'Avalie a linha do Resultado Líquido: se o resultado for positivo (azul), suas receitas superaram as despesas; se negativo (vermelho), é hora de ajustar custos.',
    ],
  },
  {
    id: 7,
    title: '7. Como criar e gerenciar metas financeiras',
    category: 'Planejamento',
    summary: 'Crie objetivos claros como reserva de emergência, viagens e investimentos.',
    steps: [
      'Acesse "Metas Financeiras" e clique em "+ Nova Meta".',
      'Defina o valor alvo, prazo e a quantia que você já possui guardada.',
      'Conforme economizar, clique em "Adicionar Aporte" para atualizar a barra de progresso.',
      'Ao atingir 100%, o sistema comemorará sua conquista com efeitos visuais!',
    ],
  },
  {
    id: 8,
    title: '8. Como criar e alternar planilhas',
    category: 'Multi-Planilhas',
    summary: 'Tenha controles separados para sua vida pessoal, empresa PJ, casal ou projetos paralelos.',
    steps: [
      'Acesse "Minhas Planilhas" no menu lateral.',
      'Clique em "+ Criar Nova Planilha", escolha um nome e o modelo inicial.',
      'Para alternar entre planilhas a qualquer momento, use o seletor rápido ou clique em "Abrir".',
      'Você também pode duplicar uma planilha existente para criar um novo ano fiscal com a mesma estrutura.',
    ],
  },
  {
    id: 9,
    title: '9. Como exportar relatórios para PDF e Excel',
    category: 'Relatórios',
    summary: 'Gere demonstrativos prontos para seu contador, sócios ou arquivo pessoal.',
    steps: [
      'Acesse "Relatórios" no menu lateral.',
      'Escolha o tipo de relatório (Mensal, Anual, Por Categoria ou Fluxo Acumulado).',
      'Selecione o mês e ano desejados.',
      'Clique em "Exportar Relatório" para baixar o arquivo .csv ou em "Imprimir PDF" para gerar um documento formatado.',
    ],
  },
  {
    id: 10,
    title: '10. Dicas de ouro da GL Studios para organização financeira',
    category: 'Educação Financeira',
    summary: 'Recomendações práticas para manter suas contas saudáveis e acumular patrimônio.',
    steps: [
      'Regra 50-30-20: destine 50% da sua renda para necessidades essenciais, 30% para estilo de vida e 20% para metas e investimentos.',
      'Crie uma Reserva de Emergência equivalente a pelo menos 6 meses dos seus custos fixos.',
      'Nunca misture finanças da pessoa física (PF) com as finanças da empresa (PJ). Use o recurso de múltiplas planilhas do Finance GL Pro.',
      'Lance suas despesas no mesmo dia em que elas acontecerem para manter seu saldo sempre preciso.',
    ],
  },
];

const FAQS = [
  {
    q: 'O Finance GL Pro funciona no celular?',
    a: 'Sim! Toda a interface foi desenvolvida de forma 100% responsiva para computadores, notebooks, tablets e smartphones.',
  },
  {
    q: 'Meus dados ficam seguros?',
    a: 'Sim. Seus dados ficam armazenados localmente e de forma criptografada no seu dispositivo. Você também pode exportar backups completos em arquivo .JSON quando desejar.',
  },
  {
    q: 'Como funciona a sincronização Open Finance?',
    a: 'A sincronização Open Finance utiliza os protocolos seguros do Banco Central do Brasil para consultar e atualizar os saldos bancários das suas contas conectadas.',
  },
  {
    q: 'Posso cadastrar quantas contas e categorias eu quiser?',
    a: 'Sim, o Finance GL Pro não possui limite de contas, categorias, metas ou lançamentos.',
  },
];

export const HelpCenterView: React.FC = () => {
  const { setOnboardingOpen, setActiveTab } = useFinance();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedGuideId, setExpandedGuideId] = useState<number | null>(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredGuides = GUIDES.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="help-center-view" className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hero Help Header */}
      <div className="text-center py-6 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Central de Ajuda & Conhecimento GL Studios</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white tracking-tight">
          Como podemos ajudar você hoje?
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Confira nossos 10 guias passo a passo, tutoriais rápidos e respostas para as dúvidas mais frequentes
        </p>

        {/* Interactive Search Bar */}
        <div className="relative max-w-lg mx-auto mt-6">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Pesquisar nos tutoriais e guias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden shadow-xl"
          />
        </div>
      </div>

      {/* Quick Interactive Tour Trigger */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border border-blue-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Prefere um tour guiado pelo sistema?</h3>
            <p className="text-xs text-slate-400">
              Assista ao passo a passo de boas-vindas do Finance GL Pro em 4 etapas simples.
            </p>
          </div>
        </div>
        <button
          onClick={() => setOnboardingOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all shrink-0"
        >
          Iniciar Tutorial Guiado
        </button>
      </div>

      {/* 10 Step-by-Step Guides Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white">
            10 Guias Passo a Passo
          </h2>
          <span className="text-xs text-slate-400">{filteredGuides.length} guias disponíveis</span>
        </div>

        <div className="space-y-3">
          {filteredGuides.map((guide) => {
            const isExpanded = expandedGuideId === guide.id;

            return (
              <div
                key={guide.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedGuideId(isExpanded ? null : guide.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-850/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                      {guide.id}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                        {guide.category}
                      </span>
                      <h3 className="font-bold text-sm text-white">{guide.title}</h3>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-800/60 space-y-3 animate-in fade-in">
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {guide.summary}
                    </p>

                    <div className="space-y-2 pt-2">
                      {guide.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <span className="w-5 h-5 rounded-full bg-slate-950 border border-slate-800 text-blue-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-display font-bold text-white">Perguntas Frequentes (FAQ)</h2>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isExpanded = expandedFaq === idx;

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg cursor-pointer"
                onClick={() => setExpandedFaq(isExpanded ? null : idx)}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span>{faq.q}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                {isExpanded && (
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed pt-2 border-t border-slate-800/60">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
