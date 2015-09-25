import Operator from '../../Operator';
import Observer from '../../Observer';
import Subscriber from '../../Subscriber';
import ArgumentOutOfRangeError from '../../util/ArgumentOutOfRangeError';

export default function elementAt(index: number, defaultValue?: any) {
  return this.lift(new ElementAtOperator(index, defaultValue));
}

class ElementAtOperator<T, R> implements Operator<T,R> {
  
  constructor(private index: number, private defaultValue?: any) {
    if (index < 0) {
      throw new ArgumentOutOfRangeError;
    }
  }
  
  call(subscriber: Subscriber<T>): Subscriber<T> {
    return new ElementAtSubscriber(subscriber, this.index, this.defaultValue);
  }
}

class ElementAtSubscriber<T, R> extends Subscriber<T> {
  
  constructor(destination: Subscriber<T>, private index: number, private defaultValue?: any) {
    super(destination);
  }
  
  _next(x) {
    if (this.index-- === 0) {
      this.destination.next(x);
      this.destination.complete();
    }
  }
  
  _complete() {
    const destination = this.destination;
    if (this.index >= 0) {
      if(typeof this.defaultValue !== 'undefined') {
        destination.next(this.defaultValue);
      } else {
        destination.error(new ArgumentOutOfRangeError);
      }
    }
    destination.complete();
  }
}
