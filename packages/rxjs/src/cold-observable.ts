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
 * @warning Native Observable methods may subscribe through the platform's
 * internal algorithm instead of reading this instance's `subscribe` property.
 * Those internal subscriptions can bypass this override and its initializer.
 * Use this class only at an explicit compatibility boundary where direct
 * `observable.subscribe(...)` calls are the supported entry point.
 */
export class ColdObservable<T> extends Observable<T> {
  readonly #init: (subscriber: ColdSubscriber<T>) => void;

  constructor(init: (subscriber: ColdSubscriber<T>) => void) {
    super(noop);
    this.#init = init;
  }

  subscribe(maybeObserver?: Partial<Observer<T>> | ((value: T) => void) | null, config?: SubscribeOptions) {
    const subscriber = new ColdSubscriber(maybeObserver, config?.signal);
    try {
      this.#init(subscriber);
    } catch (error) {
      subscriber.error(error);
    }
  }
}

function noop() {}

function reportError(error: any) {
  if (typeof globalThis.reportError === 'function') {
    globalThis.reportError(error);
  } else {
    globalThis.setTimeout(() => {
      throw error;
    });
  }
}
