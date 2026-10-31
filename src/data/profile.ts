// Single source of truth for everything the site says.
// Edit this file to update the portfolio; components only render it.
// GitHub numbers (stars, PR counts) come from ./github.json — refresh with `npm run sync:github`.

import github from './github.json';

export const person = {
  name: 'Ganesh Kambli',
  role: 'AI Engineer',
  company: 'Flid AI',
  companyUrl: 'https://flid.ai/',
  // Flid AI ApS is based in Odense, Denmark; I work remotely.
  location: 'Mumbai, India',
  timezone: 'IST, UTC+5:30',
  email: 'gkambli70@gmail.com',
  photo: 'ganesh',
  languages: ['English', 'Hindi', 'Marathi', 'Konkani'],
  links: {
    github: 'https://github.com/Ganesh-403',
    linkedin: 'https://www.linkedin.com/in/ganeshkambli/',
    sponsors: 'https://github.com/sponsors/Ganesh-403',
  },
  // Shown in <title>, meta description and the Open Graph image.
  headline: 'AI engineer at Flid AI, working on open-source analytics in Go',
  description:
    'Ganesh Kambli is an AI engineer at Flid AI, based in Mumbai, working on LeapView, open-source BI in Go and DuckDB. He also builds software for clients end to end, from first design to deployment.',
};

// The hero reads top to bottom in priority order: what I do, then where, then the offer.
export const hero = {
  lede: 'I build software end to end, from the first sketch to a product running in production.',
  detail: `At Flid AI I work on LeapView, open-source BI in Go and DuckDB, mostly the parts that have to be right: who can see which data, how fast queries come back, and whether a release installs and upgrades cleanly. I also take on freelance projects.`,
};

export type PullRequest = { repo: string; number: number; title: string };
const lv = (number: number, title: string): PullRequest => ({ repo: 'flidai/leapview', number, title });

export const leapview = {
  name: 'LeapView',
  url: 'https://github.com/flidai/leapview',
  site: 'https://leapview.dev/',
  tagline: 'Define metrics in code. Explore them everywhere.',
  summary:
    'LeapView is open-source BI. Teams define a metric once in Git and use it in dashboards, APIs and AI tools, with the same access rules applied everywhere. The server is Go, queries run on DuckDB, and it is licensed Apache-2.0.',
  joined: 'August 2026',
  stats: github.leapview,
  stars: github.stars['flidai/leapview'],
  areas: [
    {
      title: 'Releases and supply chain',
      body: 'Reproducible Nix builds, signed provenance and SPDX SBOMs attached to every release candidate, and qualified Linux desktop installers.',
      prs: [
        lv(800, 'Bind signed provenance and SPDX to release candidates'),
        lv(845, 'Build and qualify Linux desktop installers'),
        lv(1002, 'Prepare v0.4.0-alpha.1'),
      ],
    },
    {
      title: 'Upgrades and recovery',
      body: 'Backup and restore, a durable recovery ledger, and schema upgrades tested against real release candidates, so self-hosted installs can move forward safely.',
      prs: [
        lv(372, 'Durable scheduled recovery ledger'),
        lv(646, 'Qualify a real candidate through the 019 to 020 upgrade'),
        lv(992, 'Native PostgreSQL bootstrap and Compose qualification'),
      ],
    },
    {
      title: 'Governed semantic layer',
      body: 'Access grants compiled into typed row and column predicates, plus ODCS 3.1 export, OpenLineage and dbt interoperability.',
      prs: [
        lv(496, 'Compile access grants and typed predicates'),
        lv(550, 'ODCS 3.1 export'),
        lv(475, 'dbt warehouse-boundary integration'),
      ],
    },
    {
      title: 'Query performance',
      body: 'Arrow streaming for governed queries and a result cache that keeps every access check in place.',
      prs: [
        lv(409, 'Qualify direct governed Arrow streaming'),
        lv(384, 'Result identity in the cache lifecycle'),
        lv(916, 'Stream authenticated semantic Arrow responses'),
      ],
    },
    {
      title: 'Security and identity',
      body: 'SCIM deactivation that revokes agent (MCP) sessions, credential lifecycle recovery, and a hardened Chainguard runtime image.',
      prs: [
        lv(695, 'SCIM deactivation revokes MCP sessions'),
        lv(947, 'Credential lifecycle recovery'),
        lv(382, 'Hardened Chainguard runtime image'),
      ],
    },
    {
      title: 'Reliability',
      body: 'Service-level indicators and burn-rate alerts for dashboard refresh, W3C trace context, and the runbooks that go with them.',
      prs: [
        lv(393, 'Dashboard refresh reliability SLI'),
        lv(403, 'Fast-burn alert'),
        lv(387, 'W3C trace context'),
      ],
    },
  ],
  alsoAt: {
    name: 'Alloy Catalog',
    url: 'https://alloycatalog.com/',
    // Completes the sentence "I also work on Alloy Catalog, …"
    body: "Flid's engineering master-data catalog with a built-in AI agent.",
  },
};

export type Project = {
  name: string;
  summary: string;
  body: string;
  stack: string[];
  repo: string;
  stars?: number;
  links?: { label: string; url: string }[];
};

const stars = (full: string) => (github.stars as Record<string, number>)[full] ?? 0;

export const projects: Project[] = [
  {
    name: 'RepoSage',
    summary: 'Ask questions about any codebase, fully offline.',
    body: 'Splits code into functions and classes, maps which function calls which into a graph, and answers questions with a local model through LangGraph. Every answer cites the exact file and line. Retrieval combines ChromaDB vectors with BM25 keyword search.',
    stack: ['Python', 'LangGraph', 'Ollama', 'ChromaDB', 'FastAPI', 'React'],
    repo: 'https://github.com/Ganesh-403/Repo-Sage',
    stars: stars('Ganesh-403/Repo-Sage'),
  },
  {
    name: 'Semantic Plagiarism Detector',
    summary: 'Finds paraphrased and cross-language copying in student work.',
    body: 'Embeds assignments with a multilingual sentence model, searches them with FAISS, and shows which sections match and how closely, down to a paragraph-level heatmap. I ran it as an open-source project for ECSoC’26.',
    stack: ['Python', 'Sentence Transformers', 'FAISS', 'Streamlit'],
    repo: 'https://github.com/Ganesh-403/semantic-plagiarism-detector',
    stars: stars('Ganesh-403/semantic-plagiarism-detector'),
    links: [{ label: 'Live demo', url: 'https://semantic-plagiarism-detector.streamlit.app/' }],
  },
  {
    name: 'envtether',
    summary: 'A static analyzer for application configuration.',
    body: 'Finds every environment variable a Python project reads, flags drift between .env files, Docker Compose and CI, and catches hardcoded secrets using patterns plus entropy checks. Reports in SARIF for GitHub code scanning.',
    stack: ['Python', 'AST analysis', 'SARIF'],
    repo: 'https://github.com/Ganesh-403/envtether',
    stars: stars('Ganesh-403/envtether'),
    links: [{ label: 'PyPI', url: 'https://pypi.org/project/envtether/' }],
  },
  {
    name: 'HoneyCloud',
    summary: 'Decoy servers that record, score and profile attackers.',
    body: 'Fake SSH, FTP, HTTP, Telnet, SMTP and RDP services capture attack traffic, score it with machine learning, map it to MITRE ATT&CK and stream it to a live dashboard. Rewritten in Rust; the research behind it became two papers.',
    stack: ['Rust', 'Axum', 'Tokio', 'PostgreSQL', 'WebSockets'],
    repo: 'https://github.com/Ganesh-403/honeycloud',
    stars: stars('Ganesh-403/honeycloud'),
  },
  {
    name: 'SVF',
    summary: 'A virtual file system on a real disk image.',
    body: 'Formats a binary image into a superblock, block bitmaps and 4 KB data blocks, then serves files through inodes guarded by reader-writer locks, with POSIX permissions and Argon2id-hashed user accounts.',
    stack: ['C++17', 'CMake', 'Argon2id'],
    repo: 'https://github.com/Ganesh-403/SVF',
    stars: stars('Ganesh-403/SVF'),
  },
  {
    name: 'GPU Huffman',
    summary: 'Huffman frequency counting on CPU, OpenMP and CUDA.',
    body: 'Benchmarks the same character-frequency count across a single CPU thread, OpenMP, and three CUDA kernels: global atomics, shared-memory histograms and warp-level aggregation, with throughput reports per run.',
    stack: ['C++17', 'CUDA', 'OpenMP'],
    repo: 'https://github.com/Ganesh-403/GPU-huffman',
    stars: stars('Ganesh-403/GPU-huffman'),
  },
];

export const moreProjects: { name: string; body: string; url: string; demo?: string }[] = [
  {
    name: 'Flight Delay AI',
    body: 'XGBoost delay predictions explained with SHAP, with weather cached in Redis and live updates over WebSockets.',
    url: 'https://github.com/Ganesh-403/FlightDelayAI',
  },
  {
    name: 'AWS URL shortener',
    body: 'Serverless on Lambda, API Gateway, DynamoDB, S3 and CloudFront.',
    url: 'https://github.com/Ganesh-403/aws-url-shortener',
    demo: 'https://d3461bhuac6sr6.cloudfront.net/',
  },
  {
    name: 'RailExp',
    body: 'A legacy Flask railway system rebuilt as FastAPI and React, shipped with Docker.',
    url: 'https://github.com/Ganesh-403/Rail-Exp',
  },
  {
    name: 'Aura Wellness',
    body: 'An Android app in Kotlin that steps in before a doomscroll, with Gemini-written check-ins.',
    url: 'https://github.com/Ganesh-403/Aura-Wellness',
  },
  {
    name: 'Image colorization',
    body: 'Colorizes black-and-white photos with a pretrained CNN, guided-filter upsampling and tiled high-resolution inference.',
    url: 'https://github.com/Ganesh-403/image-colorization-project',
  },
];

// Merged upstream PRs worth showing. Anything else in github.json.upstream is left out on purpose.
const UPSTREAM_REPOS = ['riscv/riscv-unified-db', 'Apicurio/apicurio-registry'];
export const upstream = github.upstream.filter((pr) => UPSTREAM_REPOS.includes(pr.repo));

export const community: { title: string; period: string; body?: string }[] = [
  {
    title: 'Project admin, Elite Coders Summer of Code',
    period: 'Jul – Sep 2026',
    body: 'Ran the Semantic Plagiarism Detector as a program project: reviewed contributor pull requests, triaged issues, wrote contributor docs and issue templates, and set up branch protection.',
  },
  {
    title: 'Contributor, GirlScript Summer of Code',
    period: 'May – Aug 2026',
  },
];

export type Role = {
  title: string;
  org: string;
  kind: 'Full-time' | 'Internship' | 'Education';
  start: string;
  end: string;
  place?: string;
  // One line shown with the role; points are tucked behind a disclosure.
  note?: string;
  points?: string[];
};

// Newest first. Dates follow LinkedIn.
export const experience: Role[] = [
  {
    title: 'AI Engineer',
    org: 'Flid AI',
    kind: 'Full-time',
    start: 'Aug 2026',
    end: 'now',
    place: 'remote from Mumbai',
    note: 'LeapView: governed data access, query performance, releases and upgrades.',
  },
  {
    title: 'Java Developer, Backend and Microservices',
    org: 'ShadowFox',
    kind: 'Internship',
    start: 'Feb 2025',
    end: 'Mar 2025',
    place: 'Pune',
    points: [
      'Built a microservices e-commerce backend with REST APIs and service boundaries that deploy independently.',
      'Delivered five Java applications, including bank and student management systems, test-first with JUnit.',
    ],
  },
  {
    title: 'Python Developer, Automation and Data Systems',
    org: 'AI Adventures',
    kind: 'Internship',
    start: 'Jan 2025',
    end: 'Feb 2025',
    place: 'Pune',
    points: [
      'Built an absence detection system on the Google Sheets API that made attendance tracking over 30% more efficient.',
      'Automated data-change alerts with GitHub Actions, cutting manual follow-up by 90%.',
    ],
  },
  {
    title: 'B.E. Computer Engineering',
    org: 'Genba Sopanrao Moze College of Engineering, Savitribai Phule Pune University',
    kind: 'Education',
    start: '2022',
    end: '2026',
    note: 'CGPA 7.95',
  },
];

// The first author is shown in bold; list authors in the paper's order.
export const papers: { title: string; authors?: string[]; venue?: string; year: number; url?: string }[] = [
  {
    title:
      'A Survey on AI-Driven Honeypot Systems and Real-Time Intrusion Detection: Techniques, Challenges, and Future Directions',
    authors: ['Ganesh Kambli', 'Akash Guldagad', 'Anand Bora', 'Aarya Konde Deshmukh', 'Rahul Korke'],
    venue: 'International Journal of Progressive Research in Engineering, Management and Science (IJPREMS)',
    year: 2026,
    url: 'https://www.ijprems.com/research-paper/a-survey-on-aidriven-honeypot-systems-and--realtime-intrusion-detection-techniques--challenges-and-future-directions',
  },
  {
    title:
      'HoneyCloud: A Smart Scalable Honeypot Platform with ML-Based Threat Classification and Real-Time Attacker Profiling',
    authors: undefined,
    venue: undefined,
    year: 2026,
    url: undefined,
  },
];

export const awards = [
  { title: 'Winner, Site Craft web development challenge', by: 'VAMINT Club', year: 2025 },
  { title: 'Runner-up, Prep-A-Thon coding competition', by: 'Technobash', year: 2025 },
];

export const certifications = [
  { title: 'Python for Machine Learning', by: 'IIT Bombay (EduPyramids, SINE)', year: 2026 },
  { title: 'Google AI Essentials', by: 'Google', year: 2025 },
  { title: 'Gemini Certified University Student', by: 'Google' },
  { title: 'Introduction to Cybersecurity' },
  { title: 'Learn Generative AI' },
];

// Freelance offers, described by outcome rather than by technology. Each one points at work that proves it.
export type Offer = { title: string; body: string; proof: PullRequest[]; projects?: string[] };

export const offers: Offer[] = [
  {
    title: 'A new product, from idea to launch',
    body: 'You bring the problem. I handle the rest: product decisions, interface, backend, data and hosting, and hand over something you can run.',
    proof: [],
    projects: ['RepoSage', 'Semantic Plagiarism Detector'],
  },
  {
    title: 'An existing system, taken further',
    body: 'New features, faster queries, AI connected to your own data, or fixes for the parts that keep breaking, without starting over.',
    proof: [
      lv(409, 'Governed Arrow streaming'),
      lv(943, 'Recover truncated agent responses before executing tools'),
    ],
  },
  {
    title: 'Ready for real users',
    body: 'Releases you can repeat, upgrades that don’t lose data, access control and monitoring, so it keeps working after launch.',
    proof: [
      lv(800, 'Signed provenance and SBOMs'),
      lv(646, 'Qualified upgrade path'),
      lv(393, 'Dashboard refresh reliability SLI'),
    ],
  },
];

export const contact = {
  formEndpoint: 'https://formspree.io/f/mdawpzbb',
};
