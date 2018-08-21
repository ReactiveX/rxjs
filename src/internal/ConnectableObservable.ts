import { Observable } from './Observable';
import { sourceAsObservable } from './util/sourceAsObservable';
import { Subscription } from './Subscription';
import { Subject } from './Subject';
import { FOType, Sink } from './types';

export interface ConnectableObservable<T> extends Observable<T> {
  connect(): Subscription;
  refCount(): Observable<T>;
}

export interface ConnectableObservableCtor {
  new <T>(source: Observable<T>, subjectFactory: () => Subject<T>): ConnectableObservable<T>;
}

export const ConnectableObservable: ConnectableObservableCtor = (<T>(source: Observable<T>, subjectFactory: () => Subject<T>) => {
  let _subject: any;

  let connectable = (type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    _subject = _subject || subjectFactory();
    _subject(FOType.SUBSCRIBE, sink, subs);
  };

  connectable = sourceAsObservable(connectable);

  (connectable as ConnectableObservable<T>).connect = () => {
    _subject = _subject || subjectFactory();
    const subs = new Subscription();
    source(FOType.SUBSCRIBE, _subject, subs);
    return subs;
  };

  (connectable as ConnectableObservable<T>).refCount = refCount;

  return connectable;
}) as any;


function refCount<T>(this: ConnectableObservable<T>) {
  let _refCounter = 0;
  let _connection: Subscription;

  return sourceAsObservable((type: FOType.SUBSCRIBE, sink: Sink<T>, subs: Subscription) => {
    _refCounter++;

    subs.add(() => {
      _refCounter--;
      if (_refCounter === 0) {
        _connection.unsubscribe();
      }
    });

    if (_refCounter === 1) {
      _connection = this.connect();
    }
  });
}
