import { createClientFromRequest } from "npm:@base44/sdk@0.8.46";
import { secrets } from "base44:runtime";

// Verifies a completed Stripe Checkout session server-side and upserts the
// caller's Subscription record. Called by the Upgrade page on the
// ?session_id= return trip, while the user is still signed in.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const sessionId = String(body.session_id || "").trim();

    if (!sessionId || !/^cs_/.test(sessionId)) {
      return Response.json({ error: "Missing session id" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription`,
      {
        headers: {
          Authorization: `Bearer ${secrets.get("STRIPE_SECRET_KEY")}`,
          "Stripe-Version": "2025-10-29.clover",
        },
      }
    );

    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe session retrieve error:", session.error?.message);
      return Response.json({ error: "Could not verify payment" }, { status: 502 });
    }
    if (session.payment_status !== "paid") {
      return Response.json({ error: "Payment not completed" }, { status: 400 });
    }

    const meta = session.metadata || {};
    const plan = String(meta.plan || "");
    const userEmail = String(meta.user_email || "").toLowerCase();
    if (!plan || !userEmail) {
      console.error("confirmSubscription: session missing metadata", session.id);
      return Response.json({ error: "Missing payment metadata" }, { status: 400 });
    }

    const sub = session.subscription || {};
    const periodEndSec = sub.current_period_end;
    const nextBillingDate = periodEndSec
      ? new Date(periodEndSec * 1000).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0];
    const startDate = new Date().toISOString().split("T")[0];
    const interval = sub.items?.data?.[0]?.price?.recurring?.interval === "year" ? "annual" : "monthly";

    const fields = {
      plan,
      status: "active",
      subscription_start_date: startDate,
      next_billing_date: nextBillingDate,
      billing_interval: interval,
    };

    const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: userEmail });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.Subscription.update(existing[0].id, fields);
    } else {
      await base44.asServiceRole.entities.Subscription.create({ user_email: userEmail, ...fields });
    }

    return Response.json({ ok: true, plan, next_billing_date: nextBillingDate });
  } catch (error) {
    console.error("confirmSubscription error:", error?.message);
    return Response.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}