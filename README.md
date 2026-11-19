# gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/WV629/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/WV629/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Trophy Guide — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden, 0 online). Every trophy shows its official name, description and grade exactly as PlayStation publishes them, plus a guide in our own words that cites its sources (PowerPyx, GTABase, Output Lag and more), its kind (story / missable / collectibles / activities), its roadmap stage, and its verified target count where one exists. One trophy is flagged potentially missable — Positive Mental Attitude, with its Chapter 1 balcony meditation — and three launch-day unknowns (In The Beginning…, Bad Luck, I Guess, Ten Pin) are marked unconfirmed rather than guessed at.

The app is a tracker too: a checklist saved in localStorage, exportable to a JSON file and importable back; filters by kind, grade, missable and text search; a spoiler setting that hides story trophies' names and descriptions until earned; a progress bar with counts by grade; a detail view with the guide and its sources; and an 8-stage platinum roadmap (story chapters 1–4 + finale, side strands, collectibles, activities, cleanup) with missable flags. It is plain static files under `app/` with no build step and no network use at run time — every file it loads lives under `app/`.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no dependencies.

Referral: https://make.fun/r/wkn1wnrf

---

<sub>Entered on [make.fun](https://make.fun/?ref=wkn1wnrf&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
