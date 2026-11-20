// trophyRoadmap: the eight-stage road to the platinum, built from the official
// descriptions and the cited guides — story chapters first, then side strands,
// collectibles, and the activity grind last. Missable trophies are flagged.
// Improvement pass: each stage chip shows its trophy's source count, and each
// stage heading totals the citations behind it, so the roadmap reads as a
// cited plan rather than an bare list of names.
import { sourceCount } from './trophyFilters.js';

export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Chapter 1 — learn Leonida, do the one missable thing',
    text: 'Play the opening chapter and its first mission, Gone Fishing. Finish an arcade game on the home TV while you are here. Most important: do Lucia’s balcony meditation before Chapter 1 ends (see Positive Mental Attitude). Keep a manual save at the start of the chapter.',
  },
  {
    stage: 2,
    title: 'Chapter 2 — two protagonists, garages and the Scooter Bros app',
    text: 'Finish Chapter 2 and the mission Breakfast Run, which unlocks switching between Jason and Lucia. Buy garages through the Vice City Real Estate app (after Daily Driver), register vehicles with Scooter Bros (after Moses), and rob Kingpin Bowling for its three valuables.',
  },
  {
    stage: 3,
    title: 'Chapter 3 — Vice City opens up: heists, jewelry, the Key Cloner',
    text: 'Finish Chapter 3 and The Cartel Heist. This chapter unlocks jewelry robberies and the Snap Gun, the Key Cloner for Randy’s sports-car list, the Dye Pack Jammer for laundering marked bills, and the Andy and Tyrone questlines. Do the side strands as they appear.',
  },
  {
    stage: 4,
    title: 'Chapter 4 — the big jobs: bank vaults and the finale setup',
    text: 'Finish Chapter 4, including Child’s Play, Headliners and the VCIA Takedown. Take the optional mission That’s Where The Money Is when it appears: it unlocks bank-vault robberies, which also earn the partner trophies and the armored-truck trophy. Rob three shops in a row with your partner for Retail Therapy.',
  },
  {
    stage: 5,
    title: 'Finale — Chapter 5 and the final mission',
    text: 'Play through to the final mission and finish it for the gold, plus Operation Savage Glory in Chapter 5. Keep a manual save from just before the finale. After the credits the whole map stays open for cleanup — nothing else is locked behind the story.',
  },
  {
    stage: 6,
    title: 'Side strands — Kenton, Billy, Bret, Cal and the strangers',
    text: 'Finish the optional questlines: Kenton’s treasure dives, Billy’s mud-club jobs, Bret’s hunts, Cal’s fishing challenges, and eight stranger strands (Kirk, Kyle, Yago and Pilot Pete among them). Do Yago’s Race Against Yago the moment it appears — it is time-sensitive.',
  },
  {
    stage: 7,
    title: 'Collectibles and exploration',
    text: 'Sweep the collectibles: 3 card sets, 100 WAiNK scans, 100 vehicles discovered by scanning, and the whole map unfogged (fly it). Meditation spots, card sets and scans are all doable in free roam after the story.',
  },
  {
    stage: 8,
    title: 'Activities, grind and cleanup — then the platinum',
    text: 'The long tail: 250 stunts (300 for 100%), gold in all 42 shooting-range challenges, drone races at all 14 locations, 20 race wins, 50 challenges (70 for 100%), all 39 illegal gang operations, the 500 criminal-profile actions, max Strength on both characters, the UFO easter egg, the tank, the airliner, and the money trophies. Finish the 100% checklist for A Long Road and the platinum pops.',
  },
];

export function renderRoadmap(container, trophies, earned, onSelectTrophy, onOpenMissables) {
  container.replaceChildren();
  for (const meta of ROADMAP_STAGES) {
    const stageTrophies = trophies.filter((t) => t.roadmap_stage === meta.stage);
    const done = stageTrophies.filter((t) => earned.has(t.name)).length;
    const item = document.createElement('li');
    item.className = 'roadmap-stage';

    const heading = document.createElement('h3');
    const number = document.createElement('span');
    number.className = 'stage-number';
    number.textContent = `Stage ${meta.stage}`;
    heading.append(number, document.createTextNode(meta.title));
    const progress = document.createElement('span');
    progress.className = 'stage-progress';
    const cites = stageTrophies.reduce((sum, t) => sum + sourceCount(t), 0);
    progress.textContent = `${done}/${stageTrophies.length} earned · ${cites} citations`;
    heading.append(progress);
    item.append(heading);

    const text = document.createElement('p');
    text.textContent = meta.text;
    item.append(text);

    const list = document.createElement('ul');
    list.className = 'stage-trophies';
    for (const trophy of stageTrophies) {
      const chip = document.createElement('li');
      chip.textContent = `${trophy.name} · ${sourceCount(trophy)} src${trophy.missable ? ' ⚠' : ''}`;
      if (trophy.missable) chip.classList.add('is-missable');
      if (earned.has(trophy.name)) chip.classList.add('is-earned');
      chip.title = trophy.missable ? 'Potentially missable' : trophy.description;
      chip.addEventListener('click', () => onSelectTrophy(trophy));
      list.append(chip);
    }
    item.append(list);
    if (stageTrophies.some((t) => t.missable) && onOpenMissables) {
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'missables-link';
      open.textContent = 'See the Missables view for this stage’s window →';
      open.addEventListener('click', onOpenMissables);
      item.append(open);
    }
    container.append(item);
  }
}
