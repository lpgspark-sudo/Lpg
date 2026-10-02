import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Values are injected at build time from EAS secrets / .env (see .env.example).
// Never hardcode real keys here.
// Note: this client is only used for public, anon-key reads (cylinder prices).
// All customer order/complaint operations go through Edge Functions in services/api.js,
// since there is no customer login/session in this app.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
