import { m } from '#/paraglide/messages';

// Same placeholder everywhere until there are real photos.
const placeholderImage = '/placeholder.svg';

export interface TimelineEntry {
  id: string;
  year: number;
  title: () => string;
  /** Shown only while the entry is the focused one. */
  body: () => string;
  /** Picture shown with the entry while it is active. */
  image?: string;
  link?: { href: string; label: () => string };
}

// Oldest first. Ids are used as scroll targets.
export const timeline: TimelineEntry[] = [
  {
    id: 'born',
    year: 2000,
    title: m.timeline_born_title,
    body: m.timeline_born_body,
    image: placeholderImage,
  },
  {
    id: 'school',
    year: 2006,
    title: m.timeline_school_title,
    body: m.timeline_school_body,
    image: placeholderImage,
  },
  {
    id: 'grade7',
    year: 2013,
    title: m.timeline_grade7_title,
    body: m.timeline_grade7_body,
    image: placeholderImage,
  },
  {
    id: 'sts',
    // TODO: confirm the year
    year: 2019,
    title: m.timeline_sts_title,
    body: m.timeline_sts_body,
    image: placeholderImage,
    link: {
      href: 'https://www.uu.se/utbildning/program/civilingenjorsprogrammet-i-system-i-teknik-och-samhalle',
      label: m.timeline_sts_link,
    },
  },
  {
    id: 'hockey',
    year: 2020,
    title: m.timeline_hockey_title,
    body: m.timeline_hockey_body,
    image: placeholderImage,
  },
  {
    id: 'graduated',
    year: 2024,
    title: m.timeline_graduated_title,
    body: m.timeline_graduated_body,
    image: placeholderImage,
  },
  {
    id: 'bms',
    year: 2024,
    title: m.timeline_bms_title,
    body: m.timeline_bms_body,
    image: placeholderImage,
  },
];
