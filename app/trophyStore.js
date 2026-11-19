// trophyStore: loads the trophy data file and keeps earned progress in localStorage,
// with export to a JSON file and import back. No network beyond the app's own files.
export const PROGRESS_KEY = 'gta6-trophy-checklist';
export const SETTINGS_KEY = 'gta6-trophy-settings';

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
