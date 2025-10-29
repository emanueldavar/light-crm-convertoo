import { ChangeEvent } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from './FormSection';

function parseNumeric(value: string) {
  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function GeneralSettingsForm() {
  const general = useCalculatorStore((state) => state.general);
  const updateGeneral = useCalculatorStore((state) => state.updateGeneral);

  const handleChange = (key: keyof typeof general) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = parseNumeric(event.target.value);
    updateGeneral({ [key]: value } as Partial<typeof general>);
  };

  return (
    <FormSection
      title="Configurações iniciais"
      description="Defina projeção, impostos globais e parâmetros de rateio."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="forecastMonths">Meses de previsão</Label>
          <Input
            id="forecastMonths"
            type="number"
            min={1}
            value={general.forecastMonths}
            onChange={handleChange('forecastMonths')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Moeda</Label>
          <select
            id="currency"
            className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={general.currency}
            onChange={(event) => updateGeneral({ currency: event.target.value })}
          >
            <option value="BRL">Real (BRL)</option>
            <option value="USD">Dólar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="globalTax">Impostos globais (%)</Label>
          <Input
            id="globalTax"
            type="number"
            step="0.01"
            value={(general.globalTax * 100).toFixed(2)}
            onChange={(event) => updateGeneral({ globalTax: parseNumeric(event.target.value) / 100 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="marginTarget">Margem alvo (%)</Label>
          <Input
            id="marginTarget"
            type="number"
            step="0.01"
            value={(general.marginTarget * 100).toFixed(2)}
            onChange={(event) => updateGeneral({ marginTarget: parseNumeric(event.target.value) / 100 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rateioMethod">Método de rateio</Label>
          <select
            id="rateioMethod"
            className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={general.rateioMethod}
            onChange={(event) => updateGeneral({ rateioMethod: event.target.value as any })}
          >
            <option value="clientes">Por clientes</option>
            <option value="receita">Por receita</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Sensibilidade de custos (±10%)</Label>
          <div className="space-y-3 rounded-2xl border border-dashed border-border/80 p-3">
            <input
              type="range"
              min="-0.1"
              max="0.1"
              step="0.01"
              value={general.sensitivity}
              onChange={(event) => updateGeneral({ sensitivity: parseNumeric(event.target.value) })}
              className="w-full accent-primary"
            />
            <p className="text-xs text-muted-foreground">
              Ajuste rápido para simular variação de custos. Atual: {(general.sensitivity * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </FormSection>
  );
}
