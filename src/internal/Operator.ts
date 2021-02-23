import { Subscriber } from './Subscriber.js';
import { TeardownLogic } from './types';

/***
 * @deprecated Internal implementation detail, do not use.
 */
export interface Operator<T, R> {
  call(subscriber: Subscriber<R>, source: any): TeardownLogic;
}
