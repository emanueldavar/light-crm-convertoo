import { Card } from '@/components/ui/card';
import { AlertTriangle, Flame, ShieldAlert } from 'lucide-react';

interface AlertsBannerProps {
  ltvVsCac: boolean;
  marginBelowTarget: boolean;
  breakEvenBeyondHorizon: boolean;
}

export function AlertsBanner({ ltvVsCac, marginBelowTarget, breakEvenBeyondHorizon }: AlertsBannerProps) {
  const items = [] as Array<{ icon: JSX.Element; title: string; description: string; tone: 'danger' | 'warning' | 'info' }>;
  if (ltvVsCac) {
    items.push({
      icon: <Flame className="h-5 w-5" />,
      title: 'LTV abaixo de 3x CAC',
      description: 'Considere aumentar retenção, ticket médio ou reduzir CAC.',
      tone: 'danger'
    });
  }
  if (marginBelowTarget) {
    items.push({
      icon: <AlertTriangle className="h-5 w-5" />,
      title: 'Margem abaixo da meta',
      description: 'Revise custos diretos, impostos e precificação.',
      tone: 'warning'
    });
  }
  if (breakEvenBeyondHorizon) {
    items.push({
      icon: <ShieldAlert className="h-5 w-5" />,
      title: 'Break-even distante',
      description: 'O ponto de equilíbrio está além da previsão. Ajuste metas ou custos fixos.',
      tone: 'warning'
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="border border-amber-500/60 bg-amber-500/10">
      <div className="space-y-3 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Alertas automáticos</p>
        <div className="grid gap-3 md:grid-cols-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/70 p-3">
              <span className="mt-1 text-amber-500">{item.icon}</span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
