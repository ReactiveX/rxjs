import '@rxjs/observable-polyfill';

export function operatorSubscribe<T>(source: Observable<T>, subscriber: Subscriber<T>, overrideObserver?: Partial<Observer<T>>) {
  return source.subscribe({
    next: (value) => subscriber.next(value),
    error: (error) => subscriber.error(error),
    complete: () => subscriber.complete(),
    ...overrideObserver,
  }, {
    signal: subscriber.signal,
  });
}