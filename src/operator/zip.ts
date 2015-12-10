import {Observable} from '../Observable';
import {zip} from './zip-static';

export function zip<R>(...observables: Array<Observable<any> | ((...values: Array<any>) => R)>): Observable<R> {
  observables.unshift(this);
  return zip.apply(this, observables);
}
