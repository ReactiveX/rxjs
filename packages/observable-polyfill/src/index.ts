class SafeObserver<T> implements Observer<T> {
  readonly #destination: Partial<Observer<T>> | null | undefined;

  constructor(maybeObserver: Partial<Observer<T>> | ((value: T) => void) | null | undefined) {
    this.#destination = typeof maybeObserver === 'function' ? { next: maybeObserver } : maybeObserver;
  }

  next(value: T): void {
    if (!canInvokeRealmCallbacks()) {
      return;
    }
    try {
      this.#destination?.next?.(value);
    } catch (error) {
      reportError(error);
    }
  }

  error(error: any, hasSourceLocation = true): void {
    if (!canInvokeRealmCallbacks()) {
      return;
    }

    if (!this.#destination?.error) {
      reportError(error, hasSourceLocation);
      return;
    }

    try {
      this.#destination.error(error);
    } catch (handlerError) {
      reportError(handlerError);
    }
  }

  complete(): void {
    if (!canInvokeRealmCallbacks()) {
      return;
    }
    try {
      this.#destination?.complete?.();
    } catch (error) {
      reportError(error);
    }
  }
}

const addObserver = Symbol('addObserver');
const closeSubscriber = Symbol('closeSubscriber');
const errorSubscriber = Symbol('errorSubscriber');
const subscriberToken = Symbol('subscriberToken');
const propagateTeardownError = Symbol('propagateTeardownError');

type AbortAlgorithm = (reason: unknown) => void;
type Teardown = (() => void) & { [propagateTeardownError]?: boolean };

const abortAlgorithms = new WeakMap<AbortSignal, Set<AbortAlgorithm>>();
let nativeAbort: typeof AbortController.prototype.abort | undefined;

// Observable cancellation is specified as an AbortSignal abort algorithm,
// which runs before the signal's public `abort` event. JavaScript has no API
// for registering one, so the fallback bridges only signals with Observable
// work here and otherwise delegates to the captured platform implementation.
function abortWithObservableAlgorithms(this: AbortController, reason?: unknown): void {
  const signal = this.signal;
  let firstError: unknown;
  let hasError = false;

  if (!signal.aborted) {
    const algorithms = abortAlgorithms.get(signal);
    if (algorithms) {
      for (const algorithm of Array.from(algorithms)) {
        try {
          algorithm(reason);
        } catch (error) {
          if (!hasError) {
            firstError = error;
            hasError = true;
          } else {
            reportError(error);
          }
        }
      }
    }
  }

  nativeAbort!.call(this, reason);
  if (hasError) {
    throw firstError;
  }
}

function addAbortAlgorithm(signal: AbortSignal, algorithm: AbortAlgorithm, cleanupSignal?: AbortSignal): void {
  const algorithms = abortAlgorithms.get(signal) ?? new Set<AbortAlgorithm>();
  abortAlgorithms.set(signal, algorithms);

  let active = true;
  const run = (reason: unknown): void => {
    if (!active) {
      return;
    }
    active = false;
    algorithms.delete(run);
    algorithm(reason);
  };

  algorithms.add(run);
  signal.addEventListener('abort', () => run(signal.reason), cleanupSignal ? { once: true, signal: cleanupSignal } : { once: true });
  cleanupSignal?.addEventListener(
    'abort',
    () => {
      active = false;
      algorithms.delete(run);
    },
    { once: true }
  );
}

class Subscriber<T> implements Observer<T> {
  #teardowns: Teardown[] = [];
  #closed = false;

  readonly #observerList = new Set<SafeObserver<T>>();

  readonly #abortController = new AbortController();

  #assertBrand(): void {}

  constructor(...args: [symbol?]) {
    const token = args[0];
    if (token !== subscriberToken) {
      throw new TypeError('Illegal constructor');
    }
  }

  [addObserver](observer: SafeObserver<T>): (reason?: unknown) => void {
    this.#observerList.add(observer);

    return (reason?: unknown) => {
      this.#observerList.delete(observer);
      if (this.#observerList.size === 0) {
        this[closeSubscriber](reason);
      }
    };
  }

  [closeSubscriber](reason?: unknown): void {
    if (!this.active) {
      return;
    }

    this.#closed = true;
    let firstError: unknown;
    let hasError = false;
    try {
      this.#abortController.abort(reason);
    } catch (error) {
      firstError = error;
      hasError = true;
    }
    this.#observerList.clear();

    const teardowns = this.#teardowns;
    this.#teardowns = [];
    for (let index = teardowns.length - 1; index >= 0; index--) {
      const teardown = teardowns[index]!;
      try {
        teardown();
      } catch (error) {
        if (teardown[propagateTeardownError] && !hasError) {
          firstError = error;
          hasError = true;
        } else {
          reportError(error);
        }
      }
    }

    if (hasError) {
      throw firstError;
    }
  }

  get active(): boolean {
    return !this.#closed;
  }

  get signal(): AbortSignal {
    return this.#abortController.signal;
  }

  addTeardown(teardown: () => void): void {
    this.#assertBrand();
    if (arguments.length === 0 || typeof teardown !== 'function') {
      throw new TypeError('Subscriber.addTeardown requires a callback');
    }

    if (!this.active) {
      teardown();
      return;
    }

    this.#teardowns.push(teardown);
  }

  next(value: T): void {
    this.#assertBrand();
    if (arguments.length === 0) {
      throw new TypeError('Subscriber.next requires a value');
    }

    if (this.active) {
      const observers = Array.from(this.#observerList);
      for (const observer of observers) {
        observer.next(value);
      }
    }
  }

  error(error: any): void {
    this.#assertBrand();
    if (arguments.length === 0) {
      throw new TypeError('Subscriber.error requires an error');
    }

    this[errorSubscriber](error, true);
  }

  [errorSubscriber](error: any, hasSourceLocation: boolean): void {
    if (!this.active) {
      reportError(error, hasSourceLocation);
      return;
    }

    const observers = Array.from(this.#observerList);
    this[closeSubscriber](error);
    for (const observer of observers) {
      observer.error(error, hasSourceLocation);
    }
  }

  complete(): void {
    this.#assertBrand();
    if (this.active) {
      const observers = Array.from(this.#observerList);
      this[closeSubscriber]();
      for (const observer of observers) {
        observer.complete();
      }
    }
  }
}

function reportError(error: unknown, hasSourceLocation = true): void {
  if (!canInvokeRealmCallbacks()) {
    return;
  }
  if (hasSourceLocation && globalThis.reportError) {
    globalThis.reportError(error);
    return;
  }
  if (typeof ErrorEvent === 'function' && typeof globalThis.dispatchEvent === 'function') {
    const isError = error instanceof Error;
    const event = new ErrorEvent('error', {
      cancelable: true,
      colno: hasSourceLocation ? 1 : 0,
      error,
      lineno: hasSourceLocation ? 1 : 0,
      message: isError ? error.message : String(error),
    });
    event.preventDefault();
    globalThis.dispatchEvent(event);
    return;
  }
  if (globalThis.reportError) {
    globalThis.reportError(error);
    return;
  }
  globalThis.setTimeout(() => {
    throw error;
  });
}

function reportUnhandledRejection(reason: unknown): void {
  if (typeof PromiseRejectionEvent === 'function' && typeof globalThis.dispatchEvent === 'function') {
    const event = new PromiseRejectionEvent('unhandledrejection', {
      cancelable: true,
      promise: Promise.resolve(),
      reason,
    });
    event.preventDefault();
    globalThis.dispatchEvent(event);
    return;
  }
  void Promise.reject(reason);
}

const realmStartedInFrame = typeof window !== 'undefined' && typeof document !== 'undefined' && window.parent !== window;

function canInvokeRealmCallbacks(): boolean {
  return !realmStartedInFrame || window.frameElement !== null;
}

type Callable = (...args: any[]) => unknown;

interface SyncIteratorRecord<T> {
  readonly iterator: object;
  readonly next: Callable;
}

interface AsyncIteratorRecord {
  readonly iterator: object;
}

function isObject(value: unknown): value is object {
  return (typeof value === 'object' && value !== null) || typeof value === 'function';
}

function toUnsignedLongLong(value: unknown): number {
  const number = Number(value);
  if (!Number.isFinite(number) || number === 0) {
    return 0;
  }

  const integer = Math.trunc(number);
  const range = 2 ** 64;
  if (integer > 0 && integer < range) {
    return integer;
  }

  const remainder = integer % range;
  return remainder < 0 ? remainder + range : remainder;
}

function getMethod(value: object, key: PropertyKey): Callable | undefined {
  const method = (value as Record<PropertyKey, unknown>)[key];
  if (method == null) {
    return undefined;
  }
  if (typeof method !== 'function') {
    throw new TypeError(`${String(key)} must be callable`);
  }
  return method as Callable;
}

function getSyncIteratorRecord<T>(value: object): SyncIteratorRecord<T> {
  const iteratorMethod = getMethod(value, Symbol.iterator);
  if (!iteratorMethod) {
    throw new TypeError('Object does not define a callable Symbol.iterator method');
  }

  const iterator = iteratorMethod.call(value);
  if (!isObject(iterator)) {
    throw new TypeError('Symbol.iterator must return an object');
  }

  const next = getMethod(iterator, 'next');
  if (!next) {
    throw new TypeError('Iterator must define a callable next() method');
  }
  return { iterator, next };
}

function getAsyncIteratorRecord(value: object): AsyncIteratorRecord {
  const asyncIteratorMethod = getMethod(value, Symbol.asyncIterator);
  if (asyncIteratorMethod) {
    const iterator = asyncIteratorMethod.call(value);
    if (!isObject(iterator)) {
      throw new TypeError('Symbol.asyncIterator must return an object');
    }
    return { iterator };
  }

  return { iterator: getSyncIteratorRecord(value).iterator };
}

function closeSyncIterator(record: SyncIteratorRecord<unknown>, reason: unknown): void {
  const returnMethod = getMethod(record.iterator, 'return');
  if (!returnMethod) {
    return;
  }

  const result = returnMethod.call(record.iterator, reason);
  if (!isObject(result)) {
    throw new TypeError('Iterator return() must return an Object');
  }
}

function closeAsyncIterator(record: AsyncIteratorRecord, reason: unknown): void {
  let result: unknown;
  try {
    const returnMethod = getMethod(record.iterator, 'return');
    if (!returnMethod) {
      return;
    }
    result = returnMethod.call(record.iterator, reason);
  } catch (error) {
    globalThis.queueMicrotask(() => reportUnhandledRejection(error));
    return;
  }

  void Promise.resolve(result).then(
    (returnResult) => {
      if (!isObject(returnResult)) {
        reportUnhandledRejection(new TypeError('Iterator return() must return an Object'));
      }
    },
    (error) => reportUnhandledRejection(error)
  );
}

function fromIterable<T>(ObservableCtor: typeof Observable<T>, value: object): Observable<T> {
  return new ObservableCtor((subscriber) => {
    if (!subscriber.active) {
      return;
    }

    let record: SyncIteratorRecord<T>;
    try {
      record = getSyncIteratorRecord<T>(value);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    if (!subscriber.active) {
      return;
    }

    let finished = false;
    const closeIterator: Teardown = () => {
      if (!finished) {
        closeSyncIterator(record, subscriber.signal.reason);
      }
    };
    closeIterator[propagateTeardownError] = true;
    subscriber.addTeardown(closeIterator);

    try {
      while (subscriber.active) {
        const result = record.next.call(record.iterator);
        if (!isObject(result)) {
          throw new TypeError('Iterator next() must return an Object');
        }

        const iteratorResult = result as IteratorResult<T>;
        if (iteratorResult.done) {
          finished = true;
          subscriber.complete();
          return;
        }
        subscriber.next(iteratorResult.value);
      }
    } catch (error) {
      subscriber.error(error);
    }
  });
}

function fromAsyncIterable<T>(ObservableCtor: typeof Observable<T>, value: object): Observable<T> {
  return new ObservableCtor((subscriber) => {
    if (!subscriber.active) {
      return;
    }

    let record: AsyncIteratorRecord;
    try {
      record = getAsyncIteratorRecord(value);
    } catch (error) {
      subscriber.error(error);
      return;
    }

    if (!subscriber.active) {
      return;
    }

    let finished = false;
    let nextMethod: Callable | undefined;
    subscriber.addTeardown(() => {
      if (!finished) {
        closeAsyncIterator(record, subscriber.signal.reason);
      }
    });

    // Do not simplify this to `for await...of`. The Observable conversion
    // contract exposes protocol details that the language loop intentionally
    // hides: subscription-time iterator reacquisition, `return(reason)` on
    // abort, next()/return() microtask timing, and inspection of an already
    // pending IteratorResult after abort without starting another pull.
    const pull = (): void => {
      if (!subscriber.active) {
        return;
      }

      let nextResult: unknown;
      try {
        nextMethod ??= getMethod(record.iterator, 'next');
        if (!nextMethod) {
          throw new TypeError('Iterator must define a callable next() method');
        }
        nextResult = nextMethod.call(record.iterator);
      } catch (error) {
        globalThis.queueMicrotask(() => subscriber.error(error));
        return;
      }

      void Promise.resolve(nextResult).then(
        (result) => {
          try {
            if (!isObject(result)) {
              throw new TypeError('Iterator next() must return an Object');
            }

            const iteratorResult = result as IteratorResult<T>;
            const done = Boolean(iteratorResult.done);
            if (done) {
              finished = true;
              if (subscriber.active) {
                subscriber.complete();
              }
              return;
            }

            if (!subscriber.active) {
              return;
            }

            subscriber.next(iteratorResult.value);
            pull();
          } catch (error) {
            subscriber.error(error);
          }
        },
        (error) => subscriber.error(error)
      );
    };

    pull();
  });
}

class ObservableImpl<T> implements Subscribable<T> {
  static from<T>(value: ObservableValue<T>): Observable<T> {
    if (value instanceof Observable) {
      return value;
    }

    if (!isObject(value)) {
      throw new TypeError(`${String(value)} is not observable`);
    }

    const ObservableCtor = staticCtor<T>(this);
    const asyncIteratorMethod = getMethod(value, Symbol.asyncIterator);
    if (asyncIteratorMethod) {
      return fromAsyncIterable(ObservableCtor, value);
    }

    const iteratorMethod = getMethod(value, Symbol.iterator);
    if (iteratorMethod) {
      return fromIterable(ObservableCtor, value);
    }

    const thenMethod = getMethod(value, 'then');
    if (thenMethod) {
      return new ObservableCtor((subscriber) => {
        Promise.resolve(value as PromiseLike<T>).then(
          (output) => {
            subscriber.next(output);
            subscriber.complete();
          },
          (error) => (subscriber as Subscriber<T>)[errorSubscriber](error, false)
        );
      });
    }

    throw new TypeError(`${String(value)} is not observable`);
  }

  #subscriber: WeakRef<Subscriber<T>> | null = null;

  readonly #init: (subscriber: Subscriber<T>) => void;

  constructor(init: (subscriber: Subscriber<T>) => void) {
    if (typeof init !== 'function') {
      throw new TypeError('Observable constructor requires a callback');
    }
    this.#init = init;
  }

  subscribe(observer: Partial<Observer<T>> | ((value: T) => void) | null = {}, options: SubscribeOptions = {}): void {
    if (!canInvokeRealmCallbacks()) {
      return;
    }

    let subscriber = this.#subscriber?.deref();

    const shouldSubscribe = !subscriber?.active;

    if (shouldSubscribe) {
      subscriber = new Subscriber(subscriberToken);
      this.#subscriber = new WeakRef(subscriber);
    }

    const safeObserver = new SafeObserver(observer);
    const signal = options.signal;

    if (signal?.aborted) {
      if (shouldSubscribe) {
        subscriber![closeSubscriber](signal.reason);
      }
    } else {
      const removeObserver = subscriber![addObserver](safeObserver);
      if (signal) {
        addAbortAlgorithm(signal, removeObserver, subscriber!.signal);
      }
    }

    if (shouldSubscribe) {
      try {
        this.#init(subscriber!);
      } catch (error) {
        subscriber!.error(error);
      }
    }
  }

  takeUntil(notifier: ObservableValue<any>): Observable<T> {
    const ObservableCtor = instanceCtor<T>(this);
    return new ObservableCtor((subscriber) => {
      Observable.from(notifier).subscribe(
        {
          next: () => subscriber.complete(),
          error: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );

      if (subscriber.active) {
        this.subscribe(subscriber, { signal: subscriber.signal });
      }
    });
  }

  map<R>(mapper: (value: T, index: number) => R): Observable<R> {
    const ObservableCtor = instanceCtor<R>(this);
    return new ObservableCtor((subscriber) => {
      let index = 0;

      this.subscribe(
        {
          next: (value) => {
            let result: R;
            try {
              result = mapper(value, index++);
            } catch (error) {
              subscriber.error(error);
              return;
            }

            subscriber.next(result);
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  }

  filter(predicate: (value: T, index: number) => boolean): Observable<T> {
    const ObservableCtor = instanceCtor<T>(this);
    return new ObservableCtor((subscriber) => {
      let index = 0;

      this.subscribe(
        {
          next: (value) => {
            let result: boolean;
            try {
              result = predicate(value, index++);
            } catch (error) {
              subscriber.error(error);
              return;
            }

            if (result) {
              subscriber.next(value);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  }

  take(amount: number): Observable<T> {
    const ObservableCtor = instanceCtor<T>(this);
    return new ObservableCtor((subscriber) => {
      let remaining = toUnsignedLongLong(amount);

      if (remaining <= 0) {
        subscriber.complete();
        return;
      }

      this.subscribe(
        {
          next: (value) => {
            if (remaining > 0) {
              remaining--;
              subscriber.next(value);
            }

            if (remaining <= 0) {
              subscriber.complete();
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  }

  drop(amount: number): Observable<T> {
    const ObservableCtor = instanceCtor<T>(this);
    return new ObservableCtor((subscriber) => {
      let remaining = toUnsignedLongLong(amount);

      this.subscribe(
        {
          next: (value) => {
            if (remaining <= 0) {
              subscriber.next(value);
            } else {
              remaining--;
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  }

  flatMap<R>(mapper: (value: T, index: number) => ObservableValue<R>): Observable<R> {
    const ObservableCtor = instanceCtor<R>(this);
    return new ObservableCtor((subscriber) => {
      let index = 0;
      const buffer: T[] = [];
      let active = 0;
      const maxConcurrent = 1;
      let outerComplete = false;

      const innerSub = (value: T) => {
        let result: Observable<R>;
        try {
          result = Observable.from(mapper(value, index++));
        } catch (error) {
          subscriber.error(error);
          return;
        }

        active++;

        result.subscribe(
          {
            next: (innerValue) => subscriber.next(innerValue),
            error: (error) => subscriber.error(error),
            complete: () => {
              active--;
              if (buffer.length > 0) {
                innerSub(buffer.shift()!);
                return;
              }
              if (outerComplete && active === 0) {
                subscriber.complete();
              }
            },
          },
          {
            signal: subscriber.signal,
          }
        );
      };

      this.subscribe(
        {
          next: (value) => {
            if (active < maxConcurrent) {
              innerSub(value);
            } else {
              buffer.push(value);
            }
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            outerComplete = true;
            if (active === 0 && buffer.length === 0) {
              subscriber.complete();
            }
          },
        },
        { signal: subscriber.signal }
      );
    });
  }

  switchMap<R>(mapper: (value: T, index: number) => ObservableValue<R>): Observable<R> {
    const ObservableCtor = instanceCtor<R>(this);
    return new ObservableCtor((subscriber) => {
      let innerController: AbortController | null = null;
      let outerComplete = false;
      let index = 0;

      this.subscribe(
        {
          next: (value) => {
            if (innerController) {
              innerController.abort();
              innerController = null;
            }

            let result: Observable<R>;
            try {
              result = Observable.from(mapper(value, index++));
            } catch (error) {
              subscriber.error(error);
              return;
            }

            innerController = new AbortController();
            result.subscribe(
              {
                next: (innerValue) => subscriber.next(innerValue),
                error: (error) => subscriber.error(error),
                complete: () => {
                  innerController = null;
                  if (outerComplete) subscriber.complete();
                },
              },
              {
                signal: AbortSignal.any([innerController.signal, subscriber.signal]),
              }
            );
          },
          error: (error) => subscriber.error(error),
          complete: () => {
            outerComplete = true;
            if (!innerController) {
              subscriber.complete();
            }
          },
        },
        {
          signal: subscriber.signal,
        }
      );
    });
  }

  inspect(inspector: ((value: T) => void) | Inspector<T>): Observable<T> {
    const ObservableCtor = instanceCtor<T>(this);
    return new ObservableCtor((subscriber) => {
      const actualInspector = typeof inspector === 'function' ? { next: inspector } : inspector;

      try {
        actualInspector.subscribe?.();
      } catch (error) {
        subscriber.error(error);
        return;
      }

      let completed = false;
      let errored = false;

      addAbortAlgorithm(subscriber.signal, (reason) => {
        if (!completed && !errored) {
          try {
            actualInspector.abort?.(reason);
          } catch (error) {
            reportError(error);
          }
        }
      });

      this.subscribe(
        {
          next: (value) => {
            try {
              actualInspector.next?.(value);
            } catch (error) {
              subscriber.error(error);
              return;
            }
            subscriber.next(value);
          },
          error: (error) => {
            errored = true;
            try {
              actualInspector.error?.(error);
            } catch (error) {
              subscriber.error(error);
              return;
            }
            subscriber.error(error);
          },
          complete: () => {
            completed = true;
            try {
              actualInspector.complete?.();
            } catch (error) {
              subscriber.error(error);
              return;
            }
            subscriber.complete();
          },
        },
        { signal: subscriber.signal }
      );
    });
  }

  catch<R>(handler: (error: any) => ObservableValue<R>): Observable<T | R> {
    const ObservableCtor = instanceCtor<T | R>(this);
    return new ObservableCtor((subscriber) => {
      this.subscribe(
        {
          next: (value) => subscriber.next(value),
          error: (error) => {
            let result: Observable<R>;
            try {
              result = Observable.from(handler(error));
            } catch (error) {
              subscriber.error(error);
              return;
            }

            result.subscribe(subscriber, { signal: subscriber.signal });
          },
          complete: () => subscriber.complete(),
        },
        { signal: subscriber.signal }
      );
    });
  }

  finally(callback: () => void): Observable<T> {
    const ObservableCtor = instanceCtor<T>(this);
    return new ObservableCtor((subscriber) => {
      subscriber.addTeardown(callback);
      this.subscribe(subscriber, { signal: subscriber.signal });
    });
  }

  forEach(handler: (value: T) => void, options?: SubscribeOptions): Promise<void> {
    const deferred = new AbortableDeferred<void>(options);

    this.subscribe(
      {
        next: (value) => {
          try {
            handler(value);
          } catch (error) {
            deferred.reject(error);
          }
        },
        error: (error) => deferred.reject(error),
        complete: () => deferred.resolve(),
      },
      { signal: deferred.signal }
    );

    return deferred.promise;
  }

  first(options?: SubscribeOptions): Promise<T> {
    const deferred = new AbortableDeferred<T>(options);

    this.subscribe(
      {
        next: (value) => deferred.resolve(value),
        error: (error) => deferred.reject(error),
        complete: () => deferred.reject(new RangeError('Observable completed without emitting a value')),
      },
      {
        signal: deferred.signal,
      }
    );
    return deferred.promise;
  }

  last(options?: SubscribeOptions): Promise<T> {
    let hasLastValue = false;
    let lastValue: T | undefined;

    const deferred = new AbortableDeferred<T>(options);

    this.subscribe(
      {
        next: (value) => {
          hasLastValue = true;
          lastValue = value;
        },
        error: (error) => deferred.reject(error),
        complete: () => {
          if (hasLastValue) {
            deferred.resolve(lastValue!);
          } else {
            deferred.reject(new RangeError('Observable completed without emitting a value'));
          }
        },
      },
      {
        signal: deferred.signal,
      }
    );
    return deferred.promise;
  }

  find(predicate: (value: T, index: number) => boolean, options?: SubscribeOptions): Promise<T | undefined> {
    const deferred = new AbortableDeferred<T | undefined>(options);
    let index = 0;
    this.subscribe(
      {
        next: (value) => {
          let result: boolean;
          try {
            result = predicate(value, index++);
          } catch (error) {
            deferred.reject(error);
            return;
          }

          if (result) {
            deferred.resolve(value);
          }
        },
        error: (error) => deferred.reject(error),
        complete: () => deferred.resolve(undefined),
      },
      { signal: deferred.signal }
    );
    return deferred.promise;
  }

  some(predicate: (value: T, index: number) => boolean, options?: SubscribeOptions): Promise<boolean> {
    const deferred = new AbortableDeferred<boolean>(options);
    let index = 0;
    this.subscribe(
      {
        next: (value) => {
          let result: boolean;
          try {
            result = predicate(value, index++);
          } catch (error) {
            deferred.reject(error);
            return;
          }

          if (result) {
            deferred.resolve(true);
          }
        },
        error: (error) => deferred.reject(error),
        complete: () => deferred.resolve(false),
      },
      { signal: deferred.signal }
    );
    return deferred.promise;
  }

  every(predicate: (value: T, index: number) => boolean, options?: SubscribeOptions): Promise<boolean> {
    const deferred = new AbortableDeferred<boolean>(options);
    let index = 0;
    this.subscribe(
      {
        next: (value) => {
          let result: boolean;
          try {
            result = predicate(value, index++);
          } catch (error) {
            deferred.reject(error);
            return;
          }

          if (!result) {
            deferred.resolve(false);
          }
        },
        error: (error) => deferred.reject(error),
        complete: () => deferred.resolve(true),
      },
      { signal: deferred.signal }
    );
    return deferred.promise;
  }

  reduce<R>(reducer: (accumulation: T | R, value: T, index: number) => R): Promise<R>;
  reduce<I, R>(reducer: (accumulation: I | R, value: T, index: number) => R, initialValue: I, options?: SubscribeOptions): Promise<R | I>;

  reduce<I, R>(reducer: (accumulation: T | I | R, value: T, index: number) => R, initialValue?: I, options?: SubscribeOptions): Promise<R> {
    const deferred = new AbortableDeferred<R>(options);

    let hasState = arguments.length > 1;
    let state: T | I | R | undefined = initialValue;
    let index = 0;

    this.subscribe(
      {
        next: (value) => {
          if (!hasState) {
            state = value;
            hasState = true;
            index = 1;
            return;
          }

          try {
            state = reducer(state!, value, index++);
          } catch (error) {
            deferred.reject(error);
          }
        },
        error: (error) => deferred.reject(error),
        complete: () => {
          if (!hasState) {
            deferred.reject(new TypeError('Reduce of empty observable with no initial value'));
          } else {
            deferred.resolve(state as any);
          }
        },
      },
      {
        signal: deferred.signal,
      }
    );

    return deferred.promise;
  }

  toArray(options?: SubscribeOptions): Promise<T[]> {
    const deferred = new AbortableDeferred<T[]>(options, true);

    const result: T[] = [];

    this.subscribe(
      {
        next: (value) => result.push(value),
        error: (error) => deferred.reject(error),
        complete: () => deferred.resolve(result),
      },
      { signal: deferred.signal }
    );

    return deferred.promise;
  }
}

Object.defineProperty(ObservableImpl, 'name', { value: 'Observable' });
Object.defineProperty(ObservableImpl.prototype, Symbol.toStringTag, {
  configurable: true,
  value: 'Observable',
});
Object.defineProperty(Subscriber.prototype, Symbol.toStringTag, {
  configurable: true,
  value: 'Subscriber',
});
for (const key of ['next', 'error', 'complete', 'addTeardown', 'active', 'signal']) {
  const descriptor = Object.getOwnPropertyDescriptor(Subscriber.prototype, key)!;
  Object.defineProperty(Subscriber.prototype, key, { ...descriptor, enumerable: true });
}
const subscribeDescriptor = Object.getOwnPropertyDescriptor(ObservableImpl.prototype, 'subscribe')!;
Object.defineProperty(ObservableImpl.prototype, 'subscribe', {
  ...subscribeDescriptor,
  enumerable: true,
});

class AbortableDeferred<T> {
  private readonly resolver: (value: T | PromiseLike<T>) => void;
  private readonly rejector: (reason?: any) => void;
  private readonly abortController = new AbortController();
  private settled = false;

  get signal() {
    return this.abortController.signal;
  }

  readonly promise: Promise<T>;

  constructor(options?: SubscribeOptions, useAbortAlgorithm = false) {
    let resolver: (value: T | PromiseLike<T>) => void;
    let rejector: (reason?: any) => void;

    this.promise = new Promise((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });
    // Promise-returning platform methods internally observe their rejection so
    // an intentionally ignored result does not create a second global event.
    void this.promise.catch(() => {});

    // @ts-expect-error -- The Promise executor assigns this synchronously.
    this.resolver = resolver;
    // @ts-expect-error -- The Promise executor assigns this synchronously.
    this.rejector = rejector;

    const signal = options?.signal;

    if (signal) {
      const abort = () => this.reject(signal.reason);
      if (signal.aborted) {
        abort();
      } else if (useAbortAlgorithm) {
        addAbortAlgorithm(signal, abort, this.abortController.signal);
      } else {
        signal.addEventListener('abort', abort, { once: true, signal: this.abortController.signal });
      }
    }
  }

  resolve(value: T | PromiseLike<T>): void {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this.resolver(value);
    this.abortController.abort();
  }

  reject(reason?: any): void {
    if (this.settled) {
      return;
    }
    this.settled = true;
    this.rejector(reason);
    this.abortController.abort(reason);
  }
}

function eventTargetWhen(this: EventTarget, eventName: string, options?: { capture?: boolean; passive?: boolean }): Observable<Event> {
  return new Observable((subscriber) => {
    this.addEventListener(eventName, (event) => subscriber.next(event), {
      capture: options?.capture,
      passive: options?.passive,
      once: false,
      signal: subscriber.signal,
    });
  }) as any;
}

function instanceCtor<R>(owner: any): typeof Observable<R> {
  return owner.constructor;
}

function staticCtor<R>(owner: any): typeof Observable<R> {
  return owner;
}

export interface ObservablePolyfillInfo {
  readonly packageName: string;
  readonly version: string;
}

/**
 * Stable metadata key shared by compatible copies of the initializer.
 *
 * Public RxJS operator Symbols remain exact module-owned keys. This registry
 * key identifies only an Observable constructor installed by this fallback.
 */
export const observablePolyfillInfo = Symbol.for('rxjs.observable.polyfill.info.v1');

const installedObservablePolyfillInfo: ObservablePolyfillInfo = Object.freeze({
  packageName: '@rxjs/observable-polyfill',
  version: '9.0.0-beta.0',
});

Object.defineProperty(ObservableImpl, observablePolyfillInfo, {
  configurable: false,
  enumerable: false,
  value: installedObservablePolyfillInfo,
  writable: false,
});

/**
 * Returns RxJS fallback metadata owned by the supplied constructor, if any.
 *
 * An unmarked constructor is intentionally not classified as native,
 * conforming, or foreign.
 */
export function getObservablePolyfillInfo(
  constructor: ObservableCtor | undefined = globalThis.Observable
): ObservablePolyfillInfo | undefined {
  if ((typeof constructor !== 'function' && typeof constructor !== 'object') || constructor === null) {
    return undefined;
  }

  const value = Object.getOwnPropertyDescriptor(constructor, observablePolyfillInfo)?.value;
  return isObservablePolyfillInfo(value) ? value : undefined;
}

function isObservablePolyfillInfo(value: unknown): value is ObservablePolyfillInfo {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<ObservablePolyfillInfo>).packageName === 'string' &&
    typeof (value as Partial<ObservablePolyfillInfo>).version === 'string'
  );
}

interface PropertyInstallation {
  readonly key: PropertyKey;
  readonly label: string;
  readonly next: PropertyDescriptor;
  readonly previous: PropertyDescriptor | undefined;
  readonly target: object;
}

function preparePropertyInstallation(target: object, key: PropertyKey, next: PropertyDescriptor, label: string): PropertyInstallation {
  const previous = Object.getOwnPropertyDescriptor(target, key);
  if (!canDefineProperty(target, previous, next)) {
    throw new TypeError(`Cannot initialize @rxjs/observable-polyfill: ${label} is not writable or configurable`);
  }
  return { key, label, next, previous, target };
}

function canDefineProperty(target: object, previous: PropertyDescriptor | undefined, next: PropertyDescriptor): boolean {
  if (!previous) {
    return Object.isExtensible(target);
  }
  if (previous.configurable) {
    return true;
  }
  if ('value' in previous && 'value' in next && previous.writable) {
    return next.configurable === false && next.enumerable === previous.enumerable && next.writable !== false;
  }
  return false;
}

function installPropertiesAtomically(installations: PropertyInstallation[]): void {
  const applied: PropertyInstallation[] = [];
  try {
    for (const installation of installations) {
      Object.defineProperty(installation.target, installation.key, installation.next);
      applied.push(installation);
    }
  } catch (error) {
    const rollbackErrors: unknown[] = [];
    for (let index = applied.length - 1; index >= 0; index--) {
      const installation = applied[index]!;
      try {
        if (installation.previous) {
          Object.defineProperty(installation.target, installation.key, installation.previous);
        } else {
          Reflect.deleteProperty(installation.target, installation.key);
        }
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }

    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        [error, ...rollbackErrors],
        'Cannot initialize @rxjs/observable-polyfill and could not fully restore the realm'
      );
    }
    throw error;
  }
}

function initializeObservablePolyfill(): void {
  const installations: PropertyInstallation[] = [];
  const activeObservable = (globalThis as typeof globalThis & { Observable?: ObservableCtor }).Observable;

  if (activeObservable === undefined) {
    const AbortControllerCtor = globalThis.AbortController;
    const abortDescriptor = AbortControllerCtor && Object.getOwnPropertyDescriptor(AbortControllerCtor.prototype, 'abort');
    if (!AbortControllerCtor || !abortDescriptor || typeof abortDescriptor.value !== 'function') {
      throw new TypeError('Cannot initialize @rxjs/observable-polyfill: AbortController.prototype.abort is unavailable');
    }

    nativeAbort = abortDescriptor.value;
    installations.push(
      preparePropertyInstallation(
        AbortControllerCtor.prototype,
        'abort',
        { ...abortDescriptor, value: abortWithObservableAlgorithms },
        'AbortController.prototype.abort'
      ),
      preparePropertyInstallation(
        globalThis,
        'Subscriber',
        {
          configurable: true,
          enumerable: false,
          value: Subscriber,
          writable: true,
        },
        'globalThis.Subscriber'
      ),
      preparePropertyInstallation(
        globalThis,
        'Observable',
        {
          configurable: true,
          enumerable: false,
          value: ObservableImpl,
          writable: true,
        },
        'globalThis.Observable'
      )
    );
  }

  const EventTargetCtor = globalThis.EventTarget;
  if (EventTargetCtor && EventTargetCtor.prototype.when === undefined) {
    installations.push(
      preparePropertyInstallation(
        EventTargetCtor.prototype,
        'when',
        {
          configurable: true,
          enumerable: false,
          value: eventTargetWhen,
          writable: true,
        },
        'EventTarget.prototype.when'
      )
    );
  }

  installPropertiesAtomically(installations);
}

declare global {
  interface EventTarget {
    when: (eventName: string, options?: { capture?: boolean; passive?: boolean }) => Observable<Event>;
  }

  interface Observer<T> {
    next: (value: T) => void;
    error: (error: any) => void;
    complete: () => void;
  }

  interface Inspector<T> extends Partial<Observer<T>> {
    subscribe?: () => void;
    abort?: (reason?: any) => void;
  }

  interface Subscribable<T> {
    subscribe(observer?: Partial<Observer<T>> | ((value: T) => void) | null, options?: SubscribeOptions): void;
  }

  type ObservableValue<T> = Observable<T> | AsyncIterable<T> | PromiseLike<T> | Iterable<T>;

  interface SubscribeOptions {
    signal?: AbortSignal;
  }

  interface Subscriber<T> extends Observer<T> {
    next<Value extends T>(value: Value): void;
    addTeardown: (teardown: () => void) => void;
    readonly active: boolean;
    readonly signal: AbortSignal;
  }

  // eslint-disable-next-line no-var
  var Subscriber: {
    readonly prototype: Subscriber<unknown>;
  };

  interface ObservableCtor {
    new <T>(init: (subscriber: Subscriber<T>) => void): Observable<T>;
    from<T>(value: ObservableValue<T>): Observable<T>;
  }

  // eslint-disable-next-line no-var
  var Observable: ObservableCtor;

  // This interface intentionally participates in global declaration merging.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Observable<T> extends ObservableImpl<T> {}
}

initializeObservablePolyfill();
