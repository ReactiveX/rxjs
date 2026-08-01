import { create } from './create.js';
import { Subject } from './subject.js';
import type { SubjectLike } from './util/types.js';

export interface KeyedGroupObservable<K, T> extends Observable<T> {
  readonly key: K;
}

export interface GroupByOptions<K, T, E = T> {
  element?: (value: T) => E;
  duration?: (group: KeyedGroupObservable<K, E>) => ObservableValue<unknown>;
  connector?: () => SubjectLike<E>;
}

export const groupBy: unique symbol = Symbol('groupBy');

declare global {
  interface Observable<T> {
    [groupBy]: {
      <K extends T>(keySelector: (value: T) => value is K): Observable<
        KeyedGroupObservable<true, K> | KeyedGroupObservable<false, Exclude<T, K>>
      >;
      <K>(keySelector: (value: T) => K): Observable<KeyedGroupObservable<K, T>>;
      <K>(keySelector: (value: T) => K, options: GroupByOptions<K, T, T>): Observable<KeyedGroupObservable<K, T>>;
      <K, E>(keySelector: (value: T) => K, options: GroupByOptions<K, T, E> & { element: (value: T) => E }): Observable<
        KeyedGroupObservable<K, E>
      >;
      <K, E>(
        keySelector: (value: T) => K,
        element: (value: T) => E,
        duration?: (group: KeyedGroupObservable<K, E>) => ObservableValue<unknown>,
        connector?: () => SubjectLike<E>
      ): Observable<KeyedGroupObservable<K, E>>;
      <K>(
        keySelector: (value: T) => K,
        element: undefined,
        duration: (group: KeyedGroupObservable<K, T>) => ObservableValue<unknown>,
        connector?: () => SubjectLike<T>
      ): Observable<KeyedGroupObservable<K, T>>;
    };
  }
}

interface GroupEntry<K, T> {
  readonly subject: SubjectLike<T>;
  readonly view: KeyedGroupObservable<K, T>;
  readonly durationView: KeyedGroupObservable<K, T>;
  durationController?: AbortController;
}

function groupByOperator<T, K extends T>(
  this: Observable<T>,
  keySelector: (value: T) => value is K
): Observable<KeyedGroupObservable<true, K> | KeyedGroupObservable<false, Exclude<T, K>>>;
function groupByOperator<T, K>(this: Observable<T>, keySelector: (value: T) => K): Observable<KeyedGroupObservable<K, T>>;
function groupByOperator<T, K>(
  this: Observable<T>,
  keySelector: (value: T) => K,
  options: GroupByOptions<K, T, T>
): Observable<KeyedGroupObservable<K, T>>;
function groupByOperator<T, K, E>(
  this: Observable<T>,
  keySelector: (value: T) => K,
  options: GroupByOptions<K, T, E> & { element: (value: T) => E }
): Observable<KeyedGroupObservable<K, E>>;
function groupByOperator<T, K, E>(
  this: Observable<T>,
  keySelector: (value: T) => K,
  element: (value: T) => E,
  duration?: (group: KeyedGroupObservable<K, E>) => ObservableValue<unknown>,
  connector?: () => SubjectLike<E>
): Observable<KeyedGroupObservable<K, E>>;
function groupByOperator<T, K>(
  this: Observable<T>,
  keySelector: (value: T) => K,
  element: undefined,
  duration: (group: KeyedGroupObservable<K, T>) => ObservableValue<unknown>,
  connector?: () => SubjectLike<T>
): Observable<KeyedGroupObservable<K, T>>;
function groupByOperator<T, K, E = T>(
  this: Observable<T>,
  keySelector: (value: T) => K,
  elementOrOptions?: ((value: T) => E) | GroupByOptions<K, T, E>,
  legacyDuration?: (group: KeyedGroupObservable<K, E>) => ObservableValue<unknown>,
  legacyConnector?: () => SubjectLike<E>
): Observable<any> {
  const source = this;
  const options: GroupByOptions<K, T, E> =
    typeof elementOrOptions === 'function'
      ? {
          element: elementOrOptions,
          duration: legacyDuration,
          connector: legacyConnector,
        }
      : elementOrOptions ?? {
          duration: legacyDuration,
          connector: legacyConnector,
        };
  const { element, duration, connector } = options;

  return source[create]((subscriber) => {
    const groups = new Map<K, GroupEntry<K, E>>();
    const durationControllers = new Set<AbortController>();
    const sourceController = new AbortController();
    let activeGroupViews = 0;
    let dispatchingSourceValue = false;
    let outerActive = true;
    let stopped = false;

    const stop = () => {
      if (stopped) {
        return;
      }
      stopped = true;
      sourceController.abort();
      for (const controller of durationControllers) {
        controller.abort();
      }
      durationControllers.clear();
      groups.clear();
    };

    const stopIfUnobserved = () => {
      if (!outerActive && activeGroupViews === 0 && !dispatchingSourceValue) {
        stop();
      }
    };

    const createGroupView = (key: K, subject: SubjectLike<E>, retainsSource: boolean): KeyedGroupObservable<K, E> => {
      const view = source[create]<E>((groupSubscriber) => {
        if (retainsSource) {
          activeGroupViews++;
        }
        let released = false;
        groupSubscriber.addTeardown(() => {
          if (released || !retainsSource) {
            return;
          }
          released = true;
          activeGroupViews--;
          stopIfUnobserved();
        });
        subject.subscribe(groupSubscriber, { signal: groupSubscriber.signal });
      });

      Object.defineProperty(view, 'key', {
        configurable: false,
        enumerable: true,
        value: key,
        writable: false,
      });
      return view as KeyedGroupObservable<K, E>;
    };

    const terminate = (kind: 'complete' | 'error', error?: unknown) => {
      if (stopped) {
        return;
      }
      stopped = true;
      sourceController.abort();
      for (const controller of durationControllers) {
        controller.abort();
      }
      durationControllers.clear();

      const entries = Array.from(groups.values());
      groups.clear();
      for (const { subject } of entries) {
        if (kind === 'error') {
          subject.error(error);
        } else {
          subject.complete();
        }
      }

      if (kind === 'error') {
        subscriber.error(error);
      } else {
        subscriber.complete();
      }
    };

    const removeGroup = (key: K, entry: GroupEntry<K, E>, kind: 'complete' | 'error', error?: unknown) => {
      if (groups.get(key) !== entry) {
        return;
      }
      groups.delete(key);
      if (entry.durationController) {
        durationControllers.delete(entry.durationController);
        entry.durationController.abort();
      }
      if (kind === 'error') {
        entry.subject.error(error);
      } else {
        entry.subject.complete();
      }
      stopIfUnobserved();
    };

    const startDuration = (key: K, entry: GroupEntry<K, E>) => {
      if (!duration || stopped) {
        return;
      }

      let durationValue: ObservableValue<unknown>;
      try {
        durationValue = duration(entry.durationView);
      } catch (error) {
        terminate('error', error);
        return;
      }

      let durationObservable: Observable<unknown>;
      try {
        durationObservable = Observable.from(durationValue);
      } catch (error) {
        terminate('error', error);
        return;
      }

      const controller = new AbortController();
      entry.durationController = controller;
      durationControllers.add(controller);
      durationObservable.subscribe(
        {
          next: () => removeGroup(key, entry, 'complete'),
          error: (error) => removeGroup(key, entry, 'error', error),
          complete: () => removeGroup(key, entry, 'complete'),
        },
        { signal: AbortSignal.any([sourceController.signal, controller.signal]) }
      );
    };

    subscriber.addTeardown(() => {
      outerActive = false;
      stopIfUnobserved();
    });

    source.subscribe(
      {
        next: (value) => {
          if (stopped) {
            return;
          }

          dispatchingSourceValue = true;
          try {
            let key: K;
            try {
              key = keySelector(value);
            } catch (error) {
              terminate('error', error);
              return;
            }

            let entry = groups.get(key);
            if (!entry) {
              if (!outerActive) {
                return;
              }

              let subject: SubjectLike<E>;
              try {
                subject = connector ? connector() : new Subject<E>();
              } catch (error) {
                terminate('error', error);
                return;
              }

              entry = {
                subject,
                view: createGroupView(key, subject, true),
                durationView: createGroupView(key, subject, false),
              };
              groups.set(key, entry);
              subscriber.next(entry.view);

              if (stopped || groups.get(key) !== entry) {
                return;
              }
              startDuration(key, entry);
              if (stopped || groups.get(key) !== entry) {
                return;
              }
            }

            let groupedValue: E;
            try {
              groupedValue = element ? element(value) : (value as unknown as E);
            } catch (error) {
              terminate('error', error);
              return;
            }
            entry.subject.next(groupedValue);
          } finally {
            dispatchingSourceValue = false;
            stopIfUnobserved();
          }
        },
        error: (error) => terminate('error', error),
        complete: () => terminate('complete'),
      },
      { signal: sourceController.signal }
    );
  });
}

Observable.prototype[groupBy] = groupByOperator;
