// Leonida Trophy Guide — boots the app: loads the 55 trophies, wires the filters,
// the spoiler setting, the checklist, the detail panel, the roadmap, and export/import.
// Improvement pass: an audit strip computed from the data, per-trophy source
// counts in the list, a Sources tab listing every distinct source, a "Next up"
// bar in roadmap order (missable first), and progress counters for countable
// trophies — all rendered from trophies.json, nothing fetched at run time.
// Deep links: ?view=roadmap|sources, ?kind=collectibles, ?grade=silver, ?trophy=<id>,
// ?spoilers=off, ?search=<text> set the initial state for a shared link.
import {
  loadTrophies,
  loadEarned,
  saveEarned,
  toggleEarned,
  exportProgress,
  importProgressFile,
  loadSettings,
  saveSettings,
  loadCounters,
  setCounter,
} from './trophyStore.js';
import {
  KIND_LABELS,
  applyTrophyFilters,
  countByGrade,
  isSpoilerHidden,
  formatCount,
  auditStats,
  distinctSources,
  nextUpTrophies,
  sourceCount,
  isUnconfirmed,
} from './trophyFilters.js';
import { renderTrophyDetail } from './trophyDetail.js';
import { renderRoadmap } from './trophyRoadmap.js';

const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

const params = new URLSearchParams(location.search);
const savedSettings = loadSettings();

const state = {
  trophies: [],
  earned: loadEarned(),
  counters: loadCounters(),
  search: params.get('search') ?? '',
  kind: params.get('kind') ?? 'all',
  grade: params.get('grade') ?? 'all',
  missableOnly: params.get('missable') === '1',
  earnedOnly: false,
  hideSpoilers: params.get('spoilers') === 'off' ? false : (savedSettings.hideSpoilers ?? true),
  selectedId: params.get('trophy') ? Number(params.get('trophy')) : null,
  view: params.get('view') === 'roadmap' ? 'roadmap' : params.get('view') === 'sources' ? 'sources' : 'checklist',
};

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detailPanel');
const listMetaEl = document.getElementById('listMeta');
const searchInput = document.getElementById('searchInput');
const kindFilter = document.getElementById('kindFilter');
const gradeFilter = document.getElementById('gradeFilter');
const missableOnlyBox = document.getElementById('missableOnly');
const earnedOnlyBox = document.getElementById('earnedOnly');
const spoilerToggle = document.getElementById('spoilerToggle');

function selectedTrophy() {
  if (state.selectedId === null) return null;
  return state.trophies.find((t) => t.id === state.selectedId) ?? null;
}

function renderAuditStrip() {
  const stats = auditStats(state.trophies);
  const strip = document.getElementById('auditStrip');
  strip.replaceChildren();
  const items = [
    `${stats.total}/${stats.total} official name, description, grade`,
    `${stats.withSources}/${stats.total} guides cite sources`,
    `${stats.totalCitations} source citations`,
    `${stats.backedByTwoPlus} backed by 2+ sources`,
    `${stats.sites} distinct sites`,
    `${stats.missable} possibly missable`,
    `${stats.unconfirmed} unconfirmed`,
  ];
  for (const text of items) {
    const item = document.createElement('span');
    item.className = 'audit-item';
    item.textContent = text;
    strip.append(item);
  }
}

function renderNextUp() {
  const box = document.getElementById('nextUp');
  box.replaceChildren();
  const heading = document.createElement('strong');
  heading.className = 'next-up-heading';
  heading.textContent = 'Next up · roadmap order';
  box.append(heading);
  for (const trophy of nextUpTrophies(state.trophies, state.earned)) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'next-chip';
    if (trophy.missable) chip.classList.add('is-missable');
    chip.textContent = `${trophyDisplayName(trophy)} · Stage ${trophy.roadmap_stage}${trophy.missable ? ' ⚠ missable' : ''}`;
    chip.addEventListener('click', () => {
      state.selectedId = trophy.id;
      renderAll();
    });
    box.append(chip);
  }
}

function renderSourcesView() {
  const sources = distinctSources(state.trophies);
  document.getElementById('sourcesTotal').textContent =
    `${auditStats(state.trophies).totalCitations} citations from ${sources.length} sources`;
  const list = document.getElementById('sourcesList');
  list.replaceChildren();
  for (const source of sources) {
    const item = document.createElement('li');
    item.className = 'source-row';
    const name = document.createElement('span');
    name.className = 'source-name';
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    name.append(link);
    const meta = document.createElement('span');
    meta.className = 'source-meta';
    meta.textContent = `Cited by ${source.trophies} ${source.trophies === 1 ? 'trophy' : 'trophies'} · Read ${source.read}`;
    item.append(name, meta);
    list.append(item);
  }
}

function renderProgress() {
  const total = state.trophies.length;
  const done = state.earned.size;
  const percent = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressCount').textContent = `${done} / ${total}`;
  document.getElementById('progressPercent').textContent = `${percent}%`;
  document.getElementById('progressFill').style.width = `${percent}%`;
  document.getElementById('progressNote').textContent =
    done === total && total > 0
      ? 'Platinum earned — Vice Got a Price!'
      : `${total - done} to go. Progress is saved in this browser.`;
  const counts = countByGrade(state.trophies, state.earned);
  const countsEl = document.getElementById('gradeCounts');
  countsEl.replaceChildren();
  for (const { grade, done: d, total: t } of counts) {
    const item = document.createElement('li');
    const strong = document.createElement('b');
    strong.textContent = `${d}/${t}`;
    item.append(document.createTextNode(`${GRADE_LABELS[grade]} `), strong);
    countsEl.append(item);
  }
}

function trophyDisplayName(trophy) {
  return isSpoilerHidden(trophy, state) ? 'Hidden story trophy' : trophy.name;
}

function renderList() {
  const visible = applyTrophyFilters(state.trophies, state);
  listMetaEl.textContent =
    visible.length === state.trophies.length
      ? `Showing all ${visible.length} trophies. Click one for its guide and sources.`
      : `Showing ${visible.length} of ${state.trophies.length} trophies.`;
  listEl.replaceChildren();
  for (const trophy of visible) {
    const hidden = isSpoilerHidden(trophy, state);
    const item = document.createElement('li');
    item.className = 'trophy-card';
    if (state.earned.has(trophy.name)) item.classList.add('is-earned');
    if (selectedTrophy() === trophy) item.classList.add('is-selected');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophyDisplayName(trophy)} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => {
      toggleEarned(state.earned, trophy.name);
      renderAll();
    });

    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = trophyDisplayName(trophy);

    const stage = document.createElement('span');
    stage.className = 'trophy-stage';
    stage.textContent = `Stage ${trophy.roadmap_stage}`;

    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = hidden ? 'Story trophy — hidden until earned.' : trophy.description;

    const meta = document.createElement('span');
    meta.className = 'trophy-meta';
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `badge badge-${trophy.grade}`;
    gradeBadge.textContent = GRADE_LABELS[trophy.grade];
    meta.append(gradeBadge);
    const kindBadge = document.createElement('span');
    kindBadge.className = 'badge badge-kind';
    kindBadge.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
    if (trophy.kind !== 'missable') meta.append(kindBadge);
    if (trophy.hidden) {
      const hiddenBadge = document.createElement('span');
      hiddenBadge.className = 'badge badge-hidden';
      hiddenBadge.textContent = 'Hidden on PSN';
      meta.append(hiddenBadge);
    }
    if (trophy.missable) {
      const missableBadge = document.createElement('span');
      missableBadge.className = 'badge badge-missable';
      missableBadge.textContent = '⚠ Missable';
      meta.append(missableBadge);
    }
    if (isUnconfirmed(trophy)) {
      const unconfirmedBadge = document.createElement('span');
      unconfirmedBadge.className = 'badge badge-unconfirmed';
      unconfirmedBadge.textContent = 'Unconfirmed';
      meta.append(unconfirmedBadge);
    }
    const countText = formatCount(trophy.count, trophy);
    if (countText) {
      const countBadge = document.createElement('span');
      countBadge.className = 'badge badge-count';
      const done = state.counters.get(trophy.name);
      countBadge.textContent = done
        ? `${done}/${countText} done`
        : `Target: ${countText}`;
      meta.append(countBadge);
    }
    const srcBadge = document.createElement('span');
    srcBadge.className = 'badge badge-src';
    srcBadge.textContent = `${sourceCount(trophy)} src`;
    meta.append(srcBadge);

    item.append(box, name, stage, desc, meta);
    item.addEventListener('click', () => {
      state.selectedId = trophy.id;
      renderAll();
    });
    listEl.append(item);
  }
  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'trophy-card';
    empty.textContent = 'No trophies match these filters. Clear the search or widen the filters.';
    listEl.append(empty);
  }
}

function renderDetail() {
  renderTrophyDetail(
    detailEl,
    selectedTrophy(),
    state,
    (name) => {
      toggleEarned(state.earned, name);
      renderAll();
    },
    (name, value, target) => {
      setCounter(state.counters, name, value, target);
      renderAll();
    },
  );
}

function renderRoadmapView() {
  renderRoadmap(document.getElementById('roadmapStages'), state.trophies, state.earned, (trophy) => {
    state.selectedId = trophy.id;
    setView('checklist');
    renderAll();
    document.getElementById('detailPanel').scrollIntoView({ block: 'nearest' });
  });
}

function setView(view) {
  state.view = view;
  document.getElementById('tabChecklist').classList.toggle('is-active', view === 'checklist');
  document.getElementById('tabRoadmap').classList.toggle('is-active', view === 'roadmap');
  document.getElementById('tabSources').classList.toggle('is-active', view === 'sources');
  document.getElementById('checklistView').hidden = view !== 'checklist';
  document.getElementById('roadmapView').hidden = view !== 'roadmap';
  document.getElementById('sourcesView').hidden = view !== 'sources';
}

function renderAll() {
  renderProgress();
  renderAuditStrip();
  renderNextUp();
  renderList();
  renderDetail();
  renderRoadmapView();
  renderSourcesView();
}

function persistSettings() {
  saveSettings({ hideSpoilers: state.hideSpoilers });
}

searchInput.value = state.search;
kindFilter.value = state.kind;
gradeFilter.value = state.grade;
missableOnlyBox.checked = state.missableOnly;
spoilerToggle.checked = state.hideSpoilers;

searchInput.addEventListener('input', () => {
  state.search = searchInput.value;
  renderList();
});
kindFilter.addEventListener('change', () => {
  state.kind = kindFilter.value;
  renderList();
});
gradeFilter.addEventListener('change', () => {
  state.grade = gradeFilter.value;
  renderList();
});
missableOnlyBox.addEventListener('change', () => {
  state.missableOnly = missableOnlyBox.checked;
  renderList();
});
earnedOnlyBox.addEventListener('change', () => {
  state.earnedOnly = earnedOnlyBox.checked;
  renderList();
});
spoilerToggle.addEventListener('change', () => {
  state.hideSpoilers = spoilerToggle.checked;
  persistSettings();
  renderAll();
});
document.getElementById('tabChecklist').addEventListener('click', () => {
  setView('checklist');
});
document.getElementById('tabRoadmap').addEventListener('click', () => {
  setView('roadmap');
});
document.getElementById('tabSources').addEventListener('click', () => {
  setView('sources');
});
document.getElementById('exportButton').addEventListener('click', () => {
  exportProgress(state.earned);
});
document.getElementById('importInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    state.earned = await importProgressFile(
      file,
      state.trophies.map((t) => t.name),
    );
    saveEarned(state.earned);
    renderAll();
  } catch (error) {
    listMetaEl.textContent = `Import failed: ${error.message}`;
  }
  event.target.value = '';
});

state.trophies = await loadTrophies();
setView(state.view);
renderAll();
