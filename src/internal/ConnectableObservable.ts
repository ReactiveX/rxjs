import { Observable } from './Observable';
import { Subject } from './Subject';
import { Subscription } from './Subscription';
import { PartialObserver } from './types';

export class ConnectableObservable<T> extends Observable<T> {
  private _connection: Subscription;

  constructor(protected _source: Observable<T>, private _subject: Subject<T>) {
    super();
  }

  subscribe(nextOrObserver?: PartialObserver<T>|((value: T, subscription: Subscription) => void)): Subscription {
    return this._subject.subscribe(nextOrObserver);
  }

  connect(): Subscription {
    if (!this._connection) {
      this._connection = this._source.subscribe(this._subject);
    }
    return this._connection;
  }
}
