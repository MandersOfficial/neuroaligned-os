import { secrets } from "base44:runtime";
import { APP_BASE_URL } from "../../shared/appBaseUrl.ts";

// Creates a Stripe Checkout subscription session. Public app — the caller's
// email is passed from the client (the Upgrade page requires a signed-in user
// in practice), no auth lookup here.
export default async function(req) {
  try {
    const body = await req.json();
    const plan = String(body.plan || "");
    const userEmail = String(body.user_email || "").trim().toLowerCase();

    const PRICE_IDS = {
      starter: secrets.get("STRIPE_PRICE_STARTER"),
      pro: secrets.get("STRIPE_PRICE_PRO"),
    };

    if (!PRICE_IDS[plan]) {
      return Response.json({ error: "Unknown plan" }, { status: 400 });
    }
    if (!userEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(userEmail)) {
      return Response.json({ error: "A valid signed-in email is required" }, { status: 400 });
    }

    // Redirect targets come from the app's own canonical base URL — never from
    // the caller-supplied Origin header, which would allow an open redirect.
    const appId = secrets.get("BASE44_APP_ID") || "";
    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("payment_method_types[]", "card");
    params.set("line_items[0][price]", PRICE_IDS[plan]);
    params.set("line_items[0][quantity]", "1");
    params.set("customer_email", userEmail);
    params.set("success_url", `${APP_BASE_URL}/upgrade?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `${APP_BASE_URL}/upgrade?canceled=1`);
    params.set("metadata[base44_app_id]", appId);
    params.set("metadata[user_email]", userEmail);
    params.set("metadata[plan]", plan);
    params.set("subscription_data[metadata][base44_app_id]", appId);
    params.set("subscription_data[metadata][user_email]", userEmail);
    params.set("subscription_data[metadata][plan]", plan);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secrets.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2025-10-29.clover",
      },
      body: params,
    });

    const session = await res.json();
    if (!res.ok) {
      console.error("Stripe checkout session error:", session.error?.message);
      return Response.json({ error: "Could not start checkout" }, { status: 502 });
    }

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error("createCheckoutSession error:", error?.message);
    return Response.json({ error: error?.message || "Internal error" }, { status: 500 });
  }
}