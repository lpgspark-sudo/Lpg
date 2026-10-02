// Supabase Edge Function: get-orders-by-phone
// Returns all orders for a given phone number. No login — phone number is
// typed in by the customer on the Order History screen.
// Deploy: supabase functions deploy get-orders-by-phone --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const phone = url.searchParams.get("phone");
    if (!phone) {
      return new Response(JSON.stringify({ error: "phone is required" }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: customer } = await supabase.from("customers").select("id").eq("phone", phone).maybeSingle();
    if (!customer) {
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(orders), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
