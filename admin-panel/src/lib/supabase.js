import { createClient } from '@supabase/supabase-js';

// Loaded from .env (Vite requires VITE_ prefix). Never commit real values.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
