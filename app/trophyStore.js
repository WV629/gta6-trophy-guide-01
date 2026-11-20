// trophyStore: loads the trophy data file and keeps earned progress in localStorage,
// with export to a JSON file and import back. No network beyond the app's own files.
// Improvement pass: the same localStorage pattern now also keeps per-trophy
// progress counters (e.g. meditations 3/18), so a collectible grind survives reloads.
export const PROGRESS_KEY = 'gta6-trophy-checklist';
export const SETTINGS_KEY = 'gta6-trophy-settings';
export const COUNTERS_KEY = 'gta6-trophy-counters';

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  const doc = await response.json();
  return doc.trophies;
}

export function loadEarned() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const names = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(names) ? names : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

export function toggleEarned(earned, name) {
  if (earned.has(name)) earned.delete(name);
  else earned.add(name);
  saveEarned(earned);
  return earned;
}

export function exportProgress(earned) {
  const payload = {
    app: 'Leonida Trophy Guide',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned],
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importProgressFile(file, knownNames) {
  const text = await file.text();
  const data = JSON.parse(text);
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) throw new Error('That file has no earned list.');
  const known = new Set(knownNames);
  const earned = new Set(names.filter((name) => known.has(name)));
  saveEarned(earned);
  return earned;
}

export function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// Progress counters: { trophy name: number done }. Values are clamped to
// 0..target by setCounter so a stored count can never exceed the trophy's target.
export function loadCounters() {
  try {
    const raw = localStorage.getItem(COUNTERS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return new Map(Object.entries(data).filter(([, v]) => Number.isFinite(v) && v > 0));
  } catch {
    return new Map();
  }
}

export function saveCounters(counters) {
  localStorage.setItem(COUNTERS_KEY, JSON.stringify(Object.fromEntries(counters)));
}

export function setCounter(counters, name, value, target) {
  const clamped = Math.max(0, Math.min(target, Math.floor(value)));
  if (clamped <= 0) counters.delete(name);
  else counters.set(name, clamped);
  saveCounters(counters);
  return counters;
}

// Missables round: a plain-text progress summary for sharing or pasting
// elsewhere, built from the same data the app renders so it can never
// disagree with the checklist on screen. Counters in progress and the next
// trophies in roadmap order are included; money targets are shown as targets,
// not counts.
export function progressSummaryText(trophies, earned, counters, nextUp) {
  const total = trophies.length;
  const done = earned.size;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const lines = [`Leonida Trophy Guide — ${done}/${total} trophies (${percent}%)`];
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const gradeTotal = trophies.filter((t) => t.grade === grade).length;
    const gradeDone = trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    lines.push(`${grade}: ${gradeDone}/${gradeTotal}`);
  }
  const inProgress = [...counters.entries()].filter(([, v]) => v > 0);
  if (inProgress.length > 0) {
    lines.push('Counters in progress:');
    for (const [name, value] of inProgress) {
      const trophy = trophies.find((t) => t.name === name);
      lines.push(`  ${name}: ${value}/${trophy?.count ?? '?'}`);
    }
  }
  if (nextUp.length > 0) {
    lines.push('Next up (roadmap order):');
    for (const trophy of nextUp) {
      lines.push(`  ${trophy.name}${trophy.missable ? ' (missable)' : ''}`);
    }
  }
  return lines.join('\n');
}

// Copy text to the clipboard, falling back to a temporary textarea for
// browsers without clipboard write access. Returns true when the text landed.
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
