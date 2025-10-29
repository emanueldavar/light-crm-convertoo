import { useCalculatorStore } from '@/store/useCalculatorStore';
import { FormSection } from './FormSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

function parse(value: string) {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function RecurringPlansForm() {
  const plans = useCalculatorStore((state) => state.recurring.plans);
  const addPlan = useCalculatorStore((state) => state.addRecurringPlan);
  const updatePlan = useCalculatorStore((state) => state.updateRecurringPlan);
  const removePlan = useCalculatorStore((state) => state.removeRecurringPlan);
  const addAddon = useCalculatorStore((state) => state.addAddonToPlan);
  const updateAddon = useCalculatorStore((state) => state.updateAddon);
  const removeAddon = useCalculatorStore((state) => state.removeAddon);

  return (
    <FormSection
      title="Planos recorrentes"
      description="Defina planos ativos, impostos e add-ons."
      action={
        <Button variant="outline" size="sm" onClick={addPlan}>
          ➕ novo plano
        </Button>
      }
    >
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="space-y-4 rounded-3xl border border-border/80 p-4">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2 space-y-2">
                <Label>Nome</Label>
                <Input value={plan.name} onChange={(event) => updatePlan(plan.id, { name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Preço de venda</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={plan.priceSell}
                  onChange={(event) => updatePlan(plan.id, { priceSell: parse(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Custo parceiro</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={plan.partnerCost}
                  onChange={(event) => updatePlan(plan.id, { partnerCost: parse(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Clientes</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={plan.customers}
                  onChange={(event) => updatePlan(plan.id, { customers: parse(event.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Imposto específico (%)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={plan.taxRate !== undefined ? (plan.taxRate * 100).toFixed(2) : ''}
                  placeholder={(plan.taxRate ?? 0).toFixed(2)}
                  onChange={(event) =>
                    updatePlan(plan.id, {
                      taxRate: event.target.value === '' ? undefined : parse(event.target.value) / 100
                    })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={() => removePlan(plan.id)} className="ml-auto">
                  🗑️ remover plano
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground">Add-ons</h4>
                <Button variant="secondary" size="sm" onClick={() => addAddon(plan.id)}>
                  ➕ add-on
                </Button>
              </div>
              <div className="space-y-2">
                {plan.addons.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum add-on configurado.</p>
                ) : (
                  plan.addons.map((addon) => (
                    <div key={addon.id} className="grid gap-3 rounded-2xl border border-border/60 p-3 md:grid-cols-5">
                      <div className="md:col-span-2 space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={addon.name}
                          onChange={(event) => updateAddon(plan.id, addon.id, { name: event.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Preço unidade</Label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={addon.priceSellUnit}
                          onChange={(event) =>
                            updateAddon(plan.id, addon.id, { priceSellUnit: parse(event.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Custo unidade</Label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={addon.partnerCostUnit}
                          onChange={(event) =>
                            updateAddon(plan.id, addon.id, { partnerCostUnit: parse(event.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantidade</Label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={addon.quantity}
                          onChange={(event) =>
                            updateAddon(plan.id, addon.id, { quantity: parse(event.target.value) })
                          }
                        />
                      </div>
                      <div className="flex items-end justify-end md:col-span-5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAddon(plan.id, addon.id)}
                          aria-label="Remover add-on"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
