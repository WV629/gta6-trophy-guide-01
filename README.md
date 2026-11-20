# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/WV629/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/WV629/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online). Every trophy shows its official name, description and grade exactly as PlayStation publishes them, plus a guide in our own words that cites its sources (PowerPyx, GTABase, Output Lag and more), its kind (story / missable / collectibles / activities), its roadmap stage, and its verified target count where one exists. One trophy is flagged potentially missable — Positive Mental Attitude, with its Chapter 1 balcony meditation — and three launch-day unknowns (In The Beginning…, Bad Luck, I Guess, Ten Pin) are marked unconfirmed rather than guessed at.

The app is a tracker too: a checklist saved in localStorage, exportable to a JSON file and importable back; filters by kind, grade, missable and text search; a spoiler setting that hides story trophies' names and descriptions until earned; a progress bar with counts by grade; a detail view with the guide and its sources; and an 8-stage platinum roadmap (story chapters 1–4 + finale, side strands, collectibles, activities, cleanup) with missable flags. It is plain static files under `app/` with no build step and no network use at run time — every file it loads lives under `app/`.

What the improved version adds, all computed from `app/data/trophies.json` so the numbers can never drift from the data:

- **Audit strip** under the header: `55/55 official name, description, grade · 55/55 guides cite sources · 110 source citations · 55 backed by 2+ sources · 5 distinct sites · 1 possibly missable · 3 unconfirmed`.
- **Per-trophy source counts** in the checklist (`2 src` on every card) and in the roadmap chips, plus inline citation markers `[1] [2]` in each guide keyed to a numbered **Sources for this guide** list in the detail panel.
- **Sources tab**: every distinct source (PowerPyx, GTABase, Output Lag, Of Zen and Computing, U7BUY) with how many trophies cite it and the read date (19 November 2026).
- **Next up bar**: the next unearned trophies in roadmap order, the possibly missable one first.
- **Counter widgets** for countable trophies (meditations 0/18, card sets 0/3, scans 0/100, …) with a +/− stepper saved in localStorage; money targets ($250,000 / $100,000) are not counters.
- **Dispute boxes**: the missable trophy shows both sides of its balcony-meditation question, and the three unconfirmed trophies (In The Beginning…, Bad Luck, I Guess, Ten Pin) are badged and boxed as unconfirmed rather than given invented steps. Each trophy also carries a derived `citation_count` in the data file.

What this round adds, again computed from the same data file:

- **Missables view** (new tab, `?view=missables`): the one possibly missable trophy — Positive Mental Attitude — with its chapter window (Chapter 1, before the chapter ends), what to do (Lucia's balcony meditation after Down to Earth), why it can be missed, the sources' dispute, and the safety net (keep a Chapter 1 save). The data file carries the window, trigger and save advice as derived fields (`missable_window`, `missable_trigger`, `missable_save`), all taken from the trophy's own guide. The view also states the rest plainly: the other 54 trophies stay earnable after the story, plus the roadmap's three safety habits (manual saves per chapter, no cheats, Yago's time-sensitive race).
- **Per-kind progress counts** in the header card (Story / Collectibles / Activities / Missable), next to the per-grade counts.
- **Copy progress summary**: a button in the header card copies a plain-text summary (totals by grade, counters in progress, next up in roadmap order) for sharing — clipboard with a textarea fallback.
- The detail panel and the roadmap both link into the Missables view from the missable trophy, so the warning is one click away wherever you meet it.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no dependencies.

Referral: https://make.fun/r/wkn1wnrf

---

<sub>Entered on [make.fun](https://make.fun/?ref=wkn1wnrf&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
