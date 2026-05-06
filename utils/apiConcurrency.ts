export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const getHttpStatus = (e: unknown): number | undefined => {
  const err = e as { response?: { status?: number }; statusCode?: number };
  return err?.response?.status ?? err?.statusCode;
};

/** Retry transient server/gateway issues and rate limits (429/503). */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: { attempts?: number; baseDelayMs?: number },
): Promise<T> {
  const attempts = opts?.attempts ?? 2;
  const baseDelayMs = opts?.baseDelayMs ?? 400;
  let lastErr: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const st = getHttpStatus(e);
      const shouldRetry = st === 429 || st === 503;
      if (!shouldRetry || i === attempts - 1) throw e;
      await sleep(baseDelayMs * (i + 1) + Math.floor(Math.random() * 200));
    }
  }

  throw lastErr;
}

export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (true) {
      const idx = nextIndex++;
      if (idx >= items.length) return;
      results[idx] = await mapper(items[idx], idx);
    }
  };

  const workers = Array.from(
    { length: Math.max(1, concurrency) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

