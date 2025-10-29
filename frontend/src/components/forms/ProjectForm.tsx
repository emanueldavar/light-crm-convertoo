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

export function ProjectForm() {
  const project = useCalculatorStore((state) => state.project);
  const updateProject = useCalculatorStore((state) => state.updateProjectSettings);
  const updateEffort = useCalculatorStore((state) => state.updateProjectEffort);
  const addThirdParty = useCalculatorStore((state) => state.addThirdPartyCost);
  const updateThirdParty = useCalculatorStore((state) => state.updateThirdPartyCost);
  const removeThirdParty = useCalculatorStore((state) => state.removeThirdPartyCost);

  return (
    <FormSection
      title="Projeto pontual"
      description="Detalhe orçamento, horas e terceiros."
      action={
        <Button variant="outline" size="sm" onClick={addThirdParty}>
          ➕ incluir custo de terceiro
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Valor total do projeto</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={project.priceSell}
            onChange={(event) => updateProject({ priceSell: parse(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Parcelas</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={project.installments}
            onChange={(event) => updateProject({ installments: parse(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Impostos específicos (%)</Label>
          <Input
            type="number"
            inputMode="decimal"
            value={(project.taxRate * 100).toFixed(2)}
            onChange={(event) => updateProject({ taxRate: parse(event.target.value) / 100 })}
          />
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Horas por função</h4>
        <div className="space-y-2">
          {project.efforts.map((effort) => (
            <div key={effort.role} className="grid gap-3 rounded-2xl border border-border/70 p-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{effort.role}</Label>
                <Input value={effort.hours} type="number" onChange={(event) => updateEffort(effort.role, { hours: parse(event.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Custo/hora</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={effort.hourlyCost}
                  onChange={(event) => updateEffort(effort.role, { hourlyCost: parse(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Total</Label>
                <Input value={(effort.hours * effort.hourlyCost).toFixed(2)} readOnly disabled />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground">Custos de terceiros</h4>
        <div className="space-y-2">
          {project.thirdPartyCosts.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem custos adicionais.</p>
          ) : (
            project.thirdPartyCosts.map((cost) => (
              <div key={cost.id} className="grid gap-3 rounded-2xl border border-border/70 p-3 md:grid-cols-12">
                <div className="md:col-span-6 space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={cost.description}
                    onChange={(event) => updateThirdParty(cost.id, { description: event.target.value })}
                  />
                </div>
                <div className="md:col-span-4 space-y-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={cost.amount}
                    onChange={(event) => updateThirdParty(cost.id, { amount: parse(event.target.value) })}
                  />
                </div>
                <div className="flex items-end justify-end md:col-span-2">
                  <Button variant="ghost" size="icon" onClick={() => removeThirdParty(cost.id)}>
                    🗑️
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </FormSection>
  );
}
