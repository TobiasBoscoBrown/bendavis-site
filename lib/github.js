const OWNER = process.env.GITHUB_OWNER || 'TobiasBoscoBrown';
const REPO = process.env.GITHUB_REPO || 'bendavis-site';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const API = 'https://api.github.com';

function headers() {
  return {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export async function getFileSha(path) {
  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: headers(), cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getFileSha ${res.status}`);
  const j = await res.json();
  return j.sha;
}

export async function putFile(path, base64Content, message) {
  const sha = await getFileSha(path);
  const body = { message, content: base64Content, branch: BRANCH };
  if (sha) body.sha = sha;
  const res = await fetch(`${API}/repos/${OWNER}/${REPO}/contents/${path}`, {
    method: 'PUT', headers: headers(), body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`putFile ${res.status}: ${t.slice(0,300)}`);
  }
  const j = await res.json();
  return j.content;
}

export function rawUrl(path) {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
}
