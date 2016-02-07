import {Subscriber} from './Subscriber';

export class Operator<T, R> {
  call(subscriber: Subscriber<R>): Subscriber<T> {
    return new Subscriber<T>(subscriber);
  }
}
