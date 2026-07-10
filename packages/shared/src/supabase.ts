import { createBrowserClient } from '@supabase/ssr';
import type { GenericSchema } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export type Database = GenericSchema & {
  Tables: Record<string, unknown>;
  Views: Record<string, unknown>;
  Functions: Record<string, unknown>;
};
