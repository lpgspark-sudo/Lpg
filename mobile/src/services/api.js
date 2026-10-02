import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

const FUNCTIONS_URL = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1`;
// Edge Functions deployed with --no-verify-jwt still require the anon key
// as a bearer token (Supabase's platform-level check), just not a user session.
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const PROFILE_KEY = 'lpg_customer_profile'; // { phone, full_name }

// ---------- Local profile (replaces login) ----------
export async function getSavedProfile() {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveProfile(profile) {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ---------- Prices (public, no auth needed) ----------
export async function fetchPrices(category) {
  const { data, error } = await supabase
    .from('cylinder_prices')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('min_price', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data;
}

// ---------- Orders ----------
async function callFunction(name, { method = 'GET', body, query } = {}) {
  let url = `${FUNCTIONS_URL}/${name}`;
  if (query) {
    const params = new URLSearchParams(query);
    url += `?${params.toString()}`;
  }
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ANON_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `${name} failed`);
  return json;
}

// Creates the customer (if new), address, order, and Razorpay order — all in one call.
export async function createOrderWithPayment(payload) {
  return callFunction('create-order', { method: 'POST', body: payload });
}

export async function fetchOrderById(orderId) {
  return callFunction('get-order', { query: { order_id: orderId } });
}

export async function fetchOrderHistory(phone) {
  return callFunction('get-orders-by-phone', { query: { phone } });
}

export async function submitComplaint({ phone, order_id, description }) {
  return callFunction('submit-complaint', { method: 'POST', body: { phone, order_id, description } });
}
