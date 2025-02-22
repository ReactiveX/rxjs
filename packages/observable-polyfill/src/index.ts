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

  type ObservableValue<T> = Subscribable<T> | AsyncIterable<T> | PromiseLike<T> | Iterable<T>;

  interface SubscribeOptions {
    signal?: AbortSignal;
  }

  interface Subscriber<T> extends Observer<T> {
    addTeardown: (teardown: () => void) => void;
    readonly active: boolean;
    readonly signal: AbortSignal;
  }

  interface ObservableCtor {
    new <T>(init: (subscriber: Subscriber<T>) => void): Observable<T>;
    from<T>(value: ObservableValue<T>): Observable<T>;
  }

  var Observable: ObservableCtor;

  interface Observable<T> extends ObservableImpl<T> {}
}

class SafeObserver<T> implements Observer<T> {
  readonly #destination: Partial<Observer<T>> | null | undefined;

  constructor(maybeObserver: Partial<Observer<T>> | ((value: T) => void) | null | undefined) {
    this.#destination = typeof maybeObserver === 'function' ? { next: maybeObserver } : maybeObserver;
  }

  next(value: T) {
    try {
      this.#destination?.next?.(value);
    } catch (error) {
      reportError(error);
    }
  }

  error(error: any) {
    try {
      if (this.#destination?.error) {
        this.#destination.error(error);
      } else {
        throw error;
      }
    } catch (error) {
      reportError(error);
    }
  }

  complete() {
    try {
      this.#destination?.complete?.();
    } catch (error) {
      reportError(error);
    }
  }
}

const addObserver = Symbol('addObserver');

class Subscriber<T> implements Observer<T> {
  #teardowns: (() => void)[] | null = null;

  readonly #observerList = new Set<SafeObserver<T>>();

  readonly #abortController = new AbortController();

  [addObserver](observer: SafeObserver<T>) {
    this.#observerList.add(observer);

    return () => {
      this.#observerList.delete(observer);
      this.#checkRefCount();
    };
  }

  #checkRefCount() {
    if (this.#observerList.size === 0) {
      this.#abortController.abort();
    }
  }

  get active() {
    return !this.#abortController.signal.aborted;
  }

  get signal() {
    return this.#abortController.signal;
  }

  constructor() {
    this.#abortController.signal.addEventListener(
      'abort',
      () => {
        this.#observerList.clear();
        const teardowns = this.#teardowns;
        this.#teardowns = null;
        if (teardowns) {
          for (const teardown of teardowns) {
            try {
              teardown();
            } catch (error) {
              reportError(error);
            }
          }
        }
      },
      { once: true }
    );
  }

  addTeardown(teardown: () => void) {
    this.#teardowns ??= [];
    this.#teardowns.push(teardown);
  }

  next(value: T) {
    if (this.active) {
      const observers = Array.from(this.#observerList);
      for (const observer of observers) {
        observer.next(value);
      }
    }
  }

  error(error: any) {
    if (this.active) {
      const observers = Array.from(this.#observerList);
      this.#abortController.abort();
      for (const observer of observers) {
        observer.error(error);
      }
    }
  }

  complete() {
    if (this.active) {
      const observers = Array.from(this.#observerList);
      this.#abortController.abort();
      for (const observer of observers) {
        observer.complete();
      }
    }
  }
}

function reportError(error: any) {
  if (globalThis.reportError) {
    globalThis.reportError(error);
  } else {
    setTimeout(() => {
      throw error;
    });
  }
}

class ObservableImpl<T> implements Subscribable<T> {
  static from<T>(value: ObservableValue<T>): Observable<T> {
    if (value != null) {
      if (value instanceof Observable) {
        return value;
      }

      const ObservableCtor = staticCtor<T>(this);

      if ('subscribe' in value) {
        return new ObservableCtor((subscriber) => {
          value.subscribe(subscriber, { signal: subscriber.signal });
        });
      }

      if ('then' in value) {
        return new ObservableCtor((subscriber) => {
          value.then(
            (value) => subscriber.next(value),
            (error) => subscriber.error(error)
          );
        });
      }

      if (Symbol.asyncIterator in value) {
        return new ObservableCtor(async (subscriber) => {
          try {
            for await (const output of value) {
              if (!subscriber.active) break;
              subscriber.next(output);
            }
            subscriber.complete();
          } catch (error) {
            subscriber.error(error);
          }
        });
      }

      if (Symbol.iterator in value) {
        return new ObservableCtor((subscriber) => {
          try {
            for (const output of value) {
              if (!subscriber.active) break;
              subscriber.next(output);
            }
            subscriber.complete();
          } catch (error) {
            subscriber.error(error);
          }
        });
      }
    }

    throw new TypeError(`${value} is not observable`);
  }

  #subscriber: WeakRef<Subscriber<T>> | null = null;

  constructor(private readonly init: (subscriber: Subscriber<T>) => void) {}

  subscribe(observer?: Partial<Observer<T>> | ((value: T) => void) | null, options?: SubscribeOptions) {
    let subscriber = this.#subscriber?.deref();

    const shouldSubscribe = !subscriber?.active;

    if (shouldSubscribe) {
      subscriber = new Subscriber();
      this.#subscriber = new WeakRef(subscriber);
    }

    const safeObserver = new SafeObserver(observer);
    const removeObserver = subscriber![addObserver](safeObserver);
    options?.signal?.addEventListener('abort', removeObserver, {
      once: true,
      signal: subscriber!.signal,
    });

    if (shouldSubscribe) {
      this.init(subscriber!);
    }
  }

  takeUntil(notifier: ObservableValue<any>): Observable<T> {
    return new Observable<T>((subscriber) => {
      Observable.from(notifier).subscribe(
        () => {
          subscriber.complete();
        },
        { signal: subscriber.signal }
      );

      this.subscribe(subscriber, { signal: subscriber.signal });
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
      let remaining = amount;

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
      let remaining = amount;

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

      subscriber.signal.addEventListener(
        'abort',
        () => {
          if (!completed && !errored) {
            actualInspector.abort?.(subscriber.signal.reason);
          }
        },
        { once: true }
      );

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
    const deferred = new AbortableDeferred<T[]>(options);

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

globalThis.Observable = ObservableImpl as any;

class AbortableDeferred<T> {
  private readonly resolver: (value: T | PromiseLike<T>) => void;
  private readonly rejector: (reason?: any) => void;
  private readonly abortController = new AbortController();

  get signal() {
    return this.abortController.signal;
  }

  readonly promise: Promise<T>;

  constructor(options?: SubscribeOptions) {
    let resolver: (value: T | PromiseLike<T>) => void;
    let rejector: (reason?: any) => void;

    this.promise = new Promise((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });

    // @ts-expect-error
    this.resolver = resolver;
    // @ts-expect-error
    this.rejector = rejector;

    const signal = options?.signal;

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          this.reject(new DOMException('Observable promise result aborted', 'AbortError'));
          this.abortController.abort();
        },
        { once: true, signal: this.abortController.signal }
      );
    }
  }

  resolve(value: T | PromiseLike<T>) {
    this.abortController?.abort();
    this.resolver(value);
  }

  reject(reason?: any) {
    this.abortController?.abort();
    this.rejector(reason);
  }
}

EventTarget.prototype.when = function (
  this: EventTarget,
  eventName: string,
  options?: { capture?: boolean; passive?: boolean }
): Observable<Event> {
  return new Observable((subscriber) => {
    this.addEventListener(eventName, (event) => subscriber.next(event), {
      capture: options?.capture,
      passive: options?.passive,
      once: false,
      signal: subscriber.signal,
    });
  }) as any;
};

function instanceCtor<R>(owner: any): typeof Observable<R> {
  return owner.constructor;
}

function staticCtor<R>(owner: any): typeof Observable<R> {
  return owner;
}

export {};
