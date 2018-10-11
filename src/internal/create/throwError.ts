import { Observable } from 'rxjs/internal/Observable';

export function throwError(err: any): Observable<never> {
  return Observable(o => o.error(err));
}
