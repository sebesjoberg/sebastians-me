import { useEffect, useState } from 'react';
import type { RunningSummary } from '../../../server/src/types.ts';

// One request per page load, however many components ask.
let request: Promise<RunningSummary | null> | undefined;

async function load(): Promise<RunningSummary | null> {
  try {
    const res = await fetch('/api/running');
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as RunningSummary;
  } catch {
    // API down or offline; the numbers show as unknown.
    return null;
  }
}

/** Running stats from the API, or null until/unless they arrive. */
export function useRunning(): RunningSummary | null {
  const [running, setRunning] = useState<RunningSummary | null>(null);

  useEffect(() => {
    let live = true;
    request ??= load();
    void request.then((value) => {
      if (live) {
        setRunning(value);
      }
    });
    return () => {
      live = false;
    };
  }, []);

  return running;
}
