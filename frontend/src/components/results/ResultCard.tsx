import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn, formatCurrency, formatPercent } from '@/lib/utils';
import { FormulaDialog } from './FormulaDialog';

interface ResultCardProps {
  label: string;
  value: number;
  currency?: string;
  description: string;
  formula: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  secondary?: string;
  format?: 'currency' | 'percent' | 'number';
}

export function ResultCard({
  label,
  value,
  currency = 'BRL',
  description,
  formula,
  variant = 'default',
  secondary,
  format = 'currency'
}: ResultCardProps) {
  const formatted = format === 'percent'
    ? formatPercent(value)
    : format === 'number'
    ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
    : formatCurrency(value, currency);
  return (
    <Card
      className={cn(
        'relative flex h-full flex-col justify-between border border-border/80 p-6',
        variant === 'success' && 'border-emerald-500/50',
        variant === 'warning' && 'border-amber-500/60',
        variant === 'danger' && 'border-rose-500/60'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{formatted}</p>
          {secondary ? <p className="text-xs text-muted-foreground">{secondary}</p> : null}
        </div>
        <FormulaDialog title={label} description={description} calculation={formula} />
      </div>
    </Card>
  );
}
