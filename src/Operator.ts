import {Subscriber} from './Subscriber';

export class Operator<T, R> {
  call(subscriber: Subscriber<R>, source: any): any {
    return source._subscribe(new Subscriber<T>(subscriber));
  }
}
