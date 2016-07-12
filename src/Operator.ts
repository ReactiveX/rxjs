import {Subscriber} from './Subscriber';
import {TeardownLogic} from './Subscription';

export class Operator<T, R> {
  call(subscriber: Subscriber<R>, source: any): TeardownLogic {
    return source._subscribe(new Subscriber<T>(subscriber));
  }
}
