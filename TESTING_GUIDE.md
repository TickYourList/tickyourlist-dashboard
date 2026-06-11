# TickYourList — Feature Testing Guide

Every module shipped in the June 2026 rounds: what it does, where it lives, and **exactly how to test it**.

## Prerequisites (one-time)

| Thing | How |
|---|---|
| API base | `https://api.univolenitsolutions.com` (prod) or `http://localhost:3005` (local) |
| API key header | Every public call needs `x-api-key: <API_KEY>` (same key the frontend uses) |
| Admin JWT | Log into the dashboard as `tickyourlist2024@gmail.com` — the dashboard attaches the JWT automatically. For curl, copy `authUser → data.tokens.accessToken` from dashboard localStorage and send `Authorization: Bearer <token>` |
| Customer JWT | Log into the website as a customer; calls use `customer-authorization: Bearer <token>` |
| Dashboard admin menu | The new pages live in the password-gated **Globaltix** sidebar section (hidden from employees) |
| Test payments | Use **Test mode** Razorpay keys (`rzp_test_…`) and card `4111 1111 1111 1111`, any future expiry, any CVV |

Env toggles (all default ON): `ABANDONED_RECOVERY_EMAILS`, `REVIEW_REQUEST_EMAILS`, `WAITLIST_NOTIFICATIONS` — set `=false` to disable a job.

---

## 1. Razorpay payment webhook (safety net)

**What:** If the customer's browser dies right after paying, Razorpay calls the server directly and the booking still confirms.

**Test:**
1. Make a test booking, pay in the Razorpay modal, and **close the tab immediately** after payment succeeds (before redirect).
2. Within ~1 minute the booking flips to CONFIRMED anyway (webhook). Check in **Customer Console** (dashboard) by the customer email.
3. Negative test: `curl -X POST <API>/v1/tyltourcustomerbooking/razorpay/webhook -H 'Content-Type: application/json' -d '{}'` → expect **401** (bad signature).
4. Razorpay Dashboard → Webhooks → your URL → check delivery log shows 200s.

**Needs:** `RAZORPAY_WEBHOOK_SECRET` set on the server AND the same secret in the Razorpay webhook settings.

## 2. Abandoned-checkout recovery email (+ pay-later link)

**What:** PENDING bookings 1–24h old get a "complete your booking" email every 15 min cycle; max one per customer+tour; skipped if they already rebooked. The email deep-links to `/complete-payment` where they pay without re-entering anything.

**Test:**
1. Start a checkout (fill contact details), reach the Razorpay modal, and close it without paying.
2. Wait ~1h15m (or temporarily change `MIN_AGE_MS` locally). The email arrives with a **Complete booking** button.
3. Click it → `/complete-payment?bookingId=…&email=…` shows the booking summary and amount → Pay → lands on `/pay-done`, booking confirms, ticket email arrives.
4. Re-test the dedupe: create two pending bookings for the same tour+email — only one email is sent.
5. Direct API check: `curl '<API>/v1/tyltourcustomerbooking/booking/<id>/payment-order?email=<email>' -H 'x-api-key: …'` → returns `orderId`, amount; wrong email → "Booking not found".
6. **Dashboard:** Automations page shows "sent 24h" incrementing and "due right now" near zero.

## 3. Booking amendments (date change, no penalty)

**What:** Move a CONFIRMED booking to a new date/slot. New provider ticket is reserved **first**, then the old one is cancelled; capacity moves; customer gets an email.

**Test (customer):**
1. Site → **My Bookings** → enter the booking email → on a CONFIRMED booking click **Change date** → pick a future date → Confirm.
2. Expect: success message with the new date; "Your booking has been moved" email; new ticket email (Globaltix products).
3. Negative: pick a sold-out date → "No availability on the requested date"; a past date is blocked by the date picker and the API.

**Test (admin):** Dashboard → Globaltix → Bookings → 📅 icon on a CONFIRMED row (linked to a TYL booking) → choose date (+optional time) → Confirm. Or via Customer Console → 📅 on the booking row.

**Failure path:** if the OLD ticket can't be cancelled after the new one is issued, the booking shows a red **needs attention** badge in Customer Console / Needs Attention tab, and an ops webhook alert fires (see §15).

## 4. Cancellation + resource release + email

**What:** Customer/admin cancel refunds per policy and releases coupon usage, TylCash, and slot seats; customer gets a cancellation email.

**Test:**
1. My Bookings → Cancel booking → preview shows the policy refund (e.g. "80% of AED 500") → Confirm.
2. Expect: refund initiated in Razorpay (Test mode dashboard → Refunds), cancellation email, coupon usage count decremented (check the coupon in dashboard), TylCash credited back (Customer Console ledger).

## 5. Pending-capacity expiry

**What:** Hourly job returns seats held by checkouts that never paid (24h+).

**Test:** create a pending booking with a timeslot, wait 24h (or trust the counters): **Dashboard → Automations → "Stale holds released (7d)"** should be non-zero on a normal week. Slot availability on the product page recovers.

## 6. My Bookings (guest + logged-in)

**Test:** `/my-bookings` logged out → email form. Log in as a customer → bookings auto-load, no email step, plus ticket links / refund preview / cancel / change-date.

## 7. Post-visit review request

**What:** Daily 10:00 job emails CONFIRMED bookings whose visit date passed in the last 7 days (once per booking).

**Test:** confirm a booking dated yesterday → after 10:00 the "How was it?" email arrives, linking to the tour page `#reviews`. Counter visible in **Automations** page.

## 8. Waitlist (notify on availability)

**Test:**
1. On the checkout page pick a date where a variant is sold out → the card shows **"Sold out — get notified"** → submit an email → success note.
2. Free capacity (dashboard availability override, or cancel a booking holding seats).
3. Within an hour the "🎉 Spots opened up!" email arrives (once).
4. **Dashboard → Waitlist**: "Most-wanted sold-out dates" ranks demand; entries flip Waiting → Notified. Entries whose date passes silently expire.

## 9. Demand-based pricing (weekend/peak)

**What:** Markup rules can be conditioned on weekdays/date ranges and are evaluated against the **travel date**.

**Test:**
1. Dashboard → tour group → Custom Pricing → markup rules → create a rule: type PERCENTAGE, value e.g. 40, **priority higher than your default rule**, and in **"When does this rule apply?"** select Sat+Sun.
2. Frontend checkout: pick a Saturday → price reflects the weekend rule; pick a Tuesday → normal price. (Globaltix products: visible in the date-specific slot prices.)
3. Manual variants: use the calendar pricing rules (same weekday conditions) under variant calendar pricing.

## 10. Margin analytics

**Test:** Dashboard → **Margin Analytics** → date range → totals (bookings, revenue USD, supplier cost, margin) + per-product table. Products without a provider buy rate show "no buy rate" instead of fake margins. Cross-check one product: revenue ≈ sum of its confirmed bookings converted to USD.

## 11. Admin audit log

**Test:** change any coupon/markup/price/setting in the dashboard, then **Audit Log** page → entry appears within seconds with your admin email, area badge, action, and a **View** payload (passwords/tokens auto-redacted). Filters: area, admin email, date range.

## 12. Gift cards

**Test (buy):** site `/gift-cards` → amount + your email + recipient email → Pay (test card) → recipient gets the 🎁 email with `GIFT-…` code.
**Test (redeem):** log in as the recipient → `/gift-cards` → enter code → "X TylCash added"; balance visible in Customer Console; code can't be redeemed twice (atomic).
**Test (admin):** Dashboard → **Gift Cards** → totals cards + list shows the card as PAID then REDEEMED with redeemer + date.

## 13. Referral rewards

**Test:**
1. Customer A: GET `/v1/customer-referral/referral-code` (or profile UI) → code.
2. Customer B (new): apply the code (`POST /v1/customer-referral/apply-referral`).
3. B completes their **first** booking → on confirmation, A's TylCash gains `REFERRAL_REWARD_TYLCASH` (default 10) — visible in A's Customer Console ledger as "Referral reward".
4. B books again → **no** second reward (one per referee).

## 14. B2B agents

**Test:**
1. Dashboard → **Agents (B2B)** → Grant agent access → existing customer email + 15%.
2. That customer logs into the site and books normally → on confirmation their TylCash gains 15% of the amount ("Agent commission" in the ledger) **instead of** normal cashback.
3. Agent API: `GET /v1/agent/summary` with their customer JWT → commission %, wallet, booking stats. `GET /v1/agent/nett-price/<variantId>?tourGroupId=<id>` → supplier buy rate.
4. Revoke in the dashboard → next booking earns standard cashback again.

## 15. Ops alerts (Slack webhook)

**Setup:** create a Slack incoming webhook, set `OPS_ALERT_WEBHOOK_URL=<url>` on the backend.
**Test:** trigger a needs-attention event (e.g. amend a booking whose old ticket is a non-cancellable PDF voucher, or force a delivery failure on STG) → a 🚨 message lands in the channel with booking id, customer, amount, error. Without the env var nothing happens (silent no-op).

## 16. WhatsApp ticket delivery

**Setup (blocked on you):** Meta Business → WhatsApp → permanent token + phone-number id; approve a template named `ticket_delivery` with 4 body params (name, tour, date, ticket URL). Set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, optional `WHATSAPP_TICKET_TEMPLATE`.
**Test:** confirm a Globaltix booking with a real phone number → ticket email **and** WhatsApp template message; booking's `ticketDelivery.deliveryMethod` becomes `whatsapp`. Without env vars: email-only, no errors.

## 17. New OCTO providers (Rezdy / Ventrata / Klook-OCTO)

**Setup (blocked on you):** get the supplier's OCTO endpoint + API key → insert into `tyl_provider_credentials` (provider `REZDY_OCTO`/`VENTRATA`/`KLOOK_OCTO`, environment `sandbox` or `production`, `isActive: true`).
**Test:** create a provider product mapping for a variant with that provider → orchestrator pricing/availability calls flow through the generic OCTO adapter. Without credentials, calls fail with a clear "no active credentials" message (nothing crashes).

## 18. Customer Console & Automations (dashboard ops)

**Customer Console:** sidebar → enter any customer email → account card (TylCash, agent badge, referral), bookings with **resend confirmation** + **change date** inline actions, full TylCash ledger, gift cards, waitlist. Guests (no account) still show their bookings.
**Automations:** sidebar → live counters per job with schedule badges. Red flag to watch: **"Due right now"** on recovery growing — means the scheduler isn't running (check server logs for the `✅ … scheduled` lines on boot).

## 19. Rate limiting & health

**Test:** `for i in $(seq 35); do curl -s -o /dev/null -w '%{http_code}\n' '<API>/v1/tyltourcustomerbooking/my-bookings?email=a@b.com' -H 'x-api-key: …'; done` → 200s then **429s** after 30 in 5 min. `curl <API>/health` → `{"status":"ok","uptime":…}` (point UptimeRobot/BetterStack at this).

## 20. Tests & CI

**Local:** `cd commercee-backend && npx jest` → 24 tests green (markup strategies, demand rules, webhook HMAC, pricing priority). `npx tsc --noEmit` → clean.
**CI:** Bitbucket → repo → Pipelines (enable once) → every push runs typecheck + tests. GitHub Actions config also included if the repo ever mirrors to GitHub.

---

## Quick smoke-test order (15 minutes after each deploy)

1. `curl /health` → ok
2. Book + pay (test mode) → confirmation email + ticket
3. Close-tab payment → webhook confirms anyway
4. My Bookings → cancel preview shows policy numbers
5. Dashboard → Automations → counters load; Audit Log shows your last admin change
6. Margin Analytics loads with non-zero revenue
7. Jest suite green in CI
