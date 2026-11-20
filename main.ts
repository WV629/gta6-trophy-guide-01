// Leonida Trophy Guide — the entry program for gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is this directory's app/ folder: plain
// static files that open at app/index.html, work with the network off, and load
// nothing beyond their own files. Its 55 trophies and cited guides live in
// app/data/trophies.json (each trophy carries a citation_count derived from its
// own sources array, and a top-level audit block summarising the same numbers).
// Improved version: the app renders a verification audit strip computed from the
// data, per-trophy source counts with inline [1] [2] citation markers, a Sources
// tab listing every distinct source, a "Next up" bar in roadmap order (missable
// first), progress counters for countable trophies, and dispute boxes for the
// contested missable trophy and the three unconfirmed ones. This round adds a
// dedicated Missables view (chapter window, what to do, the sources' dispute,
// and the save safety net), per-kind progress counts, and a copyable plain-text
// progress summary. This program hands
// the entry in: it copies app/ and screenshots/ from beside this file to /output
// and writes /output/dossier.json, the summary the judge reads (screenshots,
// first-load files and bytes, and the source), using the vendored make.fun
// library. vendor/makefun-frontend.ts is the kit's copy and must stay unchanged:
// the scorer requires dossier.json to be byte for byte what its own copy of the
// library writes.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
