export function isObservableInstance<T>(value: any): value is Observable<T> {
  return value != null && value instanceof Observable;
}
