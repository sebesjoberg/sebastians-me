import { Box, Text } from '@mantine/core';
import { useRunning } from './useRunning';
import classes from './Numbers.module.css';
import type { Stat } from '#/content/numbers';
import { m } from '#/paraglide/messages';
import { getLocale } from '#/paraglide/runtime';

// All the numbers on one screen as a bento grid: one big tinted tile for
// the year, two small ones beside it, and the race times along the bottom
// on top of their photos.
export function Numbers({ items }: { items: Stat[] }) {
  const running = useRunning();

  return (
    <Box w="100%" maw={1040}>
      <div className={classes.grid}>
        {items.map(({ id, icon: Icon, size, image, label, value, unit }) => (
          <div key={id} className={classes.card} data-size={size}>
            {image ? (
              <img className={classes.photo} src={image} alt="" />
            ) : null}
            <Icon className={classes.icon} stroke={1.75} aria-hidden />
            <div className={classes.body}>
              <p className={classes.value}>
                {value(running) ?? '–'}
                {unit ? <span className={classes.unit}>{unit}</span> : null}
              </p>
              <p className={classes.label}>{label()}</p>
            </div>
          </div>
        ))}
      </div>
      <Text mt="sm" fz="sm" c="dimmed" ta="right">
        {running
          ? m.stat_strava_note({
              date: new Intl.DateTimeFormat(getLocale(), {
                dateStyle: 'medium',
              }).format(new Date(running.updatedAt)),
            })
          : m.stat_strava_missing()}
      </Text>
    </Box>
  );
}
