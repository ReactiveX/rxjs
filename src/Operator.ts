import Observer from './Observer';
import Subscriber from './Subscriber';

export default class Operator<T, R> {
  call<T, R>(observer: Observer<R>): Observer<T> {
    return new Subscriber<T>(observer);
  }
}