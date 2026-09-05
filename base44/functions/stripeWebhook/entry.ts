import { createClientFromRequest } from "npm:@base44/sdk@0.8.46";
import { secrets } from "base44:runtime";

// Stripe webhook receiver: keeps Subscription records in sync with the live
// Stripe subscription lifecycle (renewals, past-due, cancellations) — things
// the success-page confirmation alone can't see. Signature is verified
// manually with Web Crypto (HMAC-SHA256) per Stripe's spec.
export default async function(req) {
  try {
    const raw = await req.text();
    const sigHeader = req.headers.get("stripe-signature") || "";
    const webhookSecret = secrets.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      return Response.json({ error: "Not configured" }, { status: 500 });
    }

    const parts = {};
    sigHeader.split(",").forEach((p) => {
      const [k, v] = p.split("=");
      if (k && v) parts[k.trim()] = v.trim();
    });
    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) {
      return Response.json({ error: "Invalid signature header" }, { status: 400 });
    }
    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) {
      return Response.json({ error: "Event too old" }, { status: 400 });
    }

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign("HMAC", key, enc.encode(`${timestamp}.${raw}`));
    const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
    if (hex !== signature) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(raw);
    const base44 = createClientFromRequest(req);

    async function upsertSubscription(userEmail, plan, status, periodEndSec) {
      const email = String(userEmail || "").toLowerCase();
      if (!email) return;
      const fields = {
        status,
        next_billing_date: periodEndSec
          ? new Date(periodEndSec * 1000).toISOString().split("T")[0]
          : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      };
      if (plan) fields.plan = plan;
      if (status === "cancelled") fields.plan = "cancelled";

      const existing = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, fields);
      } else if (plan) {
        await base44.asServiceRole.entities.Subscription.create({
          user_email: email,
          subscription_start_date: new Date().toISOString().split("T")[0],
          billing_interval: "monthly",
          ...fields,
        });
      }
    }

    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      if (s.metadata?.user_email) {
        await upsertSubscription(s.metadata.user_email, s.metadata.plan, "active", null);
      }
    } else if (event.type === "customer.subscription.updated") {
      const s = event.data.object;
      const meta = s.metadata || {};
      const status = s.status === "active" ? "active" : s.status === "past_due" ? "past_due" : "cancelled";
      await upsertSubscription(meta.user_email, meta.plan, status, s.current_period_end);
    } else if (event.type === "customer.subscription.deleted") {
      const s = event.data.object;
      const meta = s.metadata || {};
      await upsertSubscription(meta.user_email, null, "cancelled", null);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("stripeWebhook error:", error?.message);
    return Response.json({ error: "Webhook error" }, { status: 500 });
  }
}