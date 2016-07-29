import {ISubscriber, Subscriber} from './Subscriber';
import {TeardownLogic} from './Subscription';

export interface Operator<T, R> {
  call(subscriber: ISubscriber<R>, source: any): TeardownLogic;
}
