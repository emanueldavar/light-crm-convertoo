import { supabaseKey, supabaseUrl, hasSupabaseCredentials, type SnapshotPayload } from './supabaseClient';

export interface SnapshotRecord {
  id: number;
  name: string;
  created_at: string;
  payload_json: SnapshotPayload;
  tags: string[] | null;
}

const restBase = supabaseUrl ? `${supabaseUrl}/rest/v1` : null;

async function supabaseFetch(path: string, init: RequestInit = {}) {
  if (!restBase || !hasSupabaseCredentials || !supabaseKey) {
    throw new Error('Supabase não configurado.');
  }
  const headers: HeadersInit = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    ...(init.headers ?? {})
  };
  const response = await fetch(`${restBase}${path}`, { ...init, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Erro desconhecido ao acessar Supabase');
  }
  return response.json();
}

export async function saveSnapshot(name: string, payload: SnapshotPayload, tags: string[] = []): Promise<SnapshotRecord | null> {
  if (!hasSupabaseCredentials || !restBase) {
    console.warn('Supabase não configurado. Snapshot não persistido.');
    return null;
  }
  const body = JSON.stringify([{ name, payload_json: payload, tags }]);
  const data = await supabaseFetch('/snapshots', {
    method: 'POST',
    body,
    headers: { Prefer: 'return=representation' }
  });
  return (Array.isArray(data) && data.length > 0 ? data[0] : null) as SnapshotRecord | null;
}

export async function listSnapshots(): Promise<SnapshotRecord[]> {
  if (!hasSupabaseCredentials || !restBase) {
    return [];
  }
  const data = await supabaseFetch('/snapshots?select=*&order=created_at.desc');
  return (Array.isArray(data) ? data : []) as SnapshotRecord[];
}

export async function duplicateSnapshot(snapshotId: number, name: string): Promise<SnapshotRecord | null> {
  if (!hasSupabaseCredentials || !restBase) {
    return null;
  }
  const existing = await supabaseFetch(`/snapshots?id=eq.${snapshotId}&select=*`);
  if (!Array.isArray(existing) || existing.length === 0) {
    throw new Error('Snapshot não encontrado');
  }
  const payload = existing[0].payload_json as SnapshotPayload;
  return saveSnapshot(name, payload, existing[0].tags ?? []);
}
