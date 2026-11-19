// trophyDetail: the detail panel for one trophy — official description, grade,
// the guide in our own words, and the sources it cites, each as a plain link.
import { KIND_LABELS, isSpoilerHidden, formatCount } from './trophyFilters.js';

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

export function renderTrophyDetail(panel, trophy, state, onToggleEarned) {
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
  const countText = formatCount(trophy.count, trophy);
  if (countText) badges.append(badge(`Target: ${countText}`, 'badge-count'));
  badges.append(badge(`Roadmap stage ${trophy.roadmap_stage}`, 'badge-kind'));
  panel.append(badges);

  if (trophy.missable) {
    const warning = document.createElement('p');
    warning.className = 'detail-warning';
    warning.textContent = 'Potentially missable — see the guide below and do it in Chapter 1, before the chapter ends.';
    panel.append(warning);
  }

  if (!hidden) {
    const guideHeading = document.createElement('h3');
    guideHeading.textContent = 'How to earn it';
    panel.append(guideHeading);
    const guide = document.createElement('p');
    guide.className = 'detail-guide';
    guide.textContent = trophy.guide;
    panel.append(guide);

    const sourcesHeading = document.createElement('h3');
    sourcesHeading.textContent = 'Sources';
    panel.append(sourcesHeading);
    const list = document.createElement('ul');
    list.className = 'detail-sources';
    for (const source of trophy.sources ?? []) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.name;
      item.append(link);
      list.append(item);
    }
    panel.append(list);
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
