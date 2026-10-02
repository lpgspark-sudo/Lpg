// Supabase Edge Function: submit-complaint
// No login — identifies the customer by phone number, creating one if new.
// Deploy: supabase functions deploy submit-complaint --no-verify-jwt

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const { phone, order_id, description } = await req.json();
    if (!phone || !description) {
      return new Response(JSON.stringify({ error: "phone and description are required" }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    let { data: customer } = await supabase.from("customers").select("id").eq("phone", phone).maybeSingle();
    if (!customer) {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({ phone })
        .select()
        .single();
      if (custErr) return new Response(JSON.stringify({ error: custErr.message }), { status: 500 });
      customer = newCustomer;
    }

    const { data: complaint, error } = await supabase
      .from("complaints")
      .insert({ customer_id: customer.id, order_id: order_id ?? null, description, category: "general" })
      .select()
      .single();

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(complaint), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
