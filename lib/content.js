import local from '@/data/content.json';

const OWNER = process.env.GITHUB_OWNER || 'TobiasBoscoBrown';
const REPO = process.env.GITHUB_REPO || 'bendavis-site';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

// Public read: pull the live content.json straight from GitHub so Ben's admin
// edits go live within ~60s with no redeploy. Falls back to the bundled copy.
export async function getContent() {
  try {
    const url = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/data/content.json`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (data && data.site) return data;
    }
  } catch (e) { /* fall through to bundled */ }
  return local;
}

export function getContentSync() { return local; }
