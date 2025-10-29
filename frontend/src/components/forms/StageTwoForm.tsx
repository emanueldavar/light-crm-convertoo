import { FormSection } from './FormSection';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function parse(value: string) {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function StageTwoForm() {
  const stageTwo = useCalculatorStore((state) => state.stageTwo);
  const updateStageTwo = useCalculatorStore((state) => state.updateStageTwo);

  return (
    <FormSection
      title="Metas dinâmicas"
      description="Ajuste a meta de faturamento ou quantidade. O último campo editado prevalece."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="targetRevenue">Meta de faturamento</Label>
          <Input
            id="targetRevenue"
            type="number"
            inputMode="decimal"
            value={stageTwo.targetRevenue}
            onChange={(event) =>
              updateStageTwo({ targetRevenue: parse(event.target.value), lastChanged: 'revenue' })
            }
          />
          <p className="text-xs text-muted-foreground">Alterar este campo recalcula a quantidade necessária.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="targetQuantity">Meta de quantidade</Label>
          <Input
            id="targetQuantity"
            type="number"
            inputMode="decimal"
            value={stageTwo.targetQuantity}
            onChange={(event) =>
              updateStageTwo({ targetQuantity: parse(event.target.value), lastChanged: 'quantity' })
            }
          />
          <p className="text-xs text-muted-foreground">Clientes ou projetos estimados para atingir a meta.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reserves">Reservas</Label>
          <Input
            id="reserves"
            type="number"
            inputMode="decimal"
            value={stageTwo.reserves}
            onChange={(event) => updateStageTwo({ reserves: parse(event.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="withdrawals">Retiradas</Label>
          <Input
            id="withdrawals"
            type="number"
            inputMode="decimal"
            value={stageTwo.withdrawals}
            onChange={(event) => updateStageTwo({ withdrawals: parse(event.target.value) })}
          />
        </div>
      </div>
    </FormSection>
  );
}
