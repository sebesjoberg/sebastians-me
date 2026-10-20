import type { MouseEvent } from 'react';

// How long a jump may take at most before it counts as done anyway, for
// browsers without the scrollend event. The longest jump on the page takes
// about 1.5s in Chrome.
const FALLBACK_MS = 3000;

/** Fired on window when a jump has landed. */
export const JUMP_END_EVENT = 'sebastians:jumpend';

let jumping = false;

/** True while a jump is under way; see useHashSync. */
export function isJumping(): boolean {
  return jumping;
}

/**
 * Smooth-scrolls straight to an element, however far away it is.
 *
 * While the page scrolls past other sections the hash sync would rewrite
 * the URL for each of them, and the router answers every hash change by
 * scrolling to that element, which cancels the jump at the next section.
 * So the hash sync waits until the jump has landed.
 */
export function jumpTo(id: string) {
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  const top = target.getBoundingClientRect().top + window.scrollY;

  // already there: no scroll would happen, so no scrollend either
  if (Math.abs(top - window.scrollY) < 1) {
    return;
  }

  jumping = true;
  let fallback = 0;
  const land = () => {
    if (!jumping) {
      return;
    }
    jumping = false;
    window.clearTimeout(fallback);
    window.removeEventListener('scrollend', land);
    window.dispatchEvent(new Event(JUMP_END_EVENT));
  };
  window.addEventListener('scrollend', land);
  fallback = window.setTimeout(land, FALLBACK_MS);

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  window.scrollTo({ top, behavior: reduceMotion ? 'instant' : 'smooth' });
}

/**
 * Click handler for an in-page link to `id`. Leaves modified clicks (new
 * tab and the like) to the browser.
 */
export function jumpOnClick(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    jumpTo(id);
  };
}
