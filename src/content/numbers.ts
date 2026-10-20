import {
  type Icon,
  IconCalendarWeek,
  IconMedal,
  IconRoute,
  IconRun,
  IconTrees,
} from '@tabler/icons-react';
import type { RunningSummary } from '../../server/src/types.ts';
import { placeholderImage } from './sections';
import { m } from '#/paraglide/messages';
import { getLocale } from '#/paraglide/runtime';

export interface Stat {
  id: string;
  label: () => string;
  /** The number. null while it is unknown, e.g. the API is down. */
  value: (running: RunningSummary | null) => string | null;
  /** Unit after the number, smaller. */
  unit?: string;
  icon: Icon;
  /** Card size in the grid. */
  size: 'lead' | 'small' | 'photo';
  /** Background picture for photo cards. */
  image?: string;
}

const integer = (value: number) =>
  new Intl.NumberFormat(getLocale()).format(Math.round(value));

// Order matters: the lead tile first, the two small ones next to it, then
// the race cards with pictures along the bottom.
export const stats: Stat[] = [
  {
    id: 'km-this-year',
    label: m.stat_km_year,
    value: (running) => (running ? integer(running.thisYear.distanceKm) : null),
    unit: 'km',
    icon: IconRoute,
    size: 'lead',
  },
  {
    id: 'runs-this-year',
    label: m.stat_runs_year,
    value: (running) => (running ? integer(running.thisYear.runs) : null),
    icon: IconRun,
    size: 'small',
  },
  {
    id: 'km-4-weeks',
    label: m.stat_km_4w,
    value: (running) =>
      running ? integer(running.last4Weeks.distanceKm) : null,
    unit: 'km',
    icon: IconCalendarWeek,
    size: 'small',
  },
  {
    id: 'marathon-time',
    label: m.stat_marathon,
    value: () => '3:26',
    icon: IconMedal,
    size: 'photo',
    // TODO: a race photo
    image: placeholderImage,
  },
  {
    id: 'lidingo-time',
    label: m.stat_lidingo,
    value: () => '2:32',
    icon: IconTrees,
    size: 'photo',
    // TODO: a race photo
    image: placeholderImage,
  },
];
