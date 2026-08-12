import { create } from './create.js';

const PlatformObservable = Observable;

class ColdSubscriber<T> implements Subscriber<T> {
  #abortController = new AbortController();
  #destination: Partial<Observer<T>> | null = null;
  #teardowns: (() => void)[] | null = null;

  readonly #signal: AbortSignal;

  get active() {
    return !this.#signal.aborted;
  }

  get signal() {
    return this.#signal;
  }

  constructor(maybeObserver: Partial<Observer<T>> | ((value: T) => void) | null = null, parentSignal?: AbortSignal) {
    this.#destination =
      typeof maybeObserver === 'function'
        ? {
            next: maybeObserver,
          }
        : maybeObserver;

    this.#signal = parentSignal ? AbortSignal.any([parentSignal, this.#abortController.signal]) : this.#abortController.signal;

    this.#signal.addEventListener(
      'abort',
      () => {
        if (this.#teardowns) {
          const teardowns = this.#teardowns;
          this.#teardowns = null;
          for (const teardown of teardowns) {
            teardown();
          }
        }
      },
      { once: true }
    );
  }

  next(value: T) {
    if (this.active) {
      try {
        this.#destination?.next?.(value);
      } catch (error) {
        reportError(error);
      }
    }
  }

  error(error: any) {
    if (this.active) {
      this.#abortController.abort();
      try {
        const handler = this.#destination?.error;
        if (handler) {
          handler.call(this.#destination, error);
        } else {
          reportError(error);
        }
      } catch (handlerError) {
        reportError(handlerError);
      }
    }
  }

  complete() {
    if (this.active) {
      this.#abortController.abort();
      try {
        this.#destination?.complete?.();
      } catch (error) {
        reportError(error);
      }
    }
  }

  addTeardown(teardown: () => void) {
    this.#teardowns ??= [];
    this.#teardowns.push(teardown);
  }
}

/**
 * Compatibility Observable whose JavaScript `subscribe()` override creates an
 * independent producer execution and Subscriber for every direct
 * subscription.
 *
 * Native string-named methods deliberately cross back to the platform
 * lifecycle and return platform Observables. RxJS Symbol-keyed operators use
 * this class's shared construction protocol and return ColdObservables.
 */
export class ColdObservable<T> extends PlatformObservable<T> {
  readonly #init: (subscriber: Subscriber<T>) => void;

  constructor(init: (subscriber: Subscriber<T>) => void) {
    super(init);
    this.#init = init;
  }

  subscribe(maybeObserver?: Partial<Observer<T>> | ((value: T) => void) | null, config?: SubscribeOptions): void {
    const subscriber = new ColdSubscriber(maybeObserver, config?.signal);
    try {
      this.#init(subscriber);
    } catch (error) {
      subscriber.error(error);
    }
  }

  [create] = <R>(init: (subscriber: Subscriber<R>) => void): ColdObservable<R> => new ColdObservable(init);

  takeUntil(notifier: ObservableValue<any>): Observable<T> {
    return this.#asPlatformObservable().takeUntil(notifier);
  }

  map<R>(mapper: (value: T, index: number) => R): Observable<R> {
    return this.#asPlatformObservable().map(mapper);
  }

  filter(predicate: (value: T, index: number) => boolean): Observable<T> {
    return this.#asPlatformObservable().filter(predicate);
  }

  take(amount: number): Observable<T> {
    return this.#asPlatformObservable().take(amount);
  }

  drop(amount: number): Observable<T> {
    return this.#asPlatformObservable().drop(amount);
  }

  flatMap<R>(mapper: (value: T, index: number) => ObservableValue<R>): Observable<R> {
    return this.#asPlatformObservable().flatMap(mapper);
  }

  switchMap<R>(mapper: (value: T, index: number) => ObservableValue<R>): Observable<R> {
    return this.#asPlatformObservable().switchMap(mapper);
  }

  inspect(inspector: ((value: T) => void) | Inspector<T>): Observable<T> {
    return this.#asPlatformObservable().inspect(inspector);
  }

  catch<R>(handler: (error: any) => ObservableValue<R>): Observable<T | R> {
    return this.#asPlatformObservable().catch(handler);
  }

  finally(callback: () => void): Observable<T> {
    return this.#asPlatformObservable().finally(callback);
  }

  forEach(handler: (value: T) => void, options?: SubscribeOptions): Promise<void> {
    return this.#asPlatformObservable().forEach(handler, options);
  }

  first(options?: SubscribeOptions): Promise<T> {
    return this.#asPlatformObservable().first(options);
  }

  last(options?: SubscribeOptions): Promise<T> {
    return this.#asPlatformObservable().last(options);
  }

  find(predicate: (value: T, index: number) => boolean, options?: SubscribeOptions): Promise<T | undefined> {
    return this.#asPlatformObservable().find(predicate, options);
  }

  some(predicate: (value: T, index: number) => boolean, options?: SubscribeOptions): Promise<boolean> {
    return this.#asPlatformObservable().some(predicate, options);
  }

  every(predicate: (value: T, index: number) => boolean, options?: SubscribeOptions): Promise<boolean> {
    const platformObservable = this.#asPlatformObservable();
    const every = (
      platformObservable as Observable<T> & {
        every?: (predicate: (value: T, index: number) => boolean, options?: SubscribeOptions) => Promise<boolean>;
      }
    ).every;
    return typeof every === 'function'
      ? every.call(platformObservable, predicate, options)
      : platformObservable.some((value, index) => !predicate(value, index), options).then((someValueFailed) => !someValueFailed);
  }

  reduce<R>(reducer: (accumulation: T | R, value: T, index: number) => R): Promise<R>;
  reduce<I, R>(reducer: (accumulation: I | R, value: T, index: number) => R, initialValue: I, options?: SubscribeOptions): Promise<R | I>;
  reduce(
    reducer: (accumulation: any, value: T, index: number) => any,
    ...args: [] | [initialValue: any, options?: SubscribeOptions]
  ): Promise<any> {
    const platformObservable = this.#asPlatformObservable();
    return args.length === 0 ? platformObservable.reduce(reducer) : platformObservable.reduce(reducer, args[0], args[1]);
  }

  toArray(options?: SubscribeOptions): Promise<T[]> {
    return this.#asPlatformObservable().toArray(options);
  }

  #asPlatformObservable(): Observable<T> {
    return new PlatformObservable<T>((subscriber) => {
      this.subscribe(subscriber, { signal: subscriber.signal });
    });
  }
}

function reportError(error: any) {
  if (typeof globalThis.reportError === 'function') {
    globalThis.reportError(error);
  } else {
    globalThis.setTimeout(() => {
      throw error;
    });
  }
}
