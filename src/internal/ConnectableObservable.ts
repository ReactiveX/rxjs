import { Observable } from './Observable';
import { Subject } from './Subject';
import { Subscription } from './Subscription';
import { Subscriber } from './Subscriber';
import { TeardownLogic } from './types';

export class ConnectableObservable<T> extends Observable<T> {
  private _connection: Subscription;

  constructor(protected _source: Observable<T>, private _subject: Subject<T>) {
    super();
  }

  protected _init(subscriber: Subscriber<T>): TeardownLogic {
    return this._subject.subscribe(subscriber);
  }

  connect(): Subscription {
    if (!this._connection) {
      this._connection = this._source.subscribe(this._subject);
    }
    return this._connection;
  }
}
