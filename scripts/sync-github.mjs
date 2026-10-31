// Refreshes src/data/github.json from the public GitHub API.
// The build reads only the committed snapshot, so deploys never depend on
// GitHub being reachable or on API rate limits.
//
//   npm run sync:github            (unauthenticated: 10 search requests/min, so it paces itself)
//   GITHUB_TOKEN=... npm run sync:github
//
// On any failure the snapshot is left untouched and the script exits non-zero.

import { writeFile } from 'node:fs/promises';

const USER = 'Ganesh-403';
const OUT = new URL('../src/data/github.json', import.meta.url);
// LeapView PRs are searched month by month: GitHub search returns at most 1,000 results per query.
const LEAPVIEW_SINCE = '2026-08-01';
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

const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${USER}-portfolio-sync`,
  ...(token && { Authorization: `Bearer ${token}` }),
};
// Search allows 10 requests/min without a token and 30 with one.
const searchInterval = token ? 2_100 : 6_500;
let lastSearch = 0;

async function search(path) {
  const wait = lastSearch + searchInterval - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastSearch = Date.now();
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  const data = await res.json();
  if (data.incomplete_results) throw new Error(`GitHub returned incomplete results for ${path}`);
  return data;
}

async function searchIssues(q) {
  const items = [];
  for (let page = 1; ; page++) {
    const data = await search(`/search/issues?q=${encodeURIComponent(q)}&per_page=100&page=${page}`);
    if (data.total_count > 1000) throw new Error(`Query matches ${data.total_count} results, over the 1,000 limit: ${q}`);
    items.push(...data.items);
    if (items.length >= data.total_count || data.items.length < 100) return items;
  }
}

// [start, end] ISO date pairs covering each calendar month from `since` to today.
function months(since) {
  const ranges = [];
  const today = new Date().toISOString().slice(0, 10);
  for (let d = new Date(`${since.slice(0, 7)}-01T00:00:00Z`); d.toISOString().slice(0, 10) <= today; d.setUTCMonth(d.getUTCMonth() + 1)) {
    const start = d.toISOString().slice(0, 10);
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
    ranges.push([start, end]);
  }
  return ranges;
}

// Monday-based week start, as YYYY-MM-DD.
function weekStart(iso) {
  const d = new Date(iso);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

const mergedAt = (pr) => pr.pull_request.merged_at ?? pr.closed_at;

async function main() {
  // One search request instead of one core request per repo.
  const repoQuery = REPOS.map((full) => `repo:${full}`).join(' ');
  const found = await search(`/search/repositories?q=${encodeURIComponent(repoQuery)}&per_page=100`);
  const byName = new Map(found.items.map((r) => [r.full_name.toLowerCase(), r.stargazers_count]));
  const stars = Object.fromEntries(REPOS.map((full) => [full, byName.get(full.toLowerCase()) ?? 0]));

  const leapview = [];
  for (const [start, end] of months(LEAPVIEW_SINCE)) {
    leapview.push(...(await searchIssues(`author:${USER} type:pr is:merged repo:flidai/leapview merged:${start}..${end}`)));
  }

  const weeks = new Map();
  for (const pr of leapview) {
    const key = weekStart(mergedAt(pr));
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
  const mergedDates = leapview.map(mergedAt).sort();

  const external = await searchIssues(`author:${USER} type:pr is:merged -user:${USER} -org:flidai`);
  const upstream = external
    .map((pr) => ({
      repo: pr.repository_url.split('/repos/')[1],
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      merged: mergedAt(pr).slice(0, 10),
    }))
    .sort((a, b) => b.merged.localeCompare(a.merged));

  const snapshot = {
    syncedAt: new Date().toISOString().slice(0, 10),
    stars,
    leapview: {
      mergedPRs: leapview.length,
      firstMerged: mergedDates[0]?.slice(0, 10) ?? null,
      lastMerged: mergedDates.at(-1)?.slice(0, 10) ?? null,
      weekly,
    },
    upstream,
  };
  await writeFile(OUT, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`Wrote ${OUT.pathname}: ${leapview.length} LeapView PRs, ${upstream.length} upstream PRs.`);
}

main().catch((err) => {
  console.error(`GitHub sync failed, snapshot left unchanged: ${err.message}`);
  process.exit(1);
});
