import { Collapse, Stack, Text } from '@mantine/core';
import { ItemImage } from '../scroll/ItemImage';
import { useScrollState } from '../scroll/scroll-context';
import { Wheel } from '../scroll/Wheel';
import type { SectionItem } from '#/content/sections';

// One fact at a time at display size in the middle, with its picture above
// it; the others wait above and below as a small, quiet line each.
export function Facts({ items }: { items: SectionItem[] }) {
  const { activeItemId } = useScrollState();

  return (
    <Wheel
      items={items}
      activeId={activeItemId}
      getId={(item) => item.id}
      smallSize="3rem"
      bigSize="24rem"
      render={(item, isActive) => (
        <Stack align="center" gap="lg">
          {item.image ? (
            <Collapse expanded={isActive} transitionDuration={500}>
              <ItemImage src={item.image} height="11rem" />
            </Collapse>
          ) : null}
          {/* the active line stays short enough to read in one glance; the
              waiting ones are full-size body text, not fine print */}
          <Text
            component="p"
            m={0}
            maw={isActive ? '18ch' : 'none'}
            fz={isActive ? 'clamp(2rem, 4.5vw, 3.5rem)' : '1.125rem'}
            fw={isActive ? 700 : 500}
            lh={1.1}
            lts={isActive ? '-0.02em' : 0}
            c={isActive ? undefined : 'dimmed'}
            style={{
              textWrap: 'balance',
              transition:
                'font-size 500ms cubic-bezier(0.2, 0.8, 0.2, 1), letter-spacing 500ms cubic-bezier(0.2, 0.8, 0.2, 1), color 300ms ease',
            }}
          >
            {item.title()}
          </Text>
        </Stack>
      )}
    />
  );
}
