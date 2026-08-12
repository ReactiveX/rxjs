import '@rxjs/observable-polyfill';

export interface ConvertObservableValueOptions<T> {
  value: ObservableValue<T>;
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
