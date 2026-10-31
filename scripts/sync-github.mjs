// Refreshes src/data/github.json from the public GitHub API.
// The build reads only the committed snapshot, so deploys never depend on
// GitHub being reachable or on API rate limits.
//
//   npm run sync:github            (unauthenticated: 60 core / 10 search req/min)
//   GITHUB_TOKEN=... npm run sync:github

import { readFile, writeFile } from 'node:fs/promises';

const USER = 'Ganesh-403';
const OUT = new URL('../src/data/github.json', import.meta.url);
const REPOS = [
  'flidai/leapview',
  'Ganesh-403/Repo-Sage',
  'Ganesh-403/semantic-plagiarism-detector',
  'Ganesh-403/envtether',
  'Ganesh-403/honeycloud',
  'Ganesh-403/SVF',
  'Ganesh-403/GPU-huffman',
  'Ganesh-403/FlightDelayAI',
  'Ganesh-403/aws-url-shortener',
  'Ganesh-403/Rail-Exp',
  'Ganesh-403/Aura-Wellness',
];

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${USER}-portfolio-sync`,
  ...(process.env.GITHUB_TOKEN && { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

async function searchAll(q) {
  const items = [];
  for (let page = 1; page <= 10; page++) {
    const data = await gh(`/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${page}`);
    items.push(...data.items);
    if (items.length >= data.total_count || data.items.length < 100) return { total: data.total_count, items };
  }
  return { total: items.length, items };
}

// Monday-based ISO week start, as YYYY-MM-DD.
function weekStart(iso) {
  const d = new Date(iso);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

async function main() {
  // One search request instead of one core request per repo.
  const repoQuery = REPOS.map((full) => `repo:${full}`).join(' ');
  const found = await gh(`/search/repositories?q=${encodeURIComponent(repoQuery)}&per_page=100`);
  const byName = new Map(found.items.map((r) => [r.full_name.toLowerCase(), r.stargazers_count]));
  const stars = Object.fromEntries(REPOS.map((full) => [full, byName.get(full.toLowerCase()) ?? 0]));

  const leapview = await searchAll(`author:${USER} type:pr is:merged repo:flidai/leapview`);
  const weeks = new Map();
  for (const pr of leapview.items) {
    const key = weekStart(pr.pull_request.merged_at ?? pr.closed_at);
    weeks.set(key, (weeks.get(key) ?? 0) + 1);
  }
  const sortedWeeks = [...weeks.keys()].sort();
  const weekly = [];
  if (sortedWeeks.length) {
    // Fill empty weeks so the chart's x-axis is continuous.
    for (let d = new Date(sortedWeeks[0]); d <= new Date(sortedWeeks.at(-1)); d.setUTCDate(d.getUTCDate() + 7)) {
      const key = d.toISOString().slice(0, 10);
      weekly.push({ week: key, merged: weeks.get(key) ?? 0 });
    }
  }
  const mergedDates = leapview.items.map((pr) => pr.pull_request.merged_at ?? pr.closed_at).sort();

  const external = await searchAll(`author:${USER} type:pr is:merged -user:${USER} -org:flidai`);
  const upstream = external.items
    .map((pr) => ({
      repo: pr.repository_url.split('/repos/')[1],
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      merged: (pr.pull_request.merged_at ?? pr.closed_at).slice(0, 10),
    }))
    .sort((a, b) => b.merged.localeCompare(a.merged));

  const snapshot = {
    syncedAt: new Date().toISOString().slice(0, 10),
    stars,
    leapview: {
      mergedPRs: leapview.total,
      firstMerged: mergedDates[0]?.slice(0, 10) ?? null,
      lastMerged: mergedDates.at(-1)?.slice(0, 10) ?? null,
      weekly,
    },
    upstream,
  };
  await writeFile(OUT, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`Wrote ${OUT.pathname}: ${leapview.total} LeapView PRs, ${upstream.length} upstream PRs.`);
}

main().catch(async (err) => {
  const existing = await readFile(OUT, 'utf8').catch(() => null);
  console.error(`GitHub sync failed: ${err.message}`);
  console.error(existing ? 'Keeping the existing snapshot.' : 'No snapshot exists yet.');
  process.exit(existing ? 0 : 1);
});
