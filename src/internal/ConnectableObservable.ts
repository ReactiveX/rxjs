import { Observable } from './Observable';
import { Subject } from './Subject';
import { Subscription } from './Subscription';

export class ConnectableObservable<T> extends Observable<T> {
  private _connection: Subscription;

  constructor(protected _source: Observable<T>, private _subjectFactory: () => Subject<T>) {
    super();
  }

  connect(): Subscription {
    if (!this._connection) {
      this._connection = this._source.subscribe(this._subjectFactory());
    }
    return this._connection;
  }
}
