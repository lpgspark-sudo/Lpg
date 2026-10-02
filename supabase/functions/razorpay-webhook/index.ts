// Supabase Edge Function: razorpay-webhook
// Receives payment confirmation from Razorpay (source of truth — do not rely on app-side callback alone).
// Configure this function's URL in Razorpay Dashboard -> Settings -> Webhooks.
// Secrets needed: RAZORPAY_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function verifySignature(body: string, signature: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const expected = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return expected === signature;
}

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    const isValid = await verifySignature(rawBody, signature, WEBHOOK_SECRET);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      // Find matching order
      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (order) {
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            status: "received",
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", order.id);

        await supabase.from("payments").insert({
          order_id: order.id,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: payment.id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: "captured",
          raw_payload: event,
        });
      }
    }

    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const { data: order } = await supabase
        .from("orders")
        .select("id")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (order) {
        await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
        await supabase.from("payments").insert({
          order_id: order.id,
          razorpay_order_id: razorpayOrderId,
          status: "failed",
          raw_payload: event,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
