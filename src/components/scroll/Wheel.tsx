import { type ReactNode, useEffect, useState } from 'react';
import { Box } from '@mantine/core';

interface WheelProps<T> {
  items: T[];
  activeId: string | null;
  getId: (item: T) => string;
  /** 'y' stacks the items top to bottom, 'x' lays them out left to right. */
  axis?: 'x' | 'y';
  /** Row height (y) or column width (x) of an inactive item, any CSS length. */
  smallSize: string;
  /** Row height (y) or column width (x) of the active item, any CSS length. */
  bigSize: string;
  render: (item: T, isActive: boolean) => ReactNode;
}

const ease = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

// A strip of fixed-size cells along one axis, translated so the active cell
// sits in the middle of its (relative, overflow-hidden) parent. Because the
// cells only ever use the two known sizes, the translation is plain
// arithmetic and the whole thing animates with a single transform.
//
// Cells fade with distance from the active one, and each cell's
// transition is delayed a little by that distance, so a change ripples
// outwards from the middle instead of everything moving at once.
//
// When the active id belongs to another section the wheel keeps its last
// position, so leaving at the end and coming back does not sweep through
// every cell.
export function Wheel<T>({
  items,
  activeId,
  getId,
  axis = 'y',
  smallSize,
  bigSize,
  render,
}: WheelProps<T>) {
  const found = items.findIndex((item) => getId(item) === activeId);
  const [remembered, setRemembered] = useState(0);

  useEffect(() => {
    if (found >= 0) {
      setRemembered(found);
    }
  }, [found]);

  const activeIndex = found >= 0 ? found : remembered;
  const offset = `calc(-1 * (${activeIndex} * ${smallSize} + ${bigSize} / 2))`;
  const isX = axis === 'x';

  return (
    <Box
      pos="absolute"
      top={isX ? 0 : '50%'}
      bottom={isX ? 0 : undefined}
      left={isX ? '50%' : 0}
      right={isX ? undefined : 0}
      display={isX ? 'flex' : undefined}
      style={{
        transform: isX ? `translateX(${offset})` : `translateY(${offset})`,
        transition: `transform 600ms ${ease}`,
      }}
    >
      {items.map((item, index) => {
        const distance = Math.abs(index - activeIndex);
        const isActive = distance === 0;
        const size = isActive ? bigSize : smallSize;
        return (
          <Box
            key={getId(item)}
            h={isX ? '100%' : size}
            w={isX ? size : undefined}
            display="flex"
            ta="center"
            px="md"
            style={{
              flex: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              // no blur: it made the neighbours hard to read for little gain
              opacity: isActive ? 1 : Math.max(0.3, 0.85 - distance * 0.15),
              transition: `${isX ? 'width' : 'height'} 600ms ${ease}, opacity 500ms ${ease}`,
              transitionDelay: `${Math.min(distance, 4) * 40}ms`,
            }}
          >
            {render(item, isActive)}
          </Box>
        );
      })}
    </Box>
  );
}
