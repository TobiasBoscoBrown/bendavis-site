import { cookies } from 'next/headers';
import { checkPassword, signSession, COOKIE_NAME } from '@/lib/auth';
export const runtime = 'nodejs';
export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  if (!checkPassword(String(body.password || ''))) {
    return Response.json({ ok: false, error: 'Wrong password' }, { status: 401 });
  }
  cookies().set(COOKIE_NAME, signSession(), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
  });
  return Response.json({ ok: true });
}
