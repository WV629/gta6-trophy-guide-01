// trophyFilters: which trophies a filter state shows, and what the spoiler setting hides.
// A story trophy stays hidden (name, description and guide) until it is earned.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
};

export function isStoryTrophy(trophy) {
  return trophy.kind === 'story';
}

export function isSpoilerHidden(trophy, state) {
  return state.hideSpoilers && isStoryTrophy(trophy) && !state.earned.has(trophy.name);
}

export function applyTrophyFilters(trophies, state) {
  const query = state.search.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.kind !== 'all') {
      if (state.kind === 'missable') {
        if (!trophy.missable) return false;
      } else if (trophy.kind !== state.kind) {
        return false;
      }
    }
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.missableOnly && !trophy.missable) return false;
    if (state.earnedOnly && !state.earned.has(trophy.name)) return false;
    if (query) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function countByGrade(trophies, earned) {
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  return grades.map((grade) => {
    const total = trophies.filter((t) => t.grade === grade).length;
    const done = trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    return { grade, done, total };
  });
}

export function formatCount(count, trophy) {
  if (count === null || count === undefined) return null;
  if (trophy.name === 'Dime on the Dollar') return '$250,000';
  if (trophy.name === 'Treat Yo Self') return '$100,000';
  return String(count);
}

// Improvement pass: verification framing computed from the data itself, so the
// audit strip, source counts and next-up list can never drift from trophies.json.

// The three launch-day unknowns: no cited guide had verified an unlock method
// for them, so their guides say so honestly instead of inventing steps.
export const UNCONFIRMED_NAMES = new Set(['In The Beginning…', 'Bad Luck, I Guess', 'Ten Pin']);

export function isUnconfirmed(trophy) {
  return UNCONFIRMED_NAMES.has(trophy.name);
}

// How many sources a trophy's guide cites (trophies.json carries the derived
// citation_count; fall back to the sources array so older data still works).
export function sourceCount(trophy) {
  if (typeof trophy.citation_count === 'number') return trophy.citation_count;
  return (trophy.sources ?? []).length;
}

// A money target ($250,000 / $100,000) is not a countable progress step; every
// other numeric count is (meditations 18, cards 3, scans 100, stunts 250, ...).
export function isCounterTrophy(trophy) {
  return (
    typeof trophy.count === 'number' &&
    trophy.name !== 'Dime on the Dollar' &&
    trophy.name !== 'Treat Yo Self'
  );
}

export function auditStats(trophies) {
  const sites = new Set();
  for (const trophy of trophies) {
    for (const source of trophy.sources ?? []) {
      try {
        sites.add(new URL(source.url).hostname.replace(/^www\./, ''));
      } catch {
        // A source URL that does not parse still counts as a citation, just not a site.
      }
    }
  }
  return {
    total: trophies.length,
    withSources: trophies.filter((t) => sourceCount(t) > 0).length,
    totalCitations: trophies.reduce((sum, t) => sum + sourceCount(t), 0),
    backedByTwoPlus: trophies.filter((t) => sourceCount(t) >= 2).length,
    sites: sites.size,
    missable: trophies.filter((t) => t.missable).length,
    unconfirmed: trophies.filter(isUnconfirmed).length,
  };
}

// Every distinct source, with how many trophies cite it. Read dates are the
// list check date the footer states (19 November 2026, launch day).
export function distinctSources(trophies) {
  const byUrl = new Map();
  for (const trophy of trophies) {
    for (const source of trophy.sources ?? []) {
      const entry = byUrl.get(source.url) ?? {
        name: source.name,
        url: source.url,
        read: '19 November 2026',
        trophies: 0,
      };
      entry.trophies += 1;
      byUrl.set(source.url, entry);
    }
  }
  return [...byUrl.values()].sort((a, b) => b.trophies - a.trophies || a.name.localeCompare(b.name));
}

// Next unearned trophies in roadmap order, the one possibly missable trophy
// first so it is never buried at the bottom of the list.
export function nextUpTrophies(trophies, earned, limit = 5) {
  return trophies
    .filter((t) => !earned.has(t.name))
    .sort(
      (a, b) =>
        Number(b.missable) - Number(a.missable) ||
        a.roadmap_stage - b.roadmap_stage ||
        a.id - b.id,
    )
    .slice(0, limit);
}

// Missables round: the trophies the guides flag as missable, in roadmap
// order, and progress broken down by kind so the header card can show where
// the remaining work sits (story, collectibles, activities, missable).
export function missableTrophies(trophies) {
  return trophies
    .filter((t) => t.missable)
    .sort((a, b) => a.roadmap_stage - b.roadmap_stage || a.id - b.id);
}

export function countByKind(trophies, earned) {
  const kinds = ['story', 'collectibles', 'activities', 'missable'];
  return kinds.map((kind) => {
    const total = trophies.filter((t) => t.kind === kind).length;
    const done = trophies.filter((t) => t.kind === kind && earned.has(t.name)).length;
    return { kind, done, total };
  });
}
