import { map as mapProto } from '../operator/map';
import { Observable } from '../Observable';

export function map<T, R>(
  project: (value: T, index: number) => R,
  thisArg?: any
): (source: Observable<T>) => Observable<R> {
  return (source: Observable<T>) => mapProto.call(source, project);
}