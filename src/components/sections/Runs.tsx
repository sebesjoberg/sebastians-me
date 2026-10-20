import { IconClock, IconGauge, IconMountain } from '@tabler/icons-react';
import { Anchor, Text } from '@mantine/core';
import type { RecentRun } from '../../../server/src/types.ts';
import { RouteShape } from './RouteShape';
import { useRunning } from './useRunning';
import classes from './Runs.module.css';
import { m } from '#/paraglide/messages';
import { getLocale } from '#/paraglide/runtime';

function duration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const min = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(min)}:${pad(sec)}` : `${min}:${pad(sec)}`;
}

function RunCard({ run }: { run: RecentRun }) {
  const locale = getLocale();
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${run.date}T12:00:00`));
  const km = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(run.distanceKm);

  return (
    <li className={classes.card}>
      <RouteShape route={run.route} />
      <div>
        <Text fz="sm" c="dimmed">
          {date}
        </Text>
        <Text fw={600} lh={1.25} lineClamp={1} title={run.name}>
          {run.name}
        </Text>
        {run.description ? (
          <Text mt={4} fz="sm" c="dimmed" lh={1.45} lineClamp={3}>
            {run.description}
          </Text>
        ) : null}
      </div>
      <p className={classes.distance}>
        {km}
        <span className={classes.unit}>km</span>
      </p>
      <dl className={classes.figures}>
        <div>
          <dt>
            <IconClock aria-hidden />
            {m.runs_time()}
          </dt>
          <dd>{duration(run.movingTimeSec)}</dd>
        </div>
        <div>
          <dt>
            <IconGauge aria-hidden />
            {m.runs_pace()}
          </dt>
          <dd>{duration(run.paceSecPerKm)} /km</dd>
        </div>
        <div>
          <dt>
            <IconMountain aria-hidden />
            {m.runs_elevation()}
          </dt>
          <dd>{run.elevationGainM} m</dd>
        </div>
      </dl>
      <Anchor
        href={`https://www.strava.com/activities/${run.id}`}
        target="_blank"
        rel="noreferrer"
        fz="sm"
        fw={600}
      >
        {m.runs_view_on_strava()}
      </Anchor>
    </li>
  );
}

// The latest runs, one card each with the route drawn big on top. A row of
// five on wide screens, a strip to swipe through on phones.
export function Runs() {
  const running = useRunning();

  if (!running) {
    return <Text c="dimmed">{m.stat_strava_missing()}</Text>;
  }
  if (running.recentRuns.length === 0) {
    return <Text c="dimmed">{m.runs_empty()}</Text>;
  }

  return (
    <ol className={classes.list}>
      {running.recentRuns.map((run) => (
        <RunCard key={run.id} run={run} />
      ))}
    </ol>
  );
}
