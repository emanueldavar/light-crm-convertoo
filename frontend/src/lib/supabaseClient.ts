export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const supabaseKey = import.meta.env.VITE_SUPABASE_KEY as string | undefined;

export const hasSupabaseCredentials = Boolean(supabaseUrl && supabaseKey);

export type SnapshotPayload = {
  inputs: unknown;
  results: unknown;
  mode: 'recurring' | 'one_off';
  createdAt: string;
};
