import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { listSnapshots, duplicateSnapshot, type SnapshotRecord } from '@/lib/snapshots';
import { SnapshotPayload } from '@/lib/supabaseClient';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { computeCalculatorResults } from '@/lib/calculations';

export function SnapshotsPage() {
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const general = useCalculatorStore((state) => state.general);
  const currentResults = useCalculatorStore((state) => computeCalculatorResults(state));

  useEffect(() => {
    const fetchSnapshots = async () => {
      setLoading(true);
      try {
        const data = await listSnapshots();
        setSnapshots(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSnapshots();
  }, []);

  const comparison = useMemo(() => {
    if (selectedIds.length !== 2) {
      return null;
    }
    const [first, second] = selectedIds
      .map((id) => snapshots.find((snapshot) => snapshot.id === id))
      .filter(Boolean) as SnapshotRecord[];
    if (!first || !second) {
      return null;
    }
    const payloadA = first.payload_json as SnapshotPayload;
    const payloadB = second.payload_json as SnapshotPayload;
    return { first: payloadA, second: payloadB, meta: [first.name, second.name] };
  }, [selectedIds, snapshots]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  };

  const handleDuplicate = async (snapshot: SnapshotRecord) => {
    const newName = `${snapshot.name} (cópia)`;
    try {
      const duplicated = await duplicateSnapshot(snapshot.id, newName);
      if (duplicated) {
        setSnapshots((prev) => [duplicated, ...prev]);
      }
    } catch (error) {
      console.error(error);
      alert('Não foi possível duplicar o snapshot.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Histórico de Snapshots</h1>
        <p className="text-muted-foreground">Compare cenários salvos e duplique simulações facilmente.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snapshots no Supabase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && <p className="text-sm text-muted-foreground">Carregando snapshots...</p>}
          {!loading && snapshots.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum snapshot encontrado. Configure variáveis na calculadora e salve uma simulação.
            </p>
          )}
          {!loading && snapshots.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-border/60">
              <table className="min-w-full divide-y divide-border/80 text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left">Selecionar</th>
                    <th className="px-4 py-3 text-left">Nome</th>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {snapshots.map((snapshot) => (
                    <tr key={snapshot.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.includes(snapshot.id)}
                          onCheckedChange={() => toggleSelect(snapshot.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{snapshot.name}</span>
                          <span className="text-xs text-muted-foreground">{snapshot.payload_json?.mode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(snapshot.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleDuplicate(snapshot)}>
                          Duplicar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação lado a lado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {comparison.meta.map((name, index) => {
              const payload = index === 0 ? comparison.first : comparison.second;
              const revenue = (payload.results as any).stageOne.totalRevenue ?? 0;
              const margin = (payload.results as any).stageOne.marginPercent ?? 0;
              const roi = (payload.results as any).stageOne.roi ?? 0;
              return (
                <div key={name} className="rounded-2xl border border-border/70 p-4">
                  <h3 className="text-lg font-semibold">{name}</h3>
                  <p className="text-xs text-muted-foreground">{payload.mode} • {new Date(payload.createdAt).toLocaleDateString('pt-BR')}</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <dt>Receita</dt>
                      <dd>{formatCurrency(revenue, general.currency)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>Margem</dt>
                      <dd>{formatPercent(margin)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt>ROI</dt>
                      <dd>{formatPercent(roi)}</dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Snapshot atual vs histórico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 p-3">
            <p className="text-xs uppercase text-muted-foreground">Receita atual</p>
            <p className="text-lg font-semibold">{formatCurrency(currentResults.stageOne.totalRevenue, general.currency)}</p>
          </div>
          <div className="rounded-2xl border border-border/60 p-3">
            <p className="text-xs uppercase text-muted-foreground">ROI atual</p>
            <p className="text-lg font-semibold">{formatPercent(currentResults.stageOne.roi)}</p>
          </div>
          <div className="rounded-2xl border border-border/60 p-3">
            <p className="text-xs uppercase text-muted-foreground">Lucro projetado</p>
            <p className="text-lg font-semibold">{formatCurrency(currentResults.stageTwo.projectedProfit, general.currency)}</p>
          </div>
          <div className="rounded-2xl border border-border/60 p-3">
            <p className="text-xs uppercase text-muted-foreground">Reinvestível</p>
            <p className="text-lg font-semibold">{formatCurrency(currentResults.stageTwo.reinvestibleValue, general.currency)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
