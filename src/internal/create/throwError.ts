import { Observable } from '../Observable';

export function throwError(err: any): Observable<never> {
  return Observable(o => o.error(err));
}
