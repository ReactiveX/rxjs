export interface PlatformObserver<T> {
  next(value: T): void;
  error(error: unknown): void;
  complete(): void;
}

export interface PlatformSubscribeOptions {
  signal?: AbortSignal;
}

export interface PlatformSubscriber<T> extends PlatformObserver<T> {
  next<Value extends T>(value: Value): void;
  addTeardown(teardown: () => void): void;
  readonly active: boolean;
  readonly signal: AbortSignal;
}

declare global {
  interface Observable<T> {
    subscribe(observer?: Partial<PlatformObserver<T>> | ((value: T) => void) | null, options?: PlatformSubscribeOptions): void;
  }
}

export interface PlatformObservableConstructor {
  new <T>(init: (subscriber: PlatformSubscriber<T>) => void): Observable<T>;
}

export function getObservableConstructor(): PlatformObservableConstructor {
  const constructor = (globalThis as { Observable?: unknown }).Observable;
  if (typeof constructor !== 'function') {
    throw new Error('@rxjs/test requires the active realm to initialize the platform Observable before rxTest is called.');
  }
  return constructor as PlatformObservableConstructor;
}
