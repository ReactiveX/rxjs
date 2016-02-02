
import {Observable} from '../../Observable';
import {Subject} from '../../Subject';
import {ConnectableObservable} from '../../observable/ConnectableObservable';
import {multicast} from '../../operator/multicast';

Observable.prototype.multicast = multicast;

declare module '../../Observable' {
  interface Observable<T> {
    multicast: (subjectOrSubjectFactory: Subject<T> | (() => Subject<T>)) => ConnectableObservable<T>;
  }
}