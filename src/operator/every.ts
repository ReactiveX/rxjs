import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Observable} from '../Observable';
import {ScalarObservable} from '../observable/ScalarObservable';
import {ArrayObservable} from '../observable/fromArray';
import {ErrorObservable} from '../observable/throw';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean,
                         thisArg?: any): Observable<boolean> {
  const source = this;
  let result;

  if (source._isScalar) {
    result = tryCatch(predicate).call(thisArg || this, source.value, 0, source);
    if (result === errorObject) {
      return new ErrorObservable(errorObject.e, source.scheduler);
    } else {
      return new ScalarObservable(result, source.scheduler);
    }
  }

  if (source instanceof ArrayObservable) {
    const array = (<ArrayObservable<T>>source).array;
    let result = tryCatch((array, predicate, thisArg) => array.every(<any>predicate, thisArg))(array, predicate, thisArg);
    if (result === errorObject) {
      return new ErrorObservable(errorObject.e, source.scheduler);
    } else {
      return new ScalarObservable(result, source.scheduler);
    }
  }
  return source.lift(new EveryOperator(predicate, thisArg, source));
}

class EveryOperator<T, R> implements Operator<T, R> {
  constructor(private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg?: any,
              private source?: Observable<T>) {
  }

  call(observer: Subscriber<boolean>): Subscriber<T> {
    return new EverySubscriber(observer, this.predicate, this.thisArg, this.source);
  }
}

class EverySubscriber<T, R> extends Subscriber<T> {
  private index: number = 0;

  constructor(destination: Observer<R>,
              private predicate: (value: T, index: number, source: Observable<T>) => boolean,
              private thisArg: any,
              private source?: Observable<T>) {
    super(destination);
  }

  private notifyComplete(everyValueMatch: boolean): void {
    this.destination.next(everyValueMatch);
    this.destination.complete();
  }

  _next(value: T): void {
    const result = tryCatch(this.predicate).call(this.thisArg || this, value, this.index++, this.source);

    if (result === errorObject) {
      this.destination.error(result.e);
    } else if (!result) {
      this.notifyComplete(false);
    }
  }

  _complete(): void {
    this.notifyComplete(true);
  }
}
