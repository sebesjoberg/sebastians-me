import type { ReactNode } from 'react';
import { Group } from '@mantine/core';
import { ScrollContext } from './scroll-context';
import { SectionNav } from './SectionNav';
import { useCenterActive } from './useCenterActive';
import { useHashSync } from './useHashSync';
import classes from './ScrollShell.module.css';
import type { SectionDef } from '#/content/sections';

interface ScrollShellProps {
  sections: SectionDef[];
  /** Pinned to the top right corner, e.g. locale and color scheme controls. */
  controls?: ReactNode;
  /** Pinned to the top left corner once the first section is left behind. */
  brand?: ReactNode;
  /** Accessible name of the section rail on the right edge. */
  navLabel: string;
  children: ReactNode;
}

// Page layout for the one-page site: a centred stage with a small bar of
// controls pinned to the top right and a rail of section dots on the right. Tracks which section/item is in the
// middle of the viewport, shares it through ScrollContext and mirrors it
// into the URL hash.
export function ScrollShell({
  sections,
  controls,
  brand,
  navLabel,
  children,
}: ScrollShellProps) {
  const key = sections
    .map((s) => `${s.id}:${s.items.map((i) => i.id).join(',')}`)
    .join('|');
  const activeSectionId = useCenterActive('data-section-id', key);
  const activeItemId = useCenterActive('data-item-id', key);

  const activeSection = sections.find((s) => s.id === activeSectionId);
  const activeItem = activeSection?.items.find((i) => i.id === activeItemId);

  // The hash names the item when there is one, else the section. The first
  // section at the top of the page gets no hash: that is just the page.
  const isTop = activeSection === sections[0] && !activeItem;
  useHashSync(isTop ? null : (activeItem?.id ?? activeSection?.id ?? null));

  // The brand repeats the first section, so it only shows away from it.
  const showBrand =
    activeSection !== undefined && activeSection !== sections[0];

  return (
    <ScrollContext.Provider value={{ activeSectionId, activeItemId }}>
      {brand ? (
        <div
          className={classes.brand}
          data-visible={showBrand || undefined}
          inert={!showBrand}
        >
          {brand}
        </div>
      ) : null}
      {controls ? (
        <Group gap="sm" className={classes.controls}>
          {controls}
        </Group>
      ) : null}
      <SectionNav
        sections={sections}
        activeSectionId={activeSectionId}
        label={navLabel}
      />
      <main className={classes.main}>{children}</main>
    </ScrollContext.Provider>
  );
}
