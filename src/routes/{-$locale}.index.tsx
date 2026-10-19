import { createFileRoute } from '@tanstack/react-router';
import { Anchor, Container, Group, Stack, Text, Title } from '@mantine/core';
import { ColorSchemeToggle } from '#/components/ColorSchemeToggle';
import { LocaleSwitch } from '#/components/LocaleSwitch';
import { sections } from '#/content/sections';
import { m } from '#/paraglide/messages';

export const Route = createFileRoute('/{-$locale}/')({ component: Home });

// Placeholder until the scroll shell is built. It only proves that routing,
// locale, messages and the section data all line up.
function Home() {
  return (
    <Container size="xl" py="xl">
      <Group justify="flex-end" mb="xl">
        <LocaleSwitch />
        <ColorSchemeToggle />
      </Group>
      <Stack gap="sm">
        <Title order={1}>{m.hero_headline()}</Title>
        <Text size="lg" c="dimmed">
          {m.hero_name()} · {m.hero_country()}
        </Text>
      </Stack>
      <Stack gap="xs" mt="xl" component="nav">
        {sections.map((section) => (
          <Anchor key={section.id} href={`#${section.id}`}>
            {section.title()}
          </Anchor>
        ))}
      </Stack>
    </Container>
  );
}
