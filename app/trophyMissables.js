// trophyMissables: the dedicated Missables view — every trophy the cited
// guides flag as missable, with the chapter window it can be lost in, what to
// do, why it can be missed, and what the sources disagree about. Everything
// on this page is grounded in the trophy's own guide and its cited sources in
// trophies.json (plus the window / trigger / save fields derived from that
// guide): where a guide does not state a chapter or a mission, the view says
// so instead of inventing one. The view also collects the safety-net habits
// the roadmap states — manual saves, no cheats — and the one time-sensitive
// moment the roadmap flags, so all the "don't lock yourself out" advice lives
// in one place.
import { sourceCount, missableTrophies } from './trophyFilters.js';

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

function factRow(container, label, text) {
  const row = document.createElement('p');
  row.className = 'missable-fact';
  const strong = document.createElement('strong');
  strong.textContent = `${label}: `;
  row.append(strong, document.createTextNode(text));
  container.append(row);
}

function renderMissableCard(container, trophy, earned, onSelectTrophy, onToggleEarned) {
  const card = document.createElement('article');
  card.className = 'missable-card';

  const title = document.createElement('h3');
  title.textContent = trophy.name;
  card.append(title);

  const badges = document.createElement('div');
  badges.className = 'detail-badges';
  badges.append(badge(GRADE_LABELS[trophy.grade], `badge-${trophy.grade}`));
  badges.append(badge(`Roadmap stage ${trophy.roadmap_stage}`, 'badge-kind'));
  if (typeof trophy.count === 'number') {
    badges.append(badge(`Target: ${trophy.count}`, 'badge-count'));
  }
  badges.append(badge(`${sourceCount(trophy)} src`, 'badge-src'));
  card.append(badges);

  const official = document.createElement('p');
  official.className = 'detail-official';
  official.textContent = `Official: “${trophy.description}”`;
  card.append(official);

  factRow(
    card,
    'Window',
    trophy.missable_window ?? 'The guide does not state a chapter window for this trophy.',
  );
  factRow(
    card,
    'What to do',
    trophy.missable_trigger ?? 'The guide does not name a specific moment for this trophy.',
  );

  const why = document.createElement('p');
  why.textContent =
    'Why it can be missed: the trophy needs every meditation spot, and the first spot is at Jason’s house in Chapter 1 — once the chapter ends that spot is gone. A Chapter 1 spot left undone can block the trophy on that save, which is why the guides flag this as the one trophy to handle early instead of leaving for cleanup.';
  card.append(why);

  const dispute = document.createElement('div');
  dispute.className = 'dispute-box';
  const disputeHeading = document.createElement('strong');
  disputeHeading.textContent = 'Sources differ — is it missable?';
  const disputeBody = document.createElement('p');
  disputeBody.textContent =
    'PowerPyx flags this as the only trophy that can be missed, but it is not yet confirmed whether the balcony meditation is actually required for the trophy: it raises the counter but is not marked as a regular spot. PowerPyx’s author did the balcony meditation and then earned the trophy, so the safe play is to do it in Chapter 1 either way.';
  dispute.append(disputeHeading, disputeBody);
  card.append(dispute);

  factRow(
    card,
    'Safety net',
    trophy.missable_save ??
      'The guide gives no save advice for this trophy; keep a manual save from the start of the chapter as a habit.',
  );

  const sources = trophy.sources ?? [];
  const sourcesHeading = document.createElement('h4');
  sourcesHeading.textContent = `Sources for this guide · ${sources.length}`;
  card.append(sourcesHeading);
  const list = document.createElement('ol');
  list.className = 'detail-sources';
  sources.forEach((source) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    item.append(link);
    list.append(item);
  });
  card.append(list);

  const actions = document.createElement('div');
  actions.className = 'missable-actions';
  const earnedLabel = document.createElement('label');
  earnedLabel.className = 'detail-earned';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.addEventListener('change', () => onToggleEarned(trophy.name));
  earnedLabel.append(box, document.createTextNode('Earned'));
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'missables-link';
  open.textContent = 'Open the full guide →';
  open.addEventListener('click', () => onSelectTrophy(trophy));
  actions.append(earnedLabel, open);
  card.append(actions);

  container.append(card);
}

export function renderMissables(container, trophies, earned, onSelectTrophy, onToggleEarned) {
  container.replaceChildren();
  const missable = missableTrophies(trophies);
  const safe = trophies.length - missable.length;

  const heading = document.createElement('h2');
  heading.textContent = 'Missables — the trophies you can lock yourself out of';
  container.append(heading);

  const intro = document.createElement('p');
  intro.className = 'missables-intro';
  intro.textContent =
    `${missable.length} of ${trophies.length} trophies can be missed. The other ${safe} stay earnable after the story — after the credits the whole map stays open for cleanup, and nothing else is locked behind the story. Handle the one below before its window closes, and the platinum stays safe.`;
  container.append(intro);

  for (const trophy of missable) {
    renderMissableCard(container, trophy, earned, onSelectTrophy, onToggleEarned);
  }

  const safety = document.createElement('div');
  safety.className = 'missable-safety';
  const safetyHeading = document.createElement('strong');
  safetyHeading.textContent = 'Safety net — three habits from the roadmap';
  safety.append(safetyHeading);
  const habits = document.createElement('ul');
  for (const habit of [
    'Keep a manual save at the start of every chapter (15 slots) and one from just before the final mission — that save is the only way back if a window closes.',
    'Never use cheats on your trophy save: they disable trophies and saving.',
    'Do Yago’s race the moment it appears. The roadmap flags it as time-sensitive — the one moment outside the missable trophy that should not wait.',
  ]) {
    const item = document.createElement('li');
    item.textContent = habit;
    habits.append(item);
  }
  safety.append(habits);
  container.append(safety);
}
