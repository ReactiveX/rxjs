import { Observable } from './Observable';
import { Subject } from './Subject';
import { Subscription } from './Subscription';
import { Subscriber } from './Subscriber';
import { TeardownLogic } from './types';

export class ConnectableObservable<T> extends Observable<T> {
  private _connection: Subscription;
  private _subject: Subject<T>;
  private _refCount = 0;

  constructor(protected _source: Observable<T>, private _subjectFactory: () => Subject<T>) {
    super();
  }

  protected _getSubject() {
    return this._subject && !this._subject.closed
      ? this._subject
      : (this._subject = this._subjectFactory());
  }

  protected _init(subscriber: Subscriber<T>): TeardownLogic {
    return this._getSubject().subscribe(subscriber);
  }

  connect(): Subscription {
    let connection = this._connection;
    if (!connection) {
      const subject = this._getSubject();
      connection = this._connection = new Subscription();
      connection.add(() => {
        this._refCount = 0;
        this._subject = null;
        this._connection = null;
      });
      connection.add(this._source.subscribe(subject));
    }
    return connection;
  }

  refCount() {
    return new Observable<T>(subscriber => {
      this._refCount++;

      const innerSub = this.subscribe(subscriber);

      if (this._refCount === 1) {
        this.connect();
      }

      return () => {
        innerSub.unsubscribe();
        this._refCount--;
        if (this._refCount === 0) {
          this._connection && this._connection.unsubscribe();
        }
      };
    });
  }
}
