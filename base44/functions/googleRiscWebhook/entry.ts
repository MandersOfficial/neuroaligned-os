import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { waitUntil } from 'base44:runtime';

// Google RISC (Cross-Account Protection) security-event webhook.
// Receives JWT-signed security events from Google, verifies the signature
// against Google's public JWKS (no secret required — public keys), checks
// issuer/expiry, then alerts admins for high-severity events.

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const EXPECTED_ISS = 'https://risc.googleapis.com/google.identity.risc.v1beta';

// High-severity RISC/CAEP event types that warrant an admin alert.
const HIGH_SEVERITY_EVENTS = new Set([
  'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked',
  'https://schemas.openid.net/secevent/caep/event-type/sessions-revoked',
  'https://schemas.openid.net/secevent/risc/event-type/account-disabled',
  'https://schemas.openid.net/secevent/risc/event-type/account-purged',
  'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required',
  'https://schemas.openid.net/secevent/risc/event-type/account-compromised',
  'https://schemas.openid.net/secevent/caep/event-type/credential-change',
  'https://schemas.openid.net/secevent/caep/event-type/account-compromised',
]);

function base64urlToBytes(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function verifyGoogleJwt(jwt) {
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT');
  const [headerB64, payloadB64, sigB64] = parts;

  const header = JSON.parse(atob(headerB64));
  if (header.alg !== 'RS256') throw new Error('Unsupported alg');

  const jwksRes = await fetch(GOOGLE_JWKS_URL);
  if (!jwksRes.ok) throw new Error('JWKS fetch failed');
  const jwks = await jwksRes.json();
  const key = (jwks.keys || []).find((k) => k.kid === header.kid);
  if (!key) throw new Error('Signing key not found');

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    key,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const data = new TextEncoder().encode(headerB64 + '.' + payloadB64);
  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    base64urlToBytes(sigB64),
    data,
  );
  if (!valid) throw new Error('Invalid signature');

  const payload = JSON.parse(atob(payloadB64));
  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== EXPECTED_ISS) throw new Error('Unexpected iss');
  if (typeof payload.exp !== 'number' || payload.exp < now) throw new Error('Expired');
  if (!payload.aud) throw new Error('Missing aud');

  return payload;
}

async function notifyAdmins(base44, eventTypes, sub, jti) {
  const users = await base44.asServiceRole.entities.User.list();
  const admins = (users || []).filter((u) => u.role === 'admin' && u.email);
  if (admins.length === 0) return;

  const subject = '🔒 Security alert: Google account event received';
  const body = `A Google Cross-Account Protection (RISC) security event was received for a NeuroAligned user.

Event type(s): ${eventTypes.join(', ')}
Account subject: ${sub || 'unknown'}
Event ID: ${jti || 'n/a'}
Time: ${new Date().toISOString()}

Recommended actions:
- If sessions were revoked or the account was compromised, sign out the affected user in NeuroAligned and review recent activity.
- If credentials changed, prompt the user to reset their NeuroAligned password on next login.

This is an automated alert from the RISC webhook handler.`;

  for (const admin of admins) {
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: admin.email,
        subject,
        body,
        from_name: 'NeuroAligned Security',
      });
    } catch {
      // best-effort; continue to next admin
    }
  }
}

export default async function (req) {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const raw = await req.text();

    // Google posts the body as a JWT (content-type application/secevent+jwt).
    // Tolerate a JSON wrapper too.
    let jwt = raw;
    if (raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        jwt = parsed.jwt || parsed.secevent || parsed.token || '';
      } catch {
        jwt = '';
      }
    }
    if (!jwt || jwt.split('.').length !== 3) {
      return Response.json({ error: 'Invalid security event' }, { status: 400 });
    }

    let payload;
    try {
      payload = await verifyGoogleJwt(jwt);
    } catch {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const events = payload.events || {};
    const eventTypes = Object.keys(events);
    const sub =
      payload.sub ||
      (Array.isArray(payload.subjects) && payload.subjects[0]?.sub) ||
      '';

    const highSeverity = eventTypes.some((t) => HIGH_SEVERITY_EVENTS.has(t));
    if (highSeverity) {
      waitUntil(notifyAdmins(base44, eventTypes, sub, payload.jti));
    }

    console.log(
      JSON.stringify({
        status: 'processed',
        eventTypes,
        sub,
        jti: payload.jti,
        highSeverity,
      }),
    );

    return Response.json({ status: 'received', events: eventTypes });
  } catch {
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}