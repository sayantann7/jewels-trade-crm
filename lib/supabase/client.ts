import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials missing');
      throw new Error('Supabase environment variables are not set');
    }

    supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
};