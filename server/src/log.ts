/* oxlint-disable no-console -- the one place that writes to the console */

// One JSON object per line, which is what the cluster's log tooling reads.
function write(level: string, message: string, extra?: object) {
  const line = JSON.stringify({
    time: new Date().toISOString(),
    level,
    message,
    ...extra,
  });
  if (level === 'error' || level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export const log = {
  info: (message: string, extra?: object) => write('info', message, extra),
  warn: (message: string, extra?: object) => write('warn', message, extra),
  error: (message: string, extra?: object) => write('error', message, extra),
};

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
