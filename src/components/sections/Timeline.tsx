import { Anchor, Box, Collapse, Flex, Stack, Text } from '@mantine/core';
import { ItemImage } from '../scroll/ItemImage';
import { useScrollState } from '../scroll/scroll-context';
import { Wheel } from '../scroll/Wheel';
import type { TimelineEntry } from '#/content/timeline';

const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

// How far the active dot lifts off the line, in px.
const LIFT = 48;

// A line runs across the middle of the stage, oldest on the left; every
// entry is a dot on it with the year above and the title below. Scrolling
// down slides the strip left so the next entry arrives from the right, which
// reads as travelling along the line. The active entry's dot lifts off the
// line on a thin stem, fills with the accent and takes its year up with it,
// while the title grows to display size and the picture and body appear
// under it. The others stay as one quiet column each.
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  const { activeItemId } = useScrollState();

  return (
    <>
      <Box
        aria-hidden
        pos="absolute"
        top="50%"
        left={0}
        right={0}
        h={2}
        mt={-1}
        bg="var(--mantine-color-default-border)"
      />
      <Wheel
        axis="x"
        items={entries}
        activeId={activeItemId}
        getId={(entry) => entry.id}
        smallSize="9rem"
        bigSize="min(44rem, 92vw)"
        render={(entry, isActive) => {
          const lift = isActive ? LIFT : 0;
          const dot = isActive ? 18 : 10;
          return (
            <Box
              w="100%"
              h="100%"
              display="flex"
              style={{ flexDirection: 'column', alignItems: 'center' }}
            >
              {/* empty top half; the marker below is anchored on the line */}
              <Box style={{ flex: 1 }} />

              {/* zero-height anchor sitting exactly on the line. The stem
                  grows up from it, the dot rides on top of the stem and the
                  year sits above the dot, so all three lift together. */}
              <Box pos="relative" w="100%" h={0} style={{ flex: 'none' }}>
                <Box
                  aria-hidden
                  pos="absolute"
                  left="50%"
                  bottom={0}
                  w={2}
                  ml={-1}
                  h={lift}
                  bg="var(--mantine-primary-color-filled)"
                  style={{ transition: `height 500ms ${ease}` }}
                />
                <Box
                  pos="absolute"
                  left="50%"
                  bottom={lift}
                  w={dot}
                  h={dot}
                  style={{
                    transform: 'translate(-50%, 50%)',
                    borderRadius: '50%',
                    background: isActive
                      ? 'var(--mantine-primary-color-filled)'
                      : 'var(--mantine-color-body)',
                    border: isActive
                      ? 'none'
                      : '2px solid var(--mantine-color-default-border)',
                    boxShadow: isActive
                      ? '0 0 0 6px color-mix(in srgb, var(--mantine-primary-color-filled) 18%, transparent)'
                      : 'none',
                    transition: `bottom 500ms ${ease}, width 500ms ${ease}, height 500ms ${ease}, background-color 300ms ease, box-shadow 300ms ease`,
                  }}
                />
                <Text
                  pos="absolute"
                  left={0}
                  right={0}
                  bottom={lift + dot / 2 + 12}
                  ta="center"
                  fz={isActive ? 'clamp(1.25rem, 2.5vw, 1.75rem)' : '1rem'}
                  lh={1.1}
                  fw={600}
                  c={isActive ? 'purpleAccent' : 'dimmed'}
                  style={{
                    transition: `bottom 500ms ${ease}, font-size 500ms ${ease}, color 300ms ease`,
                  }}
                >
                  {entry.year}
                </Text>
              </Box>

              {/* below the line: the title, and for the active entry its
                  picture and body */}
              <Box w="100%" pt="lg" style={{ flex: 1 }}>
                <Text
                  component="h3"
                  m={0}
                  fz={isActive ? 'clamp(1.75rem, 4vw, 3rem)' : '1rem'}
                  fw={isActive ? 700 : 500}
                  lh={1.1}
                  lts={isActive ? '-0.02em' : 0}
                  c={isActive ? undefined : 'dimmed'}
                  style={{
                    transition: `font-size 500ms ${ease}, letter-spacing 500ms ${ease}, color 300ms ease`,
                  }}
                >
                  {entry.title()}
                </Text>
                <Collapse expanded={isActive} transitionDuration={500}>
                  <Flex
                    mt="lg"
                    gap="lg"
                    justify="center"
                    align={{ base: 'center', sm: 'flex-start' }}
                    direction={{ base: 'column', sm: 'row' }}
                  >
                    {entry.image ? (
                      <ItemImage src={entry.image} height="10rem" />
                    ) : null}
                    <Stack gap="xs" align="flex-start" ta="left" maw="40ch">
                      <Text fz="lg" c="dimmed">
                        {entry.body()}
                      </Text>
                      {entry.link ? (
                        <Anchor
                          href={entry.link.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {entry.link.label()}
                        </Anchor>
                      ) : null}
                    </Stack>
                  </Flex>
                </Collapse>
              </Box>
            </Box>
          );
        }}
      />
    </>
  );
}
