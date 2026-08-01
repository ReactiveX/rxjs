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

export interface SubscribeToSourceOptions<T> {
  source: Observable<T>;
  subscriber: Subscriber<unknown>;
  next: (value: T) => void;
  error?: (error: unknown) => void;
  complete?: () => void;
  signal?: AbortSignal;
}

export interface RunWithErrorForwardingOptions<T> {
  subscriber: Subscriber<unknown>;
  run: () => T;
}

export type ErrorForwardingResult<T> = { ok: true; value: T } | { ok: false };

/** Creates a derived value through the receiver's versioned construction ABI. */
export function createDerivedObservable<T>(options: CreateDerivedObservableOptions<T>): Observable<T> {
  return options.receiver[create](options.init);
}

/** Converts inputs at the active realm's platform boundary. */
export function convertObservableValue<T>(options: ConvertObservableValueOptions<T>): Observable<T> {
  return Observable.from(options.value);
}

/** Subscribes upstream with cancellation owned by the derived subscriber. */
export function subscribeToSource<T>(options: SubscribeToSourceOptions<T>): void {
  options.source.subscribe(
    {
      next: options.next,
      error: options.error ?? ((error) => options.subscriber.error(error)),
      complete: options.complete ?? (() => options.subscriber.complete()),
    },
    { signal: options.signal ?? options.subscriber.signal }
  );
}

/** Turns a synchronous callback or conversion exception into a stream error. */
export function runWithErrorForwarding<T>(options: RunWithErrorForwardingOptions<T>): ErrorForwardingResult<T> {
  try {
    return { ok: true, value: options.run() };
  } catch (error) {
    options.subscriber.error(error);
    return { ok: false };
  }
}
