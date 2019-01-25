import { OperatorFunction, TeardownLogic } from 'rxjs/internal/types';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from '../Subscription';
import { Subject } from '../Subject';
import { MutableSubscriber } from 'rxjs/internal/MutableSubscriber';

export function share<T>(): OperatorFunction<T, T> {
  return (source: Observable<T>) => new SharedObservable(source);
}

class SharedObservable<T> extends Observable<T> {
  private _subject: Subject<T>;
  private _refCount = 0;
  private _connection: Subscription;

  constructor(private _source: Observable<T>) {
    super();
  }

  _init(mut: MutableSubscriber<T>): TeardownLogic {
    this._refCount++;

    if (!this._subject || this._subject.closed) {
      this._subject = new Subject();
      this._connection = null;
    }

    const innerSub = this._subject.subscribe(mut);

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
