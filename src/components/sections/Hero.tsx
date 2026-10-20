import { Avatar, Stack, Text } from '@mantine/core';
import { m } from '#/paraglide/messages';

// The headline is the hero. Drop a photo at public/me.jpg; until then the
// initials show in a neutral circle.
export function Hero() {
  return (
    <Stack align="center" gap={40} maw={820}>
      <Text
        component="h1"
        m={0}
        ta="center"
        fz="clamp(2.25rem, 5.5vw, 4.5rem)"
        fw={700}
        lh={1.05}
        lts="-0.03em"
      >
        {m.hero_headline()}
      </Text>
      <Avatar
        src="/me.jpg"
        alt={m.hero_name()}
        size={140}
        radius="50%"
        color="gray"
        variant="light"
        fw={500}
      >
        SS
      </Avatar>
      <Stack gap={2} align="center">
        <Text fw={600}>{m.hero_name()}</Text>
        <Text c="dimmed">{m.hero_country()}</Text>
      </Stack>
    </Stack>
  );
}
