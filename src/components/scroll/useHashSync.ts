import { useEffect, useRef } from 'react';
import { JUMP_END_EVENT, isJumping } from './jump';

function writeHash(id: string | null) {
  const target = id ? `#${id}` : '';
  if (window.location.hash === target) {
    return;
  }
  const url = `${window.location.pathname}${window.location.search}${target}`;
  window.history.replaceState(window.history.state, '', url);
}

/**
 * Keeps the URL hash in step with what is on screen, so a link copied at any
 * point lands on the same item. Uses history.replaceState directly: no
 * router navigation, no new history entry. Passing null clears the hash
 * (used at the very top of the page).
 *
 * Holds off during a jump from the section rail (the router would scroll
 * to every hash it sees and cut the jump short) and catches up when it
 * lands.
 */
export function useHashSync(id: string | null) {
  const latest = useRef(id);
  latest.current = id;

  useEffect(() => {
    if (!isJumping()) {
      writeHash(id);
    }
  }, [id]);

  useEffect(() => {
    const catchUp = () => writeHash(latest.current);
    window.addEventListener(JUMP_END_EVENT, catchUp);
    return () => window.removeEventListener(JUMP_END_EVENT, catchUp);
  }, []);
}
