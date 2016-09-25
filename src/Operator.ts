import { Subscriber } from './Subscriber';
import { TeardownLogic } from './Subscription';

export interface Operator<T, R> {
  connect(subscriber: Subscriber<R>, source: any): TeardownLogic;
}
