// Supabase Edge Function: get-order
// Returns one order by its UUID. No login — the order ID itself (a long,
// unguessable UUID) acts as the access token for the confirmation/tracking screens.
// Deploy: supabase functions deploy get-order --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("order_id");
    if (!orderId) {
      return new Response(JSON.stringify({ error: "order_id is required" }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 });
    return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
