import { Observable } from '../Observable';
export function isObservable<T>(value: any | Observable<T>): value is Observable<T> {
  return value && typeof (<any>value).subscribe === 'function' && typeof (<any>value)._isScalar === 'boolean';
}
