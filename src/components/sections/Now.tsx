import { Stack, Text } from '@mantine/core';
import type { NowEntry } from '#/content/now';
import { m } from '#/paraglide/messages';

// A short list, one line per thing, with a small label in front. Fits on
// one screen, so it is a single slot rather than a wheel.
export function Now({ entries }: { entries: NowEntry[] }) {
  return (
    <Stack gap="xl" maw={680} w="100%">
      {entries.map((entry) => (
        <Stack key={entry.id} gap={4}>
          <Text fz="sm" fw={600} c="purpleAccent" tt="uppercase" lts="0.08em">
            {entry.label()}
          </Text>
          <Text
            component="p"
            m={0}
            fz="clamp(1.25rem, 2.6vw, 1.75rem)"
            fw={600}
            lh={1.3}
          >
            {entry.text()}
          </Text>
        </Stack>
      ))}
      <Text fz="sm" c="dimmed">
        {m.now_updated()}
      </Text>
    </Stack>
  );
}
