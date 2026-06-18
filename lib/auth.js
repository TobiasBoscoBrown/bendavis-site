import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'bd-dev-secret-change-me';
const COOKIE = 'bd_admin';

export function signSession() {
  const payload = JSON.stringify({ ok: true, t: Date.now() });
  const b64 = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
  return `${b64}.${sig}`;
}

export function verifySession(token) {
  if (!token || !token.includes('.')) return false;
  const [b64, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(b64).digest('base64url');
  if (sig !== expected) return false;
  try {
    const data = JSON.parse(Buffer.from(b64, 'base64url').toString());
    // 30 day expiry
    return data.ok && (Date.now() - data.t) < 30 * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export function checkPassword(pw) {
  const real = process.env.ADMIN_PASSWORD || '';
  if (!real) return false;
  if (pw.length !== real.length) return false;
  return crypto.timingSafeEqual(Buffer.from(pw), Buffer.from(real));
}

export const COOKIE_NAME = COOKIE;
