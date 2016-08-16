import {Operator} from '../Operator';
import {Observer} from '../Observer';
import {Observable} from '../Observable';
import {Subscriber} from '../Subscriber';
import {tryCatch} from '../util/tryCatch';
import {errorObject} from '../util/errorObject';

export const defaultComparor = <T>(a: T, b: T) => a === b;

export interface SequenceEqualSignature<T> {
  (compareTo: Observable<T>, comparor?: (a: T, b: T) => boolean): Observable<boolean>;
}

export function sequenceEqual<T>(compareTo: Observable<T>,
                                 comparor: (a: T, b: T) => boolean = defaultComparor): Observable<boolean> {
  return this.lift(new SequenceEqualOperator(compareTo, comparor));
}

export class SequenceEqualOperator<T> implements Operator<T, T> {
  constructor(private compareTo: Observable<T>,
              private comparor: (a: T, b: T) => boolean) {
  }

  call(subscriber: Subscriber<T>, source: any): any {
    return source._subscribe(new SequenceEqualSubscriber(subscriber, this.compareTo, this.comparor));
  }
}

/**
 * We need this JSDoc comment for affecting ESDoc.
 * @ignore
 * @extends {Ignored}
 */
export class SequenceEqualSubscriber<T, R> extends Subscriber<T> {
  private _a: T[] = [];
  private _b: T[] = [];
  private _oneComplete = false;

  constructor(destination: Observer<R>,
              private compareTo: Observable<T>,
              private comparor: (a: T, b: T) => boolean) {
    super(destination);
    this.add(compareTo.subscribe(new SequenceEqualCompareToSubscriber(destination, this)));
  }

  protected _next(value: T): void {
    if (this._oneComplete && this._b.length === 0) {
      this.emit(false);
    } else {
      this._a.push(value);
      this.checkValues();
    }
  }

  public _complete(): void {
    if (this._oneComplete) {
      const { _a, _b, comparor } = this;
      if (_a.length !== _b.length) {
        this.emit(false);
      } else {
        const len = _a.length;
        for (let i = 0; i < len; i++) {
          let areEqual = false;
          let a = _a[i];
          let b = _b[i];
          if (comparor) {
            areEqual = tryCatch(comparor)(a, b);
            if (areEqual === errorObject) {
              this.destination.error(errorObject.e);
              return;
            }
          }
          if (!areEqual) {
            this.emit(false);
          }
        }
        this.emit(true);
      }
    } else {
      this._oneComplete = true;
    }
  }

  checkValues() {
    const { _a, _b, comparor } = this;
    while (_a.length > 0 && _b.length > 0) {
      let a = _a.shift();
      let b = _b.shift();
      let areEqual = false;
      if (comparor) {
        areEqual = tryCatch(comparor)(a, b);
        if (areEqual === errorObject) {
          this.destination.error(errorObject.e);
        }
      } else {
        areEqual = a === b;
      }
      if (!areEqual) {
        this.emit(false);
      }
    }
  }

  emit(value: boolean) {
    const { destination } = this;
    destination.next(value);
    destination.complete();
  }

  nextB(value: T) {
    if (this._oneComplete && this._a.length === 0) {
      this.emit(false);
    } else {
      this._b.push(value);
      this.checkValues();
    }
  }
}

class SequenceEqualCompareToSubscriber<T, R> extends Subscriber<T> {
  constructor(destination: Observer<R>, private parent: SequenceEqualSubscriber<T, R>) {
    super(destination);
  }

  protected _next(value: T): void {
    this.parent.nextB(value);
  }

  protected _error(err: any): void {
    this.parent.error(err);
  }

  protected _complete(): void {
    this.parent._complete();
  }
}