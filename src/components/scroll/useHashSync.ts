import { useEffect } from 'react';

/**
 * Keeps the URL hash in step with what is on screen, so a link copied at any
 * point lands on the same item. Uses history.replaceState directly: no
 * router navigation, no scroll, no new history entry. Passing null clears
 * the hash (used at the very top of the page).
 */
export function useHashSync(id: string | null) {
  useEffect(() => {
    const target = id ? `#${id}` : '';
    if (window.location.hash === target) {
      return;
    }
    const url = `${window.location.pathname}${window.location.search}${target}`;
    window.history.replaceState(window.history.state, '', url);
  }, [id]);
}
