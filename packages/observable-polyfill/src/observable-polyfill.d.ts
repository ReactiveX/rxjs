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
    addTeardown: (teardown: () => void) => void;
    readonly active: boolean;
    readonly signal: AbortSignal;
  }

  var Subscriber: {
    readonly prototype: Subscriber<unknown>;
  };

  interface ObservableCtor {
    new <T>(init: (subscriber: Subscriber<T>) => void): Observable<T>;
    from<T>(value: ObservableValue<T>): Observable<T>;
  }

  var Observable: ObservableCtor;

  interface Observable<T> extends ObservableImpl<T> {}
}
