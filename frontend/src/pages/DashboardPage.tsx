import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { computeCalculatorResults } from '@/lib/calculations';
import { formatCurrency, formatPercent } from '@/lib/utils';

function LineChart({
  data,
  currency
}: {
  data: Array<{ month: number; revenue: number; costs: number; profit: number }>;
  currency: string;
}) {
  const width = 520;
  const height = 220;
  const max = Math.max(
    ...data.flatMap((item) => [item.revenue, item.costs, Math.abs(item.profit)])
  );
  const buildPoints = (key: 'revenue' | 'costs' | 'profit') =>
    data
      .map((item, index) => {
        const x = data.length > 1 ? (index / (data.length - 1)) * (width - 40) + 20 : width / 2;
        const value = key === 'profit' ? item.profit + max : item[key];
        const normalized = max > 0 ? value / (max * (key === 'profit' ? 2 : 1)) : 0;
        const y = height - normalized * (height - 40) - 20;
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      <defs>
        <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill="url(#gridPattern)" />
      <polyline points={buildPoints('revenue')} fill="none" stroke="#6366f1" strokeWidth={2.5} />
      <polyline points={buildPoints('costs')} fill="none" stroke="#f97316" strokeWidth={2.5} />
      <polyline points={buildPoints('profit')} fill="none" stroke="#22c55e" strokeWidth={2.5} />
      {data.map((item, index) => (
        <text key={item.month} x={index === data.length - 1 ? width - 30 : index === 0 ? 20 : (index / (data.length - 1)) * (width - 40) + 20} y={height - 4} className="text-[10px] fill-muted-foreground">
          M{item.month}
        </text>
      ))}
    </svg>
  );
}

function PieChart({
  data
}: {
  data: Array<{ name: string; value: number }>;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let accumulator = 0;
  const segments = data.map((item) => {
    const start = accumulator / total;
    accumulator += item.value;
    const end = accumulator / total;
    const largeArc = end - start > 0.5 ? 1 : 0;
    const startAngle = start * Math.PI * 2;
    const endAngle = end * Math.PI * 2;
    const x1 = 120 + Math.cos(startAngle) * 100;
    const y1 = 120 + Math.sin(startAngle) * 100;
    const x2 = 120 + Math.cos(endAngle) * 100;
    const y2 = 120 + Math.sin(endAngle) * 100;
    const pathData = `M120,120 L${x1},${y1} A100,100 0 ${largeArc} 1 ${x2},${y2} Z`;
    return { pathData, item };
  });

  return (
    <svg viewBox="0 0 240 240" className="h-full w-full">
      {segments.map(({ pathData, item }, index) => (
        <path key={item.name} d={pathData} fill={`hsl(${index * 65} 80% 60%)`} opacity={0.85} />
      ))}
    </svg>
  );
}

function BarChart({ data }: { data: Array<{ name: string; roi: number }> }) {
  return (
    <div className="flex h-full w-full flex-col justify-end gap-2">
      {data.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span>{item.name}</span>
            <span>{formatPercent(item.roi)}</span>
          </div>
          <div className="h-3 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-cyan-400"
              style={{ width: `${Math.min(Math.abs(item.roi) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardPage() {
  const general = useCalculatorStore((state) => state.general);
  const results = useCalculatorStore((state) => computeCalculatorResults(state));
  const timeline = results.stageOne.timeline;
  const costComposition = results.stageOne.costComposition;
  const roiByProduct = results.stageOne.mode === 'recurring' ? results.stageOne.roiByProduct : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard financeiro</h1>
        <p className="text-muted-foreground">Resumo visual de receitas, custos, ROI e reinvestimentos.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Receita acumulada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(results.stageOne.totalRevenue, general.currency)}</p>
            <p className="text-xs text-muted-foreground">Considerando {general.forecastMonths} meses.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lucro operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              {formatCurrency((results.stageOne as any).operationalProfit ?? 0, general.currency)}
            </p>
            <p className="text-xs text-muted-foreground">Margem após custos fixos e diretos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ROI projetado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatPercent(results.stageTwo.projectedROI)}</p>
            <p className="text-xs text-muted-foreground">Com metas dinâmicas aplicadas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valor reinvestível</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(results.stageTwo.reinvestibleValue, general.currency)}</p>
            <p className="text-xs text-muted-foreground">Após reservas e retiradas.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-[360px]">
          <CardHeader>
            <CardTitle>Evolução mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <LineChart data={timeline} currency={general.currency} />
          </CardContent>
        </Card>
        <Card className="h-[360px]">
          <CardHeader>
            <CardTitle>Composição de custos</CardTitle>
          </CardHeader>
          <CardContent className="flex h-full flex-col items-center justify-center gap-4">
            <div className="h-60 w-60">
              <PieChart data={costComposition} />
            </div>
            <div className="grid w-full grid-cols-2 gap-2 text-xs text-muted-foreground">
              {costComposition.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: `hsl(${index * 65} 80% 60%)` }}
                  />
                  <span>
                    {item.name}: {formatCurrency(item.value, general.currency)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-[340px]">
          <CardHeader>
            <CardTitle>ROI por produto/plano</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <BarChart data={roiByProduct.length > 0 ? roiByProduct : [{ name: 'Projeto', roi: results.stageOne.roi }]} />
          </CardContent>
        </Card>
        <Card className="h-[340px]">
          <CardHeader>
            <CardTitle>Indicadores-chave</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
              <span>Margem atual</span>
              <strong>{formatPercent(results.stageOne.marginPercent)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
              <span>Ticket médio</span>
              <strong>
                {formatCurrency(
                  results.stageOne.mode === 'recurring'
                    ? (results.stageOne as any).monthlyRevenue / Math.max((results.stageOne as any).customers, 1)
                    : results.stageOne.totalRevenue,
                  general.currency
                )}
              </strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
              <span>Break-even</span>
              <strong>
                {results.stageOne.mode === 'recurring'
                  ? `${Math.round((results.stageOne as any).breakEvenClients)} clientes`
                  : `${Math.round((results.stageOne as any).breakEvenProjects)} projetos`}
              </strong>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
              <span>Meta reinvestível</span>
              <strong>{formatCurrency(results.stageTwo.reinvestibleValue, general.currency)}</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
