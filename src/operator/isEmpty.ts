import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';

export function isEmpty(): Observable<boolean> {
  return this.lift(new IsEmptyOperator());
}

class IsEmptyOperator<T> implements Operator<boolean, boolean> {
  call (observer: Subscriber<T>): Subscriber<boolean> {
    return new IsEmptySubscriber(observer);
  }
}

class IsEmptySubscriber extends Subscriber<boolean> {

  constructor(destination: Subscriber<any>) {
    super(destination);
  }

  private notifyComplete(isEmpty: boolean): void {
    const destination = this.destination;

    destination.next(isEmpty);
    destination.complete();
  }

  protected _next(value: boolean) {
    this.notifyComplete(false);
  }

  protected _complete() {
    this.notifyComplete(true);
  }
}
