# LPG — Cylinder Booking App

Android-first app for booking domestic, commercial, and industrial LPG cylinders across India.
Customer app (React Native/Expo) + Customer Care admin panel (React) + Supabase backend.

## ⚠️ Before anything else: rotate your Razorpay keys

If a Razorpay key/secret was ever pasted into a chat, screenshot, or committed to a public
place, **regenerate it now** in the Razorpay Dashboard → Settings → API Keys, and set a new
webhook secret. Never commit real keys to this repo — only `.env.example` files are tracked.

---

## Project structure

```
lpg-app/
├── mobile/            # Customer app (Expo React Native) → builds to .aab
├── admin-panel/       # Customer care / admin web dashboard (React + Vite)
├── supabase/
│   ├── migrations/    # Database schema (SQL)
│   └── functions/     # Edge Functions (Razorpay order + webhook)
├── .github/workflows/ # GitHub Actions: builds the Android App Bundle
└── docs/              # Privacy policy page (host via GitHub Pages)
```

## 1. Set up Supabase

1. Create a project at https://supabase.com
2. In the SQL editor, run `supabase/migrations/0001_init.sql`
3. **No phone/OTP auth setup needed** — the app has no login. Customers are identified
   only by the phone number they type in at checkout (saved on-device for next time).
   You do not need to configure Twilio or any SMS provider for the customer app at all.
4. Deploy the Edge Functions (all are public — `--no-verify-jwt` — since there's no login session):
   ```bash
   supabase functions deploy create-order --no-verify-jwt
   supabase functions deploy get-order --no-verify-jwt
   supabase functions deploy get-orders-by-phone --no-verify-jwt
   supabase functions deploy submit-complaint --no-verify-jwt
   supabase functions deploy razorpay-webhook --no-verify-jwt
   supabase secrets set RAZORPAY_KEY_ID=xxx RAZORPAY_KEY_SECRET=xxx RAZORPAY_WEBHOOK_SECRET=xxx
   ```
5. In Razorpay Dashboard → Webhooks, add the deployed `razorpay-webhook` function URL and
   select events: `payment.captured`, `payment.failed`, `order.paid`
6. **Admin panel login is separate and still uses Supabase Auth** (email/password, for staff
   only — customers never see this). Create your first admin/staff login: add a user via
   Supabase Auth → Users, then insert a row into `admin_users` with their `id` and
   `role = 'super_admin'`

## 2. Mobile app (customer-facing)

```bash
cd mobile
cp .env.example .env      # fill in your real Supabase URL/anon key + Razorpay key ID
npm install
npx expo start            # test in Expo Go during development
```

## 3. Admin panel (customer care)

```bash
cd admin-panel
cp .env.example .env      # fill in your real Supabase URL/anon key
npm install
npm run dev                # http://localhost:5173
```

## 4. Building the Android App Bundle (.aab) via GitHub

1. Push this repo to GitHub
2. Create a free account at https://expo.dev, then generate an access token:
   Expo Dashboard → Account Settings → Access Tokens
3. In your GitHub repo → Settings → Secrets and variables → Actions, add:
   - `EXPO_TOKEN`
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_RAZORPAY_KEY_ID`
4. Go to the **Actions** tab → "Build Android AAB" → **Run workflow**
5. The build runs in Expo's cloud (EAS Build). Track progress and download the finished
   `.aab` from https://expo.dev under your project's **Builds** tab, or run:
   ```bash
   eas build:list --platform android --limit 1
   ```

## 5. Publishing to Play Store

1. Go to Google Play Console → your app → Production → Create new release
2. Upload the `.aab` downloaded from EAS
3. Add your Privacy Policy URL (see `docs/privacy-policy.html` — host it via GitHub Pages:
   Settings → Pages → set source to the `docs/` folder)
4. Complete the store listing (screenshots, description, content rating) and submit for review

## Notes

- **No customer login/OTP.** The customer app asks for name + phone number inline at checkout
  (not a separate login screen), saves it on-device, and uses it to look up order history later
  on the Order History screen. This removes SMS/Twilio costs entirely for the customer app.
- The advance/service charge is fixed at ₹50 per booking (see `ADVANCE_AMOUNT_PAISE` in
  `supabase/functions/create-order/index.ts`) — change it there if needed.
- There is no dealer-directory feature by design; customer care staff coordinate with dealers
  manually (phone/WhatsApp) from the Order Queue page.
- Cylinder prices are editable monthly from the admin panel's Price Management page and take
  effect in the customer app immediately (no app update required).
- The **admin panel still uses Supabase Auth** (email/password) for staff login — this is
  separate from the customer app and unaffected by the above.
