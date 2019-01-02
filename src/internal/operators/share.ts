import { OperatorFunction, TeardownLogic } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from '../Subscription';
import { Subject } from '../Subject';
import { Subscriber } from '../Subscriber';

export function share<T>(): OperatorFunction<T, T> {
  let subject: Subject<T>;
  let refCount = 0;
  let connection: Subscription;

  const reset = () => {
    refCount = 0;
    connection && connection.unsubscribe();
    connection = null;
    subject = null;
  };

  return (source: Observable<T>) => new SharedObservable(source);
}

class SharedObservable<T> extends Observable<T> {
  private _subject: Subject<T>;
  private _refCount = 0;
  private _connection: Subscription;

  constructor(private _source: Observable<T>) {
    super();
  }

  _init(subscriber: Subscriber<T>): TeardownLogic {
    this._refCount++;

    if (!this._subject || this._subject.closed) {
      this._subject = new Subject();
      this._connection = null;
    }

    const innerSub = this._subject.subscribe(subscriber);

    if (!this._connection || this._connection.closed) {
      this._connection = this._source.subscribe(this._subject);
    }

    this._connection.add(innerSub);

    return () => {
      this._refCount--;
      innerSub.unsubscribe();

      if (this._refCount === 0) {
        this._connection.unsubscribe();
      }
    };
  }
}
