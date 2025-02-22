export function isObservableInstance<T>(value: any): value is Observable<T> {
  return value != null && value instanceof Observable;
}

export function getInstanceCtor(value: any): ObservableCtor {
  return value.constructor;
}

export function getStaticCtor(value: any): ObservableCtor {
  if (typeof value === 'function') {
    return value;
  }

  return Observable;
}
