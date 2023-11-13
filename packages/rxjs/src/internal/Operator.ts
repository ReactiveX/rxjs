import { Subscriber } from './Observable.js';
import { TeardownLogic } from './types.js';

/***
 * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
 */
export interface Operator<T, R> {
  call(subscriber: Subscriber<R>, source: any): TeardownLogic;
}
