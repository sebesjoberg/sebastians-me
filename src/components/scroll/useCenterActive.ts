import { useEffect, useState } from 'react';

/**
 * Returns the value of `attribute` on the first element (in document order)
 * that crosses the horizontal line through the middle of the viewport.
 *
 * The observer's root margin shrinks the viewport to that single line, so
 * "intersecting" means "under the line". When nothing is under the line the
 * last value is kept, which is what you want while a header scrolls past.
 */
export function useCenterActive(attribute: string, key: string): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(`[${attribute}]`)
    );
    const underLine = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            underLine.add(entry.target);
          } else {
            underLine.delete(entry.target);
          }
        }
        const first = elements.find((el) => underLine.has(el));
        if (first) {
          setActive(first.getAttribute(attribute));
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );

    for (const el of elements) {
      observer.observe(el);
    }
    return () => observer.disconnect();
    // `key` changes when the set of observed elements changes (e.g. locale).
  }, [attribute, key]);

  return active;
}
