import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { isOwnerAdmin } from "../../shared/adminGate.ts";

// Google RISC stream configuration.
// Ports the Java makeBearerToken() example: signs an RS256 JWT with the
// service-account private key, then calls the RISC stream:update endpoint to
// point Google's security-event delivery at our googleRiscWebhook receiver.
// Admin-only. Set GOOGLE_RISC_SERVICE_ACCOUNT_JSON to the full service-account
// credentials JSON.

const RISC_AUDIENCE =
  'https://risc.googleapis.com/google.identity.risc.v1beta.RiscManagementService';
const STREAM_UPDATE_URL = 'https://risc.googleapis.com/v1beta/stream:update';
const STREAM_VERIFY_URL = 'https://risc.googleapis.com/v1beta/stream:verify';
const PUSH_METHOD =
  'https://schemas.openid.net/secevent/risc/delivery-method/push';

// Sensible default event types to subscribe to if none are provided.
const DEFAULT_EVENTS = [
  'https://schemas.openid.net/secevent/risc/event-type/sessions-revoked',
  'https://schemas.openid.net/secevent/risc/event-type/account-disabled',
  'https://schemas.openid.net/secevent/risc/event-type/account-purged',
  'https://schemas.openid.net/secevent/risc/event-type/account-credential-change-required',
];

function bytesToBase64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function strToBase64url(str) {
  return bytesToBase64url(new TextEncoder().encode(str));
}

function pemPkcs8ToDer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

async function makeBearerToken(sa) {
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemPkcs8ToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 3600; // exactly one hour, per the spec

  const header = { alg: 'RS256', typ: 'JWT', kid: sa.private_key_id };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: RISC_AUDIENCE,
    iat,
    exp,
  };

  const h = strToBase64url(JSON.stringify(header));
  const p = strToBase64url(JSON.stringify(payload));
  const data = new TextEncoder().encode(`${h}.${p}`);
  const sig = new Uint8Array(
    await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, data),
  );
  return `${h}.${p}.${bytesToBase64url(sig)}`;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only — configuring the RISC stream is a sensitive operation.
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }
    if (!isOwnerAdmin(user)) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const receiverUrl = body.receiverUrl;
    if (!receiverUrl || !/^https:\/\//.test(receiverUrl)) {
      return Response.json(
        { error: 'A valid https receiverUrl is required' },
        { status: 400 },
      );
    }
    const eventsRequested =
      Array.isArray(body.events) && body.events.length
        ? body.events
        : DEFAULT_EVENTS;
    const dryRun = body.dryRun === true;

    const saJson = Deno.env.get('GOOGLE_RISC_SERVICE_ACCOUNT_JSON');
    if (!saJson) {
      return Response.json(
        { error: 'Service account not configured' },
        { status: 500 },
      );
    }
    let sa;
    try {
      sa = JSON.parse(saJson);
    } catch {
      return Response.json(
        { error: 'Invalid service account JSON' },
        { status: 500 },
      );
    }
    if (!sa.private_key || !sa.private_key_id || !sa.client_email) {
      return Response.json(
        { error: 'Service account missing required fields' },
        { status: 500 },
      );
    }

    const token = await makeBearerToken(sa);

    if (dryRun) {
      // Generate + validate the token without calling Google.
      const [, payloadB64] = token.split('.');
      const claims = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
      return Response.json({
        dryRun: true,
        token,
        claims,
        receiverUrl,
        eventsRequested,
      });
    }

    // Configure delivery: point the RISC stream at our webhook.
    const updateRes = await fetch(STREAM_UPDATE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        delivery: { delivery_method: PUSH_METHOD, url: receiverUrl },
        events_requested: eventsRequested,
      }),
    });
    const updateStatus = updateRes.status;
    const updateText = await updateRes.text();

    let verifyResult = null;
    if (updateRes.ok && body.verify === true) {
      const nonce = body.nonce || `verify-${Date.now()}`;
      const verifyRes = await fetch(STREAM_VERIFY_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ state: nonce }),
      });
      verifyResult = {
        status: verifyRes.status,
        nonce,
        body: await verifyRes.text(),
      };
    }

    return Response.json({
      configured: updateRes.ok,
      updateStatus,
      updateResponse: safeJson(updateText),
      verifyResult,
      receiverUrl,
      eventsRequested,
    });
  } catch (error) {
    return Response.json(
      { error: 'Internal error', message: String(error?.message || error) },
      { status: 500 },
    );
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}