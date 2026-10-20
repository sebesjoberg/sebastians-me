import { Anchor, Button, CopyButton, Group, Stack, Text } from '@mantine/core';
import { contactLinks, email } from '#/content/contact';
import { m } from '#/paraglide/messages';

// The last stop: the email big enough to read from across the room, a copy
// button next to it, and the profile links under it.
export function Contact() {
  return (
    <Stack align="center" gap="xl" ta="center">
      <Text
        component="p"
        m={0}
        fz="clamp(2.25rem, 5.5vw, 4rem)"
        fw={700}
        lh={1.05}
        lts="-0.03em"
      >
        {m.contact_headline()}
      </Text>
      <Group gap="md" justify="center">
        <Anchor
          href={`mailto:${email}`}
          fz="clamp(1.125rem, 2.5vw, 1.5rem)"
          fw={600}
        >
          {email}
        </Anchor>
        <CopyButton value={email}>
          {({ copied, copy }) => (
            <Button variant="light" size="xs" radius="xl" onClick={copy}>
              {copied ? m.contact_copied() : m.contact_copy()}
            </Button>
          )}
        </CopyButton>
      </Group>
      <Group gap="lg" component="nav" aria-label={m.contact_links_label()}>
        {contactLinks.map((link) =>
          link.href ? (
            <Anchor
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              c="dimmed"
              fw={500}
            >
              {link.label}
            </Anchor>
          ) : null
        )}
      </Group>
    </Stack>
  );
}
