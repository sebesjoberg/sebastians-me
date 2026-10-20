import type { ReactNode } from 'react';
import { Box, Text } from '@mantine/core';
import { useScrollState } from './scroll-context';
import type { SectionDef } from '#/content/sections';

interface SectionProps {
  section: SectionDef;
  children: ReactNode;
}

const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

// How much scrolling each item gets, in viewport heights. Exactly one screen
// per item means one wheel tick or swipe moves one item, which is the only
// version of mandatory snapping that feels predictable. Taller slots let you
// scroll with nothing changing and then jump, which reads as broken.
const SLOT_HEIGHT = 1;

// A section is a tall scroll track with one snap slot per item (at least
// one), and a sticky full-viewport "stage" that stays on screen while you
// scroll through the slots. The stage holds the header and the body; the
// body reads the active item from ScrollContext and animates itself, so
// nothing in the scroll track ever changes size. That keeps the snap points
// fixed, which is what makes "always on exactly one item" work.
//
// The stage fades and rises in when its section becomes the active one, and
// sinks away when it stops being active, so moving between sections reads as
// a scene change rather than a hard scroll.
export function Section({ section, children }: SectionProps) {
  const { activeSectionId } = useScrollState();
  const isActive = activeSectionId === null || activeSectionId === section.id;
  const titleId = `${section.id}-title`;
  const slots = section.items.length > 0 ? section.items : [{ id: section.id }];

  return (
    <Box
      component="section"
      id={section.id}
      data-section-id={section.id}
      aria-labelledby={titleId}
      pos="relative"
      h={`${slots.length * SLOT_HEIGHT * 100}dvh`}
    >
      {slots.map((slot, index) => (
        <Box
          key={slot.id}
          id={slot.id === section.id ? undefined : slot.id}
          data-item-id={slot.id === section.id ? undefined : slot.id}
          pos="absolute"
          top={`${index * SLOT_HEIGHT * 100}dvh`}
          left={0}
          right={0}
          h={`${SLOT_HEIGHT * 100}dvh`}
          style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
        />
      ))}

      <Box
        pos="sticky"
        top={0}
        h="100dvh"
        display="flex"
        style={{ flexDirection: 'column' }}
      >
        <Box
          component="header"
          px="xl"
          pt={40}
          ta="center"
          style={{
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'none' : 'translateY(-8px)',
            transition: `opacity 500ms ${ease}, transform 500ms ${ease}`,
          }}
        >
          <Text component="h2" id={titleId} m={0} fz="md" fw={500} c="dimmed">
            {section.title()}
          </Text>
        </Box>
        <Box
          pos="relative"
          px="xl"
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            opacity: isActive ? 1 : 0,
            transform: isActive ? 'none' : 'translateY(32px) scale(0.98)',
            filter: isActive ? 'none' : 'blur(6px)',
            transition: `opacity 600ms ${ease}, transform 700ms ${ease}, filter 600ms ${ease}`,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
