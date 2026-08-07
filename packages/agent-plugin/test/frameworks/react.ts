import { useSyncExternalStore } from 'react';
import 'rxjs';

export function useObservableValue<T>(source: Observable<T>, initial: T): T {
  let current = initial;
  return useSyncExternalStore(
    (notify) => {
      const controller = new AbortController();
      source.subscribe(
        (value) => {
          current = value;
          notify();
        },
        { signal: controller.signal }
      );
      return () => controller.abort();
    },
    () => current,
    () => initial
  );
}
