import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/auth';
import { putFile } from '@/lib/github';
export const runtime = 'nodejs';
export async function POST(req) {
  if (!verifySession(cookies().get(COOKIE_NAME)?.value)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'Bad JSON' }, { status: 400 }); }
  const content = body.content;
  if (!content || !content.site) return Response.json({ ok: false, error: 'Invalid content' }, { status: 400 });
  try {
    const json = JSON.stringify(content, null, 2);
    const b64 = Buffer.from(json, 'utf8').toString('base64');
    await putFile('data/content.json', b64, 'Update site content via admin');
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
