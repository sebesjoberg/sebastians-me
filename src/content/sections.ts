import { m } from '#/paraglide/messages';

export type SectionKind = 'hero' | 'facts' | 'timeline';

export interface SectionDef {
  /** Used for the URL hash and the outline nav. */
  id: string;
  kind: SectionKind;
  /** A Paraglide message, so it follows the active locale. */
  title: () => string;
  /** Optional backdrop image; without one the section shows the animated background. */
  image?: string;
}

// Single source of truth for the one-page layout: the outline nav, the
// sections and the hash links all read from this list.
export const sections: SectionDef[] = [
  { id: 'hello', kind: 'hero', title: m.section_hello },
  { id: 'things', kind: 'facts', title: m.section_things },
  { id: 'journey', kind: 'timeline', title: m.section_journey },
];
