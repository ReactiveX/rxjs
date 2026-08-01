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
  const destination = subscriber;
  const handleError = overrides?.error
    ? (error: unknown) => {
        try {
          overrides.error!(error);
        } catch (callbackError) {
          destination.error(callbackError);
        }
      }
    : (error: unknown) => destination.error(error);

  try {
    source.subscribe(
      {
        next: overrides?.next
          ? (value) => {
              try {
                overrides.next!(value);
              } catch (error) {
                destination.error(error);
              }
            }
          : (value) => destination.next(value),
        error: handleError,
        complete: overrides?.complete
          ? () => {
              try {
                overrides.complete!();
              } catch (error) {
                destination.error(error);
              }
            }
          : () => destination.complete(),
      },
      { signal: signal ? AbortSignal.any([destination.signal, signal]) : destination.signal }
    );
  } catch (error) {
    // Subscription setup failures are source failures and therefore follow an
    // overridden source-error path when one is present.
    handleError(error);
  }
}
