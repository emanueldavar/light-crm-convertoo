import { useCalculatorStore } from '@/store/useCalculatorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from './FormSection';

function parse(value: string) {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function CACChurnForm() {
  const general = useCalculatorStore((state) => state.general);
  const updateGeneral = useCalculatorStore((state) => state.updateGeneral);
  const variableCosts = useCalculatorStore((state) => state.recurring.variableCosts);
  const updateVariableCosts = useCalculatorStore((state) => state.updateVariableCosts);

  return (
    <FormSection
      title="CAC, Churn e suporte"
      description="Defina métricas de aquisição e retenção."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="cac">CAC por cliente/projeto</Label>
          <Input
            id="cac"
            type="number"
            inputMode="decimal"
            value={general.cac}
            onChange={(event) => updateGeneral({ cac: parse(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="churn">Churn mensal (%)</Label>
          <Input
            id="churn"
            type="number"
            inputMode="decimal"
            value={(general.churnMonthly * 100).toFixed(2)}
            onChange={(event) => updateGeneral({ churnMonthly: parse(event.target.value) / 100 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportHours">Horas de suporte (por cliente)</Label>
          <Input
            id="supportHours"
            type="number"
            inputMode="decimal"
            value={variableCosts.supportHours}
            onChange={(event) => updateVariableCosts({ supportHours: parse(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportCost">Custo hora suporte</Label>
          <Input
            id="supportCost"
            type="number"
            inputMode="decimal"
            value={variableCosts.supportHourCost}
            onChange={(event) => updateVariableCosts({ supportHourCost: parse(event.target.value) })}
          />
        </div>
      </div>
    </FormSection>
  );
}
