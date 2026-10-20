import { createContext, useContext } from 'react';

export interface ScrollState {
  /** Section currently crossing the vertical middle of the viewport. */
  activeSectionId: string | null;
  /** Item (fact, timeline entry) currently crossing the middle, if any. */
  activeItemId: string | null;
}

export const ScrollContext = createContext<ScrollState>({
  activeSectionId: null,
  activeItemId: null,
});

export function useScrollState(): ScrollState {
  return useContext(ScrollContext);
}
