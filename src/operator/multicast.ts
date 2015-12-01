import {Subject} from '../Subject';
import {Observable} from '../Observable';
import {ConnectableObservable} from '../observable/ConnectableObservable';

export function multicast<T>(subjectOrSubjectFactory: Subject<T>|(() => Subject<T>)) {
  let subjectFactory: () => Subject<T>;
  if (typeof subjectOrSubjectFactory === 'function') {
    subjectFactory = <() => Subject<T>>subjectOrSubjectFactory;
  } else {
    subjectFactory = function subjectFactory() {
      return <Subject<T>>subjectOrSubjectFactory;
    };
  }
  return new ConnectableObservable(this, subjectFactory);
}

Observable.prototype.multicast = multicast;
