import {Subscriber} from './Subscriber';

export class Operator<T, R> {
  call<T, R>(subscriber: Subscriber<R>): Subscriber<T> {
    return new Subscriber<T>(subscriber);
  }
}
