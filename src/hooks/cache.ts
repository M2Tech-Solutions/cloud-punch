import { useCallback, useEffect, useState } from "react";

type CacheEntry<T> = { data: T };
type Subscriber = () => void;

const store = new Map<string, CacheEntry<unknown>>();
const subscribers = new Map<string, Set<Subscriber>>();

function subscribe(key: string, fn: Subscriber): () => void {
  if (!subscribers.has(key)) subscribers.set(key, new Set());
  subscribers.get(key)!.add(fn);
  return () => subscribers.get(key)?.delete(fn);
}

function notify(key: string) {
  subscribers.get(key)?.forEach((fn) => fn());
}

export function invalidate(key: string) {
  store.delete(key);
  notify(key);
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
): { data: T | undefined; loading: boolean; refresh: () => void } {
  const cached = store.get(key) as CacheEntry<T> | undefined;
  const [state, setState] = useState<{ data: T | undefined; loading: boolean }>(
    { data: cached?.data, loading: !cached },
  );

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await fetcher();
      store.set(key, { data });
      setState({ data, loading: false });
    } catch (err) {
      console.error(`Cache fetch error for key "${key}":`, err);
      setState((s) => ({ ...s, loading: false }));
    }
  }, [key]);

  useEffect(() => {
    if (!store.has(key)) load();
    return subscribe(key, load);
  }, [key, load]);

  const refresh = useCallback(() => invalidate(key), [key]);

  return { data: state.data, loading: state.loading, refresh };
}
