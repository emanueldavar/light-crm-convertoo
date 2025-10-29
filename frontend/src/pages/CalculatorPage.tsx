import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GeneralSettingsForm } from '@/components/forms/GeneralSettingsForm';
import { FixedCostsForm } from '@/components/forms/FixedCostsForm';
import { VariableCostsForm } from '@/components/forms/VariableCostsForm';
import { RecurringPlansForm } from '@/components/forms/RecurringPlansForm';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { StageTwoForm } from '@/components/forms/StageTwoForm';
import { CACChurnForm } from '@/components/forms/CACChurnForm';
import { SnapshotActions } from '@/components/forms/SnapshotActions';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { computeCalculatorResults, type RecurringStageOneResults, type ProjectStageOneResults } from '@/lib/calculations';
import { ResultCard } from '@/components/results/ResultCard';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { AlertsBanner } from '@/components/results/AlertsBanner';

export function CalculatorPage() {
  const mode = useCalculatorStore((state) => state.mode);
  const setMode = useCalculatorStore((state) => state.setMode);
  const stage = useCalculatorStore((state) => state.stage);
  const setStage = useCalculatorStore((state) => state.setStage);
  const general = useCalculatorStore((state) => state.general);
  const results = useCalculatorStore((state) => computeCalculatorResults(state));
  const [activeResultsTab, setActiveResultsTab] = useState<'stage1' | 'stage2'>('stage1');

  const stageOne = results.stageOne;
  const stageTwo = results.stageTwo;

  const stageOneCards = useMemo(() => {
    const currency = general.currency;
    if (stageOne.mode === 'recurring') {
      const data = stageOne as RecurringStageOneResults;
      return [
        {
          label: 'Receita bruta',
          value: data.totalRevenue,
          description: 'Soma de (preço de venda × clientes × meses).',
          formula: 'Receita = Σ(preço × quantidade)',
          secondary: `${formatCurrency(data.monthlyRevenue, currency)} / mês`,
          format: 'currency'
        },
        {
          label: 'Custos diretos',
          value: data.totalDirectCosts,
          description: 'Custos de parceiro, suporte, add-ons e implantação.',
          formula: 'Custos diretos = Σ(custo parceiro + suporte + variáveis)',
          format: 'currency'
        },
        {
          label: 'Impostos',
          value: data.totalTaxes,
          description: 'Tributos calculados por plano ou alíquota global.',
          formula: 'Impostos = Receita × alíquota',
          format: 'currency'
        },
        {
          label: 'Margem de contribuição',
          value: data.marginValue,
          description: 'Receita após impostos e custos diretos.',
          formula: 'Margem = Receita − Impostos − Custos diretos',
          secondary: formatPercent(data.marginPercent),
          format: 'currency'
        },
        {
          label: 'Rateio de fixos',
          value: data.fixedCostAllocation,
          description: 'Somatório de despesas fixas distribuídas.',
          formula: 'Rateio = Σ(custos fixos)',
          format: 'currency'
        },
        {
          label: 'Lucro operacional',
          value: data.operationalProfit,
          description: 'Margem após descontar os fixos rateados.',
          formula: 'Lucro = Margem − Rateio',
          format: 'currency'
        },
        {
          label: 'Markup',
          value: data.markup,
          description: 'Indicador de precificação sobre custo.',
          formula: 'Markup = Preço ÷ Custo',
          secondary: `${data.markup.toFixed(2)}x`,
          format: 'number'
        },
        {
          label: 'ARPU',
          value: data.arpu,
          description: 'Receita média por cliente por mês.',
          formula: 'ARPU = Receita mensal ÷ Clientes',
          format: 'currency'
        },
        {
          label: 'LTV',
          value: data.ltv,
          description: 'Valor do ciclo de vida com base em churn e margem.',
          formula: 'LTV = ARPU × (1 / churn) × margem%',
          variant: data.ltv < 3 * general.cac ? 'danger' : 'default',
          format: 'currency'
        },
        {
          label: 'Payback CAC (meses)',
          value: Number.isFinite(data.payback) ? data.payback : 0,
          description: 'Tempo para recuperar investimento em aquisição.',
          formula: 'Payback = CAC ÷ Margem mensal por cliente',
          format: 'number',
          secondary: 'meses'
        },
        {
          label: 'Break-even (clientes)',
          value: Number.isFinite(data.breakEvenClients) ? data.breakEvenClients : 0,
          description: 'Clientes necessários para cobrir custos fixos.',
          formula: 'Break-even = Custos fixos ÷ Margem por cliente',
          format: 'number'
        },
        {
          label: 'ROI',
          value: data.roi,
          description: 'Retorno sobre custos diretos + fixos + CAC.',
          formula: 'ROI = Lucro ÷ (Custos totais + CAC)',
          format: 'percent'
        }
      ];
    }
    const data = stageOne as ProjectStageOneResults;
    return [
      {
        label: 'Receita do projeto',
        format: 'currency',
        value: data.totalRevenue,
        description: 'Valor total negociado para o projeto.',
        formula: 'Receita = Preço final'
      },
      {
        label: 'Custo total horas',
        format: 'currency',
        value: data.hoursCost,
        description: 'Somatório de horas × custo por função.',
        formula: 'Horas × custo/hora'
      },
      {
        label: 'Custo terceiros',
        format: 'currency',
        value: data.thirdPartyCost,
        description: 'Plugins, templates, APIs, fornecedores.',
        formula: 'Σ custos terceiros'
      },
      {
        label: 'Custo direto',
        format: 'currency',
        value: data.totalDirectCosts,
        description: 'Horas + terceiros ajustados pela sensibilidade.',
        formula: 'Direto = Horas + Terceiros'
      },
      {
        label: 'Impostos',
        format: 'currency',
        value: data.totalTaxes,
        description: 'Tributação específica do projeto.',
        formula: 'Impostos = Receita × alíquota'
      },
      {
        label: 'Margem de contribuição',
        format: 'currency',
        value: data.marginValue,
        description: 'Lucro antes dos fixos.',
        formula: 'Margem = Receita − Custos − Impostos',
        secondary: formatPercent(data.marginPercent)
      },
      {
        label: 'Lucro líquido',
        format: 'currency',
        value: data.operationalProfit,
        description: 'Margem descontando rateio de fixos.',
        formula: 'Lucro líquido = Margem − Fixos'
      },
      {
        label: 'Markup',
        format: 'number',
        value: data.markup,
        description: 'Relação entre preço e custo direto.',
        formula: 'Markup = Preço ÷ Custo'
      },
      {
        label: 'Preço mínimo ideal',
        format: 'currency',
        value: data.priceIdeal,
        description: 'Preço para atingir a margem alvo.',
        formula: 'Preço ideal = Custo ÷ (1 − margem alvo)'
      },
      {
        label: 'ROI por projeto',
        value: data.roi,
        format: 'percent',
        description: 'Retorno considerando CAC e custos.',
        formula: 'ROI = Lucro ÷ (Custos totais + CAC)',
        secondary: formatPercent(data.roi),
        isPercent: false
      },
      {
        label: 'Break-even (projetos)',
        format: 'number',
        value: Number.isFinite(data.breakEvenProjects) ? data.breakEvenProjects : 0,
        description: 'Projetos necessários para pagar os fixos.',
        formula: 'Break-even = Fixos ÷ Margem por projeto'
      }
    ];
  }, [stageOne, general.currency, general.cac]);

  const stageTwoCards = useMemo(() => {
    const currency = general.currency;
    return [
      {
        label: 'Receita total prevista',
        format: 'currency',
        value: stageTwo.targetRevenue,
        description: 'Meta aplicada após ajustes dinâmicos.',
        formula: 'Receita meta = quantidade × ticket médio'
      },
      {
        label: 'Meta de quantidade',
        format: 'number',
        value: stageTwo.targetQuantity,
        description: 'Clientes ou projetos necessários.',
        formula: 'Quantidade = Receita ÷ ticket médio'
      },
      {
        label: 'Lucro projetado',
        format: 'currency',
        value: stageTwo.projectedProfit,
        description: 'Lucro líquido considerando CAC e fixos.',
        formula: 'Lucro projetado = Margem projetada − Fixos − CAC'
      },
      {
        label: 'Margem de contribuição (%)',
        value: stageTwo.projectedMarginPercent,
        format: 'percent',
        description: 'Margem prevista sobre a receita meta.',
        formula: 'Margem% = Margem projetada ÷ Receita meta',
        isPercent: true
      },
      {
        label: 'ROI total',
        value: stageTwo.projectedROI,
        format: 'percent',
        description: 'Retorno estimado com base na meta.',
        formula: 'ROI = Lucro projetado ÷ (Custos projetados)',
        isPercent: true
      },
      {
        label: 'Ponto de equilíbrio vs meta',
        value: stageTwo.breakEvenGap,
        format: 'number',
        description: 'Diferença entre meta e ponto de equilíbrio.',
        formula:
          stageOne.mode === 'recurring'
            ? 'Gap = Quantidade meta − Break-even clientes'
            : 'Gap = Projetos meta − Break-even projetos'
      },
      {
        label: 'Valor reinvestível',
        value: stageTwo.reinvestibleValue,
        format: 'currency',
        description: 'Lucro líquido após reservas e retiradas.',
        formula: 'Reinvestível = Lucro projetado − Reservas − Retiradas'
      }
    ];
  }, [stageOne.mode, stageTwo, general.currency]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Tipo de cálculo</p>
          <div className="mt-2 flex gap-3">
            <Button
              variant={mode === 'recurring' ? 'default' : 'outline'}
              onClick={() => setMode('recurring')}
            >
              Recorrência (SaaS)
            </Button>
            <Button variant={mode === 'one_off' ? 'default' : 'outline'} onClick={() => setMode('one_off')}>
              Projeto Pontual
            </Button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estágio de cálculo</p>
          <div className="flex gap-2">
            <Button variant={stage === 1 ? 'default' : 'outline'} onClick={() => setStage(1)}>
              Estágio 1
            </Button>
            <Button variant={stage === 2 ? 'default' : 'outline'} onClick={() => setStage(2)}>
              Estágio 2
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${stage}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="grid gap-6 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
            <GeneralSettingsForm />
            {stage === 1 && (
              <>
                <FixedCostsForm />
                {mode === 'recurring' ? (
                  <>
                    <VariableCostsForm />
                    <RecurringPlansForm />
                  </>
                ) : (
                  <ProjectForm />
                )}
                <CACChurnForm />
              </>
            )}
            {stage === 2 && <StageTwoForm />}
            <SnapshotActions />
          </div>
          <div className="space-y-6">
            <AlertsBanner
              ltvVsCac={results.stageOne.alerts.ltvVsCac}
              marginBelowTarget={results.stageOne.alerts.marginBelowTarget}
              breakEvenBeyondHorizon={results.stageOne.alerts.breakEvenBeyondHorizon}
            />
            <div className="space-y-4">
              <div className="flex gap-2 rounded-2xl bg-muted p-1">
                <button
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${activeResultsTab === 'stage1' ? 'bg-background shadow' : 'text-muted-foreground hover:bg-muted/70'}`}
                  onClick={() => setActiveResultsTab('stage1')}
                >
                  Resultados Estágio 1
                </button>
                <button
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition ${activeResultsTab === 'stage2' ? 'bg-background shadow' : 'text-muted-foreground hover:bg-muted/70'}`}
                  onClick={() => setActiveResultsTab('stage2')}
                >
                  Resultados Estágio 2
                </button>
              </div>
              {activeResultsTab === 'stage1' ? (
                <div className="grid gap-4">
                  {stageOneCards.map((card) => (
                    <ResultCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      currency={general.currency}
                      description={card.description}
                      formula={card.formula}
                      secondary={card.secondary}
                      variant={(card as any).variant}
                      format={card.format ?? 'currency'}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {stageTwoCards.map((card) => (
                    <ResultCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      currency={general.currency}
                      description={card.description}
                      formula={card.formula}
                      secondary={card.secondary}
                      format={card.format ?? 'currency'}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
