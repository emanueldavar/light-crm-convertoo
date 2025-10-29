import { useCalculatorStore } from '@/store/useCalculatorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from './FormSection';

function parse(value: string) {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function VariableCostsForm() {
  const variableCosts = useCalculatorStore((state) => state.recurring.variableCosts);
  const updateVariableCosts = useCalculatorStore((state) => state.updateVariableCosts);

  return (
    <FormSection
      title="Custos variáveis"
      description="Mensalidades de parceiros, adicionais e implantação."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="partnerMonthly">Mensalidade do parceiro</Label>
          <Input
            id="partnerMonthly"
            type="number"
            inputMode="decimal"
            value={variableCosts.partnerMonthly}
            onChange={(event) => updateVariableCosts({ partnerMonthly: parse(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="additionalCosts">Custos adicionais</Label>
          <Input
            id="additionalCosts"
            type="number"
            inputMode="decimal"
            value={variableCosts.additional}
            onChange={(event) => updateVariableCosts({ additional: parse(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="setupFee">Taxa de implantação parceiro</Label>
          <Input
            id="setupFee"
            type="number"
            inputMode="decimal"
            value={variableCosts.partnerSetupFee}
            onChange={(event) => updateVariableCosts({ partnerSetupFee: parse(event.target.value) })}
          />
        </div>
      </div>
    </FormSection>
  );
}
