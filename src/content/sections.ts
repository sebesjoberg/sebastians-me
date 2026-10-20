import { timeline } from './timeline';
import { m } from '#/paraglide/messages';

// Same placeholder everywhere until there are real photos.
export const placeholderImage = '/placeholder.svg';

export type SectionKind = 'hero' | 'facts' | 'timeline';

export interface SectionItem {
  /** Scroll target id. */
  id: string;
  title: () => string;
  /** Picture shown with the item while it is active. */
  image?: string;
}

export interface SectionDef {
  /** Used for the URL hash. */
  id: string;
  kind: SectionKind;
  /** A Paraglide message, so it follows the active locale. */
  title: () => string;
  /** One full-screen slot per item. */
  items: SectionItem[];
}

export const facts: SectionItem[] = [
  { id: 'marathon', title: m.fact_marathon, image: placeholderImage },
  { id: 'lidingo', title: m.fact_lidingo, image: placeholderImage },
  { id: 'discgolf', title: m.fact_discgolf, image: placeholderImage },
  { id: 'f1', title: m.fact_f1, image: placeholderImage },
  { id: 'hiking', title: m.fact_hiking, image: placeholderImage },
  { id: 'k8s', title: m.fact_k8s, image: placeholderImage },
];

// Single source of truth for the one-page layout: the sections and the hash
// links all read from this list.
export const sections: SectionDef[] = [
  {
    id: 'hello',
    kind: 'hero',
    title: m.section_hello,
    items: [],
  },
  { id: 'things', kind: 'facts', title: m.section_things, items: facts },
  {
    id: 'journey',
    kind: 'timeline',
    title: m.section_journey,
    items: timeline.map(({ id, title, image }) => ({ id, title, image })),
  },
];
