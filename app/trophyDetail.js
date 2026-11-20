// trophyDetail: the detail panel for one trophy — official description, grade,
// the guide in our own words, and the sources it cites, each numbered so the
// guide's inline citation markers [1] [2] point at a real entry below.
// Improvement pass: numbered "SOURCES FOR THIS GUIDE · N", a counter widget for
// trophies with a countable target, and honest dispute boxes — the missable
// trophy shows both sides of its balcony-meditation question, and the three
// unconfirmed trophies say so outright instead of inventing steps.
import {
  KIND_LABELS,
  isSpoilerHidden,
  formatCount,
  sourceCount,
  isCounterTrophy,
  isUnconfirmed,
} from './trophyFilters.js';

const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

function badge(text, className) {
  const span = document.createElement('span');
  span.className = `badge ${className}`;
  span.textContent = text;
  return span;
}

function renderCounter(panel, trophy, state, onCounterChange) {
  const target = trophy.count;
  const current = state.counters.get(trophy.name) ?? 0;
  const box = document.createElement('div');
  box.className = 'counter-widget';

  const label = document.createElement('span');
  label.className = 'counter-label';
  label.textContent = 'Your count';
  const value = document.createElement('strong');
  value.className = 'counter-value';
  value.textContent = `${current} / ${target}`;
  box.append(label, value);

  const minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'counter-step';
  minus.textContent = '−';
  minus.setAttribute('aria-label', 'One fewer');
  minus.disabled = current <= 0;
  minus.addEventListener('click', () => onCounterChange(trophy.name, current - 1, target));
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'counter-step';
  plus.textContent = '+';
  plus.setAttribute('aria-label', 'One more');
  plus.disabled = current >= target;
  plus.addEventListener('click', () => onCounterChange(trophy.name, current + 1, target));
  box.append(minus, plus);

  const hint = document.createElement('span');
  hint.className = 'counter-hint';
  hint.textContent =
    current >= target
      ? 'Target reached — the trophy should pop.'
      : 'Saved in this browser, like your checklist.';
  box.append(hint);
  panel.append(box);
}

export function renderTrophyDetail(panel, trophy, state, onToggleEarned, onCounterChange, onOpenMissables) {
  panel.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Pick a trophy from the checklist to see its official description, the full guide and the sources behind it.';
    panel.append(empty);
    return;
  }
  const hidden = isSpoilerHidden(trophy, state);
  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  panel.append(title);

  const official = document.createElement('p');
  official.className = 'detail-official';
  official.textContent = hidden
    ? 'Spoilers are hidden until this story trophy is earned. Tick it off (or turn the spoiler setting off) to reveal it.'
    : `Official: “${trophy.description}”`;
  panel.append(official);

  const badges = document.createElement('div');
  badges.className = 'detail-badges';
  badges.append(badge(GRADE_LABELS[trophy.grade], `badge-${trophy.grade}`));
  if (trophy.kind !== 'missable') badges.append(badge(KIND_LABELS[trophy.kind] ?? trophy.kind, 'badge-kind'));
  if (trophy.hidden) badges.append(badge('Hidden on PSN', 'badge-hidden'));
  if (trophy.missable) badges.append(badge('⚠ Missable', 'badge-missable'));
  if (isUnconfirmed(trophy)) badges.append(badge('Unconfirmed', 'badge-unconfirmed'));
  const countText = formatCount(trophy.count, trophy);
  if (countText) badges.append(badge(`Target: ${countText}`, 'badge-count'));
  badges.append(badge(`${sourceCount(trophy)} src`, 'badge-src'));
  badges.append(badge(`Roadmap stage ${trophy.roadmap_stage}`, 'badge-kind'));
  panel.append(badges);

  if (trophy.missable) {
    const warning = document.createElement('div');
    warning.className = 'dispute-box';
    const heading = document.createElement('strong');
    heading.textContent = 'Sources differ — is it missable?';
    const body = document.createElement('p');
    body.textContent =
      'PowerPyx flags this as the only trophy that can be missed: the first meditation happens at Jason’s house in Chapter 1 and is gone once the chapter ends. It is not yet confirmed whether that balcony meditation is actually required for the trophy — it raises the counter but is not marked as a regular spot — but PowerPyx’s author did it and then earned the trophy. Do it in Chapter 1 to be safe and keep a Chapter 1 save until the trophy pops.';
    warning.append(heading, body);
    panel.append(warning);
    if (onOpenMissables) {
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'missables-link';
      open.textContent = 'See the Missables view →';
      open.addEventListener('click', onOpenMissables);
      panel.append(open);
    }
  }

  if (isUnconfirmed(trophy)) {
    const note = document.createElement('div');
    note.className = 'unconfirmed-box';
    const heading = document.createElement('strong');
    heading.textContent = 'Unconfirmed — no verified unlock yet';
    const body = document.createElement('p');
    body.textContent =
      'No cited guide had verified an unlock method for this trophy at launch. The guide below reports what is known and the official description; it does not invent steps. Treat any step list found elsewhere as unverified until a cited guide confirms it.';
    note.append(heading, body);
    panel.append(note);
  }

  if (!hidden) {
    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'How to earn it';
    panel.append(guideHeading);
    const guide = document.createElement('p');
    guide.className = 'detail-guide';
    guide.textContent = trophy.guide;
    // Inline citation markers keyed to the numbered sources below: the guide
    // is prose, so the markers sit at the end of the guide rather than on
    // invented step breakdowns.
    const sources = trophy.sources ?? [];
    for (let i = 0; i < sources.length; i++) {
      const marker = document.createElement('sup');
      marker.className = 'cite-sup';
      const link = document.createElement('a');
      link.href = `#src-${i + 1}`;
      link.textContent = `[${i + 1}]`;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById(`src-${i + 1}`)?.scrollIntoView({ block: 'nearest' });
      });
      marker.append(link);
      guide.append(document.createTextNode(' '), marker);
    }
    panel.append(guide);

    if (isCounterTrophy(trophy) && onCounterChange) renderCounter(panel, trophy, state, onCounterChange);

    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = `Sources for this guide · ${sources.length}`;
    panel.append(sourcesHeading);
    const list = document.createElement('ol');
    list.className = 'detail-sources';
    sources.forEach((source, index) => {
      const item = document.createElement('li');
      item.id = `src-${index + 1}`;
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
      list.append(item);
    });
    panel.append(list);
    const readNote = document.createElement('p');
    readNote.className = 'sources-read-note';
    readNote.textContent = 'Sources checked 19 November 2026, launch day.';
    panel.append(readNote);
  }

  const earnedLabel = document.createElement('label');
  earnedLabel.className = 'detail-earned';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.name);
  box.addEventListener('change', () => onToggleEarned(trophy.name));
  earnedLabel.append(box, document.createTextNode('Earned'));
  panel.append(earnedLabel);
}
