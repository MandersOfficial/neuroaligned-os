/**
 * Canonical base URL for links the app builds itself — Stripe redirect
 * targets and links embedded in outgoing emails.
 *
 * Deliberately NOT derived from the request's Origin header: that header is
 * caller-supplied, so a spoofed value would let an attacker redirect paying
 * users after checkout, or plant a phishing link in an admin's inbox.
 */
export const APP_BASE_URL = "https://neuroalignedos.base44.app";