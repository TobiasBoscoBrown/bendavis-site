import { cookies } from 'next/headers';
import { verifySession, COOKIE_NAME } from '@/lib/auth';
export const runtime = 'nodejs';
export async function GET() {
  const authed = verifySession(cookies().get(COOKIE_NAME)?.value);
  const configured = !!process.env.ADMIN_PASSWORD && !!process.env.GITHUB_TOKEN;
  return Response.json({ authed, configured });
}
