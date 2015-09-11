import Observer from './Observer';
import Subscriber from './Subscriber';

interface Operator<T, R> {
  call<T, R>(subscriber: Subscriber<R>): Subscriber<T>;
}

export default Operator;

export function defaultCallFn<T, R>(observer: Observer<R>): Observer<T> {
  return new Subscriber<T>(observer);
}
