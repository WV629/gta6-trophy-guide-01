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
