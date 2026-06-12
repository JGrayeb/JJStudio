// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(url, anon, {
  auth: {
    // optional: set storage or other client options
    // redirectTo not required if using OAuth with next redirect
  },
});