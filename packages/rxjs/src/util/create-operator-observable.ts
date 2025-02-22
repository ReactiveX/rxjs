// COPYRIGHT (c) 2025 Ben Lesh <ben@benlesh.com> All rights reserved
function instanceCtor<R>(instance: any): typeof Observable<R> {
  return instance.constructor;
}

export function createOperatorObservable<R>(
  instance: any,
  init: (subscriber: Subscriber<R>) => void
): Observable<R> {
  const ObservableCtor = instanceCtor<R>(instance);
  return new ObservableCtor(init);
}
