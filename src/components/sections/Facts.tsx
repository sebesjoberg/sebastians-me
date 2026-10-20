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
      smallSize="2.75rem"
      bigSize="26rem"
      render={(item, isActive) => (
        <Stack align="center" gap="lg">
          {item.image ? (
            <Collapse expanded={isActive} transitionDuration={500}>
              <ItemImage src={item.image} height="11rem" />
            </Collapse>
          ) : null}
          <Text
            component="p"
            m={0}
            maw={960}
            fz={isActive ? 'clamp(2.5rem, 6vw, 5rem)' : '1rem'}
            fw={isActive ? 700 : 500}
            lh={1.05}
            lts={isActive ? '-0.03em' : 0}
            c={isActive ? undefined : 'dimmed'}
            style={{
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
