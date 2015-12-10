import {Subject} from '../Subject';
import {ConnectableObservable} from '../observable/ConnectableObservable';
import {_Factory} from '../types';

export function multicast<T>(subjectOrSubjectFactory: Subject<T> | _Factory<Subject<T>>): ConnectableObservable<T> {
  let subjectFactory: _Factory<Subject<T>>;
  if (typeof subjectOrSubjectFactory === 'function') {
    subjectFactory = <_Factory<Subject<T>>>subjectOrSubjectFactory;
  } else {
    subjectFactory = function subjectFactory() {
      return <Subject<T>>subjectOrSubjectFactory;
    };
  }
  return new ConnectableObservable(this, subjectFactory);
}
