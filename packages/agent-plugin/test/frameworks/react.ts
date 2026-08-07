import { useSyncExternalStore } from 'react';
import 'rxjs';

export interface ObservableStore<T> {
  readonly subscribe: (notify: () => void) => () => void;
  readonly getSnapshot: () => T;
  readonly getServerSnapshot: () => T;
  readonly destroy: () => void;
}

export function createObservableStore<T>(source: Observable<T>, initial: T): ObservableStore<T> {
  let current = initial;
  let sourceController: AbortController | undefined;
  const listeners = new Set<() => void>();

  const subscribe = (notify: () => void) => {
    listeners.add(notify);
    if (listeners.size === 1) {
      const controller = new AbortController();
      sourceController = controller;
      source.subscribe((value) => {
        current = value;
        for (const listener of listeners) listener();
      }, { signal: controller.signal });
    }

    return () => {
      listeners.delete(notify);
      if (listeners.size === 0) {
        sourceController?.abort();
        sourceController = undefined;
      }
    };
  };

  return {
    subscribe,
    getSnapshot: () => current,
    getServerSnapshot: () => initial,
    destroy: () => {
      sourceController?.abort();
      sourceController = undefined;
      listeners.clear();
    },
  };
}

export function useObservableValue<T>(store: ObservableStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
