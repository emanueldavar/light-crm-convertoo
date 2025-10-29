import { Fragment } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormSection } from './FormSection';

function parse(value: string) {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function FixedCostsForm() {
  const fixedCosts = useCalculatorStore((state) => state.fixedCosts);
  const updateAmount = useCalculatorStore((state) => state.updateFixedCostAmount);
  const updateWeight = useCalculatorStore((state) => state.updateFixedCostWeight);
  const addFixedCost = useCalculatorStore((state) => state.addFixedCost);
  const removeFixedCost = useCalculatorStore((state) => state.removeFixedCost);

  return (
    <FormSection
      title="Custos fixos"
      description="Edite o rateio de despesas fixas mensais."
      action={
        <Button
          variant="outline"
          size="sm"
          onClick={() => addFixedCost({ name: 'Novo custo', amount: 0, weight: 1, category: 'operacional' })}
        >
          ➕ adicionar
        </Button>
      }
    >
      <div className="grid gap-4">
        {fixedCosts.map((item) => (
          <Fragment key={item.id}>
            <div className="grid gap-3 rounded-2xl border border-border/80 p-4 md:grid-cols-12">
              <div className="md:col-span-5">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Custo</Label>
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <div className="md:col-span-3">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Valor mensal</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={item.amount}
                  onChange={(event) => updateAmount(item.id, parse(event.target.value))}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">Peso</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={item.weight}
                  onChange={(event) => updateWeight(item.id, parse(event.target.value))}
                />
              </div>
              <div className="flex items-end justify-end md:col-span-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFixedCost(item.id)}
                  aria-label={`Remover ${item.name}`}
                >
                  🗑️
                </Button>
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </FormSection>
  );
}
