import '@rxjs/observable-polyfill';
import { create } from '../create.js';

interface ObservableCreator {
  [create]<T>(init: (subscriber: Subscriber<T>) => void): Observable<T>;
}

export interface CreateDerivedObservableOptions<T> {
  receiver: ObservableCreator;
  init: (subscriber: Subscriber<T>) => void;
}

export interface ConvertObservableValueOptions<T> {
  value: ObservableValue<T>;
}

/** Creates a derived value through the receiver's versioned construction ABI. */
export function createDerivedObservable<T>(options: CreateDerivedObservableOptions<T>): Observable<T> {
  return options.receiver[create](options.init);
}

/** Converts inputs at the active realm's platform boundary. */
export function convertObservableValue<T>(options: ConvertObservableValueOptions<T>): Observable<T> {
  return Observable.from(options.value);
}

/** Subscribes upstream with cancellation and errors owned by the derived subscriber. */
export function subscribeToSource<T>(
  source: Observable<T>,
  subscriber: Subscriber<unknown>,
  overrides?: Partial<Observer<T>>,
  signal?: AbortSignal
): void {
  const guard = <Args extends unknown[]>(override: ((...args: Args) => void) | undefined, forward: (...args: Args) => void) =>
    override
      ? (...args: Args) => {
          try {
            override(...args);
          } catch (error) {
            subscriber.error(error);
          }
        }
      : forward;
  const handleError = guard<[unknown]>(overrides?.error, (error) => subscriber.error(error));

  try {
    source.subscribe(
      {
        next: guard<[T]>(overrides?.next, (value) => subscriber.next(value)),
        error: handleError,
        complete: guard<[]>(overrides?.complete, () => subscriber.complete()),
      },
      { signal: signal ? AbortSignal.any([subscriber.signal, signal]) : subscriber.signal }
    );
  } catch (error) {
    // Subscription setup failures are source failures and therefore follow an
    // overridden source-error path when one is present.
    handleError(error);
  }
}
