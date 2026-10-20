import { m } from '#/paraglide/messages';

export interface NowEntry {
  id: string;
  label: () => string;
  text: () => string;
}

// What I am up to right now. Bump now_updated whenever this changes.
export const now: NowEntry[] = [
  { id: 'building', label: m.now_building_label, text: m.now_building },
  { id: 'learning', label: m.now_learning_label, text: m.now_learning },
  { id: 'work', label: m.now_work_label, text: m.now_work },
  // TODO: placeholder, swap for what I am actually watching or reading
  { id: 'watching', label: m.now_watching_label, text: m.now_watching },
];
