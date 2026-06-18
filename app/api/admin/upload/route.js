import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/auth';
import { putFile, rawUrl } from '@/lib/github';
export const runtime = 'nodejs';
export async function POST(req) {
  if (!verifySession(cookies().get(COOKIE_NAME)?.value)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'Bad JSON' }, { status: 400 }); }
  const { filename, dataBase64 } = body;
  if (!filename || !dataBase64) return Response.json({ ok: false, error: 'Missing file' }, { status: 400 });
  const safe = String(filename).toLowerCase().replace(/[^a-z0-9._-]/g, '-').replace(/-+/g, '-');
  const path = `public/media/uploads/${Date.now()}-${safe}`;
  try {
    await putFile(path, dataBase64, `Upload media: ${safe}`);
    // served live from GitHub so it appears without a redeploy
    return Response.json({ ok: true, url: rawUrl(path) });
  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) }, { status: 500 });
  }
}
