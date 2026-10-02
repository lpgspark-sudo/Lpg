// Supabase Edge Function: create-order
// No login/session required — identifies the customer purely by phone number.
// Deploy: supabase functions deploy create-order --no-verify-jwt
// Secrets needed: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ADVANCE_AMOUNT_PAISE = 5000; // ₹50.00

function isValidIndianPhone(phone: string) {
  return /^\+91[6-9]\d{9}$/.test(phone);
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = await req.json();
    const {
      phone,
      full_name,
      category,
      cylinder_label,
      quantity,
      address_line,
      pincode,
      latitude,
      longitude,
      preferred_date,
      preferred_slot,
    } = body;

    if (!phone || !isValidIndianPhone(phone)) {
      return new Response(JSON.stringify({ error: "Valid phone number required (e.g. +919884224076)" }), { status: 400 });
    }
    if (!category || !cylinder_label || !quantity || !address_line) {
      return new Response(JSON.stringify({ error: "Missing required order fields" }), { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1. Find or create the customer by phone (no password, no OTP)
    let { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (!customer) {
      const { data: newCustomer, error: custErr } = await supabase
        .from("customers")
        .insert({ phone, full_name: full_name ?? null })
        .select()
        .single();
      if (custErr) return new Response(JSON.stringify({ error: custErr.message }), { status: 500 });
      customer = newCustomer;
    }

    // 2. Save the delivery address
    const { data: address, error: addrErr } = await supabase
      .from("addresses")
      .insert({
        customer_id: customer.id,
        address_line,
        pincode: pincode ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        is_default: true,
      })
      .select()
      .single();
    if (addrErr) return new Response(JSON.stringify({ error: addrErr.message }), { status: 500 });

    // 3. Create the order (status: pending_payment)
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        customer_id: customer.id,
        category,
        cylinder_label,
        quantity,
        address_id: address.id,
        preferred_date: preferred_date ?? null,
        preferred_slot: preferred_slot ?? null,
        status: "pending_payment",
        payment_status: "pending",
        advance_amount: ADVANCE_AMOUNT_PAISE / 100,
      })
      .select()
      .single();
    if (orderErr) return new Response(JSON.stringify({ error: orderErr.message }), { status: 500 });

    // 4. Create the Razorpay order for the fixed ₹50 advance
    const rpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: ADVANCE_AMOUNT_PAISE,
        currency: "INR",
        receipt: order.order_number,
        notes: { order_id: order.id, phone, category, cylinder_label, quantity: String(quantity) },
      }),
    });

    const rpOrder = await rpResponse.json();
    if (!rpResponse.ok) {
      return new Response(JSON.stringify({ error: "Razorpay order creation failed", details: rpOrder }), { status: 500 });
    }

    await supabase.from("orders").update({ razorpay_order_id: rpOrder.id }).eq("id", order.id);

    return new Response(
      JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        razorpay_order_id: rpOrder.id,
        amount: ADVANCE_AMOUNT_PAISE,
        currency: "INR",
        key_id: RAZORPAY_KEY_ID, // public key, safe to send to client
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
