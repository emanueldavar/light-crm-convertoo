import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSection } from './FormSection';
import { computeCalculatorResults } from '@/lib/calculations';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { saveSnapshot, type SnapshotRecord } from '@/lib/snapshots';
import { SnapshotPayload } from '@/lib/supabaseClient';
import { formatCurrency } from '@/lib/utils';

export function SnapshotActions({ onSnapshotSaved }: { onSnapshotSaved?: (snapshot: SnapshotRecord | null) => void }) {
  const state = useCalculatorStore();
  const [name, setName] = useState('Nova simulação');
  const [saving, setSaving] = useState(false);
  const results = computeCalculatorResults(state);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: SnapshotPayload = {
        inputs: state,
        results,
        mode: state.mode,
        createdAt: new Date().toISOString()
      };
      const snapshot = await saveSnapshot(name, payload, [`stage-${state.stage}`]);
      if (!snapshot) {
        alert('Supabase não configurado. Snapshot não foi persistido.');
      } else {
        onSnapshotSaved?.(snapshot);
      }
    } catch (error) {
      console.error(error);
      alert('Não foi possível salvar no Supabase. Verifique as credenciais.');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const rows: Array<[string, string]> = [];
    const currency = state.general.currency;
    rows.push(['Receita total', formatCurrency(results.stageOne.totalRevenue, currency)]);
    rows.push(['Margem (%)', (results.stageOne.marginPercent * 100).toFixed(2) + '%']);
    rows.push(['Lucro projetado', formatCurrency(results.stageTwo.projectedProfit, currency)]);
    rows.push(['ROI', (results.stageTwo.projectedROI * 100).toFixed(2) + '%']);
    const content = rows.map((row) => row.join(';')).join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${name.replace(/\s+/g, '-')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <FormSection
      title="Snapshots"
      description="Salve ou exporte o cenário atual. Historico completo disponível na aba Snapshots."
      action={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => (window.location.href = '/snapshots')}>
            Ver histórico
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="snapshot-name">Nome do snapshot</Label>
          <Input id="snapshot-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving} className="min-w-[180px]">
          {saving ? 'Salvando...' : 'Salvar no Supabase'}
        </Button>
        <Button variant="outline" onClick={exportCsv} className="min-w-[180px]">
          Exportar CSV
        </Button>
      </div>
    </FormSection>
  );
}
