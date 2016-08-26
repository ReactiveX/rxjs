import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';

/**
 * If the source Observable is empty it returns an Observable that emits true, otherwise it emits false.
 *
 * <img src="./img/isEmpty.png" width="100%">
 *
 * @return {Observable} an Observable that emits a Boolean.
 * @method isEmpty
 * @owner Observable
 */
export function isEmpty(): Observable<boolean> {
  return this.lift(new IsEmptyOperator());
}

export interface IsEmptySignature<T> {
  (): Observable<boolean>;
}

class IsEmptyOperator implements Operator<any, boolean> {
  call (observer: Subscriber<boolean>, source: any): any {
    return source._subscribe(new IsEmptySubscriber(observer));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class IsEmptySubscriber extends Subscriber<any> {
  constructor(destination: Subscriber<boolean>) {
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
