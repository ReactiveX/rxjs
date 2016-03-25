import {Operator} from '../Operator';
import {Subscriber} from '../Subscriber';
import {Observable} from '../Observable';
import {PartialObserver} from '../Observer';

/**
 * Returns a mirrored Observable of the source Observable, but modified so that the provided Observer is called
 * for every item emitted by the source.
 * This operator is useful for debugging your observables for the correct values or performing other side effects.
 * @param {Observer|function} [nextOrObserver] a normal observer callback or callback for onNext.
 * @param {function} [error] callback for errors in the source.
 * @param {function} [complete] callback for the completion of the source.
 * @reurns {Observable} a mirrored Observable with the specified Observer or callback attached for each item.
 * @method do
 * @owner Observable
 */
export function _do<T>(nextOrObserver?: PartialObserver<T> | ((x: T) => void),
                       error?: (e: any) => void,
                       complete?: () => void): Observable<T> {
  return this.lift(new DoOperator(nextOrObserver, error, complete));
}

export interface DoSignature<T> {
  (next: (x: T) => void, error?: (e: any) => void, complete?: () => void): Observable<T>;
  (observer: PartialObserver<T>): Observable<T>;
}

class DoOperator<T> implements Operator<T, T> {
  constructor(private nextOrObserver?: PartialObserver<T> | ((x: T) => void),
              private error?: (e: any) => void,
              private complete?: () => void) {
  }
  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
class DoSubscriber<T> extends Subscriber<T> {

  private safeSubscriber: Subscriber<T>;

  constructor(destination: Subscriber<T>,
              nextOrObserver?: PartialObserver<T> | ((x: T) => void),
              error?: (e: any) => void,
              complete?: () => void) {
    super(destination);

    const safeSubscriber = new Subscriber<T>(nextOrObserver, error, complete);
    safeSubscriber.syncErrorThrowable = true;
    this.add(safeSubscriber);
    this.safeSubscriber = safeSubscriber;
  }

  protected _next(value: T): void {
    const { safeSubscriber } = this;
    safeSubscriber.next(value);
    if (safeSubscriber.syncErrorThrown) {
      this.destination.error(safeSubscriber.syncErrorValue);
    } else {
      this.destination.next(value);
    }
  }

  protected _error(err: any): void {
    const { safeSubscriber } = this;
    safeSubscriber.error(err);
    if (safeSubscriber.syncErrorThrown) {
      this.destination.error(safeSubscriber.syncErrorValue);
    } else {
      this.destination.error(err);
    }
  }

  protected _complete(): void {
    const { safeSubscriber } = this;
    safeSubscriber.complete();
    if (safeSubscriber.syncErrorThrown) {
      this.destination.error(safeSubscriber.syncErrorValue);
    } else {
      this.destination.complete();
    }
  }
}

